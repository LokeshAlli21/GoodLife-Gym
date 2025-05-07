CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) ,
    phone VARCHAR(15),
    height_feet INTEGER,
    height_inches INTEGER,
    weight_kg NUMERIC(5,2),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')
);

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

CREATE TABLE health_metrics (
    id SERIAL PRIMARY KEY,

    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,

    -- Physical Info
    height_feet INTEGER,
    height_inches INTEGER,
    weight_kg NUMERIC(5,2),
    bicps_size_inches NUMERIC(5,2),
    bmi NUMERIC(5,2),
    notes TEXT
);

CREATE TABLE memberships_and_payments (
    id SERIAL PRIMARY KEY,

    -- Linking to member and membership plan
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    
    membership_plan VARCHAR(50) NOT NULL UNIQUE,  -- Monthly, Quarterly, Yearly
    membership_duration_days INTEGER NOT NULL,         -- 30, 90, 365
    membership_price NUMERIC(10,2) NOT NULL,

    membership_start_date DATE NOT NULL,
    membership_end_date DATE NOT NULL,

    -- Payment Info
    payment_installment_1 NUMERIC(10,2) DEFAULT 0.00,
    payment_installment_2 NUMERIC(10,2) DEFAULT 0.00,
    payment_installment_3 NUMERIC(10,2) DEFAULT 0.00,
    total_amount_paid NUMERIC(10,2) DEFAULT 0.00,
    total_amount_due NUMERIC(10,2),
    installment_amount NUMERIC(10,2),
    last_payment_date DATE,
    next_payment_due_date DATE,
    payment_method VARCHAR(50),
    payment_screenshot_url TEXT,
    notes TEXT,

    created_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')
);



------------------------TODO ...... auto set ----------------