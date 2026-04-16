import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Badge from '../UI/Badge.jsx'
import MemberAvatar from '../UI/MemberAvatar.jsx'

function TaskCard({ task, isDone, onClick }) {
  const { title, description, priority, tags, dueDate, assignee } = task

  const {
    attributes,  // accessibility attributes for drag handle
    listeners,  // event listeners for drag handle
    setNodeRef,  // ref setter for the sortable item
    transform,  // current transform style (x, y, scale)
    transition, // current transition style
    isDragging, // whether this item is currently being dragged
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColor = { High: 'red', Medium: 'yellow', Low: 'green' }

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const isOverdue = !isDone && dueDate && new Date(dueDate) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        rounded-xl p-4
        border
        hover:shadow-sm
        transition-all duration-150
        cursor-grab active:cursor-grabbing
        group
        ${isDone
          ? 'bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500 border-t-gray-100 border-r-gray-100 border-b-gray-100 dark:border-t-gray-700 dark:border-r-gray-700 dark:border-b-gray-700'
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
        }
        ${isDragging ? 'opacity-40 shadow-lg scale-105' : 'opacity-100'}
      `}
    >
      {/* Top row — priority/completed badge + overdue */}
      <div className="flex items-center justify-between mb-2">
        {isDone ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Completed
          </span>
        ) : (
          <Badge label={priority} color={priorityColor[priority] || 'gray'} />
        )}
        {isOverdue && (
          <span className="text-xs text-red-500 font-medium">Overdue</span>
        )}
      </div>

      {/* Title */}
      <h3 className={`
        text-sm font-semibold mb-1 transition-colors
        ${isDone
          ? 'text-gray-500 dark:text-gray-400 line-through'
          : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
        }
      `}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-xs mb-3 line-clamp-2 ${isDone ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {description}
        </p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} label={tag} color={isDone ? 'gray' : 'blue'} />
          ))}
        </div>
      )}

      {/* Footer — due date + assignee avatar */}
      <div className="flex items-center justify-between mt-2">
        {formattedDate ? (
          <div className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {isDone ? 'Done by ' : 'Due '}{formattedDate}
          </div>
        ) : <div />}

        {/* Assignee avatar — shown bottom right of card */}
        {assignee && (
          <MemberAvatar user={assignee} size="xs" />
        )}
      </div>
    </div>
  )
}

export default TaskCard