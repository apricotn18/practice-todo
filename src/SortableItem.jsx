import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

export default function SortableItem({
  item,
  onToggle,
  onDelete,
  onEdit,
  editingId,
  editText,
  setEditText,
  onSaveEdit,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })
  const [showActions, setShowActions] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  if (item.type === 'section') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="section-row"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <span className="drag-handle" {...attributes} {...listeners}>⋮⋮</span>
        {editingId === item.id ? (
          <input
            className="inline-edit"
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={() => onSaveEdit(item.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(item.id)}
          />
        ) : (
          <span className="section-label" onDoubleClick={() => onEdit(item)}>
            {item.text}
          </span>
        )}
        {showActions && (
          <button className="delete-btn" onClick={() => onDelete(item.id)}>×</button>
        )}
      </div>
    )
  }

  const overdue = isOverdue(item.dueDate)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-row ${item.done ? 'done' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <span className="drag-handle" {...attributes} {...listeners}>⋮⋮</span>
      <button
        className={`check-btn ${item.done ? 'checked' : ''}`}
        onClick={() => onToggle(item.id)}
      >
        {item.done ? '✓' : ''}
      </button>
      <div className="todo-content">
        {editingId === item.id ? (
          <input
            className="inline-edit"
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={() => onSaveEdit(item.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(item.id)}
          />
        ) : (
          <span className="todo-text" onDoubleClick={() => onEdit(item)}>
            {item.text}
          </span>
        )}
        {item.dueDate && (
          <span className={`due-date ${overdue ? 'overdue' : ''}`}>
            ◷ {formatDate(item.dueDate)}
          </span>
        )}
      </div>
      {showActions && (
        <button className="delete-btn" onClick={() => onDelete(item.id)}>×</button>
      )}
    </div>
  )
}
