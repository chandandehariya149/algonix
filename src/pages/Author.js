import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Author.css';

function Author() {
  useContext(AuthContext);
  return (
    <div className="page">
      <Navbar />
      <main className="author container">
        <div className="author__bg" aria-hidden="true"><div className="author__glow" /></div>
        <header className="author__head">
          <span className="eyebrow">Mentor</span>
          <h1 className="gradient-text">Meet the maker behind Algonix.</h1>
        </header>
        <div className="author__card">
          <div className="author__photo-wrap">
            <img src="/assets/mentor.png" alt="Chandan Dehariya" className="author__photo" />
            <div className="author__photo-ring" aria-hidden="true" />
          </div>
          <div className="author__body">
            <h2>Chandan Dehariya</h2>
            <span className="author__role">Founder · Engineer · ML Enthusiast</span>
            <p>
              Chandan is the founder of Algonix — a passionate coder and machine-learning
              enthusiast. With a mission to empower Indian coders and entrepreneurs, he
              built Algonix to make quality education accessible to everyone, with 100%
              free content and round-the-clock support.
            </p>
            <p>
              His expertise spans multiple programming languages, data structures,
              algorithms, and ML. Through Algonix he ships tutorials, a curated DSA sheet,
              and an in-browser compiler — all designed for builders.
            </p>
            <div className="author__links">
              <a href="https://www.linkedin.com/in/chandandehariya" target="_blank" rel="noreferrer" className="btn btn-ghost">LinkedIn</a>
              <a href="https://github.com/chandandehariya"        target="_blank" rel="noreferrer" className="btn btn-ghost">GitHub</a>
              <a href="https://chandandehariya.vercel.app/"        target="_blank" rel="noreferrer" className="btn btn-primary">Portfolio</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Author;
