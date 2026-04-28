import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Sheet.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Sheet() {
  const { user } = useContext(AuthContext);
  const [sheets, setSheets] = useState([]);
  const [progress, setProgress] = useState([]);
  const [form, setForm] = useState({ question: '', solution: '', websiteLink: '', code: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/sheet`).then(res => setSheets(res.data));
    if (user) {
      axios.get(`${API}/api/sheet/progress`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => setProgress(res.data));
    }
  }, [user]);

  const reload = async () => {
    const res = await axios.get(`${API}/api/sheet`);
    setSheets(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/api/sheet/${editingId}`, form,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setEditingId(null);
      } else {
        await axios.post(`${API}/api/sheet`, form,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      setForm({ question: '', solution: '', websiteLink: '', code: '' });
      reload();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (sheet) => { setForm(sheet); setEditingId(sheet._id); };
  const handleDelete = async (sheetId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`${API}/api/sheet/${sheetId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      reload();
    } catch (err) { console.error(err); }
  };
  const toggleCode = (id, code) =>
    setSelectedCode(selectedCode && selectedCode.id === id ? null : { id, code });

  const toggleSolved = async (sheetId, solved) => {
    try {
      const res = await axios.post(`${API}/api/sheet/progress`, { sheetId, solved },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProgress((prev) => {
        const updated = prev.filter((p) => p.sheetId.toString() !== sheetId);
        return [...updated, res.data];
      });
    } catch (err) { console.error(err); }
  };

  const isAdmin = user?.email === 'chandandehariya149@gmail.com';
  const filtered = sheets.filter(s =>
    !search || s.question.toLowerCase().includes(search.toLowerCase()));
  const solvedCount = progress.filter(p => p.solved).length;
  const pct = sheets.length ? Math.round((solvedCount / sheets.length) * 100) : 0;

  return (
    <div className="page">
      <Navbar />
      <main className="sheet container">
        <header className="sheet__head">
          <div>
            <span className="eyebrow">DSA practice</span>
            <h1 className="gradient-text">Algonix Coding Sheet</h1>
            <p>149 hand-picked problems with video solutions and code. Track your progress.</p>
          </div>
          {user && (
            <div className="sheet__progress">
              <div className="sheet__progress-track">
                <div className="sheet__progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span><strong>{solvedCount}</strong> / {sheets.length} solved · {pct}%</span>
            </div>
          )}
        </header>

        <div className="sheet__toolbar">
          <input
            className="sheet__search"
            placeholder="Search a problem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
          <div className="sheet__form">
            <h3>{editingId ? 'Edit' : 'Add'} Question</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Question" value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })} />
              <input type="text" placeholder="Solution (YouTube Link)" value={form.solution}
                onChange={(e) => setForm({ ...form, solution: e.target.value })} />
              <input type="text" placeholder="Website Link" value={form.websiteLink}
                onChange={(e) => setForm({ ...form, websiteLink: e.target.value })} />
              <textarea placeholder="Code" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}></textarea>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
            </form>
          </div>
        )}

        <div className="sheet__table-wrap">
          <table className="sheet__table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Question</th>
                <th>Solution</th>
                <th>Website</th>
                <th>Code</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sheet, idx) => {
                const entry = progress.find((p) => p.sheetId.toString() === sheet._id.toString());
                const isSolved = entry?.solved || false;
                return (
                  <tr key={sheet._id} className={isSolved ? 'is-solved' : ''}>
                    <td className="sheet__idx">{idx + 1}</td>
                    <td className="sheet__q">{sheet.question}</td>
                    <td>
                      {sheet.solution && (
                        <a href={sheet.solution} target="_blank" rel="noopener noreferrer" className="sheet__icon-link" title="Watch solution">
                          <img src="/assets/yt.png" alt="YouTube" />
                        </a>
                      )}
                    </td>
                    <td>
                      {sheet.websiteLink && (
                        <a href={sheet.websiteLink} target="_blank" rel="noopener noreferrer" className="sheet__icon-link" title="Open problem">
                          <img src="/assets/website.png" alt="Website" />
                        </a>
                      )}
                    </td>
                    <td>
                      {sheet.code && (
                        <button onClick={() => toggleCode(sheet._id, sheet.code)} className="sheet__chip">
                          {selectedCode?.id === sheet._id ? 'Hide' : 'See code'}
                        </button>
                      )}
                    </td>
                    <td>
                      {isAdmin ? (
                        <div className="sheet__admin">
                          <button onClick={() => handleEdit(sheet)} className="sheet__chip">Edit</button>
                          <button onClick={() => handleDelete(sheet._id)} className="sheet__chip sheet__chip--danger">Delete</button>
                        </div>
                      ) : (
                        <button
                          className={`sheet__status ${isSolved ? 'is-solved' : ''}`}
                          onClick={() => user && toggleSolved(sheet._id, !isSolved)}
                          disabled={!user}
                          title={user ? '' : 'Sign in to track progress'}
                        >
                          {isSolved ? '✓ Solved' : 'Mark solved'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedCode && (
          <div className="sheet__modal" onClick={() => setSelectedCode(null)}>
            <div className="sheet__modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="sheet__modal-close" onClick={() => setSelectedCode(null)}>✕</button>
              <h3>Solution code</h3>
              <pre><code>{selectedCode.code}</code></pre>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Sheet;
