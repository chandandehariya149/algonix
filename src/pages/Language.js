import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Language.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Language() {
  const { lang, topic: urlTopic, subtopic: urlSubtopic } = useParams();
  useContext(AuthContext);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(decodeURIComponent(urlTopic || ''));
  const [selectedSubtopic, setSelectedSubtopic] = useState(decodeURIComponent(urlSubtopic || ''));
  const [selectedContent, setSelectedContent] = useState('');
  const [error, setError] = useState('');
  const [compilerLang, setCompilerLang] = useState(lang);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${API}/api/materials/${lang.toLowerCase()}`);
        const valid = res.data.filter(m => m.subtopic && m.subtopic.trim());
        setMaterials(valid);
        if (valid.length > 0) {
          const dt = decodeURIComponent(urlTopic || '') || valid[0].topic;
          const ds = decodeURIComponent(urlSubtopic || '') || valid.find(m => m.topic === dt)?.subtopic || '';
          setSelectedTopic(dt);
          setSelectedSubtopic(ds);
          setSelectedContent(valid.find(m => m.topic === dt && m.subtopic === ds)?.content || '');
        } else {
          setSelectedTopic(''); setSelectedSubtopic(''); setSelectedContent('');
        }
        setError('');
      } catch (err) {
        setError(`Failed to load materials: ${err.response?.data?.msg || err.message}`);
      }
    };
    fetchMaterials();
  }, [lang, urlTopic, urlSubtopic]);

  const runCode = async () => {
    setRunning(true);
    setOutput('Running...');
    try {
      const res = await axios.post(`${API}/compile`, {
        script: code,
        language: compilerLang === 'cpp' ? 'cpp17' : compilerLang === 'java' ? 'java' : 'python3',
        input
      });
      setOutput(res.data.output || 'No output');
    } catch (err) {
      setOutput('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunning(false);
    }
  };

  const extensions = { cpp: [cpp()], java: [java()], python: [python()] };

  const handleTopicClick = (topic) => {
    const first = materials.find(m => m.topic === topic)?.subtopic || '';
    if (first) {
      setSelectedTopic(topic);
      setSelectedSubtopic(first);
      setSelectedContent(materials.find(m => m.topic === topic && m.subtopic === first)?.content || '');
      navigate(`/language/${lang}/${encodeURIComponent(topic)}/${encodeURIComponent(first)}`);
      setSidebarOpen(false);
    }
  };

  const handleSubtopicClick = (sub) => {
    if (!sub) return;
    setSelectedSubtopic(sub);
    setSelectedContent(materials.find(m => m.topic === selectedTopic && m.subtopic === sub)?.content || '');
    navigate(`/language/${lang}/${encodeURIComponent(selectedTopic)}/${encodeURIComponent(sub)}`);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (!selectedContent) return <p className="lang__placeholder">Select a subtopic to begin.</p>;

    const parts = [];
    let i = 0;
    while (i < selectedContent.length) {
      const cs = selectedContent.indexOf('[code]', i);
      const is = selectedContent.indexOf('[img]',  i);
      const bs = selectedContent.indexOf('[b]',    i);
      const lb = selectedContent.indexOf('<br>',   i);
      const next = Math.min(cs===-1?Infinity:cs, is===-1?Infinity:is, bs===-1?Infinity:bs, lb===-1?Infinity:lb);
      if (next === Infinity) { parts.push({ type:'text', content: selectedContent.substring(i) }); break; }
      if (next > i) parts.push({ type:'text', content: selectedContent.substring(i, next) });
      if (next === cs) {
        const ce = selectedContent.indexOf('[/code]', cs);
        if (ce !== -1) { parts.push({ type:'code', content: selectedContent.substring(cs+6, ce).trim() }); i = ce + 7; }
        else i = cs + 1;
      } else if (next === is) {
        const ie = selectedContent.indexOf('[/img]', is);
        if (ie !== -1) { parts.push({ type:'img', content: selectedContent.substring(is+5, ie).trim() }); i = ie + 6; }
        else i = is + 1;
      } else if (next === bs) {
        const be = selectedContent.indexOf('[/b]', bs);
        if (be !== -1) { parts.push({ type:'bold', content: selectedContent.substring(bs+3, be).trim() }); i = be + 4; }
        else i = bs + 1;
      } else if (next === lb) {
        parts.push({ type:'linebreak' }); i = lb + 4;
      }
    }

    let para = []; const out = [];
    parts.forEach((p, idx) => {
      if (p.type === 'text' || p.type === 'bold') {
        para.push(p.type === 'bold'
          ? <strong key={`b-${idx}`}>{p.content}</strong>
          : <span key={`t-${idx}`}>{p.content}</span>);
      } else if (p.type === 'linebreak') {
        if (para.length) { out.push(<p key={`p-${idx}`}>{para}</p>); para = []; }
      } else if (p.type === 'code') {
        if (para.length) { out.push(<p key={`p-${idx}`}>{para}</p>); para = []; }
        out.push(<pre key={`c-${idx}`} className="lang__code-block"><code>{p.content}</code></pre>);
      } else if (p.type === 'img') {
        if (para.length) { out.push(<p key={`p-${idx}`}>{para}</p>); para = []; }
        out.push(
          <img key={`i-${idx}`}
               src={`${API}${p.content}`}
               alt=""
               className="lang__content-img"
               onError={(e) => { e.target.style.display = 'none'; }} />
        );
      }
    });
    if (para.length) out.push(<p key="last">{para}</p>);
    return out;
  };

  const langKey = (lang || '').toLowerCase();
  const heroImg =
    langKey === 'cpp' ? '/assets/cpp1.png'
    : langKey === 'dsa' ? '/assets/dssa.png'
    : langKey === 'java' ? '/assets/java.jpeg'
    : langKey === 'python' ? '/assets/python.png'
    : `https://www.vectorlogo.zone/logos/${langKey}/${langKey}-icon.svg`;
  const topics = [...new Set(materials.map(m => m.topic))];
  const subtopics = materials.filter(m => m.topic === selectedTopic);

  return (
    <div className="page">
      <Navbar />
      <main className="lang">
        <button className="lang__sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          {sidebarOpen ? 'Close ✕' : 'Topics ☰'}
        </button>

        <aside className={`lang__sidebar ${sidebarOpen ? 'is-open' : ''}`}>
          <Link to={`/language/${lang}`} className="lang__sidebar-head">
            <img src={heroImg} alt="" className="lang__sidebar-logo" />
            <span>{(lang || '').toUpperCase()}</span>
          </Link>
          <div className="lang__topics">
            {topics.map((topic, idx) => {
              const open = selectedTopic === topic;
              return (
                <div key={idx} className={`lang__topic ${open ? 'is-open' : ''}`}>
                  <button className="lang__topic-btn" onClick={() => handleTopicClick(topic)}>
                    <span>{topic}</span>
                    <i aria-hidden="true">{open ? '−' : '+'}</i>
                  </button>
                  {open && (
                    <div className="lang__subtopics">
                      {subtopics.map((m, sIdx) => (
                        <button key={sIdx}
                          className={`lang__subtopic ${selectedSubtopic === m.subtopic ? 'is-active' : ''}`}
                          onClick={() => handleSubtopicClick(m.subtopic)}>
                          {m.subtopic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {topics.length === 0 && <p className="lang__empty">No topics yet.</p>}
          </div>
        </aside>

        <div className="lang__content">
          <section className="lang__reader">
            <header className="lang__reader-head">
              <span className="eyebrow">{selectedTopic || 'Topic'}</span>
              <h1>{selectedSubtopic || 'Choose a subtopic'}</h1>
            </header>
            <div className="lang__article">
              {renderContent()}
            </div>
          </section>

          <section className="lang__compiler">
            <header className="lang__compiler-head">
              <div>
                <span className="eyebrow">In-browser compiler</span>
                <h2 className="gradient-text">Algonix Compiler</h2>
              </div>
              <div className="lang__lang-select">
                <label htmlFor="ls">Language</label>
                <select id="ls" value={compilerLang} onChange={(e) => setCompilerLang(e.target.value)}>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                </select>
              </div>
            </header>

            <div className="lang__editor">
              <CodeMirror
                value={code}
                height="320px"
                theme="dark"
                extensions={extensions[compilerLang] || [cpp()]}
                onChange={(value) => setCode(value)}
              />
            </div>

            <div className="lang__io">
              <div className="lang__io-col">
                <label>Input (stdin)</label>
                <textarea rows="4" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Optional input..." />
              </div>
              <div className="lang__io-col">
                <label>Output</label>
                <pre className="lang__output">{output || 'Your output will appear here.'}</pre>
              </div>
            </div>

            <button onClick={runCode} className="btn btn-primary lang__run" disabled={running}>
              {running ? 'Running...' : 'Run code →'}
            </button>
          </section>
        </div>
      </main>

      {error && <p className="lang__error">{error}</p>}
      <Footer />
    </div>
  );
}

export default Language;
