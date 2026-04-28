import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import './Modules.css';

const MODULES = [
  {
    to: '/language/java',
    title: 'Java',
    blurb: 'OOP fundamentals to Spring-ready engineering.',
    img:  '/assets/java.png',
    span: 'span-2',
  },
  {
    to: '/language/cpp',
    title: 'C++',
    blurb: 'Modern C++17/20, STL deep-dives, and competitive patterns.',
    img:  '/assets/cpp1.png',
  },
  {
    to: '/language/python',
    title: 'Python',
    blurb: 'From scripting to ML & backend with clean idioms.',
    img:  '/assets/python.png',
  },
  {
    to: '/language/dsa',
    title: 'Data Structures & Algorithms',
    blurb: 'The fundamentals every great engineer revisits — visually.',
    img:  '/assets/dsa.png',
    span: 'span-2',
  },
  {
    to: '/sheet',
    title: 'Algonix Coding Sheet',
    blurb: '149 hand-picked problems · video walkthroughs · solutions.',
    img:  '/assets/sheet-icon.png',
    accent: true,
  },
  {
    to: '/tutorials',
    title: 'Video Tutorials',
    blurb: 'Watch, learn, build — bite-sized lessons by practitioners.',
    img:  '/assets/tuto.png',
  },
];

export default function Modules() {
  return (
    <section className="modules">
      <div className="container">
        <Reveal className="modules__head">
          <span className="eyebrow">Platform</span>
          <h2 className="gradient-text">Everything you need, in one place.</h2>
          <p>Learning, practice, compiler and community — designed to feel like a single product.</p>
        </Reveal>

        <div className="modules__grid">
          {MODULES.map((m, i) => (
            <Reveal
              key={m.to + m.title}
              delay={i * 70}
              as={Link}
              to={m.to}
              className={`mcard ${m.span || ''} ${m.accent ? 'mcard--accent' : ''}`}
            >
              <div className="mcard__media">
                <img src={m.img} alt="" loading="lazy" />
              </div>
              <div className="mcard__body">
                <h3>{m.title}</h3>
                <p>{m.blurb}</p>
                <span className="mcard__cta">Explore <i aria-hidden="true">→</i></span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
