-- PostgreSQL schema for Bug Tracker System

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Developer', 'Tester')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  start_date DATE,
  project_manager VARCHAR(100),
  team_members TEXT[],
  total_bugs INTEGER DEFAULT 0,
  open_bugs INTEGER DEFAULT 0,
  resolved_bugs INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bugs (
  id SERIAL PRIMARY KEY,
  bug_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  reproduction_steps TEXT,
  expected_result TEXT,
  actual_result TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  project_id INTEGER REFERENCES projects(id),
  project_name VARCHAR(150),
  reporter_name VARCHAR(100),
  assigned_developer VARCHAR(100),
  status VARCHAR(30) NOT NULL CHECK (status IN ('Reported', 'Open', 'In Progress', 'Resolved', 'Closed', 'Reopened')),
  reported_date TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_history (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
  action VARCHAR(150) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  bug_id INTEGER REFERENCES bugs(id) ON DELETE CASCADE,
  filename VARCHAR(200) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
