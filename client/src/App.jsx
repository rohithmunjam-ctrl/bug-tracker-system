import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Search,
  ShieldCheck,
  UserCog,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const defaultUser = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@bugtracker.io',
  role: 'Admin'
};

const severityColors = {
  Critical: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Low: 'bg-emerald-100 text-emerald-800'
};

const statusColors = {
  Open: 'bg-sky-100 text-sky-800',
  'In Progress': 'bg-violet-100 text-violet-800',
  Resolved: 'bg-emerald-100 text-emerald-800',
  Closed: 'bg-slate-100 text-slate-800',
  Reopened: 'bg-amber-100 text-amber-800'
};

const apiBase = '/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('bugtracker_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('bugtracker_user') || 'null') || defaultUser);
  const [authMode, setAuthMode] = useState('login');
  const [dashboard, setDashboard] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'High',
    priority: 'High',
    project: 'College Management System',
    reporter: 'Rohith',
    assignee: 'Rahul',
    status: 'Open'
  });

  const stats = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: 'Total Bugs', value: dashboard.metrics.total, icon: FileText, color: 'bg-blue-500' },
      { label: 'Open', value: dashboard.metrics.open, icon: Clock3, color: 'bg-sky-500' },
      { label: 'Critical', value: dashboard.metrics.critical, icon: AlertTriangle, color: 'bg-red-500' },
      { label: 'Resolved', value: dashboard.metrics.resolved, icon: CheckCircle2, color: 'bg-emerald-500' }
    ];
  }, [dashboard]);

  const fetchData = async () => {
    try {
      const [dashboardRes, bugsRes, projectsRes, notificationsRes] = await Promise.all([
        fetch(`${apiBase}/dashboard`),
        fetch(`${apiBase}/bugs`),
        fetch(`${apiBase}/projects`),
        fetch(`${apiBase}/notifications`)
      ]);

      const dashboardData = await dashboardRes.json();
      const bugsData = await bugsRes.json();
      const projectsData = await projectsRes.json();
      const notificationsData = await notificationsRes.json();

      setDashboard(dashboardData);
      setBugs(bugsData);
      setProjects(projectsData);
      setNotifications(notificationsData);
      setLoading(false);
    } catch (e) {
      setError('Failed to load dashboard data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('bugtracker_token', data.token);
      localStorage.setItem('bugtracker_user', JSON.stringify(data.user));
      setError('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const payload = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      role: e.target.role.value
    };

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setError('Registration successful! Please log in.');
      setAuthMode('login');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitBug = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${apiBase}/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: 'Open'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create bug');

      setBugs((prev) => [data.bug, ...prev]);
      setForm({
        title: '',
        description: '',
        severity: 'High',
        priority: 'High',
        project: 'College Management System',
        reporter: 'Rohith',
        assignee: 'Rahul',
        status: 'Open'
      });
      setError('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bugtracker_token');
    localStorage.removeItem('bugtracker_user');
    setToken('');
    setUser(defaultUser);
  };

  const recentBugs = bugs.slice(0, 5);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-lg font-semibold">Loading bug tracker...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {!token ? (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-6">
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-soft">
            <div className="grid md:grid-cols-2">
              <div className="bg-slate-900 p-10 text-white">
                <div className="mb-6 flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-sky-400" />
                  <div>
                    <p className="text-xl font-bold">Bug Tracker</p>
                    <p className="text-sm text-slate-300">Issue Management</p>
                  </div>
                </div>
                <h1 className="mb-4 text-4xl font-bold">Track bugs. Ship better software.</h1>
                <p className="text-slate-300">
                  Manage reports, assignments, developer workloads, and lifecycle status from one modern dashboard.
                </p>
                <div className="mt-10 space-y-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 20 realistic sample bugs</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Role-based access</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Analytics and notifications</div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="mb-8 flex gap-2 rounded-full bg-slate-100 p-1">
                  <button
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${authMode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
                    onClick={() => setAuthMode('login')}
                  >
                    Login
                  </button>
                  <button
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${authMode === 'register' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`}
                    onClick={() => setAuthMode('register')}
                  >
                    Register
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Email</label>
                      <input name="email" defaultValue="admin@bugtracker.io" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-sky-500" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Password</label>
                      <input type="password" name="password" defaultValue="admin123" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none ring-0 focus:border-sky-500" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-700">Login</button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Full name</label>
                      <input name="name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Email</label>
                      <input name="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Password</label>
                      <input type="password" name="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Role</label>
                      <select name="role" defaultValue="Tester" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-500">
                        <option>Admin</option>
                        <option>Developer</option>
                        <option>Tester</option>
                      </select>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800">Create account</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-8">
          <header className="mb-8 flex flex-col gap-4 rounded-2xl bg-slate-900 px-6 py-5 text-white shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-300">Bug Tracker</p>
              <h2 className="text-2xl font-bold">Project Dashboard</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input className="rounded-xl border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-400" placeholder="Search bug ID or title" />
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2">
                <Bell className="h-4 w-4 text-sky-300" />
                <span className="text-sm">{notifications.length}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-3 py-2">
                <UserCog className="h-5 w-5" />
                <div className="text-sm">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-slate-400">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </header>

          <nav className="mb-8 flex flex-wrap gap-3">
            {['Dashboard', 'Bugs', 'Projects', 'Developers', 'Analytics'].map((item) => (
              <button key={item} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">{item}</button>
            ))}
          </nav>

          <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">{stat.label}</span>
                  <div className={`${stat.color} flex h-10 w-10 items-center justify-center rounded-xl text-white`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="mb-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Bugs by Severity</h3>
                <span className="text-sm text-slate-500">This month</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.severityChart || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {dashboard?.severityChart?.map((entry, index) => (
                        <Cell key={index} fill={['#ef4444', '#f59e0b', '#facc15', '#2dd4bf'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <LayoutDashboard className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-4">
                {recentBugs.map((bug) => (
                  <div key={bug.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{bug.title}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[bug.status]}`}>{bug.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{bug.project} • {bug.assignee}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Bug List</h3>
                <span className="text-sm text-slate-500">{bugs.length} reports</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-600">
                    <tr>
                      <th className="px-3 py-3">Bug ID</th>
                      <th className="px-3 py-3">Title</th>
                      <th className="px-3 py-3">Severity</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Assignee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bugs.slice(0, 6).map((bug) => (
                      <tr key={bug.id} className="border-t border-slate-200 text-sm">
                        <td className="px-3 py-3 font-medium text-sky-600">{bug.id}</td>
                        <td className="px-3 py-3">{bug.title}</td>
                        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 ${severityColors[bug.severity]}`}>{bug.severity}</span></td>
                        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 ${statusColors[bug.status]}`}>{bug.status}</span></td>
                        <td className="px-3 py-3">{bug.assignee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Report a Bug</h3>
                <PlusCircle className="h-5 w-5 text-sky-500" />
              </div>
              <form onSubmit={handleSubmitBug} className="space-y-4">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Bug title" className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the bug" className="w-full rounded-xl border border-slate-200 px-3 py-2" rows="4" required />
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2">
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2" />
                  <input value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2" />
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2">
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                    <option>Reopened</option>
                  </select>
                </div>
                <button className="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-700">Create bug</button>
              </form>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-500" />
                <h3 className="text-lg font-bold">Developers</h3>
              </div>
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="mb-3 rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.teamMembers.length} team members</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-soft lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Notifications</h3>
                <span className="text-sm text-slate-500">Unread {notifications.filter((item) => !item.read).length}</span>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start justify-between rounded-xl border border-slate-200 p-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.message}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${item.read ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-700'}`}>
                      {item.read ? 'Read' : 'New'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
