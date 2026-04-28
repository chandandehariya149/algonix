import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

function Signup() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const { signup } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await signup(name, email, password, whatsapp); }
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
          <span className="eyebrow">Get started</span>
          <h1 className="gradient-text">Create your account</h1>
          <p>Free forever. No credit card. No clutter.</p>
          {error && <div className="auth__error">{error}</div>}
          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required value={name}
                placeholder="Your full name"
                onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required autoComplete="new-password" value={password}
                placeholder="At least 8 characters"
                onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp number</label>
              <input id="whatsapp" type="text" value={whatsapp}
                placeholder="+91 ..."
                onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary auth__submit" disabled={busy}>
              {busy ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="auth__alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Signup;
