import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(email, password); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="auth">
        <div className="auth__bg" aria-hidden="true">
          <div className="auth__glow auth__glow--1" />
          <div className="auth__glow auth__glow--2" />
        </div>
        <div className="auth__card">
          <span className="eyebrow">Welcome back</span>
          <h1 className="gradient-text">Sign in to Algonix</h1>
          <p>Pick up right where you left off — your progress is saved.</p>
          {error && <div className="auth__error">{error}</div>}
          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email"
                placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required autoComplete="current-password"
                placeholder="********" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary auth__submit" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="auth__alt">
            Don’t have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
