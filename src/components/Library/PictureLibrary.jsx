// ============================================================
// Behavior Ally — PictureLibrary React Component
// Integrated into PEAK Curriculum App
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  CATEGORIES, WIKI_CATEGORIES, COLORS, SHAPES, NUMBERS, LETTERS,
  SHAPE_COLORS, NUMBER_STYLES, LETTER_STYLES, NUMBER_WORDS,
  getVariants,
} from '../../data/pictureLibraryData';

// ── Brand tokens ────────────────────────────────────────────
const C = {
  coral:  '#D9674A',
  green:  '#5A8B3C',
  coralBg:'#FBF0ED',
  greenBg:'#EFF6EA',
  border: '#E5E7EB',
  gray:   '#6B7280',
  text:   '#111827',
  sub:    '#374151',
};

// ── Wikipedia image cache (module-level, shared across all uses) ──
export const imgCache = {};

/** Fetch a Wikipedia thumbnail URL for a given term.
 *  1. Tries the REST summary API directly (fast, works for exact article titles).
 *  2. Falls back to OpenSearch if no thumbnail found (handles near-misses and
 *     descriptive phrases by finding the best matching Wikipedia article). */
async function fetchWikiImgUrl(term) {
  // Step 1 — direct REST lookup
  try {
    const r = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`
    );
    if (r.ok) {
      const d = await r.json();
      if (d.thumbnail?.source) return d.thumbnail.source;
    }
  } catch (_) {}

  // Step 2 — OpenSearch fallback: find the canonical article title
  try {
    const r = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(term)}&limit=1&format=json&origin=*`
    );
    const [, titles] = await r.json();
    const title = titles?.[0];
    if (title) {
      const r2 = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
      );
      if (r2.ok) {
        const d = await r2.json();
        if (d.thumbnail?.source) return d.thumbnail.source;
      }
    }
  } catch (_) {}

  return null;
}

function useWikiImg(term) {
  const [src, setSrc] = useState(imgCache[term] ?? null);
  const [status, setStatus] = useState(imgCache[term] !== undefined ? 'done' : 'loading');
  useEffect(() => {
    if (!term) return;
    if (imgCache[term] !== undefined) { setSrc(imgCache[term]); setStatus('done'); return; }
    fetchWikiImgUrl(term).then(u => {
      imgCache[term] = u;
      setSrc(u);
      setStatus('done');
    });
  }, [term]);
  return { src, loading: status === 'loading' };
}

// ── Atom: Wikipedia image ───────────────────────────────────
export function WikiImg({ term, size = 80, radius = 8 }) {
  const { src, loading } = useWikiImg(term);
  const box = { width: size, height: size, borderRadius: radius, background: '#F3F4F6',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 };
  if (loading) return (
    <div style={box}>
      <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTopColor: C.coral,
        borderRadius: '50%', animation: 'ba-spin 0.7s linear infinite' }} />
    </div>
  );
  if (!src) return <div style={{ ...box, fontSize: 10, color: C.gray }}>—</div>;
  return <img src={src} alt={term} style={{ width: size, height: size, objectFit: 'cover', borderRadius: radius }} />;
}

