// Content Studio: a weekly social calendar with an approval workflow, posting-cadence
// targets and content-pillar rotation. Published posts can be logged as campaigns so
// their results feed the tactic analysis.
import React, { useMemo, useState } from 'react';
import { BarChart3, Check, ChevronLeft, ChevronRight, Film, Image, Layers, Plus, Radio, Video } from 'lucide-react';
import { PILLARS, PILLAR_NAMES, TACTICS } from './constants.js';
import { Modal } from './forms.jsx';

export const POST_FORMATS = {
  Reel: { icon: Film, tactic: 'Listing Reel' },
  Carousel: { icon: Layers, tactic: 'Listing carousel' },
  'Single image': { icon: Image, tactic: 'Just Listed / Just Sold post' },
  Story: { icon: Radio, tactic: 'Stories' },
  Video: { icon: Video, tactic: 'Client testimonial' }
};

export const POST_STATUSES = ['Draft', 'In review', 'Approved', 'Published'];

const STATUS_STYLES = {
  Draft: 'bg-stone-100 text-stone-600',
  'In review': 'bg-amber-50 text-amber-800',
  Approved: 'bg-sky-50 text-sky-800',
  Published: 'bg-emerald-50 text-emerald-800'
};

const SOCIAL_PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Pinterest'];

// Weekly cadence targets for a consistent, professional feed.
const CADENCE = [
  { label: 'Reels', formats: ['Reel'], min: 2, max: 3 },
  { label: 'Feed posts & carousels', formats: ['Carousel', 'Single image'], min: 1, max: 2 },
  { label: 'Pillars covered', pillars: true, min: 3, max: PILLAR_NAMES.length }
];

// ---------- dates (local time, no UTC drift) ----------

export const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export function startOfWeek(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return addDays(x, -((x.getDay() + 6) % 7)); // Monday
}
const weekLabel = monday => {
  const sunday = addDays(monday, 6);
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
};

// Sample posts laid out around the current week so the calendar is never empty on first load.
export function buildSamplePosts(today = new Date()) {
  const monday = startOfWeek(today);
  const at = offset => isoDate(addDays(monday, offset));
  const both = ['Instagram', 'Facebook'];
  return [
    { id: 'p1', date: at(-7), title: 'Just Listed: Harbor View Drive walkthrough', format: 'Reel', pillar: 'Listings', tactic: 'Listing Reel', platforms: both, status: 'Published', caption: 'Step inside a modern coastal retreat with sweeping harbor views. Link in bio for the full tour.', notes: '' },
    { id: 'p2', date: at(-5), title: '3 things sellers overlook before listing', format: 'Carousel', pillar: 'Educational', tactic: 'Buyer & seller tip carousel', platforms: both, status: 'Published', caption: 'Small details, big difference. Save this before you list.', notes: '' },
    { id: 'p3', date: at(-3), title: 'Corona del Mar: where locals get coffee', format: 'Reel', pillar: 'Hyperlocal', tactic: 'Neighborhood spotlight', platforms: ['Instagram', 'TikTok'], status: 'Published', caption: 'Our favorite morning ritual in Corona del Mar.', notes: '' },
    { id: 'p4', date: at(0), title: 'Q3 luxury market update', format: 'Carousel', pillar: 'Market authority', tactic: 'Market update infographic', platforms: both, status: 'Published', caption: 'Luxury inventory is up while days on market hold steady. Here is what that means for sellers.', notes: '' },
    { id: 'p5', date: at(2), title: 'Just Listed: Emerald Bay estate', format: 'Reel', pillar: 'Listings', tactic: 'Listing Reel', platforms: both, status: 'Approved', caption: 'Five bedrooms, ocean views from every level, and a private beach path.', notes: 'Use drone clip as the hook.' },
    { id: 'p6', date: at(4), title: 'Client story: the Martins found their forever home', format: 'Video', pillar: 'Client wins', tactic: 'Client testimonial', platforms: ['Instagram', 'Facebook', 'YouTube'], status: 'In review', caption: '"Kevin made a complex purchase feel simple." Thank you for trusting us.', notes: '' },
    { id: 'p7', date: at(5), title: 'Weekend open house teaser', format: 'Story', pillar: 'Listings', tactic: 'Stories', platforms: ['Instagram'], status: 'Draft', caption: '', notes: '' },
    { id: 'p8', date: at(8), title: 'A day in the life of a luxury broker', format: 'Reel', pillar: 'Lifestyle', tactic: 'Lifestyle / behind the scenes', platforms: both, status: 'Draft', caption: '', notes: '' },
    { id: 'p9', date: at(10), title: 'Just Sold: Laguna cliffside home', format: 'Single image', pillar: 'Client wins', tactic: 'Just Listed / Just Sold post', platforms: both, status: 'Draft', caption: '', notes: '' }
  ];
}

