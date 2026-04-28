import { useState } from 'react';
import Reveal from '../components/Reveal';
import './Contact.css';

export default function Contact() {
  const [form,   setForm]   = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Algonix · message from ${form.name}`);
    const body    = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:chandandehariya149@gmail.com?subject=${subject}&body=${body}`;
    setStatus('success');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section className="contact" id="contact">
      <div className="container contact__inner">
        <Reveal className="contact__copy">
          <span className="eyebrow">Get in touch</span>
          <h2 className="gradient-text">Have an idea? <br />Let’s build it together.</h2>
          <p>Questions, partnerships, feedback — drop us a note. We read every message.</p>

          <ul className="contact__meta">
            <li><span>Email</span><a href="mailto:chandandehariya149@gmail.com">chandandehariya149@gmail.com</a></li>
            <li><span>Phone</span><a href="tel:+919827228241">+91 98272 28241</a></li>
            <li><span>LinkedIn</span><a href="https://www.linkedin.com/company/algonix" target="_blank" rel="noreferrer">@algonix</a></li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="contact__form-wrap">
          <form className="contact__form" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required value={form.name} onChange={onChange} placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email} onChange={onChange} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="5" required value={form.message} onChange={onChange} placeholder="Tell us a little about it…" />
            </div>
            <button type="submit" className="btn btn-primary contact__submit">Send message →</button>
            {status === 'success' && (
              <p className="contact__hint">Thanks, {form.name || 'friend'} — your email client should be open now.</p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