// ── Atom: Shape SVG ─────────────────────────────────────────
export function ShapeSvg({ shape, color = C.coral, size = 80 }) {
  const s = size, cx = s / 2, cy = s / 2;
  const poly = (n, r, off = -90) =>
    Array.from({ length: n }, (_, i) => {
      const a = (off + i * 360 / n) * Math.PI / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  const star = () =>
    Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? s * 0.42 : s * 0.18, a = (-90 + i * 36) * Math.PI / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  const heart = `M${cx} ${s*.8} C${s*.2} ${s*.6},${s*.05} ${s*.45},${s*.05} ${s*.3}
    C${s*.05} ${s*.15},${s*.15} ${s*.08},${s*.28} ${s*.08}
    C${s*.36} ${s*.08},${s*.43} ${s*.12},${cx} ${s*.2}
    C${s*.57} ${s*.12},${s*.64} ${s*.08},${s*.72} ${s*.08}
    C${s*.85} ${s*.08},${s*.95} ${s*.15},${s*.95} ${s*.3}
    C${s*.95} ${s*.45},${s*.8} ${s*.6},${cx} ${s*.8} Z`;
  const els = {
    circle:    <circle cx={cx} cy={cy} r={s*.41} fill={color} />,
    square:    <rect x={s*.1} y={s*.1} width={s*.8} height={s*.8} fill={color} />,
    triangle:  <polygon points={`${cx},${s*.08} ${s*.92},${s*.88} ${s*.08},${s*.88}`} fill={color} />,
    rectangle: <rect x={s*.06} y={s*.24} width={s*.88} height={s*.52} fill={color} />,
    oval:      <ellipse cx={cx} cy={cy} rx={s*.43} ry={s*.27} fill={color} />,
    diamond:   <polygon points={`${cx},${s*.07} ${s*.93},${cy} ${cx},${s*.93} ${s*.07},${cy}`} fill={color} />,
    star:      <polygon points={star()} fill={color} />,
    heart:     <path d={heart} fill={color} />,
    pentagon:  <polygon points={poly(5, s*.42)} fill={color} />,
    hexagon:   <polygon points={poly(6, s*.42)} fill={color} />,
  };
  return <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s} style={{ display: 'block' }}>{els[shape]}</svg>;
}

// ── Atom: Number display ────────────────────────────────────
export function NumberDisplay({ value, style = 'numeral', size = 80 }) {
  const bg = { width: size, height: size, borderRadius: 8, background: C.coralBg,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  if (style === 'numeral') return (
    <div style={bg}><span style={{ fontSize: size * 0.58, fontWeight: 900, color: C.coral, lineHeight: 1 }}>{value}</span></div>
  );
  if (style === 'word') return (
    <div style={{ ...bg, padding: 4 }}><span style={{ fontSize: size * 0.2, fontWeight: 800, color: C.coral, textAlign: 'center' }}>{NUMBER_WORDS[value]?.toUpperCase()}</span></div>
  );
  if (style === 'dots') {
    const dots = Array.from({ length: Math.min(value, 10) });
    const r = size * 0.08;
    return (
      <div style={{ ...bg, flexWrap: 'wrap', gap: size * 0.05, padding: size * 0.12 }}>
        {dots.map((_, i) => <div key={i} style={{ width: r*2, height: r*2, borderRadius: '50%', background: C.coral, flexShrink: 0 }} />)}
      </div>
    );
  }
  if (style === 'tally') {
    const groups = Math.floor(value / 5), rem = value % 5;
    return (
      <div style={{ ...bg, flexDirection: 'column', gap: 3, padding: 6 }}>
        {Array.from({ length: groups }).map((_, g) => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ width: 3, height: size*0.22, background: C.coral, borderRadius: 2 }} />)}
            <div style={{ width: size*0.22, height: 3, background: C.coral, borderRadius: 2, marginLeft: 1 }} />
          </div>
        ))}
        {rem > 0 && (
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: rem }).map((_, i) => <div key={i} style={{ width: 3, height: size*0.22, background: C.coral, borderRadius: 2 }} />)}
          </div>
        )}
      </div>
    );
  }
  if (style === 'dice') {
    const pip = (top, left) => <div style={{ position: 'absolute', top: `${top}%`, left: `${left}%`, width: size*0.13, height: size*0.13, borderRadius: '50%', background: C.coral, transform: 'translate(-50%,-50%)' }} />;
    const pips = {
      1: [pip(50,50)],
      2: [pip(28,28),pip(72,72)],
      3: [pip(25,25),pip(50,50),pip(75,75)],
      4: [pip(28,28),pip(28,72),pip(72,28),pip(72,72)],
      5: [pip(25,25),pip(25,75),pip(50,50),pip(75,25),pip(75,75)],
      6: [pip(25,25),pip(25,75),pip(50,25),pip(50,75),pip(75,25),pip(75,75)],
    };
    if (value > 6) return (
      <div style={bg}><span style={{ fontSize: size*0.42, fontWeight: 900, color: C.coral }}>⚄{value}</span></div>
    );
    return (
      <div style={{ ...bg, position: 'relative', border: `2px solid ${C.border}`, background: 'white', borderRadius: 12 }}>
        {(pips[value] || []).map((p, i) => React.cloneElement(p, { key: i }))}
      </div>
    );
  }
  return <div style={bg}><span style={{ fontSize: size*0.5, fontWeight: 900, color: C.coral }}>{value}</span></div>;
}

