-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS contacts;

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);