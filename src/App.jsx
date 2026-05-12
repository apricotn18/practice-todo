import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import SortableItem from './SortableItem'
import './App.css'

const INITIAL_ITEMS = [
  { id: '1', type: 'section', text: '買うものリスト' },
  { id: '2', type: 'todo', text: 'オリーブオイル', done: false, dueDate: '' },
  { id: '3', type: 'todo', text: 'トマト缶', done: false, dueDate: '' },
  { id: '4', type: 'todo', text: 'お風呂の洗剤', done: false, dueDate: '' },
  { id: '5', type: 'section', text: 'プライベート' },
  { id: '6', type: 'todo', text: '美容院 13:00', done: false, dueDate: '2026-06-02' },
  { id: '7', type: 'todo', text: 'お店予約する 5人', done: false, dueDate: '' },
  { id: '8', type: 'todo', text: '家計簿をつける', done: false, dueDate: '' },
  { id: '9', type: 'todo', text: '旅行の予定をたてる', done: false, dueDate: '' },
]

function loadItems() {
  try {
    const saved = localStorage.getItem('todo-items')
    return saved ? JSON.parse(saved) : INITIAL_ITEMS
  } catch {
    return INITIAL_ITEMS
  }
}

export default function App() {
  const [items, setItems] = useState(loadItems)
  const [activeId, setActiveId] = useState(null)
  const [addingType, setAddingType] = useState(null) // 'todo' | 'section'
  const [newText, setNewText] = useState('')
  const [newDate, setNewDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    localStorage.setItem('todo-items', JSON.stringify(items))
  }, [items])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id)
        const newIndex = prev.findIndex((i) => i.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function toggleDone(id) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'todo'
          ? { ...item, done: !item.done }
          : item
      )
    )
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  function addItem() {
    if (!newText.trim()) return
    const newItem = {
      id: Date.now().toString(),
      type: addingType,
      text: newText.trim(),
      ...(addingType === 'todo' ? { done: false, dueDate: newDate } : {}),
    }
    setItems((prev) => [...prev, newItem])
    setNewText('')
    setNewDate('')
    setAddingType(null)
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditText(item.text)
  }

  function saveEdit(id) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, text: editText } : item
      )
    )
    setEditingId(null)
  }

  const activeItem = items.find((i) => i.id === activeId)

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <button className="icon-btn menu-btn">☰</button>
          <span className="header-title">やることリスト</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn">□</button>
          <button className="icon-btn">◎</button>
          <button className="icon-btn">☑</button>
        </div>
      </header>

      <div className="list-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onToggle={toggleDone}
                onDelete={deleteItem}
                onEdit={startEdit}
                editingId={editingId}
                editText={editText}
                setEditText={setEditText}
                onSaveEdit={saveEdit}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeItem ? (
              <div className={`drag-overlay ${activeItem.type}`}>
                {activeItem.type === 'section' ? (
                  <span className="section-label">{activeItem.text}</span>
                ) : (
                  <span>{activeItem.text}</span>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {addingType && (
        <div className="add-form-overlay" onClick={() => setAddingType(null)}>
          <div className="add-form" onClick={(e) => e.stopPropagation()}>
            <p className="add-form-title">
              {addingType === 'section' ? '見出しを追加' : 'タスクを追加'}
            </p>
            <input
              className="add-input"
              autoFocus
              placeholder={addingType === 'section' ? '見出し名' : 'タスク名'}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            {addingType === 'todo' && (
              <input
                className="add-input date-input"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            )}
            <div className="add-form-actions">
              <button className="btn-cancel" onClick={() => setAddingType(null)}>キャンセル</button>
              <button className="btn-add" onClick={addItem}>追加</button>
            </div>
          </div>
        </div>
      )}

      <div className="fab-area">
        <button className="fab-secondary" onClick={() => setAddingType('section')}>
          見出し
        </button>
        <button className="fab" onClick={() => setAddingType('todo')}>
          ＋
        </button>
      </div>
    </div>
  )
}