// ── Atom: Letter display ────────────────────────────────────
export function LetterDisplay({ value, style = 'upper_coral', size = 80 }) {
  const s = LETTER_STYLES.find(x => x.id === style) || LETTER_STYLES[0];
  const letter = s.case === 'lower' ? value.toLowerCase() : value.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: C.greenBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.62, fontWeight: 900, color: s.color, lineHeight: 1, fontFamily: 'Nunito,sans-serif' }}>{letter}</span>
    </div>
  );
}

// ── usePictureLibrary hook ──────────────────────────────────
export function usePictureLibrary(category, itemId) {
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const variants = getVariants(category, itemId);
  return { variants, activeVariantIndex, activeVariant: variants[activeVariantIndex], setActiveVariantIndex };
}

// ── VariantStrip: 5 thumbnails in a row ─────────────────────
export function VariantStrip({ category, itemId, activeIndex, onSelect, thumbSize = 56 }) {
  const variants = getVariants(category, itemId);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {variants.map((v, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} onClick={() => onSelect(i)}
            style={{ width: thumbSize, height: thumbSize, borderRadius: 7, border: `2px solid ${active ? C.coral : C.border}`,
              background: active ? C.coralBg : 'white', cursor: 'pointer', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s' }}>
            {v.type === 'shape'  && <ShapeSvg shape={v.shape} color={v.color} size={thumbSize - 10} />}
            {v.type === 'number' && <NumberDisplay value={v.value} style={v.style} size={thumbSize - 4} />}
            {v.type === 'letter' && <LetterDisplay value={v.value} style={v.style} size={thumbSize - 4} />}
            {v.type === 'wiki'   && <WikiImg term={v.term} size={thumbSize - 4} radius={5} />}
          </div>
        );
      })}
    </div>
  );
}

// ── StimulusCard: primary card shown in a grid ──────────────
export function StimulusCard({ category, itemId, label, active, onClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const variants = getVariants(category, itemId);
  const v = variants[activeIndex];
  return (
    <div onClick={onClick}
      style={{ borderRadius: 10, border: `2px solid ${active ? C.coral : C.border}`,
        background: active ? C.coralBg : 'white', cursor: 'pointer', padding: '8px 6px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.12s' }}>
      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        {v?.type === 'shape'  && <ShapeSvg shape={v.shape} color={v.color} size={78} />}
        {v?.type === 'number' && <NumberDisplay value={v.value} style={v.style} size={78} />}
        {v?.type === 'letter' && <LetterDisplay value={v.value} style={v.style} size={78} />}
        {v?.type === 'wiki'   && <WikiImg term={v.term} size={78} radius={7} />}
        {v?.type === 'color'  && <WikiImg term={v.term} size={78} radius={7} />}
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, textAlign: 'center' }}>{label}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {variants.map((_, i) => (
          <div key={i} onClick={e => { e.stopPropagation(); setActiveIndex(i); }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: i === activeIndex ? C.coral : C.border, cursor: 'pointer', transition: 'background 0.1s' }} />
        ))}
      </div>
    </div>
  );
}

