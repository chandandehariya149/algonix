import { Link } from 'react-router-dom';
import './Footer.css';

const SOCIAL = [
  { href: 'https://www.linkedin.com/company/algonix', label: 'LinkedIn' },
  { href: 'https://www.instagram.com',                 label: 'Instagram' },
  { href: 'https://www.facebook.com/profile.php?id=61566377129881', label: 'Facebook' },
  { href: 'https://www.youtube.com/@chandanmehra94',   label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__mark" />
            <span>ALGONIX</span>
          </div>
          <p>Empowering coders and entrepreneurs in India with free, high-quality resources to learn, build, and ship.</p>
        </div>

        <div className="footer__col">
          <h4>Product</h4>
          <Link to="/tutorials">Tutorials</Link>
          <Link to="/sheet">Coding Sheet</Link>
          <Link to="/language/cpp">C++</Link>
          <Link to="/language/python">Python</Link>
        </div>

        <div className="footer__col">
          <h4>Company</h4>
          <Link to="/author">Author</Link>
          <a href="https://www.linkedin.com/company/algonix" target="_blank" rel="noreferrer">About</a>
          <a href="https://www.linkedin.com/company/algonix" target="_blank" rel="noreferrer">Events</a>
          <a href="mailto:chandandehariya149@gmail.com">Contact</a>
        </div>

        <div className="footer__col">
          <h4>Connect</h4>
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>
      </div>

      <div className="footer__bar container">
        <span>© {new Date().getFullYear()} Algonix. All rights reserved.</span>
        <span>Crafted with care by Chandan Dehariya.</span>
      </div>
    </footer>
  );
}
