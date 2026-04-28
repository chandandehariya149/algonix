import Reveal from '../components/Reveal';
import './Testimonials.css';

const QUOTES = [
  {
    quote: 'Algonix made DSA feel approachable. The sheet plus videos is the cleanest path I’ve used.',
    name:  'Riya Sharma',
    role:  'SDE Intern · Bangalore',
  },
  {
    quote: 'Finally a learning hub that respects my time — minimal UI, deep content, no fluff.',
    name:  'Ankit Verma',
    role:  'CS Sophomore',
  },
  {
    quote: 'I went from struggling with recursion to clearing on-campus rounds in three months.',
    name:  'Priya Nair',
    role:  'Frontend Engineer',
  },
];

export default function Testimonials() {
  return (
    <section className="testi">
      <div className="container">
        <Reveal className="testi__head">
          <span className="eyebrow">Loved by learners</span>
          <h2 className="gradient-text">A community that ships.</h2>
        </Reveal>

        <div className="testi__grid">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i * 90} className="quote">
              <p className="quote__text">“{q.quote}”</p>
              <div className="quote__who">
                <div className="quote__avatar" aria-hidden="true">
                  {q.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div>
                  <strong>{q.name}</strong>
                  <span>{q.role}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