// ---------- view ----------

export function ContentStudio({ posts, setPosts, onLogResults }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [editing, setEditing] = useState(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekKeys = days.map(isoDate);
  const weekPosts = posts.filter(p => weekKeys.includes(p.date));
  const reviewQueue = posts.filter(p => p.status === 'In review').sort((a, b) => a.date.localeCompare(b.date));
  const todayKey = isoDate(new Date());

  // Pillar mix over the four weeks starting with the one on screen.
  const mixKeys = useMemo(() => new Set(Array.from({ length: 28 }, (_, i) => isoDate(addDays(weekStart, i)))), [weekStart]);
  const mixPosts = posts.filter(p => mixKeys.has(p.date));
  const pillarCounts = PILLAR_NAMES.map(name => ({ name, count: mixPosts.filter(p => p.pillar === name).length }));
  const maxPillar = Math.max(1, ...pillarCounts.map(p => p.count));

  const updatePost = (id, patch) => setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  const savePost = post => {
    setPosts(prev => (post.id ? prev.map(p => (p.id === post.id ? post : p)) : [...prev, { ...post, id: `p-${Date.now()}` }]));
    setEditing(null);
  };
  const deletePost = post => {
    if (window.confirm(`Delete "${post.title}"?`)) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setEditing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Social media management</p>
          <h2 className="font-display text-3xl text-stone-900">Content Studio</h2>
          <p className="text-sm text-stone-500 mt-1">Plan the week, review every post before it goes live, and keep the feed on brand.</p>
        </div>
        <button onClick={() => setEditing({ date: todayKey })} className="btn-primary px-4 py-2 rounded-md flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />New post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="panel p-5">
          <h3 className="font-display text-xl text-stone-900 mb-3">This week's cadence</h3>
          <ul className="space-y-3">
            {CADENCE.map(rule => {
              const count = rule.pillars
                ? new Set(weekPosts.map(p => p.pillar).filter(Boolean)).size
                : weekPosts.filter(p => rule.formats.includes(p.format)).length;
              const met = count >= rule.min;
              return (
                <li key={rule.label} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{rule.label}</span>
                  <span className={`tabular-nums font-medium ${met ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {met ? '✓' : '○'} {count} <span className="text-stone-400 font-normal">/ {rule.min}–{rule.max}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-stone-500 mt-4">Plus 3–5 Stories a day to stay top of mind with followers.</p>
        </section>

        <section className="panel p-5">
          <h3 className="font-display text-xl text-stone-900 mb-1">Content pillar mix</h3>
          <p className="text-xs text-stone-500 mb-3">Next 4 weeks. Rotate pillars so the feed isn't only listings.</p>
          <ul className="space-y-1.5">
            {pillarCounts.map(p => (
              <li key={p.name} className="grid grid-cols-[7.5rem_1fr_1.5rem] items-center gap-2 text-sm" title={PILLARS[p.name]}>
                <span className="text-stone-600 truncate">{p.name}</span>
                <span className="h-2.5 rounded-r" style={{ width: `${(p.count / maxPillar) * 100}%`, minWidth: p.count ? 3 : 0, background: 'var(--gold)' }} />
                <span className="text-right tabular-nums text-stone-700">{p.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5">
          <h3 className="font-display text-xl text-stone-900 mb-3">Awaiting approval <span className="text-stone-400 text-base">({reviewQueue.length})</span></h3>
          {reviewQueue.length ? (
            <ul className="space-y-2">
              {reviewQueue.slice(0, 4).map(p => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <button onClick={() => setEditing(p)} className="text-left truncate text-stone-800 hover:underline">{p.title}</button>
                  <span className="flex gap-1 shrink-0">
                    <button onClick={() => updatePost(p.id, { status: 'Approved' })} className="px-2 py-1 text-xs rounded border border-emerald-300 text-emerald-800 hover:bg-emerald-50 flex items-center gap-1"><Check className="w-3 h-3" />Approve</button>
                    <button onClick={() => updatePost(p.id, { status: 'Draft' })} className="px-2 py-1 text-xs rounded border border-stone-300 text-stone-600 hover:bg-stone-50">Revise</button>
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-stone-500">Nothing waiting. Posts you mark "In review" appear here.</p>}
        </section>
      </div>

      <section className="panel">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <button aria-label="Previous week" onClick={() => setWeekStart(w => addDays(w, -7))} className="p-1.5 rounded hover:bg-stone-100"><ChevronLeft className="w-5 h-5" /></button>
          <div className="text-center">
            <p className="font-display text-xl text-stone-900">{weekLabel(weekStart)}</p>
            <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="text-xs text-brand hover:underline">Jump to this week</button>
          </div>
          <button aria-label="Next week" onClick={() => setWeekStart(w => addDays(w, 7))} className="p-1.5 rounded hover:bg-stone-100"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-7 md:divide-x divide-stone-200">
          {days.map(day => {
            const key = isoDate(day);
            const dayPosts = posts.filter(p => p.date === key);
            return (
              <div key={key} className={`p-3 md:min-h-[9rem] border-b md:border-b-0 border-stone-200 ${key === todayKey ? 'bg-amber-50/40' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs uppercase tracking-wider ${key === todayKey ? 'text-brand font-semibold' : 'text-stone-500'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}
                  </span>
                  <button aria-label={`Add post on ${key}`} onClick={() => setEditing({ date: key })} className="text-stone-400 hover:text-stone-800"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                  {dayPosts.map(p => {
                    const Icon = POST_FORMATS[p.format]?.icon ?? Image;
                    return (
                      <button key={p.id} onClick={() => setEditing(p)} className="w-full text-left p-2 rounded-md border border-stone-200 bg-white hover:border-stone-400 transition-colors">
                        <span className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1"><Icon className="w-3.5 h-3.5" />{p.format} · {p.pillar || 'No pillar'}</span>
                        <span className="block text-sm text-stone-900 leading-snug">{p.title}</span>
                        <span className={`inline-block mt-1.5 px-1.5 py-0.5 text-[11px] rounded ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {editing && (
        <Modal title={editing.id ? 'Edit post' : 'New post'} onClose={() => setEditing(null)}>
          <PostForm
            initial={editing}
            onSave={savePost}
            onCancel={() => setEditing(null)}
            onDelete={editing.id ? () => deletePost(editing) : null}
            onLogResults={editing.id && editing.status === 'Published' ? () => { setEditing(null); onLogResults(editing); } : null}
          />
        </Modal>
      )}
    </div>
  );
}

// ---------- form ----------

const inputClass = 'w-full p-2 border border-stone-300 rounded-md text-sm focus-gold';

const EMPTY_POST = { title: '', date: '', format: 'Reel', pillar: 'Listings', tactic: 'Listing Reel', platforms: ['Instagram', 'Facebook'], status: 'Draft', caption: '', notes: '' };

function PostForm({ initial, onSave, onCancel, onDelete, onLogResults }) {
  const [form, setForm] = useState({ ...EMPTY_POST, ...initial });
  const [error, setError] = useState('');
  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
  const setFormat = e => {
    const format = e.target.value;
    // Suggest the matching tactic only if the user hasn't picked a custom one.
    setForm(f => ({ ...f, format, tactic: f.tactic === POST_FORMATS[f.format]?.tactic ? POST_FORMATS[format].tactic : f.tactic }));
  };
  const togglePlatform = name => setForm(f => ({
    ...f,
    platforms: f.platforms.includes(name) ? f.platforms.filter(p => p !== name) : [...f.platforms, name]
  }));

  const submit = () => {
    if (!form.title.trim()) return setError('Give the post a working title.');
    if (!form.date) return setError('Pick a publish date.');
    if (!form.platforms.length) return setError('Choose at least one platform.');
    onSave({ ...form, title: form.title.trim() });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block md:col-span-2">
          <span className="block text-sm font-medium text-stone-700 mb-1">Working title *</span>
          <input className={inputClass} value={form.title} onChange={set('title')} placeholder="e.g., Just Listed: Harbor View Drive" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Publish date *</span>
          <input type="date" className={inputClass} value={form.date} onChange={set('date')} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Status</span>
          <select className={inputClass} value={form.status} onChange={set('status')}>
            {POST_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Format</span>
          <select className={inputClass} value={form.format} onChange={setFormat}>
            {Object.keys(POST_FORMATS).map(f => <option key={f}>{f}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Content pillar</span>
          <select className={inputClass} value={form.pillar} onChange={set('pillar')}>
            {PILLAR_NAMES.map(p => <option key={p}>{p}</option>)}
          </select>
          <span className="block text-xs text-stone-500 mt-1">{PILLARS[form.pillar]}</span>
        </label>
        <label className="block md:col-span-2">
          <span className="block text-sm font-medium text-stone-700 mb-1">Tactic</span>
          <select className={inputClass} value={form.tactic} onChange={set('tactic')}>
            {TACTICS.map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <fieldset className="md:col-span-2">
          <legend className="block text-sm font-medium text-stone-700 mb-1">Platforms *</legend>
          <div className="flex flex-wrap gap-2">
            {SOCIAL_PLATFORMS.map(name => (
              <label key={name} className={`px-3 py-1 rounded-full border text-sm cursor-pointer ${form.platforms.includes(name) ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-300 text-stone-600'}`}>
                <input type="checkbox" className="sr-only" checked={form.platforms.includes(name)} onChange={() => togglePlatform(name)} />
                {name}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block md:col-span-2">
          <span className="block text-sm font-medium text-stone-700 mb-1">Caption</span>
          <textarea className={inputClass} rows="4" value={form.caption} onChange={set('caption')} placeholder="Written in Kevin's voice. Lead with the hook, end with a clear next step." />
          <span className="block text-xs text-stone-500 mt-1 text-right">{form.caption.length} characters</span>
        </label>
        <label className="block md:col-span-2">
          <span className="block text-sm font-medium text-stone-700 mb-1">Production notes</span>
          <textarea className={inputClass} rows="2" value={form.notes} onChange={set('notes')} placeholder="Photos to use, hook idea, music, listing link..." />
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={submit} className="flex-1 btn-primary py-2 px-4 rounded-md">Save</button>
        <button onClick={onCancel} className="flex-1 bg-stone-200 text-stone-700 py-2 px-4 rounded-md hover:bg-stone-300">Cancel</button>
      </div>
      <div className="flex flex-wrap justify-between gap-3 mt-3">
        {onLogResults ? (
          <button onClick={onLogResults} className="text-sm text-brand hover:underline flex items-center gap-1"><BarChart3 className="w-4 h-4" />Log results for analysis</button>
        ) : <span />}
        {onDelete && <button onClick={onDelete} className="text-sm text-red-600 hover:underline">Delete post</button>}
      </div>
    </>
  );
}
