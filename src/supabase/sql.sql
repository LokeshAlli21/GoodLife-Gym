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

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Create health_metrics table with auto-calculated BMI and better structure
CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE UNIQUE,
    height_feet INTEGER CHECK (height_feet BETWEEN 1 AND 10),
    height_inches INTEGER CHECK (height_inches BETWEEN 0 AND 11),
    weight_kg NUMERIC(5,2) CHECK (weight_kg > 0),
    bicps_size_inches NUMERIC(5,2) CHECK (bicps_size_inches > 0),
    notes TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
    
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
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Create memberships table with better structure and auto-calculations
CREATE TABLE memberships (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    membership_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    membership_end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'),
    
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
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
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
    GREATEST(0, (mb.membership_end_date - CURRENT_DATE)) AS days_remaining,
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

------------------------------------------------------------------------------------------------------------------------------------------

-- Create revenue_tracking view for financial analysis
CREATE VIEW revenue_tracking_view AS
SELECT 
    -- Time dimensions for analysis
    EXTRACT(YEAR FROM p.payment_date) AS year,
    EXTRACT(MONTH FROM p.payment_date) AS month,
    TO_CHAR(p.payment_date, 'Month') AS month_name,
    
    -- Payment method breakdown
    p.payment_method,
    
    -- Plan type breakdown
    mp.name AS plan_type,
    
    -- Various revenue metrics
    COUNT(p.id) AS number_of_payments,
    SUM(p.payment_amount) AS total_revenue,
    AVG(p.payment_amount) AS average_payment,
    
    -- New vs renewal memberships
    COUNT(DISTINCT CASE 
        WHEN mb.membership_start_date = p.payment_date THEN mb.id 
        ELSE NULL
    END) AS new_memberships,
    
    COUNT(DISTINCT CASE 
        WHEN mb.membership_start_date < p.payment_date THEN mb.id 
        ELSE NULL
    END) AS renewal_payments
FROM 
    payments p
JOIN 
    memberships mb ON p.membership_id = mb.id
JOIN 
    membership_plans mp ON mb.plan_id = mp.id
GROUP BY 
    EXTRACT(YEAR FROM p.payment_date),
    EXTRACT(MONTH FROM p.payment_date),
    TO_CHAR(p.payment_date, 'Month'),
    p.payment_method,
    mp.name
ORDER BY 
    year DESC, month DESC;

-- Create daily_revenue view for day-by-day analysis
CREATE VIEW daily_revenue_view AS
SELECT 
    p.payment_date,
    COUNT(p.id) AS number_of_payments,
    SUM(p.payment_amount) AS daily_revenue,
    COUNT(DISTINCT mb.member_id) AS unique_members_paid
FROM 
    payments p
JOIN 
    memberships mb ON p.membership_id = mb.id
GROUP BY 
    p.payment_date
ORDER BY 
    p.payment_date DESC;

-- Create pending_payments view to track outstanding balances
CREATE VIEW pending_payments_view AS
SELECT 
    m.id AS member_id,
    m.first_name,
    m.last_name,
    m.phone,
    m.email,
    mb.id AS membership_id,
    mp.name AS plan_name,
    mp.price AS total_price,
    COALESCE(SUM(p.payment_amount), 0) AS amount_paid,
    (mp.price - COALESCE(SUM(p.payment_amount), 0)) AS amount_due,
    mb.membership_start_date,
    mb.membership_end_date,
    -- Calculate days overdue if payment is pending
    CASE 
        WHEN (mp.price - COALESCE(SUM(p.payment_amount), 0)) > 0 THEN
            (CURRENT_DATE - COALESCE(MAX(p.payment_date), mb.membership_start_date))
        ELSE 0
    END AS days_since_last_payment,
    -- Flag severely overdue accounts
    CASE 
        WHEN (mp.price - COALESCE(SUM(p.payment_amount), 0)) > 0 AND
             (CURRENT_DATE - COALESCE(MAX(p.payment_date), mb.membership_start_date)) > 30
        THEN TRUE
        ELSE FALSE
    END AS is_overdue
FROM 
    members m
JOIN 
    memberships mb ON m.id = mb.member_id
JOIN 
    membership_plans mp ON mb.plan_id = mp.id
LEFT JOIN 
    payments p ON mb.id = p.membership_id
GROUP BY 
    m.id, m.first_name, m.last_name, m.phone, m.email,
    mb.id, mb.membership_start_date, mb.membership_end_date,
    mp.name, mp.price
HAVING 
    (mp.price - COALESCE(SUM(p.payment_amount), 0)) > 0
ORDER BY 
    days_since_last_payment DESC;

-- Create monthly_recurring_revenue view for financial forecasting
CREATE VIEW monthly_recurring_revenue_view AS
WITH active_memberships AS (
    SELECT 
        mp.id AS plan_id,
        mp.name AS plan_name,
        mp.price AS plan_price,
        mp.duration_days,
        COUNT(mb.id) AS active_memberships_count,
        SUM(mp.price) AS total_contract_value
    FROM 
        memberships mb
    JOIN 
        membership_plans mp ON mb.plan_id = mp.id
    WHERE 
        mb.membership_end_date >= CURRENT_DATE
    GROUP BY 
        mp.id, mp.name, mp.price, mp.duration_days
)
SELECT 
    plan_id,
    plan_name,
    active_memberships_count,
    total_contract_value,
    -- Calculate monthly equivalent value based on plan duration
    ROUND(
        (total_contract_value / (duration_days / 30.0))::numeric, 
        2
    ) AS monthly_recurring_revenue,
    -- Percentage of total MRR
    ROUND(
        (100 * (total_contract_value / (duration_days / 30.0)) / 
        SUM(total_contract_value / (duration_days / 30.0)) OVER ())::numeric,
        2
    ) AS percent_of_total_mrr
FROM 
    active_memberships
ORDER BY 
    monthly_recurring_revenue DESC;

-- Function to record expense (optional, for comprehensive revenue tracking)
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
);

