# Bug Tracker System

A full-stack bug tracking and issue management web app built for a college project demonstration.

## Features
- Dashboard with KPIs and analytics
- Bug reporting and assignment workflow
- Search, filtering, and bug lifecycle tracking
- Projects and developer workload management
- Notifications and activity feed
- Role-based access for Admin, Developer, and Tester

## Tech stack
- Frontend: React + Vite + Tailwind CSS + Recharts + Lucide React
- Backend: Node.js + Express
- Data layer: PostgreSQL-ready schema + demo in-memory backend data

## Quick start

1. Install dependencies:
   npm install

2. Copy environment file:
   cp .env.example .env

3. Start the application:
   npm run dev

4. Open the app in browser:
   http://localhost:5173

The backend API runs at:
   http://localhost:5000

## Demo login credentials
- Admin: admin@bugtracker.io / admin123
- Developer: rahul@bugtracker.io / developer123
- Tester: rohit@bugtracker.io / tester123

## Project structure
- client/ - frontend app
- server/ - Express API and sample data
- server/db/schema.sql - PostgreSQL schema

## Database setup
If you want to connect to PostgreSQL instead of the demo in-memory data, use the SQL file in `server/db/schema.sql` and configure `.env` with database credentials.

## License
MIT
