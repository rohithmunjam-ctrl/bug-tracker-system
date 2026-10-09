import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const projects = [
  {
    id: 'P-101',
    name: 'College Management System',
    description: 'Student portal and admin workflows',
    startDate: '2024-02-10',
    manager: 'Ms. Nisha',
    teamMembers: ['Rahul', 'Asha', 'Rohith'],
    totalBugs: 8,
    openBugs: 3,
    resolvedBugs: 5
  },
  {
    id: 'P-102',
    name: 'E-Commerce Dashboard',
    description: 'Sales insights and inventory operations',
    startDate: '2024-03-01',
    manager: 'Mr. Varun',
    teamMembers: ['Priya', 'Kiran', 'Rahul'],
    totalBugs: 7,
    openBugs: 2,
    resolvedBugs: 5
  },
  {
    id: 'P-103',
    name: 'Learning Management Portal',
    description: 'Course content and module delivery',
    startDate: '2024-04-18',
    manager: 'Ms. Meera',
    teamMembers: ['Neha', 'Rahul', 'Asha'],
    totalBugs: 5,
    openBugs: 2,
    resolvedBugs: 3
  }
];

const users = [
  { id: 'U-1', name: 'Admin User', email: 'admin@bugtracker.io', password: bcrypt.hashSync('admin123', 10), role: 'Admin' },
  { id: 'U-2', name: 'Rahul Developer', email: 'rahul@bugtracker.io', password: bcrypt.hashSync('developer123', 10), role: 'Developer' },
  { id: 'U-3', name: 'Rohith Tester', email: 'rohit@bugtracker.io', password: bcrypt.hashSync('tester123', 10), role: 'Tester' }
];

const bugs = [
  { id: 'BUG-1001', title: 'Login button not responding', description: 'User cannot login after clicking login button on mobile.', severity: 'High', priority: 'High', project: 'College Management System', reporter: 'Rohith', assignee: 'Rahul', status: 'Open', date: '2024-09-14' },
  { id: 'BUG-1002', title: 'Dashboard chart labels overlap', description: 'Labels on the analytics chart overlap at lower resolutions.', severity: 'Medium', priority: 'Medium', project: 'E-Commerce Dashboard', reporter: 'Asha', assignee: 'Priya', status: 'In Progress', date: '2024-09-15' },
  { id: 'BUG-1003', title: 'Password reset email not sent', description: 'Password reset email is not triggered for valid users.', severity: 'Critical', priority: 'High', project: 'Learning Management Portal', reporter: 'Rohith', assignee: 'Neha', status: 'Resolved', date: '2024-09-10' },
  { id: 'BUG-1004', title: 'Attachment upload limit is too small', description: 'Users cannot attach screenshots above 3MB.', severity: 'Low', priority: 'Low', project: 'College Management System', reporter: 'Meera', assignee: 'Rahul', status: 'Closed', date: '2024-09-08' },
  { id: 'BUG-1005', title: 'Project filters return empty results', description: 'Filter dropdown returns no data when a project is selected.', severity: 'High', priority: 'Medium', project: 'E-Commerce Dashboard', reporter: 'Kiran', assignee: 'Priya', status: 'Reopened', date: '2024-09-17' }
];

const notifications = [
  { id: 'N-1', title: 'Bug assigned', message: 'BUG-1001 assigned to Rahul Developer', read: false },
  { id: 'N-2', title: 'Status update', message: 'BUG-1002 moved to In Progress', read: false },
  { id: 'N-3', title: 'Bug resolved', message: 'BUG-1003 marked as Resolved by Neha', read: true },
  { id: 'N-4', title: 'Rejected fix', message: 'BUG-1005 reopened by reviewer', read: false }
];

const dashboard = {
  metrics: {
    total: bugs.length,
    open: bugs.filter((b) => b.status === 'Open').length,
    critical: bugs.filter((b) => b.severity === 'Critical').length,
    resolved: bugs.filter((b) => b.status === 'Resolved').length,
    inProgress: bugs.filter((b) => b.status === 'In Progress').length,
    closed: bugs.filter((b) => b.status === 'Closed').length
  },
  severityChart: [
    { name: 'Critical', count: bugs.filter((b) => b.severity === 'Critical').length },
    { name: 'High', count: bugs.filter((b) => b.severity === 'High').length },
    { name: 'Medium', count: bugs.filter((b) => b.severity === 'Medium').length },
    { name: 'Low', count: bugs.filter((b) => b.severity === 'Low').length }
  ]
};

const generateToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Bug Tracker API running successfully' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const found = users.find((u) => u.email === email);

  if (!found) return res.status(401).json({ message: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, found.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

  const user = { id: found.id, name: found.name, email: found.email, role: found.role };
  res.json({ token: generateToken(user), user });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const exists = users.some((user) => user.email === email);
  if (exists) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const newUser = {
    id: `U-${users.length + 1}`,
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: role || 'Tester'
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully.' });
});

app.get('/api/dashboard', (_req, res) => {
  res.json(dashboard);
});

app.get('/api/bugs', (_req, res) => {
  res.json(bugs);
});

app.post('/api/bugs', (req, res) => {
  const { title, description, severity, priority, project, reporter, assignee, status } = req.body;

  if (!title || !description || !project) {
    return res.status(400).json({ message: 'Title, description, and project are required.' });
  }

  const newBug = {
    id: `BUG-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    description,
    severity: severity || 'Medium',
    priority: priority || 'Medium',
    project,
    reporter: reporter || 'Anonymous',
    assignee: assignee || 'Unassigned',
    status: status || 'Open',
    date: new Date().toISOString().slice(0, 10)
  };

  bugs.unshift(newBug);
  dashboard.metrics.total = bugs.length;
  dashboard.metrics.open = bugs.filter((b) => b.status === 'Open').length;
  dashboard.metrics.critical = bugs.filter((b) => b.severity === 'Critical').length;
  dashboard.metrics.resolved = bugs.filter((b) => b.status === 'Resolved').length;
  dashboard.severityChart = [
    { name: 'Critical', count: bugs.filter((b) => b.severity === 'Critical').length },
    { name: 'High', count: bugs.filter((b) => b.severity === 'High').length },
    { name: 'Medium', count: bugs.filter((b) => b.severity === 'Medium').length },
    { name: 'Low', count: bugs.filter((b) => b.severity === 'Low').length }
  ];

  notifications.unshift({
    id: `N-${Date.now()}`,
    title: 'New bug reported',
    message: `${newBug.id} reported for ${project}`,
    read: false
  });

  res.status(201).json({ message: 'Bug created successfully', bug: newBug });
});

app.get('/api/projects', (_req, res) => {
  res.json(projects);
});

app.get('/api/notifications', (_req, res) => {
  res.json(notifications);
});

app.listen(PORT, () => {
  console.log(`Bug Tracker API running on http://localhost:${PORT}`);
});

export default app;
