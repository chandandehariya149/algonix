import { useEffect, useRef, useState } from 'react';

/**
 * <Reveal> — fades + slides children in once they enter the viewport.
 * Usage:  <Reveal delay={120}> ... </Reveal>
 */
export default function Reveal({
  as: Tag = 'div',
  children,
  delay = 0,
  className = '',
  threshold = 0.12,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...rest.style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
