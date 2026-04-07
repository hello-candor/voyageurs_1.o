import React, { useEffect, useRef, useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface CountdownValues {
  days: number;
  hours: number;
  mins: number;
}

// ─── Countdown hook ─────────────────────────────────────────────────────────
function useCountdown(target: Date): CountdownValues {
  const calc = (): CountdownValues => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    return { days, hours, mins };
  };
  const [cd, setCd] = useState<CountdownValues>(calc);
  useEffect(() => {
    const id = setInterval(() => setCd(calc()), 15_000);
    return () => clearInterval(id);
  }, []);
  return cd;
}

// ─── Intersection-observer fade-up ──────────────────────────────────────────
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── FadeUp wrapper ─────────────────────────────────────────────────────────
const FU: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {
  const ref = useFadeUp();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const EventLandingPage: React.FC = () => {
  const eventDate = new Date('2026-09-18T19:00:00.000+02:00');
  const cd = useCountdown(eventDate);

  // Scrolled nav
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ fontFamily: "'Jost', system-ui, sans-serif", background: '#F7F4EE', color: '#122538', overflowX: 'hidden' }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        :root {
          --navy: #0e1c2a; --navy-mid: #122538; --navy-soft: #1d3550;
          --terra: #C07D5E; --terra-dk: #a06448;
          --cream: #F7F4EE; --cream-dk: #EDE8DF; --stone: #8a8070;
          --serif: 'Cormorant Garamond', Georgia, serif;
          --sans: 'Jost', system-ui, sans-serif;
        }
        .b40-scrollbar::-webkit-scrollbar { width: 5px; }
        .b40-scrollbar::-webkit-scrollbar-track { background: var(--navy); }
        .b40-scrollbar::-webkit-scrollbar-thumb { background: var(--terra); border-radius: 4px; }
        .b40-hotel-card:hover .b40-hotel-img-inner { transform: scale(1.1) rotate(1deg); }
        .b40-travel-col:hover { transform: translateY(-4px); }
        .b40-travel-col:hover .b40-travel-bg { transform: scale(1.05); filter: saturate(1.2) brightness(0.6) blur(4px); }
        .b40-event-card:hover { transform: translateY(-6px); box-shadow: 0 40px 80px -20px rgba(14,28,42,.12); border-color: #C07D5E !important; background: white !important; }
        @media (max-width: 700px) {
          .b40-hero-title { font-size: clamp(3.5rem,18vw,6rem) !important; }
          .b40-hotels-grid { grid-template-columns: 1fr !important; }
          .b40-travel-grid { grid-template-columns: 1fr !important; }
          .b40-event-card { flex-direction: column !important; }
          .b40-event-date-stack { border-right: none !important; border-bottom: 1px solid rgba(192,125,94,.3) !important; padding-right: 0 !important; padding-bottom: 1rem !important; width: 100% !important; flex-direction: row !important; align-items: center !important; gap: 1rem !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1.5rem, 5vw, 4rem)',
        background: scrolled ? 'rgba(14,28,42,.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,.05), 0 4px 30px rgba(0,0,0,.3)' : 'none',
        transition: 'background .4s, box-shadow .4s',
      }}>
        <a href="#hero" style={{
          display: 'flex', alignItems: 'center', gap: '.75rem', textDecoration: 'none',
          opacity: scrolled ? 1 : 0, pointerEvents: scrolled ? 'auto' : 'none',
          transition: 'opacity .3s',
        }}>
          <div style={{ lineHeight: 1 }}>
            <strong style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', color: 'white', fontWeight: 400, display: 'block' }}>
              Bryan's 40th
            </strong>
          </div>
        </a>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <a href="#events" style={{
            fontSize: '.72rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.7)', textDecoration: 'none',
          }}>Events</a>
          <a href="#hotels" style={{
            fontSize: '.72rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.7)', textDecoration: 'none', marginLeft: '1rem',
          }}>Hotels</a>
          <a href="#travel" style={{
            fontSize: '.72rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.7)', textDecoration: 'none', marginLeft: '1rem',
          }}>Travel</a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section id="hero" style={{ minHeight: '100svh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '0 clamp(1.5rem,6vw,5rem) clamp(3rem,8vh,6rem)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--navy)', overflow: 'hidden' }}>
          <img
            src="https://images.squarespace-cdn.com/content/v1/62b85870cef97862d6324f88/f26117ce-9085-4af7-8348-c4ea77366c20/montpellier+france+edit26.jpg?format=2500w"
            alt="Montpellier"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .45 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,28,42,1) 0%, rgba(14,28,42,.7) 40%, rgba(14,28,42,.2) 75%, transparent 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 32, height: 1, background: 'var(--terra)' }} />
            <span style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--terra)' }}>
              A Special Invitation
            </span>
          </div>

          <h1 className="b40-hero-title" style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(4rem,10vw,9rem)', fontWeight: 300,
            lineHeight: .9, color: 'white', marginBottom: '1.5rem', letterSpacing: '-.02em',
          }}>
            Bryan's<br /><em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>40th</em>
          </h1>

          <p style={{ fontSize: '1.0rem', fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.85)', marginBottom: '2rem' }}>
            Montpellier, France · Sep 18–20, 2026
          </p>

          {/* Countdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { num: cd.days, label: 'Days' },
              { sep: true },
              { num: cd.hours, label: 'Hrs' },
              { sep: true },
              { num: cd.mins, label: 'Min' },
            ].map((item, i) =>
              'sep' in item ? (
                <span key={i} style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'rgba(255,255,255,.2)', paddingBottom: '1rem' }}>:</span>
              ) : (
                <div key={i} style={{ textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 300, color: 'white', lineHeight: 1, display: 'block' }}>
                    {String(item.num).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', display: 'block', marginTop: '.3rem' }}>
                    {item.label}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '2rem' }}>
            {['📅 Sep 18–20, 2026', '📍 Montpellier, France', '🏛 3 Events'].map(p => (
              <span key={p} style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)',
                backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,.85)',
                padding: '.6rem 1.25rem', borderRadius: 100, fontSize: '.72rem', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase',
              }}>
                {p}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <a href="#events" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.6rem',
              background: 'var(--terra)', color: 'white', textDecoration: 'none',
              fontFamily: 'var(--sans)', fontSize: '.75rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
              padding: '1rem 2rem', borderRadius: 100, boxShadow: '0 8px 32px rgba(192,125,94,.4)',
              transition: 'transform .2s, background .2s', border: 'none', cursor: 'pointer',
            }}>
              See the Weekend ↓
            </a>
            <a href="#hotels" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.6rem',
              background: 'transparent', color: 'rgba(255,255,255,.7)',
              border: '1px solid rgba(255,255,255,.25)', textDecoration: 'none',
              fontFamily: 'var(--sans)', fontSize: '.75rem', fontWeight: 500, letterSpacing: '.15em', textTransform: 'uppercase',
              padding: '1rem 2rem', borderRadius: 100, transition: 'background .2s',
            }}>
              Book Your Hotel
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem',
          color: 'rgba(255,255,255,.35)', fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase',
          animation: 'bounce 2s infinite',
        }}>
          <style>{`@keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }`}</style>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          <span>Scroll</span>
        </div>
      </section>

      {/* ── LETTER / INTRO ───────────────────────────────────────────── */}
      <section style={{
        background: `url('https://d2vbr83hnyiux1.cloudfront.net/image/975050285728/image_28olt637jh2mva7hkv7le4d37l/-FWEBP-S2560') center/cover no-repeat`,
        backgroundAttachment: 'fixed',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(5rem,12vh,9rem) clamp(1.5rem,6vw,5rem)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,28,42,0.45)', pointerEvents: 'none' }} />
        <FU style={{ position: 'relative', zIndex: 2, maxWidth: 840, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(14,28,42,0.6)', backdropFilter: 'blur(24px)',
            padding: 'clamp(3rem,8vw,5rem) clamp(2rem,6vw,4.5rem)',
            borderRadius: '1rem', boxShadow: '0 40px 100px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)',
          }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '.75rem' }}>
                From Bryan
              </div>
              <h2 style={{
                fontFamily: 'var(--serif)', fontSize: 'clamp(2.5rem,7vw,4rem)', fontWeight: 300,
                color: 'white', lineHeight: 1.05, margin: '0 0 2.5rem',
              }}>
                You're invited to something<br /><em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>truly special</em>
              </h2>
              <p style={{
                fontFamily: 'var(--serif)', fontSize: 'clamp(1.2rem,2.5vw,1.65rem)', fontWeight: 300,
                lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', marginBottom: '1.75rem', maxWidth: 680,
              }}>
                "Forty years in, and somehow every year finds me more grateful for the people in it. I wanted to celebrate this one somewhere worth the flight — so I picked France."
              </p>
              <p style={{
                fontSize: '1.05rem', fontWeight: 300, lineHeight: 2,
                color: 'rgba(255,255,255,.7)', marginBottom: '3rem', maxWidth: 600,
              }}>
                We've planned three days of unforgettable events in Montpellier — a rooftop welcome, a garden soirée, and a beach brunch on the Mediterranean. Book your hotels and travel early, as September fills fast.
              </p>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontStyle: 'italic', color: 'var(--terra)', fontWeight: 300 }}>
                — Bryan
              </div>
            </div>
          </div>
        </FU>
      </section>

      {/* ── EVENTS ──────────────────────────────────────────────────── */}
      <section id="events" style={{ background: 'var(--cream)', padding: 'clamp(4rem,10vh,8rem) clamp(1.5rem,6vw,5rem)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <FU>
            <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              The Celebrations
              <span style={{ flex: 1, height: 1, background: 'rgba(192,125,94,.3)', maxWidth: 60, display: 'block' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.05, color: 'var(--navy-mid)', marginBottom: '3.5rem' }}>
              One <em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>unforgettable</em> weekend.
            </h2>
          </FU>

          {/* Event cards */}
          {[
            {
              day: '18', dayName: 'Friday', time: '7:00 PM',
              title: 'Rooftop Sunset Welcome',
              venueName: "L'ARBRE BLANC ROOFTOP",
              venueUrl: 'https://larbre-restaurant.fr/le-bar/',
              address: '1 Pl. Christophe Colomb, Montpellier',
              addressUrl: 'https://www.google.com/maps/place/1+Pl.+Christophe+Colomb,+34000+Montpellier,+France',
              ig: '@larbrerooftop', igUrl: 'https://www.instagram.com/larbrerooftop/',
              desc: 'Join us for welcome drinks and tapas as we toast to 40 years. Experience the golden hour over Montpellier from this landmark architectural rooftop.',
            },
            {
              day: '19', dayName: 'Saturday', time: '8:00 PM',
              title: 'Contemporary Garden Soirée',
              venueName: 'MO.CO. MONTPELLIER CONTEMPORAIN',
              venueUrl: 'https://www.moco.art/en',
              address: '13 Rue de la République, Montpellier',
              addressUrl: 'https://www.google.com/maps/place/13+Rue+de+la+R%C3%A9publique,+34000+Montpellier,+France',
              ig: '@montpelliercontemporain', igUrl: 'https://www.instagram.com/montpelliercontemporain/',
              desc: 'A sophisticated evening of modern art, local wines and seasonal cocktails in the museum gardens. A DJ set will keep the tone for the night.',
            },
            {
              day: '20', dayName: 'Sunday', time: '1:00 PM',
              title: 'Boho Beach Brunch',
              venueName: 'EFFET MER',
              venueUrl: 'https://www.effetmer.com/',
              address: 'Avenue du Grand Travers, La Grande-Motte',
              addressUrl: 'https://www.google.com/maps/search/L\'Effet+Mer+Avenue+du+Grand+Travers',
              ig: '@effet.mer', igUrl: 'https://www.instagram.com/effet.mer/',
              desc: 'A relaxed afternoon brunch on the Mediterranean sands. Expect copious food, ocean swimming and a final toast to the weekend.',
            },
          ].map((ev) => (
            <FU key={ev.day} style={{ marginBottom: '2rem' }}>
              <div className="b40-event-card" style={{
                display: 'flex', flexDirection: 'row', gap: '3rem',
                background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(192,125,94,0.1)',
                borderRadius: '2rem', padding: '2.5rem', alignItems: 'flex-start',
                transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
              }}>
                <div className="b40-event-date-stack" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120, flexShrink: 0,
                  borderRight: '1px solid rgba(192,125,94,.3)', paddingRight: '2.5rem', paddingBottom: '1rem',
                }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '3.2rem', fontWeight: 300, color: 'var(--navy-mid)', lineHeight: 1 }}>{ev.day}</span>
                  <span style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--terra)', marginTop: '.6rem' }}>{ev.dayName}</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontFamily: 'var(--sans)', fontSize: '.8rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--terra)', marginTop: '.8rem' }}>
                    🕐 {ev.time}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '2.2rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--navy-mid)', lineHeight: 1.1, marginBottom: '.75rem' }}>
                    {ev.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', marginBottom: '1rem', fontSize: '.75rem', fontWeight: 600, color: 'var(--navy-soft)', letterSpacing: '.12em', textTransform: 'uppercase', opacity: .85 }}>
                    <a href={ev.venueUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{ev.venueName}</a>
                    <span style={{ opacity: .4 }}>·</span>
                    <a href={ev.addressUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--stone)', textDecoration: 'none', fontWeight: 400, letterSpacing: '.05em', textTransform: 'none' }}>{ev.address}</a>
                    <span style={{ opacity: .4 }}>·</span>
                    <a href={ev.igUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terra)', textDecoration: 'none', fontSize: '.7rem', opacity: .8 }}>{ev.ig}</a>
                  </div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.8, color: 'var(--stone)' }}>{ev.desc}</p>
                </div>
              </div>
            </FU>
          ))}

          {/* Excursion */}
          <FU delay={100}>
            <div style={{ marginTop: '3rem' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                Optional Excursion
                <span style={{ flex: 1, height: 1, background: 'rgba(192,125,94,.3)', maxWidth: 60, display: 'block' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 300, color: 'var(--navy-mid)', marginBottom: '2rem' }}>
                Extend your <em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>Mediterranean</em> visit.
              </h3>
              <div className="b40-event-card" style={{
                display: 'flex', flexDirection: 'row', gap: '3rem',
                background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(192,125,94,0.1)',
                borderRadius: '2rem', padding: '2.5rem', alignItems: 'flex-start',
                transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
              }}>
                <div className="b40-event-date-stack" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120, flexShrink: 0,
                  borderRight: '1px solid rgba(192,125,94,.3)', paddingRight: '2.5rem', paddingBottom: '1rem',
                }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '3.2rem', fontWeight: 300, color: 'var(--navy-mid)', lineHeight: 1 }}>19</span>
                  <span style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--terra)', marginTop: '.6rem' }}>Saturday</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontFamily: 'var(--sans)', fontSize: '.8rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--terra)', marginTop: '.8rem' }}>
                    🕙 10:30 AM
                  </div>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '2.2rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--navy-mid)', lineHeight: 1.1, marginBottom: '.75rem' }}>
                    Pic St Loup Wine Tour
                  </h3>
                  <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--navy-soft)', letterSpacing: '.12em', textTransform: 'uppercase', opacity: .85, marginBottom: '1rem' }}>
                    DEPARTS PREFECTURE ·{' '}
                    <a href="https://www.bertrandbosc.guide/en/home/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terra)', textDecoration: 'none', opacity: .8 }}>bertrandbosc.guide</a>
                  </div>
                  <p style={{ fontSize: '1.05rem', fontWeight: 300, lineHeight: 1.8, color: 'var(--stone)' }}>
                    An optional Saturday daytime excursion into the stunning Pic St Loup wine region. Enjoy a guided tasting from Bertrand Bosc and a homemade lunch prepared by his mother on their family estate.
                  </p>
                </div>
              </div>
            </div>
          </FU>
        </div>
      </section>

      {/* ── HOTELS ──────────────────────────────────────────────────── */}
      <section id="hotels" style={{ background: 'var(--cream-dk)', padding: 'clamp(4rem,10vh,8rem) clamp(1.5rem,6vw,5rem)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <FU>
            <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              Where to Stay
              <span style={{ flex: 1, height: 1, background: 'rgba(192,125,94,.3)', maxWidth: 60, display: 'block' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.05, color: 'var(--navy-mid)', marginBottom: '3rem' }}>
              Your <em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>home</em> away from home.
            </h2>
          </FU>

          <div className="b40-hotels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {[
              {
                img: 'https://www.hotel-richerdebelleval.com/wp-content/uploads/2021/07/exterieure-hotel-richer-de-belleval-montpellier.jpg',
                tier: 'Luxury · $$$$', name: 'Hôtel Richer De Belleval',
                loc: "L'Écusson · Place de la Canourgue",
                desc: 'A Relais & Châteaux property in a magnificently restored 17th-century mansion with Michelin-starred dining. The most romantic address in the city.',
                rate: '~€350 / $385', rating: '⭐ 4.7', walkTime: '8 min walk',
                bookUrl: 'https://www.hotel-richerdebelleval.com/reservations/',
              },
              {
                img: 'https://image-tc.galaxy.tf/wijpeg-53iiy72mryxiajxc5nmfip48n/oceania-montpellier-lobby-5.jpg?width=900',
                tier: 'Classic · $$$', name: 'Oceania Le Métropole',
                loc: 'City Center · Near Train Station',
                desc: 'Belle Époque charm meets modern comfort with a lovely exotic garden and pool. Steps from both Place de la Comédie and the train station.',
                rate: '~€160 / $175', rating: '⭐ 4.3', walkTime: '3 min walk',
                bookUrl: 'https://www.oceaniahotels.com/fr/hotel/le-metropole',
              },
              {
                img: 'https://www.jost-hotel-montpellier.com/wp-content/uploads/schema/jost-hotel-montpellier.jpg',
                tier: 'Trendy · $$', name: 'JOST Hotel',
                loc: "Near Train Station · L'Écusson Edge",
                desc: 'A sleek, design-led boutique hotel with a warm atmosphere, a celebrated restaurant, and excellent value. Ideal for guests who want personality over prestige.',
                rate: '~€110 / $120', rating: '⭐ 4.5', walkTime: '6 min walk',
                bookUrl: 'https://www.jost-hotel-montpellier.com',
              },
              {
                img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=900&auto=format&fit=crop',
                tier: 'Budget / Groups · $', name: 'Aparthotel Adagio',
                loc: 'Port Marianne District',
                desc: 'Spacious studio and one-bedroom apartments with kitchenettes. Smart choice for families, couples extending their stay, or anyone wanting more space.',
                rate: '~€80 / $88', rating: '⭐ 4.1', walkTime: 'Tram · 8 min',
                bookUrl: 'https://www.adagio-city.com/gb/hotel-9513-aparthotel-adagio-montpellier-centre/index.shtml',
              },
            ].map((h) => (
              <FU key={h.name}>
                <div className="b40-hotel-card" style={{
                  background: 'white', borderRadius: '1.75rem', overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 4px 12px rgba(0,0,0,.03)',
                  transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ position: 'relative', height: 220, overflow: 'hidden', flexShrink: 0 }}>
                    <img className="b40-hotel-img-inner" src={h.img} alt={h.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 1.2s cubic-bezier(0.165, 0.84, 0.44, 1)' }} />
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'white', color: 'var(--navy-mid)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '.35rem .8rem', borderRadius: 100, boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
                      {h.tier}
                    </div>
                  </div>
                  <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.6rem' }}>
                      <span style={{ color: 'var(--terra)', fontSize: '.8rem' }}>📍</span>
                      <span style={{ fontSize: '.75rem', fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--stone)' }}>{h.loc}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 300, fontStyle: 'italic', color: 'var(--navy-mid)', marginBottom: '.75rem', lineHeight: 1.1 }}>{h.name}</h3>
                    <p style={{ fontSize: '.92rem', fontWeight: 300, lineHeight: 1.75, color: 'var(--stone)', marginBottom: '1.25rem', flex: 1 }}>{h.desc}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem 1rem', marginBottom: '1.5rem' }}>
                      {[['Est. Rate', h.rate], ['Rating', h.rating], ['To Comédie', h.walkTime], ['Check-in', '3:00 PM']].map(([label, val]) => (
                        <div key={label}>
                          <label style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--navy-mid)', display: 'block', marginBottom: '.15rem' }}>{label}</label>
                          <span style={{ fontSize: '.9rem', fontWeight: 300, color: 'var(--stone)' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <a href={h.bookUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                      background: 'var(--navy-mid)', color: 'white', textDecoration: 'none',
                      fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase',
                      padding: '.75rem 1rem', borderRadius: 100,
                      transition: 'background .2s, transform .2s',
                    }}>
                      📅 Book Direct
                    </a>
                  </div>
                </div>
              </FU>
            ))}
          </div>

          {/* Map CTA */}
          <FU delay={100}>
            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
              <a
                href="https://www.stay22.com/embed/69c1247ab7b17be547e5bff0"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.6rem',
                  background: 'var(--navy-mid)', color: 'white', textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--sans)',
                  fontSize: '.75rem', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase',
                  padding: '1rem 2rem', borderRadius: 100, boxShadow: '0 8px 32px rgba(14,28,42,.2)',
                }}
              >
                🗺 View Accommodations on Map
              </a>
            </div>
          </FU>
        </div>
      </section>

      {/* ── TRAVEL ──────────────────────────────────────────────────── */}
      <section id="travel" style={{ background: 'var(--cream)', padding: 'clamp(4rem,10vh,8rem) clamp(1.5rem,6vw,5rem)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <FU>
            <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              Getting There
              <span style={{ flex: 1, height: 1, background: 'rgba(192,125,94,.3)', maxWidth: 60, display: 'block' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.05, color: 'var(--navy-mid)', marginBottom: '3rem' }}>
              Your route to <em style={{ fontStyle: 'italic', color: 'var(--terra)' }}>Montpellier</em>.
            </h2>
          </FU>

          <div className="b40-travel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              {
                badge: 'Recommended · Most Connected',
                title: 'Via Paris (CDG)',
                desc: 'The most seamless option. Fly into Charles de Gaulle and board the direct TGV from the terminal — no city transfer needed.',
                flightQ: 'Flights+to+Paris',
                trainNote: 'Direct TGV from CDG Terminal 2 → Montpellier Saint-Roch.',
                bgImg: 'https://www.historyhit.com/app/uploads/bis-images/5150542/The-Eiffel-Tower-1576x1074.jpg',
              },
              {
                badge: 'Best Value · Scenic Route',
                title: 'Via Barcelona (BCN)',
                desc: "Frequently the cheapest transatlantic option. Easy transfer from the airport to Sants station for the spectacular coastal train north into France.",
                flightQ: 'Flights+to+Barcelona',
                trainNote: 'Aerobús from BCN → Barcelona Sants, then TGV/Renfe → Montpellier Saint-Roch.',
                bgImg: 'https://www.barcelo.com/guia-turismo/wp-content/uploads/que-visitar-en-barcelona-1.jpg',
              },
              {
                badge: 'Most Convenient · Direct Access',
                title: 'Direct to Montpellier (MPL)',
                desc: "The absolute easiest way to arrive. Montpellier is well connected with direct flights from Paris, London, Rome, Istanbul, Amsterdam, and Madrid.",
                flightQ: 'MPL',
                trainNote: 'Quick 15-minute Uber directly to the L\'Écusson city center or take the local airport shuttle.',
                bgImg: 'https://thumbs.dreamstime.com/b/montpellier-france-august-terminal-building-airport-mpl-182359143.jpg',
              },
            ].map((col) => (
              <FU key={col.title}>
                <div className="b40-travel-col" style={{
                  background: 'var(--navy-mid)', color: 'white',
                  borderRadius: '1.75rem', border: '1px solid rgba(255,255,255,.1)',
                  boxShadow: '0 4px 30px rgba(0,0,0,.15)',
                  transition: 'transform .3s, box-shadow .3s',
                  overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
                }}>
                  {/* BG image */}
                  <div className="b40-travel-bg" style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url('${col.bgImg}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    opacity: .45, transition: 'all .6s',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1, padding: '3rem 2.25rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '.75rem', display: 'block', textShadow: '0 1px 8px rgba(0,0,0,.4)' }}>
                      {col.badge}
                    </span>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.65rem', fontStyle: 'italic', fontWeight: 300, color: 'white', marginBottom: '.75rem', textShadow: '0 1px 8px rgba(0,0,0,.3)' }}>
                      {col.title}
                    </h3>
                    <p style={{ fontSize: '.92rem', fontWeight: 300, lineHeight: 1.6, color: 'rgba(255,255,255,.95)', textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>
                      {col.desc}
                    </p>
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, padding: '0 2.25rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <a
                      href={`https://www.google.com/travel/flights?q=${col.flightQ}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                        background: 'rgba(255,255,255,0.1)', color: 'white',
                        border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)',
                        textDecoration: 'none', fontSize: '.7rem', fontWeight: 600,
                        letterSpacing: '.12em', textTransform: 'uppercase',
                        padding: '.75rem 1.4rem', borderRadius: 100,
                        transition: 'all .3s',
                      }}
                    >
                      ✈ Search Flights
                    </a>
                    <div style={{ paddingTop: '1rem' }}>
                      <div style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '.35rem' }}>
                        {col.title.includes('Montpellier') ? 'Airport to City Center' : `${col.title.split('(')[0].trim().replace('Via ', '')} to Montpellier`}
                      </div>
                      <div style={{ fontSize: '.88rem', fontWeight: 300, color: 'white', lineHeight: 1.6 }}>
                        {col.trainNote}
                      </div>
                    </div>
                    {!col.title.includes('Montpellier') && (
                      <a
                        href="https://www.thetrainline.com/"
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                          background: 'rgba(255,255,255,0.1)', color: 'white',
                          border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)',
                          textDecoration: 'none', fontSize: '.7rem', fontWeight: 600,
                          letterSpacing: '.12em', textTransform: 'uppercase',
                          padding: '.75rem 1.4rem', borderRadius: 100,
                          transition: 'all .3s',
                        }}
                      >
                        🚄 Book Train Tickets
                      </a>
                    )}
                  </div>
                </div>
              </FU>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,.06)', padding: '3rem clamp(1.5rem,6vw,5rem)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 300, color: 'white', marginBottom: '.25rem' }}>Bryan's 40th</p>
            <p style={{ fontSize: '.72rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)' }}>Sep 18–20, 2026 · Montpellier, France</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <a href="https://voyageurs.app" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,.4)', fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Powered by Voyageurs
            </a>
            <p style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.25)', marginTop: '.35rem' }}>
              © 2026 Candor Digital Group, LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventLandingPage;