-- Create profit_loss_view to track net revenue
CREATE VIEW profit_loss_view AS
SELECT
    EXTRACT(YEAR FROM d.date) AS year,
    EXTRACT(MONTH FROM d.date) AS month,
    TO_CHAR(TO_DATE(EXTRACT(MONTH FROM d.date)::text, 'MM'), 'Month') AS month_name,
    
    -- Revenue
    COALESCE(SUM(p.payment_amount), 0) AS total_revenue,
    
    -- Expenses
    COALESCE(SUM(e.amount), 0) AS total_expenses,
    
    -- Net Profit/Loss
    (COALESCE(SUM(p.payment_amount), 0) - COALESCE(SUM(e.amount), 0)) AS net_profit
FROM
    (
        -- Generate a date series for all months
        SELECT DISTINCT
            DATE_TRUNC('month', dd)::date AS date
        FROM
            generate_series(
                (SELECT MIN(LEAST(membership_start_date, payment_date)) FROM memberships mb 
                 LEFT JOIN payments p ON mb.id = p.membership_id),
                CURRENT_DATE,
                '1 month'::interval
            ) AS dd
    ) d
LEFT JOIN
    payments p ON 
        EXTRACT(YEAR FROM p.payment_date) = EXTRACT(YEAR FROM d.date) AND
        EXTRACT(MONTH FROM p.payment_date) = EXTRACT(MONTH FROM d.date)
LEFT JOIN
    expenses e ON 
        EXTRACT(YEAR FROM e.expense_date) = EXTRACT(YEAR FROM d.date) AND
        EXTRACT(MONTH FROM e.expense_date) = EXTRACT(MONTH FROM d.date)
GROUP BY
    EXTRACT(YEAR FROM d.date),
    EXTRACT(MONTH FROM d.date)
ORDER BY
    year DESC, month DESC;

