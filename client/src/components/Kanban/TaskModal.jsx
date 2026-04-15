import { useState, useEffect } from 'react'
import Input from '../UI/Input'
import Button from '../UI/Button'

function generateId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const PRIORITY_OPTIONS = [
  { value: 'Low',    label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High',   label: 'High' },
]

const AVAILABLE_TAGS = [
  'UI', 'Backend', 'DB', 'Design',
  'Docs', 'Setup', 'Bug', 'Feature', 'Testing',
]

function TaskModal({
  isOpen,       // whether modal is visible
  onClose,      // called when user cancels or closes
  onAdd,        // called when creating a new task
  onEdit,       // called when editing an existing task
  onDelete,     // called when deleting a task
  task,         // if null we are in create mode
  columnId,     // which column the new task belongs to
}) {

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]       = useState('Medium')
  const [dueDate, setDueDate]         = useState('')
  const [tags, setTags]               = useState([])
  const [error, setError]             = useState('')
  const [isSaving, setIsSaving]       = useState(false)

  useEffect(() => {
    if (task) {
      // Edit mode 
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'Medium')
      setDueDate(task.dueDate || '')
      setTags(task.tags || [])
    } else {
      // Create mode 
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
      setTags([])
    }
    setError('')
    setIsSaving(false)
  }, [task, isOpen]) 

  function handleTagToggle(tag) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)  
        : [...prev, tag]                  
    )
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Task title is required')
      return
    }

    const taskData = {
      id:          task?.id || generateId(),
      title:       title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate:     dueDate || undefined,
      tags,
    }

    setError('')
    setIsSaving(true)

    try {
      if (task) {
        await onEdit(taskData)
      } else {
        await onAdd(columnId, taskData)
      }

      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save task')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (window.confirm('Delete this task? This cannot be undone.')) {
      setError('')
      setIsSaving(true)

      try {
        await onDelete(task.id, columnId)
        onClose()
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to delete task')
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (!isOpen) return null

  const isEditMode = Boolean(task)

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="
          bg-white dark:bg-gray-800
          rounded-2xl shadow-xl
          w-full max-w-md
          p-6 flex flex-col gap-5
        "
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {isEditMode ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4">

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more detail (optional)"
            type="textarea"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              type="select"
              options={PRIORITY_OPTIONS}
            />
            <Input
              label="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              type="date"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`
                    text-xs px-2.5 py-1 rounded-full border transition-colors duration-150
                    ${tags.includes(tag)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          {isEditMode ? (
            <Button variant="danger" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          ) : (
            <div /> 
          )}

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : (isEditMode ? 'Save changes' : 'Add task')}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TaskModal