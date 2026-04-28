import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import '../styles/LanguageOverview.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const LANG_META = {
  cpp:    { name: 'C++',    blurb: 'Modern C++17/20, STL deep-dives, and competitive patterns.' },
  java:   { name: 'Java',   blurb: 'OOP fundamentals to Spring-ready engineering.' },
  python: { name: 'Python', blurb: 'From scripting to ML & backend with clean idioms.' },
  dsa:    { name: 'DSA',    blurb: 'Data Structures & Algorithms — the fundamentals every engineer revisits.' },
};

function LanguageOverview() {
  const { lang } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');
  const [addForm, setAddForm] = useState({ topic: '', subtopic: '', content: '' });
  const [changeForm, setChangeForm] = useState({ id: '', topic: '', subtopic: '', content: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API}/api/materials/${lang.toLowerCase()}`);
        setMaterials(res.data);
        setError('');
      } catch (err) {
        setError(`Failed to load materials: ${err.response?.data?.msg || err.message}`);
      }
    };
    fetchMaterials();
  }, [lang]);

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!addForm.subtopic.trim()) { setError('Subtopic is required'); return; }
    try {
      const res = await axios.post(`${API}/api/materials`,
        { language: lang.toLowerCase(), ...addForm },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMaterials([...materials, res.data]);
      setAddForm({ topic: '', subtopic: '', content: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) { setError(err.response?.data?.msg || 'Failed to add content'); }
  };

  const handleChangeContent = async (e) => {
    e.preventDefault();
    if (!changeForm.id) { setError('Please select a material to update'); return; }
    if (!changeForm.subtopic.trim()) { setError('Subtopic is required'); return; }
    try {
      const res = await axios.put(`${API}/api/materials/${changeForm.id}`,
        { topic: changeForm.topic, subtopic: changeForm.subtopic, content: changeForm.content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMaterials(materials.map(m => m._id === changeForm.id ? res.data : m));
      setChangeForm({ id: '', topic: '', subtopic: '', content: '' });
      setShowChangeForm(false);
      setError('');
    } catch (err) { setError(err.response?.data?.msg || 'Failed to update content'); }
  };

  const handleRemoveContent = async (e) => {
    e.preventDefault();
    if (!changeForm.id) { setError('Please select a material to remove'); return; }
    try {
      await axios.delete(`${API}/api/materials/${changeForm.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMaterials(materials.filter(m => m._id !== changeForm.id));
      setChangeForm({ id: '', topic: '', subtopic: '', content: '' });
      setShowRemoveForm(false);
      setError('');
    } catch (err) { setError(err.response?.data?.msg || 'Failed to remove content'); }
  };

  const handleImageUpload = async (e, isAddForm) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await axios.post(`${API}/api/upload-material-image`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const imageId = res.data.imageId;
      const updatedContent = isAddForm
        ? `${addForm.content}[img]${imageId}[/img]`
        : `${changeForm.content}[img]${imageId}[/img]`;
      isAddForm
        ? setAddForm({ ...addForm, content: updatedContent })
        : setChangeForm({ ...changeForm, content: updatedContent });
    } catch (err) {
      setError('Image upload failed: ' + (err.response?.data?.msg || err.message));
    }
  };

  const isAdmin = user?.email === 'chandandehariya149@gmail.com';

  const langKey = (lang || '').toLowerCase();
  const meta = LANG_META[langKey] || { name: (lang || '').toUpperCase(), blurb: '' };
  const heroImg =
    langKey === 'cpp' ? '/assets/cpp1.png'
    : langKey === 'dsa' ? '/assets/dsa.png'
    : langKey === 'java' ? '/assets/java.png'
    : langKey === 'python' ? '/assets/python.png'
    : `https://www.vectorlogo.zone/logos/${langKey}/${langKey}-icon.svg`;

  const topics = [...new Set(materials.map(m => m.topic))];

  return (
    <div className="page">
      <Navbar />
      <main className="lo container">
        <Reveal className="lo__hero">
          <div className="lo__hero-text">
            <span className="eyebrow">{meta.name} programming</span>
            <h1 className="gradient-text">Learn {meta.name}, the right way.</h1>
            <p>{meta.blurb || 'A focused, structured path through the fundamentals to advanced patterns.'}</p>
            <div className="lo__hero-cta">
              <Link to="/sheet" className="btn btn-primary">Practice on the sheet</Link>
              <Link to="/tutorials" className="btn btn-ghost">Watch tutorials</Link>
            </div>
          </div>
          <div className="lo__hero-visual">
            <div className="lo__hero-glow" aria-hidden="true" />
            <img src={heroImg} alt={`${meta.name} logo`} className="lo__hero-logo" />
          </div>
        </Reveal>

        {topics.length === 0 && !error && (
          <div className="lo__empty">No materials yet — check back soon.</div>
        )}

        <div className="lo__grid">
          {topics.map((topic, index) => (
            <Reveal key={index} delay={index * 60} className="lo__card">
              <div className="lo__card-head">
                <span className="lo__index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{topic}</h3>
              </div>
              <ul className="lo__list">
                {materials.filter(m => m.topic === topic).map(m => (
                  <li key={m._id}
                      onClick={() => navigate(`/language/${lang}/${encodeURIComponent(m.topic)}/${encodeURIComponent(m.subtopic)}`)}>
                    <span>{m.subtopic}</span>
                    <i aria-hidden="true">→</i>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {isAdmin && (
          <div className="lo__admin">
            <button className="btn btn-ghost" onClick={() => setShowAddForm(true)}>Add content</button>
            <button className="btn btn-ghost" onClick={() => setShowChangeForm(true)}>Edit content</button>
            <button className="btn btn-ghost" onClick={() => setShowRemoveForm(true)}>Remove content</button>
          </div>
        )}

        {error && <p className="lo__error">{error}</p>}
      </main>

      {showAddForm && (
        <Modal title="Add content" onClose={() => setShowAddForm(false)}>
          <form onSubmit={handleAddContent} className="lo__form">
            <div className="field"><label>Topic</label>
              <input value={addForm.topic} onChange={(e) => setAddForm({ ...addForm, topic: e.target.value })} required /></div>
            <div className="field"><label>Subtopic</label>
              <input value={addForm.subtopic} onChange={(e) => setAddForm({ ...addForm, subtopic: e.target.value })} required /></div>
            <div className="field"><label>Content</label>
              <textarea rows="6" value={addForm.content} onChange={(e) => setAddForm({ ...addForm, content: e.target.value })} required /></div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
            <button type="submit" className="btn btn-primary">Add</button>
          </form>
        </Modal>
      )}
      {showChangeForm && (
        <Modal title="Edit content" onClose={() => setShowChangeForm(false)}>
          <form onSubmit={handleChangeContent} className="lo__form">
            <div className="field"><label>Material</label>
              <select value={changeForm.id} required onChange={(e) => {
                const sel = materials.find(m => m._id === e.target.value);
                setChangeForm({ id: e.target.value, topic: sel?.topic || '', subtopic: sel?.subtopic || '', content: sel?.content || '' });
              }}>
                <option value="">Select a material</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.topic} — {m.subtopic}</option>)}
              </select></div>
            <div className="field"><label>Topic</label>
              <input value={changeForm.topic} onChange={(e) => setChangeForm({ ...changeForm, topic: e.target.value })} required /></div>
            <div className="field"><label>Subtopic</label>
              <input value={changeForm.subtopic} onChange={(e) => setChangeForm({ ...changeForm, subtopic: e.target.value })} required /></div>
            <div className="field"><label>Content</label>
              <textarea rows="6" value={changeForm.content} onChange={(e) => setChangeForm({ ...changeForm, content: e.target.value })} required /></div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
            <button type="submit" className="btn btn-primary">Update</button>
          </form>
        </Modal>
      )}
      {showRemoveForm && (
        <Modal title="Remove content" onClose={() => setShowRemoveForm(false)}>
          <form onSubmit={handleRemoveContent} className="lo__form">
            <div className="field"><label>Material</label>
              <select value={changeForm.id} required onChange={(e) => {
                const sel = materials.find(m => m._id === e.target.value);
                setChangeForm({ id: e.target.value, topic: sel?.topic || '', subtopic: sel?.subtopic || '', content: sel?.content || '' });
              }}>
                <option value="">Select a material</option>
                {materials.map(m => <option key={m._id} value={m._id}>{m.topic} — {m.subtopic}</option>)}
              </select></div>
            <button type="submit" className="btn btn-primary">Remove</button>
          </form>
        </Modal>
      )}

      <Footer />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="lo__modal" onClick={onClose}>
      <div className="lo__modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="lo__modal-close" onClick={onClose}>✕</button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default LanguageOverview;