-- Create function to calculate revenue forecasts
CREATE OR REPLACE FUNCTION calculate_revenue_forecast(months_ahead INTEGER DEFAULT 12)
RETURNS TABLE (
    forecast_month DATE,
    forecasted_revenue NUMERIC(10,2),
    forecasted_new_members INTEGER,
    forecasted_renewals INTEGER
) AS $$
DECLARE
    avg_monthly_revenue NUMERIC(10,2);
    avg_monthly_growth NUMERIC(5,2);
    avg_new_members_per_month INTEGER;
    avg_renewals_per_month INTEGER;
BEGIN
    -- Calculate average monthly metrics from the past 6 months
    SELECT 
        AVG(monthly_revenue),
        COALESCE(AVG(NULLIF(growth_rate, 0)), 1.05), -- Default 5% growth if can't calculate
        AVG(new_members),
        AVG(renewals)
    INTO
        avg_monthly_revenue,
        avg_monthly_growth,
        avg_new_members_per_month,
        avg_renewals_per_month
    FROM (
        SELECT
            DATE_TRUNC('month', payment_date) AS month,
            SUM(payment_amount) AS monthly_revenue,
            COUNT(DISTINCT CASE WHEN mb.membership_start_date = payment_date THEN mb.member_id ELSE NULL END) AS new_members,
            COUNT(DISTINCT CASE WHEN mb.membership_start_date < payment_date THEN mb.member_id ELSE NULL END) AS renewals,
            CASE
                WHEN LAG(SUM(payment_amount)) OVER (ORDER BY DATE_TRUNC('month', payment_date)) > 0 THEN
                    SUM(payment_amount) / LAG(SUM(payment_amount)) OVER (ORDER BY DATE_TRUNC('month', payment_date))
                ELSE NULL
            END AS growth_rate
        FROM
            payments p
        JOIN
            memberships mb ON p.membership_id = mb.id
        WHERE
            payment_date >= (CURRENT_DATE - INTERVAL '6 months')
        GROUP BY
            DATE_TRUNC('month', payment_date)
        ORDER BY
            month
    ) AS monthly_stats;

    -- Generate the forecast
    FOR i IN 1..months_ahead LOOP
        forecast_month := DATE_TRUNC('month', CURRENT_DATE + (i * INTERVAL '1 month'))::DATE;
        forecasted_revenue := ROUND((avg_monthly_revenue * POWER(avg_monthly_growth, i))::NUMERIC, 2);
        forecasted_new_members := ROUND((avg_new_members_per_month * POWER(avg_monthly_growth, i))::NUMERIC);  
        forecasted_renewals := ROUND((avg_renewals_per_month * POWER(avg_monthly_growth, i))::NUMERIC);
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Dashboard query example for overall revenue insights
-- This can be used to build a dashboard in your application
/*
SELECT
    -- Current month revenue
    (SELECT SUM(payment_amount) FROM payments 
     WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)) AS current_month_revenue,
     
    -- Previous month revenue
    (SELECT SUM(payment_amount) FROM payments 
     WHERE EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
     AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')) AS previous_month_revenue,
     
    -- Active members count
    (SELECT COUNT(*) FROM memberships WHERE membership_end_date >= CURRENT_DATE) AS active_members,
    
    -- Overdue payments amount
    (SELECT SUM(amount_due) FROM pending_payments_view WHERE is_overdue = TRUE) AS overdue_amount,
    
    -- Top performing plan
    (SELECT plan_name FROM monthly_recurring_revenue_view ORDER BY monthly_recurring_revenue DESC LIMIT 1) AS top_plan;
*/


------------------------------------------------------------------------------------------------------------------------------------------

