import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const to = location.state?.from?.pathname || '/dashboard';
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn w-full" type="submit">Login</button>
      </form>
      <p className="mt-3 text-sm">No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
