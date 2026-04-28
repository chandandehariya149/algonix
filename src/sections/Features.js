import Reveal from '../components/Reveal';
import './Features.css';

const ITEMS = [
  {
    icon: '◇',
    title: '100% free, forever',
    text: 'Every tutorial, problem and resource is free. No paywalls, no upsells — just learning.',
  },
  {
    icon: '◈',
    title: 'Curated by practitioners',
    text: 'Hand-picked content from working engineers — not auto-generated filler.',
  },
  {
    icon: '◆',
    title: 'Zero to deployable',
    text: 'Start at the basics, end at production patterns. A clear path from beginner to builder.',
  },
  {
    icon: '◉',
    title: 'Always available',
    text: 'Round-the-clock community help and async answers when you’re stuck at 2 AM.',
  },
];

export default function Features() {
  return (
    <section className="features-sec">
      <div className="container">
        <Reveal className="features-sec__head">
          <span className="eyebrow">Why Algonix</span>
          <h2 className="gradient-text">Built for the way developers actually learn.</h2>
          <p>Minimal distractions. Real depth. Practical pace.</p>
        </Reveal>

        <div className="features-sec__grid">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 90} className="feature">
              <div className="feature__icon" aria-hidden="true">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
              <div className="feature__shine" aria-hidden="true" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
