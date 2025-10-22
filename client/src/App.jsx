import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur sticky top-0 z-10 dark:bg-gray-950/70">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold">Task Schedule Manager</Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link className={navCls(pathname, '/dashboard')} to="/dashboard">Dashboard</Link>
                <Link className={navCls(pathname, '/tasks')} to="/tasks">Tasks</Link>
                <button className="btn" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link className={navCls(pathname, '/login')} to="/login">Login</Link>
                <Link className={navCls(pathname, '/register')} to="/register">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

function navCls(current, href) {
  const active = current === href;
  return active ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900';
}
