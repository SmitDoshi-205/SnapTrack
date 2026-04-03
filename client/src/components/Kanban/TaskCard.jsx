import Badge from '../UI/Badge.jsx'

function TaskCard({ task }) {
  const { title, description, priority, tags, dueDate } = task

  const priorityColor = {
    High:   'red',
    Medium: 'yellow',
    Low:    'green',
  }

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day:   'numeric',
      })
    : null

  const isOverdue = dueDate && new Date(dueDate) < new Date()

  return (
    <div className="
      bg-white rounded-xl p-4
      border border-gray-200
      hover:border-blue-300 hover:shadow-sm
      transition-all duration-150
      cursor-pointer
      group
    ">

      <div className="flex items-center justify-between mb-2">
        <Badge label={priority} color={priorityColor[priority] || 'gray'} />
        {isOverdue && (
          <span className="text-xs text-red-500 font-medium">Overdue</span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>

      {description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} label={tag} color="blue" />
          ))}
        </div>
      )}

      {formattedDate && (
        <div className={`text-xs mt-2 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
          Due {formattedDate}
        </div>
      )}

    </div>
  )
}

export default TaskCard