// ── Main PictureLibrary component ───────────────────────────
export default function PictureLibrary({
  onSelect,
  initialCategory = 'shapes',
  showGeneralization = true,
  height = 640,
}) {
  const [tab, setTab] = useState('direct');
  const [cat, setCat] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [genQ, setGenQ] = useState('');
  const [genResults, setGenResults] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genSearched, setGenSearched] = useState(false);

  const getItems = useCallback(() => {
    const q = search.toLowerCase().trim();
    if (cat === 'shapes') return SHAPES.filter(s => !q || s.includes(q)).map(s => ({ id: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
    if (cat === 'colors') return COLORS.filter(c => !q || c.label.toLowerCase().includes(q)).map(c => ({ id: c.id, label: c.label }));
    if (cat === 'numbers') return NUMBERS.filter(n => !q || String(n).includes(q)).map(n => ({ id: `${n}`, label: `${n}` }));
    if (cat === 'letters') return LETTERS.filter(l => !q || l.toLowerCase().includes(q)).map(l => ({ id: l, label: l }));
    return (WIKI_CATEGORIES[cat] || []).filter(t => !q || t.toLowerCase().includes(q)).map(t => ({ id: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));
  }, [cat, search]);

  const handleSelect = (item) => {
    setSelected({ category: cat, itemId: item.id, label: item.label });
    setActiveVariantIndex(0);
  };

  const handleVariantSelect = (idx) => {
    setActiveVariantIndex(idx);
    if (onSelect && selected) {
      const variants = getVariants(selected.category, selected.itemId);
      onSelect({ ...variants[idx], category: selected.category, itemId: selected.itemId });
    }
  };

  const selectedVariants = selected ? getVariants(selected.category, selected.itemId) : [];
  const activeVariant = selectedVariants[activeVariantIndex];

  const searchGen = async () => {
    if (!genQ.trim()) return;
    setGenLoading(true); setGenSearched(true); setGenResults([]);
    try {
      const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(genQ)}&prop=imageinfo&iiprop=url|mime&format=json&origin=*&gsrlimit=20`);
      const d = await r.json();
      const imgs = Object.values(d.query?.pages || {})
        .filter(p => { const m = p.imageinfo?.[0]?.mime || ''; return m.startsWith('image/') && !m.includes('svg') && !m.includes('tiff'); })
        .map(p => ({ url: p.imageinfo[0].url, title: p.title.replace('File:', '').replace(/\.[^.]+$/, '') }))
        .slice(0, 12);
      setGenResults(imgs);
    } catch { setGenResults([]); }
    setGenLoading(false);
  };

  const items = getItems();
  const catInfo = CATEGORIES.find(c => c.id === cat);

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", height, display: 'flex', flexDirection: 'column', background: '#F9FAFB', position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes ba-spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: `2px solid ${C.coral}`, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 900, fontSize: 13, color: C.text }}>⭐ Built-in Library</span>
        {showGeneralization && (
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ id: 'direct', label: 'Direct Training' }, { id: 'gen', label: 'Generalization' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: `1.5px solid ${tab === t.id ? C.coral : C.border}`, background: tab === t.id ? C.coral : 'white', color: tab === t.id ? 'white' : C.gray, cursor: 'pointer' }}>{t.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Direct Training */}
      {tab === 'direct' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{ width: 120, background: 'white', borderRight: `1px solid ${C.border}`, overflowY: 'auto', flexShrink: 0 }}>
            {CATEGORIES.map(c => (
              <div key={c.id} onClick={() => { setCat(c.id); setSearch(''); setSelected(null); }}
                style={{ padding: '7px 8px 7px 10px', fontSize: 11, fontWeight: cat === c.id ? 800 : 600, color: cat === c.id ? C.coral : C.sub, background: cat === c.id ? C.coralBg : 'transparent', borderLeft: `3px solid ${cat === c.id ? C.coral : 'transparent'}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{c.label}</span>
                <span style={{ fontSize: 9, color: C.gray }}>{c.count}</span>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Search bar */}
            <div style={{ padding: '6px 10px', background: 'white', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Filter ${catInfo?.label.toLowerCase()}…`}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12, background: 'transparent', color: C.text, fontFamily: 'inherit' }} />
              {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.gray, fontSize: 16 }}>×</button>}
              <span style={{ fontSize: 10, color: C.gray, whiteSpace: 'nowrap' }}>{items.length}</span>
            </div>
            {/* Treatment integrity bar */}
            <div style={{ padding: '3px 12px', background: C.greenBg, borderBottom: `1px solid #C6E0AC`, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: C.green, fontWeight: 800 }}>✓ 5 stable variants per target — consistent across all therapists</span>
            </div>

            {/* Main split: grid + detail panel */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 6 }}>
                  {items.map(item => (
                    <StimulusCard key={item.id} category={cat} itemId={item.id} label={item.label}
                      active={selected?.itemId === item.id && selected?.category === cat}
                      onClick={() => handleSelect(item)} />
                  ))}
                </div>
              </div>

              {/* Variant detail panel */}
              {selected && selected.category === cat && (
                <div style={{ width: 190, background: 'white', borderLeft: `1px solid ${C.border}`, padding: 12, overflowY: 'auto', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 12, color: C.text }}>{selected.label}</span>
                    <button onClick={() => setSelected(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.gray, fontSize: 16 }}>×</button>
                  </div>
                  {/* Large preview */}
                  <div style={{ width: '100%', height: 140, background: '#F9FAFB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 }}>
                    {activeVariant?.type === 'shape'  && <ShapeSvg shape={activeVariant.shape} color={activeVariant.color} size={125} />}
                    {activeVariant?.type === 'number' && <NumberDisplay value={activeVariant.value} style={activeVariant.style} size={125} />}
                    {activeVariant?.type === 'letter' && <LetterDisplay value={activeVariant.value} style={activeVariant.style} size={125} />}
                    {activeVariant?.type === 'wiki'   && <WikiImg term={activeVariant.term} size={135} radius={9} />}
                  </div>
                  {/* Variant label */}
                  <div style={{ background: C.coralBg, borderRadius: 6, padding: '4px 7px', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.coral }}>Variant {activeVariantIndex + 1}/5</span>
                    <p style={{ margin: '1px 0 0', fontSize: 10, color: '#7C2D12' }}>{activeVariant?.label}</p>
                  </div>
                  {/* 5 thumbnails */}
                  <p style={{ margin: '0 0 5px', fontSize: 9, fontWeight: 800, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.06em' }}>All 5 Variants</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3 }}>
                    {selectedVariants.map((v, i) => (
                      <div key={i} onClick={() => handleVariantSelect(i)}
                        style={{ width: '100%', aspectRatio: '1', borderRadius: 5, border: `2px solid ${i === activeVariantIndex ? C.coral : C.border}`, background: i === activeVariantIndex ? C.coralBg : '#F9FAFB', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {v.type === 'shape'  && <ShapeSvg shape={v.shape} color={v.color} size={28} />}
                        {v.type === 'number' && <NumberDisplay value={v.value} style={v.style} size={28} />}
                        {v.type === 'letter' && <LetterDisplay value={v.value} style={v.style} size={28} />}
                        {v.type === 'wiki'   && <WikiImg term={v.term} size={30} radius={3} />}
                      </div>
                    ))}
                  </div>
                  {onSelect && (
                    <button onClick={() => { if (onSelect && activeVariant) onSelect({ ...activeVariant, category: selected.category, itemId: selected.itemId }); }}
                      style={{ marginTop: 10, width: '100%', padding: '7px 0', background: C.coral, color: 'white', border: 'none', borderRadius: 7, fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Use This Stimulus
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generalization tab */}
      {tab === 'gen' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          <div style={{ background: C.coralBg, border: `1px solid #F0B9A4`, borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#7C2D12', margin: 0 }}><strong>Generalization phase only.</strong> Use after mastery with Direct Training stimuli. Wikimedia Commons provides varied real-world photos for stimulus generalization probes.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input value={genQ} onChange={e => setGenQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchGen()}
              placeholder="Search real-world images (e.g. 'dog', 'apple')…"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={searchGen} disabled={!genQ.trim() || genLoading}
              style={{ padding: '8px 16px', borderRadius: 8, background: genQ.trim() && !genLoading ? C.coral : '#E5E7EB', color: genQ.trim() && !genLoading ? 'white' : C.gray, border: 'none', fontWeight: 800, fontSize: 12, cursor: !genQ.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {genLoading ? '…' : 'Search'}
            </button>
          </div>
          {!genLoading && genResults.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
              {genResults.map((img, i) => (
                <div key={i} onClick={() => onSelect?.({ type: 'generalization', src: img.url, label: img.title })}
                  style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.border}`, cursor: 'pointer', background: 'white' }}>
                  <img src={img.url} alt={img.title} style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '5px 8px' }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!genSearched && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: C.gray }}>
              <p style={{ fontSize: 13, margin: 0 }}>Search for varied real-world images</p>
              <p style={{ fontSize: 11, margin: '4px 0 0', color: '#9CA3AF' }}>Use only after mastery of Direct Training targets</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
