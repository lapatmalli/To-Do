import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Search, CalendarDays } from 'lucide-react'

const PRI = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง' }
const ORDER = ['low', 'medium', 'high']
const CATS = { work: 'งาน', personal: 'ส่วนตัว', shopping: 'ช้อปปิ้ง', health: 'สุขภาพ' }
const CAT_KEYS = Object.keys(CATS)
const FILTERS = [['all', 'ทั้งหมด'], ['active', 'ยังไม่เสร็จ'], ['done', 'เสร็จแล้ว']]

// ---- date helpers (local time, YYYY-MM-DD) ----
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return fmt(d)
}
const dueStatus = (t) => {
  if (!t.due || t.done) return 'none'
  const today = fmt(new Date())
  return t.due < today ? 'overdue' : t.due === today ? 'today' : 'future'
}
const showDate = (s) =>
  new Date(s + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

function DueBadge({ t }) {
  if (!t.due) return null
  const st = dueStatus(t)
  const label = st === 'today' ? 'วันนี้' : st === 'overdue' ? `เลยกำหนด ${showDate(t.due)}` : showDate(t.due)
  return (
    <span className={`due ${st === 'overdue' ? 'overdue' : st === 'today' ? 'today' : ''}`}>
      <CalendarDays size={12} />
      {label}
    </span>
  )
}

function Donut({ segments, pct }) {
  const r = 38
  const C = 2 * Math.PI * r
  const total = segments.reduce((a, s) => a + s.v, 0)
  let acc = 0
  return (
    <svg width="104" height="104" viewBox="0 0 100 100" role="img" aria-label={`เสร็จแล้ว ${pct}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
      {total > 0 &&
        segments.map((s, i) => {
          const len = (s.v / total) * C
          const el = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-acc}
              transform="rotate(-90 50 50)"
            />
          )
          acc += len
          return el
        })}
      <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">
        {pct}%
      </text>
    </svg>
  )
}

function TodoItem({ t, editing, onToggle, onDelete, onEditStart, onEditSave, onEditCancel, onCycle }) {
  const [val, setVal] = useState(t.text)
  const ref = useRef(null)

  useEffect(() => {
    if (editing) {
      setVal(t.text)
      ref.current?.focus()
    }
  }, [editing])

  return (
    <li className={`item card px-3 py-3 mb-2 list-none ${t.removing ? 'removing' : ''}`}>
      <div className="flex items-center gap-3">
        <input type="checkbox" className="chk" checked={t.done} onChange={() => onToggle(t.id)} aria-label="เสร็จแล้ว" />
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={ref}
              type="text"
              value={val}
              className="w-full border-b py-0.5 text-base"
              style={{ borderColor: 'var(--accent)' }}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSave(t.id, val)
                if (e.key === 'Escape') onEditCancel()
              }}
              onBlur={() => onEditSave(t.id, val)}
            />
          ) : (
            <span
              className="block break-words select-none cursor-text"
              style={{
                textDecoration: t.done ? 'line-through' : 'none',
                color: t.done ? 'var(--muted)' : 'var(--text)',
              }}
              onDoubleClick={() => onEditStart(t.id)}
              title="ดับเบิลคลิกเพื่อแก้ไข"
            >
              {t.text}
            </span>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-1.5">
            <span className={`tag cat-${t.category}`}>{CATS[t.category]}</span>
            <DueBadge t={t} />
          </div>
        </div>
        <button className={`badge p-${t.priority}`} onClick={() => onCycle(t.id)} title="กดเพื่อเปลี่ยนความสำคัญ">
          {PRI[t.priority]}
        </button>
        <button className="btn-icon" onClick={() => onDelete(t.id)} aria-label="ลบ">
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'ตอบอีเมลลูกค้า', done: false, priority: 'high', category: 'work', due: addDays(-1) },
    { id: 2, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'medium', category: 'shopping', due: addDays(0) },
    { id: 3, text: 'อ่านหนังสือ 20 หน้า', done: true, priority: 'low', category: 'personal', due: '' },
    { id: 4, text: 'นัดตรวจสุขภาพประจำปี', done: false, priority: 'medium', category: 'health', due: addDays(5) },
    { id: 5, text: 'ส่งรายงานประจำเดือน', done: false, priority: 'high', category: 'work', due: addDays(2) },
  ])
  const [text, setText] = useState('')
  const [pri, setPri] = useState('medium')
  const [cat, setCat] = useState('work')
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editId, setEditId] = useState(null)
  const nextId = useRef(6)

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((l) => [{ id: nextId.current++, text: v, done: false, priority: pri, category: cat, due }, ...l])
    setText('')
    setDue('')
  }
  const toggle = (id) => setTodos((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const del = (id) => {
    setTodos((l) => l.map((t) => (t.id === id ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((l) => l.filter((t) => t.id !== id)), 250)
  }
  const save = (id, v) => {
    const s = v.trim()
    setEditId(null)
    if (s) setTodos((l) => l.map((t) => (t.id === id ? { ...t, text: s } : t)))
  }
  const cycle = (id) =>
    setTodos((l) =>
      l.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
    )
  const clearDone = () => {
    setTodos((l) => l.map((t) => (t.done ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((l) => l.filter((t) => !t.done)), 250)
  }

  // ---- derived ----
  const live = todos.filter((t) => !t.removing)
  const remaining = live.filter((t) => !t.done).length
  const doneCount = live.filter((t) => t.done).length
  const overdueCount = live.filter((t) => dueStatus(t) === 'overdue').length
  const activeCount = live.length - doneCount - overdueCount
  const pct = live.length ? Math.round((doneCount / live.length) * 100) : 0
  const q = query.trim().toLowerCase()

  const shown = todos.filter(
    (t) =>
      (filter === 'all' ? true : filter === 'active' ? !t.done : t.done) &&
      (catFilter === 'all' || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  )

  const catCount = (k) => live.filter((t) => k === 'all' || t.category === k).length
  const segments = [
    { v: doneCount, color: '#16A34A' },
    { v: activeCount, color: 'var(--accent)' },
    { v: overdueCount, color: '#DC2626' },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">สิ่งที่ต้องทำ</h1>
      <p className="muted mb-5 text-sm">จัดการงานของคุณให้เป็นระเบียบ</p>

      <div className="grid gap-5 md:grid-cols-[230px_1fr] items-start">
        {/* ---------- sidebar ---------- */}
        <aside className="grid gap-4">
          <div className="card p-2">
            <div className="muted text-xs font-semibold px-3 pt-2 pb-1 hidden md:block">หมวดหมู่</div>
            <div className="flex md:flex-col gap-1 overflow-x-auto">
              {[['all', 'ทั้งหมด'], ...Object.entries(CATS)].map(([k, label]) => (
                <button
                  key={k}
                  className={`side-item ${catFilter === k ? 'on' : ''}`}
                  onClick={() => setCatFilter(k)}
                >
                  <span>{label}</span>
                  <span className="side-count">{catCount(k)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="muted text-xs font-semibold mb-3">สถิติ</div>
            <div className="flex items-center gap-4">
              <Donut segments={segments} pct={pct} />
              <div className="text-sm grid gap-1.5">
                <div>
                  <span className="font-bold text-lg">{live.length}</span>
                  <span className="muted"> งานทั้งหมด</span>
                </div>
                <div className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: '#16A34A' }} />เสร็จ {doneCount}</div>
                <div className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />ค้างอยู่ {activeCount}</div>
                <div className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full" style={{ background: '#DC2626' }} />เลยกำหนด {overdueCount}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------- main ---------- */}
        <main className="min-w-0">
          <div className="card p-3 sm:p-4 mb-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={text}
                className="flex-1 min-w-0 px-2 py-2 text-base"
                placeholder="เพิ่มงานใหม่..."
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && add()}
              />
              <button className="add-btn" onClick={add}>
                <Plus size={18} />
                <span className="hidden sm:inline">เพิ่ม</span>
              </button>
            </div>
            <div className="grid gap-2 mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="muted text-sm w-20">ความสำคัญ:</span>
                {ORDER.map((p) => (
                  <button key={p} className={`seg ${p} ${pri === p ? 'on' : ''}`} onClick={() => setPri(p)}>
                    {PRI[p]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="muted text-sm w-20">หมวดหมู่:</span>
                {CAT_KEYS.map((k) => (
                  <button
                    key={k}
                    className={`seg ${cat === k ? 'on' : ''}`}
                    style={cat === k ? { background: 'var(--accent)', color: '#fff', borderColor: 'transparent' } : undefined}
                    onClick={() => setCat(k)}
                  >
                    {CATS[k]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="muted text-sm w-20">กำหนดส่ง:</span>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                {due && (
                  <button className="seg" onClick={() => setDue('')}>ล้าง</button>
                )}
              </div>
            </div>
          </div>

          <div className="card flex items-center gap-2 px-3 py-2 mb-4">
            <Search size={18} className="muted" />
            <input
              type="text"
              value={query}
              className="flex-1 min-w-0 py-1 text-base"
              placeholder="ค้นหางาน..."
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="card flex gap-1 mb-4 p-1 w-fit max-w-full overflow-x-auto">
            {FILTERS.map(([k, label]) => (
              <button key={k} className={`tab ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>
                {label}
              </button>
            ))}
          </div>

          <ul className="p-0 m-0">
            {shown.map((t) => (
              <TodoItem
                key={t.id}
                t={t}
                editing={editId === t.id}
                onToggle={toggle}
                onDelete={del}
                onEditStart={setEditId}
                onEditSave={save}
                onEditCancel={() => setEditId(null)}
                onCycle={cycle}
              />
            ))}
          </ul>

          {shown.length === 0 && (
            <div className="card p-8 text-center muted">
              <div className="flex justify-center mb-2 opacity-50">
                <CheckCircle2 size={40} />
              </div>
              {q
                ? 'ไม่พบงานที่ค้นหา'
                : filter === 'done'
                ? 'ยังไม่มีงานที่เสร็จ'
                : filter === 'active'
                ? 'ไม่มีงานค้างแล้ว เยี่ยมมาก!'
                : 'ยังไม่มีงาน เพิ่มงานแรกได้เลย'}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="muted">เหลืออีก {remaining} งาน</span>
            <button
              onClick={clearDone}
              disabled={doneCount === 0}
              className="bg-transparent border-0 font-[inherit]"
              style={{
                color: doneCount ? 'var(--accent)' : 'var(--muted)',
                cursor: doneCount ? 'pointer' : 'default',
                opacity: doneCount ? 1 : 0.5,
              }}
            >
              ล้างที่เสร็จแล้ว ({doneCount})
            </button>
          </div>
          <p className="muted text-center mt-8 text-xs">
            ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · กดป้ายความสำคัญเพื่อเปลี่ยน
          </p>
        </main>
      </div>
    </div>
  )
}