-- FUNCTION: Renew a membership
CREATE OR REPLACE FUNCTION renew_membership(
    p_member_id INTEGER,
    p_plan_id INTEGER,
    p_payment_amount NUMERIC(10,2),
    p_payment_method VARCHAR(50),
    p_payment_screenshot_url TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    new_membership_id INTEGER;
    new_start_date DATE;
BEGIN
    -- Determine the new start date
    -- If member has an existing membership that hasn't expired yet, start from the end date
    -- Otherwise, start from today
    SELECT 
        CASE
            WHEN MAX(membership_end_date) >= CURRENT_DATE THEN MAX(membership_end_date) + 1
            ELSE CURRENT_DATE
        END INTO new_start_date
    FROM memberships
    WHERE member_id = p_member_id;

    -- Create new membership record
    INSERT INTO memberships (
        member_id,
        plan_id,
        membership_start_date,
        notes
    ) VALUES (
        p_member_id,
        p_plan_id,
        new_start_date,
        p_notes
    )
    RETURNING id INTO new_membership_id;
    
    -- The end_date will be automatically calculated by the trigger we already have
    
    -- Record payment for the new membership
    INSERT INTO payments (
        membership_id,
        payment_amount,
        payment_date,
        payment_method,
        payment_screenshot_url,
        notes
    ) VALUES (
        new_membership_id,
        p_payment_amount,
        CURRENT_DATE,
        p_payment_method,
        p_payment_screenshot_url,
        p_notes
    );
    
    RETURN new_membership_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage of renew_membership function:
-- SELECT renew_membership(
--     1,                      -- member_id
--     2,                      -- plan_id (Quarterly)
--     1500.00,                -- payment_amount
--     'UPI',                  -- payment_method
--     'screenshots/payment1.jpg', -- payment_screenshot_url
--     'Renewal for Q2 2025'   -- notes
-- );

-- FUNCTION: Add a payment to an existing membership
CREATE OR REPLACE FUNCTION add_payment(
    p_membership_id INTEGER,
    p_payment_amount NUMERIC(10,2),
    p_payment_method VARCHAR(50),
    p_payment_screenshot_url TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    payment_id INTEGER;
    current_total NUMERIC(10,2);
    plan_price NUMERIC(10,2);
BEGIN
    -- Get the current total payments and plan price
    SELECT 
        COALESCE(SUM(p.payment_amount), 0),
        mp.price INTO current_total, plan_price
    FROM 
        memberships m
    JOIN 
        membership_plans mp ON m.plan_id = mp.id
    LEFT JOIN 
        payments p ON m.id = p.membership_id
    WHERE 
        m.id = p_membership_id
    GROUP BY 
        mp.price;
    
    -- Check if payment would exceed the plan price
    IF (current_total + p_payment_amount > plan_price) THEN
        RAISE EXCEPTION 'Payment of % would exceed the total plan price of %. Current total paid is %.', 
            p_payment_amount, plan_price, current_total;
    END IF;
    
    -- Record the payment
    INSERT INTO payments (
        membership_id,
        payment_amount,
        payment_date,
        payment_method,
        payment_screenshot_url,
        notes
    ) VALUES (
        p_membership_id,
        p_payment_amount,
        CURRENT_DATE,
        p_payment_method,
        p_payment_screenshot_url,
        p_notes
    )
    RETURNING id INTO payment_id;
    
    RETURN payment_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage of add_payment function:
-- SELECT add_payment(
--     5,                      -- membership_id 
--     500.00,                 -- payment_amount
--     'Cash',                 -- payment_method
--     NULL,                   -- payment_screenshot_url
--     'Partial payment'       -- notes
-- );

-- Query to find members with expiring memberships (for notifications)
CREATE OR REPLACE VIEW expiring_memberships AS
SELECT 
    m.id AS member_id,
    m.first_name,
    m.last_name,
    m.email,
    m.phone,
    mb.id AS membership_id,
    mb.membership_end_date,
    (mb.membership_end_date - CURRENT_DATE) AS days_until_expiration,
    mp.name AS current_plan
FROM 
    members m
JOIN 
    memberships mb ON m.id = mb.member_id
JOIN 
    membership_plans mp ON mb.plan_id = mp.id
WHERE 
    mb.membership_end_date >= CURRENT_DATE
    AND mb.membership_end_date <= (CURRENT_DATE + INTERVAL '30 days')
    AND NOT EXISTS (
        -- Exclude members who already have a future membership
        SELECT 1 FROM memberships future
        WHERE future.member_id = m.id
        AND future.membership_start_date > mb.membership_end_date
    )
ORDER BY 
    days_until_expiration;