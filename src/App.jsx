import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'

const PRI = { low: 'ต่ำ', medium: 'กลาง', high: 'สูง' }
const ORDER = ['low', 'medium', 'high']
const FILTERS = [
  ['all', 'ทั้งหมด'],
  ['active', 'ยังไม่เสร็จ'],
  ['done', 'เสร็จแล้ว'],
]

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
    <li className={`item card px-3 py-3 mb-2 list-none${t.removing ? ' removing' : ''}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="chk"
          checked={t.done}
          onChange={() => onToggle(t.id)}
          aria-label="เสร็จแล้ว"
        />

        {editing ? (
          <input
            ref={ref}
            type="text"
            value={val}
            className="flex-1 min-w-0 border-b py-0.5"
            style={{ borderColor: 'var(--accent)', fontSize: 16 }}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditSave(t.id, val)
              if (e.key === 'Escape') onEditCancel()
            }}
            onBlur={() => onEditSave(t.id, val)}
          />
        ) : (
          <span
            className="flex-1 min-w-0 break-words select-none"
            style={{
              textDecoration: t.done ? 'line-through' : 'none',
              color: t.done ? 'var(--muted)' : 'var(--text)',
              cursor: 'text',
            }}
            onDoubleClick={() => onEditStart(t.id)}
            title="ดับเบิลคลิกเพื่อแก้ไข"
          >
            {t.text}
          </span>
        )}

        <button
          className={`badge p-${t.priority}`}
          onClick={() => onCycle(t.id)}
          title="กดเพื่อเปลี่ยนความสำคัญ"
        >
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
    { id: 1, text: 'ตอบอีเมลลูกค้า', done: false, priority: 'high' },
    { id: 2, text: 'ซื้อของเข้าบ้าน', done: false, priority: 'medium' },
    { id: 3, text: 'อ่านหนังสือ 20 หน้า', done: true, priority: 'low' },
  ])
  const [text, setText] = useState('')
  const [pri, setPri] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const nextId = useRef(4)

  const add = () => {
    const v = text.trim()
    if (!v) return
    setTodos((l) => [{ id: nextId.current++, text: v, done: false, priority: pri }, ...l])
    setText('')
  }

  const toggle = (id) =>
    setTodos((l) => l.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

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
      l.map((t) =>
        t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t
      )
    )

  const clearDone = () => {
    setTodos((l) => l.map((t) => (t.done ? { ...t, removing: true } : t)))
    setTimeout(() => setTodos((l) => l.filter((t) => !t.done)), 250)
  }

  const remaining = todos.filter((t) => !t.done && !t.removing).length
  const doneCount = todos.filter((t) => t.done).length
  const shown = todos.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done
  )

  return (
    <div className="mx-auto w-full px-4 py-8 sm:py-12" style={{ maxWidth: 560 }}>
      <h1 className="text-2xl sm:text-3xl font-bold mb-1">สิ่งที่ต้องทำ</h1>
      <p className="muted mb-5 text-sm">จัดการงานของคุณให้เป็นระเบียบ</p>

      <div className="card p-3 sm:p-4 mb-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={text}
            className="flex-1 min-w-0 px-2 py-2"
            style={{ fontSize: 16 }}
            placeholder="เพิ่มงานใหม่..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="add-btn" onClick={add}>
            <Plus size={18} />
            <span className="hidden sm:inline">เพิ่ม</span>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="muted text-sm">ความสำคัญ:</span>
          {ORDER.map((p) => (
            <button
              key={p}
              className={`seg ${p}${pri === p ? ' on' : ''}`}
              onClick={() => setPri(p)}
            >
              {PRI[p]}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex gap-1 mb-4 p-1 card"
        style={{ width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}
      >
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            className={`tab${filter === k ? ' on' : ''}`}
            onClick={() => setFilter(k)}
          >
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
          <div className="flex justify-center mb-2" style={{ opacity: 0.5 }}>
            <CheckCircle2 size={40} />
          </div>
          {filter === 'done'
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
          style={{
            border: 0,
            background: 'transparent',
            font: 'inherit',
            color: doneCount ? 'var(--accent)' : 'var(--muted)',
            cursor: doneCount ? 'pointer' : 'default',
            opacity: doneCount ? 1 : 0.5,
          }}
        >
          ล้างที่เสร็จแล้ว ({doneCount})
        </button>
      </div>

      <p className="muted text-center mt-8" style={{ fontSize: 12 }}>
        ดับเบิลคลิกที่ข้อความเพื่อแก้ไข · กดป้ายความสำคัญเพื่อเปลี่ยน
      </p>
    </div>
  )
}
