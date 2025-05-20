-- Create members table with improved constraints and validation
CREATE TABLE members (
    id SERIAL PRIMARY KEY,

    -- Personal Info
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    dob DATE,
    email VARCHAR(150),
    phone VARCHAR(15),
    address TEXT,
    photo_url TEXT,
    blood_group VARCHAR(5),

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')
);

-- Create health_metrics table with auto-calculated BMI and better structure
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    height_feet INTEGER CHECK (height_feet BETWEEN 1 AND 10),
    height_inches INTEGER CHECK (height_inches BETWEEN 0 AND 11),
    weight_kg NUMERIC(5,2) CHECK (weight_kg > 0),
    bicps_size_inches NUMERIC(5,2) CHECK (bicps_size_inches > 0),
    notes TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    
    -- Auto-calculated BMI based on height and weight
    -- Formula: weight(kg) / (height(m))²
    -- We convert feet & inches to meters first
);

-- Create membership plans table to normalize data
CREATE TABLE membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')
);

-- Create memberships table with better structure and auto-calculations
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    membership_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    membership_end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata'),
    
    -- Ensure end date is after start date
    CONSTRAINT valid_date_range CHECK (membership_end_date >= membership_start_date)
);

-- Create payments table to track payments separately
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    membership_id INTEGER NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    payment_amount NUMERIC(10,2) NOT NULL CHECK (payment_amount >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    payment_screenshot_url TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')
);

-- Create views for convenience and calculated fields

-- View for member with their health metrics
CREATE VIEW member_health_view AS
SELECT 
    m.id,
    m.first_name,
    m.last_name,
    m.gender,
    m.dob,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, m.dob)) AS age,
    h.height_feet,
    h.height_inches,
    h.weight_kg,
    h.bicps_size_inches,
    -- Calculate BMI: weight(kg) / (height in meters)²
    CASE 
        WHEN h.height_feet IS NOT NULL AND h.weight_kg IS NOT NULL THEN
            ROUND(
                (h.weight_kg / POWER(((h.height_feet * 0.3048) + (COALESCE(h.height_inches, 0) * 0.0254)), 2))::NUMERIC, 
                2
            )
        ELSE NULL
    END AS bmi,
    -- BMI Category interpretation
    CASE 
        WHEN h.height_feet IS NOT NULL AND h.weight_kg IS NOT NULL THEN
            CASE 
                WHEN (h.weight_kg / POWER(((h.height_feet * 0.3048) + (COALESCE(h.height_inches, 0) * 0.0254)), 2)) < 18.5 THEN 'Underweight'
                WHEN (h.weight_kg / POWER(((h.height_feet * 0.3048) + (COALESCE(h.height_inches, 0) * 0.0254)), 2)) BETWEEN 18.5 AND 24.9 THEN 'Normal weight'
                WHEN (h.weight_kg / POWER(((h.height_feet * 0.3048) + (COALESCE(h.height_inches, 0) * 0.0254)), 2)) BETWEEN 25 AND 29.9 THEN 'Overweight'
                ELSE 'Obese'
            END
        ELSE NULL
    END AS bmi_category
FROM 
    members m
LEFT JOIN 
    health_metrics h ON m.id = h.member_id;

-- View for membership and payment information
CREATE VIEW membership_payment_view AS
SELECT 
    mb.id AS membership_id,
    m.id AS member_id,
    m.first_name,
    m.last_name,
    mp.name AS membership_plan,
    mp.duration_days,
    mp.price AS membership_price,
    mb.membership_start_date,
    mb.membership_end_date,
    -- Calculate membership status
    CASE 
        WHEN mb.membership_end_date >= CURRENT_DATE THEN 'Active'
        ELSE 'Expired'
    END AS membership_status,
    -- Calculate days remaining
    GREATEST(0, EXTRACT(DAY FROM mb.membership_end_date - CURRENT_DATE)::INTEGER) AS days_remaining,
    -- Payment summary
    COALESCE(SUM(p.payment_amount), 0) AS total_amount_paid,
    GREATEST(0, mp.price - COALESCE(SUM(p.payment_amount), 0)) AS total_amount_due,
    MAX(p.payment_date) AS last_payment_date,
    -- Next payment due calculation (if any amount is still due)
    CASE 
        WHEN mp.price > COALESCE(SUM(p.payment_amount), 0) THEN 
            COALESCE(MAX(p.payment_date) + 30, mb.membership_start_date + 30)
        ELSE NULL
    END AS next_payment_due_date
FROM 
    memberships mb
JOIN 
    members m ON mb.member_id = m.id
JOIN 
    membership_plans mp ON mb.plan_id = mp.id
LEFT JOIN 
    payments p ON mb.id = p.membership_id
GROUP BY 
    mb.id, m.id, m.first_name, m.last_name, mp.name, mp.duration_days, mp.price;

-- Function to auto-update membership end date when start date changes
CREATE OR REPLACE FUNCTION update_membership_end_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Update end date based on plan duration
    SELECT NEW.membership_start_date + (mp.duration_days * INTERVAL '1 day')
    INTO NEW.membership_end_date
    FROM membership_plans mp
    WHERE mp.id = NEW.plan_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update membership end date automatically
CREATE TRIGGER trg_update_membership_end_date
BEFORE INSERT OR UPDATE OF membership_start_date, plan_id ON memberships
FOR EACH ROW
EXECUTE FUNCTION update_membership_end_date();

-- Function to initialize health metrics record when a new member is created
CREATE OR REPLACE FUNCTION init_health_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO health_metrics (member_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create health metrics record for new members
CREATE TRIGGER trg_init_health_metrics
AFTER INSERT ON members
FOR EACH ROW
EXECUTE FUNCTION init_health_metrics();

-- Seed the membership plans table with some common plans
INSERT INTO membership_plans (name, duration_days, price) VALUES
('Monthly', 30, 600.00),
('Quarterly', 90, 1500.00),
('Annual', 365, 4500.00);