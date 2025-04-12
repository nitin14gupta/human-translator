-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS translator_profiles CASCADE;
DROP TABLE IF EXISTS traveler_profiles CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_traveler BOOLEAN NOT NULL DEFAULT TRUE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    profile_image VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create traveler profiles table
CREATE TABLE traveler_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    nationality VARCHAR(100),
    current_location VARCHAR(255),
    emergency_contact VARCHAR(100),
    travel_preferences TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create translator profiles table
CREATE TABLE translator_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create languages for translators
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    translator_profile_id INTEGER REFERENCES translator_profiles(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL,
    proficiency_level VARCHAR(20) NOT NULL DEFAULT 'intermediate',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_translator_profiles_user_id ON translator_profiles(user_id);
CREATE INDEX idx_traveler_profiles_user_id ON traveler_profiles(user_id);
CREATE INDEX idx_languages_translator_profile_id ON languages(translator_profile_id);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token); 