-- Tender Management System Database Initialization
-- PostgreSQL version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenders table
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    client VARCHAR(255),
    value DECIMAL(15,2),
    deadline DATE,
    status VARCHAR(50) DEFAULT 'active',
    category VARCHAR(100),
    risk_score DECIMAL(3,2),
    profit_prediction DECIMAL(3,2),
    submission_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    extracted_text TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100),
    metric_value DECIMAL(15,2),
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tender requirements table
CREATE TABLE IF NOT EXISTS tender_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tender timeline table
CREATE TABLE IF NOT EXISTS tender_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    phase_name VARCHAR(255) NOT NULL,
    duration VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenders_user_id ON tenders(user_id);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(deadline);
CREATE INDEX IF NOT EXISTS idx_documents_tender_id ON documents(tender_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO users (name, email, password_hash, company) VALUES 
('Demo User', 'demo@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.G', 'Demo Company')
ON CONFLICT (email) DO NOTHING;

-- Get the demo user ID for inserting demo tenders
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@example.com';
    
    IF demo_user_id IS NOT NULL THEN
        INSERT INTO tenders (user_id, title, description, client, value, deadline, status, category, risk_score, profit_prediction, submission_date) VALUES 
        (demo_user_id, 'Highway Construction Project Phase 2', 'Construction of 25km highway section with bridges and interchanges', 'Department of Transportation', 4500000.00, '2024-02-15', 'active', 'Construction', 0.30, 0.18, '2024-01-10'),
        (demo_user_id, 'Smart City IoT Infrastructure', 'Implementation of IoT sensors and smart traffic management system', 'City Council', 1200000.00, '2024-01-30', 'won', 'Technology', 0.20, 0.22, '2023-12-15'),
        (demo_user_id, 'Hospital Equipment Procurement', 'Supply and installation of medical equipment for new wing', 'Regional Health Authority', 890000.00, '2024-03-01', 'pending', 'Healthcare', 0.40, 0.15, '2024-01-20')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;