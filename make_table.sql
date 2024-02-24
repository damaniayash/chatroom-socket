-- Create 'users' table
CREATE TABLE users (
    id VARCHAR(150) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(512) NOT NULL
);

-- Create 'messages' table
CREATE TABLE messages (
    id VARCHAR(150) PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT current_timestamp,
    sender_id VARCHAR(150) REFERENCES users(id) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0
);

-- Insert data into 'users' table
INSERT INTO users (id, name, email, password) VALUES
    ('ABC1234', 'Yash', 'abc@example.com', 'hashed_password_yash'),
    ('XYZ1234', 'Janvi', 'xyz@example.com', 'hashed_password_janvi');

-- Insert data into 'messages' table
INSERT INTO messages (id, content, timestamp, sender_id, sender_name) VALUES
    ('some_ulid', 'Hello from Yash!', current_timestamp, 'ABC1234', 'Yash'),
    ('ulid2', 'Hello back from Janvi!', current_timestamp, 'XYZ1234', 'Janvi'),
    ('ulid3', 'How are you, Yash?', current_timestamp, 'XYZ1234', 'Janvi');