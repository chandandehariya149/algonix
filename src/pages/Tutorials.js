import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import '../styles/Tutorials.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [newTutorial, setNewTutorial] = useState({ iframeLink: '', directLink: '', topic: '' });
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  useContext(AuthContext);

  useEffect(() => { fetchTutorials(); }, []);

  const fetchTutorials = async () => {
    try {
      const res = await axios.get(`https://algonix-backend.onrender.com/api/tutorials`);
      setTutorials(res.data);
    } catch (err) {
      setError('Failed to fetch tutorials');
    }
  };

  const handleAddTutorial = async (e) => {
    e.preventDefault();
    if (!newTutorial.iframeLink || !newTutorial.directLink || !newTutorial.topic) {
      setError('All fields are required'); return;
    }
    try {
      await axios.post(`${API}/api/tutorials`, newTutorial, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNewTutorial({ iframeLink: '', directLink: '', topic: '' });
      fetchTutorials();
      setError('');
    } catch (err) { setError('Failed to add tutorial'); }
  };

  const handleRemoveTutorial = async (id) => {
    try {
      await axios.delete(`${API}/api/tutorials/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTutorials();
    } catch (err) { setError('Failed to remove tutorial'); }
  };

  const handleChangeTutorial = async (id) => {
    const current = tutorials.find(t => t._id === id);
    const updated = {
      ...current,
      iframeLink: prompt('Enter new iframe link:', current?.iframeLink) || current?.iframeLink,
      directLink: prompt('Enter new direct link:', current?.directLink) || current?.directLink,
      topic:      prompt('Enter new topic:',       current?.topic)      || current?.topic,
    };
    try {
      await axios.put(`${API}/api/tutorials/${id}`, updated, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTutorials();
    } catch (err) { setError('Failed to update tutorial'); }
  };

  const isAdmin = (() => {
    const t = localStorage.getItem('token');
    if (!t) return false;
    try { return JSON.parse(atob(t.split('.')[1])).email === 'chandandehariya149@gmail.com'; }
    catch { return false; }
  })();

  return (
    <div className="page">
      <Navbar />
      <main className="tutorials container">
        <header className="tutorials__head">
          <span className="eyebrow">Video tutorials</span>
          <h1 className="gradient-text">Learn by watching the build.</h1>
          <p>Bite-sized, expert-led videos covering DSA, languages, and real-world patterns.</p>
        </header>

        {error && <div className="tutorials__error">{error}</div>}

        <div className="tutorials__grid">
          {tutorials.map((t, i) => (
            <Reveal key={t._id} delay={i * 70} className="tutorial">
              <div className="tutorial__media">
                <iframe
                  src={t.iframeLink}
                  title={t.topic}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="tutorial__body">
                <h3>{t.topic}</h3>
                <a href={t.directLink} target="_blank" rel="noreferrer" className="btn btn-ghost">Watch on YouTube</a>
                {isAdmin && (
                  <div className="tutorial__admin">
                    <button className="sheet__chip" onClick={() => handleChangeTutorial(t._id)}>Edit</button>
                    <button className="sheet__chip sheet__chip--danger" onClick={() => handleRemoveTutorial(t._id)}>Remove</button>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
          {tutorials.length === 0 && !error && (
            <div className="tutorials__empty">Loading tutorials...</div>
          )}
        </div>

        {isAdmin && (
          <div className="tutorials__form">
            <h3>Add a tutorial</h3>
            <form onSubmit={handleAddTutorial}>
              <input type="text" placeholder="Iframe Link" required
                value={newTutorial.iframeLink}
                onChange={(e) => setNewTutorial({ ...newTutorial, iframeLink: e.target.value })} />
              <input type="text" placeholder="Direct Link" required
                value={newTutorial.directLink}
                onChange={(e) => setNewTutorial({ ...newTutorial, directLink: e.target.value })} />
              <input type="text" placeholder="Topic" required
                value={newTutorial.topic}
                onChange={(e) => setNewTutorial({ ...newTutorial, topic: e.target.value })} />
              <button type="submit" className="btn btn-primary">Add Video</button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Tutorials;
