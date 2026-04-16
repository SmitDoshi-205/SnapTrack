import { useState, useEffect } from 'react'
import Input from '../UI/Input.jsx'
import Button from '../UI/Button.jsx'
import MemberAvatar from '../UI/MemberAvatar.jsx'
import { boardApi } from '../../api/board.api.js'
import { useAuthStore } from '../../Store/authStore.js'

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
  isOpen,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  task,
  columnId,
  boardMembers = [],  // array of { userId, user: { id, name, avatarUrl } }
}) {
  const { user: currentUser } = useAuthStore()

  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]       = useState('Medium')
  const [dueDate, setDueDate]         = useState('')
  const [tags, setTags]               = useState([])
  const [assignedTo, setAssignedTo]   = useState('')
  const [error, setError]             = useState('')

  // Comments state
  const [comments, setComments]           = useState([])
  const [commentBody, setCommentBody]     = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'Medium')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      setTags(task.tags || [])
      setAssignedTo(task.assignedTo || task.assignee?.id || '')
      loadComments(task.id)
    } else {
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
      setTags([])
      setAssignedTo('')
      setComments([])
    }
    setError('')
    setCommentBody('')
  }, [task, isOpen])

  async function loadComments(taskId) {
    setCommentsLoading(true)
    try {
      const { data } = await boardApi.getComments(taskId)
      setComments(data.data.comments || [])
    } catch {
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }

  async function handleAddComment() {
    if (!commentBody.trim() || !task) return
    setCommentSubmitting(true)
    try {
      const { data } = await boardApi.createComment(task.id, { body: commentBody.trim() })
      setComments((prev) => [...prev, data.data.comment])
      setCommentBody('')
    } catch {
      // silent fail
    } finally {
      setCommentSubmitting(false)
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await boardApi.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch {
      // silent fail
    }
  }

  function handleTagToggle(tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSave() {
    if (!title.trim()) { setError('Task title is required'); return }

    const taskData = {
      title:       title.trim(),
      description: description.trim() || null,
      priority,
      dueDate:     dueDate || null,
      tags,
      assignedTo:  assignedTo || null,
    }

    if (task) {
      onEdit({ ...taskData, id: task.id })
    } else {
      onAdd(columnId, taskData)
    }
    onClose()
  }

  function handleDelete() {
    if (window.confirm('Delete this task? This cannot be undone.')) {
      onDelete(task.id, columnId)
      onClose()
    }
  }

  if (!isOpen) return null

  const isEditMode   = Boolean(task)
  const assignedUser = boardMembers.find(
    (m) => m.userId === assignedTo || m.user?.id === assignedTo
  )?.user

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="
          bg-white dark:bg-gray-800
          rounded-2xl shadow-xl
          w-full max-w-lg
          max-h-[90vh] overflow-y-auto
          p-6 flex flex-col gap-5
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Form */}
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
            <div className="flex flex-col gap-1">
              <Input
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                type="select"
                options={PRIORITY_OPTIONS}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                High tasks appear first in the column
              </p>
            </div>
            <Input
              label="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              type="date"
            />
          </div>

          {/* Assignee selector */}
          {boardMembers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Assign to
              </label>
              <div className="flex flex-wrap gap-2">
                {/* Unassigned option */}
                <button
                  onClick={() => setAssignedTo('')}
                  className={`
                    flex items-center gap-1.5
                    text-xs px-2.5 py-1.5 rounded-full border
                    transition-colors duration-150
                    ${!assignedTo
                      ? 'bg-gray-700 border-gray-700 text-white dark:bg-gray-200 dark:border-gray-200 dark:text-gray-800'
                      : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  Unassigned
                </button>

                {/* Board member options */}
                {boardMembers.map((member) => {
                  const memberId  = member.userId || member.user?.id
                  const isSelected = assignedTo === memberId
                  return (
                    <button
                      key={memberId}
                      onClick={() => setAssignedTo(isSelected ? '' : memberId)}
                      className={`
                        flex items-center gap-1.5
                        text-xs px-2.5 py-1.5 rounded-full border
                        transition-colors duration-150
                        ${isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                        }
                      `}
                    >
                      <MemberAvatar user={member.user} size="xs" />
                      {member.user?.name}
                    </button>
                  )
                })}
              </div>

              {/* Show currently assigned user */}
              {assignedUser && (
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  Assigned to
                  <span className="font-medium text-gray-600 dark:text-gray-300">
                    {assignedUser.name}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Tags
              </label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Select all that apply — they appear as labels on the card
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`
                    text-xs px-2.5 py-1 rounded-full border
                    transition-colors duration-150
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

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {isEditMode ? (
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
              {isEditMode ? 'Save changes' : 'Add task'}
            </Button>
          </div>
        </div>

        {/* Comments — only shown in edit mode */}
        {isEditMode && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Comments
            </h3>

            {/* Comment list */}
            {commentsLoading ? (
              <p className="text-xs text-gray-400">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No comments yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <MemberAvatar user={comment.user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {comment.user?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 break-words">
                        {comment.body}
                      </p>
                      {/* Delete button — only for comment author */}
                      {comment.user?.id === currentUser?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment input */}
            <div className="flex gap-2 mt-1">
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                placeholder="Add a comment..."
                className="
                  flex-1 text-xs px-3 py-2 rounded-lg
                  border border-gray-200 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  text-gray-800 dark:text-gray-100
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />
              <Button
                variant="primary"
                onClick={handleAddComment}
                disabled={commentSubmitting || !commentBody.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskModal