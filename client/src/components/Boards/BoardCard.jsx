import { useNavigate } from 'react-router-dom'
import MemberAvatar from '../UI/MemberAvatar.jsx'

function BoardCard({ board, onDelete }) {
  const navigate = useNavigate()

  const { name, description, columns, members = [] } = board

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0)
  const doneTasks  = columns.find((c) => c.title === 'Done')?.tasks.length ?? 0

  const accentMap = {
    'To Do':       'bg-gray-400',
    'In Progress': 'bg-blue-500',
    'Done':        'bg-green-500',
  }

  function handleDelete(e) {
    e.stopPropagation()
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      onDelete(board.id)
    }
  }

  return (
    <div
      onClick={() => navigate(`/board/${board.id}`)}
      className="
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-2xl p-5
        flex flex-col gap-3
        cursor-pointer
        hover:border-blue-300 dark:hover:border-blue-500
        hover:shadow-md
        transition-all duration-150
        group
        relative
      "
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="
          absolute top-4 right-4
          opacity-0 group-hover:opacity-100
          text-gray-400 hover:text-red-500
          transition-all duration-150
          text-lg leading-none
        "
      >
        ×
      </button>

      {/* Board name */}
      <h3 className="
        font-semibold text-gray-800 dark:text-gray-100 text-sm
        group-hover:text-blue-600 dark:group-hover:text-blue-400
        transition-colors pr-6
      ">
        {name}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      )}

      {/* Column pills */}
      <div className="flex flex-wrap gap-1.5">
        {columns.map((col) => (
          <span
            key={col.id}
            className="
              flex items-center gap-1
              text-xs text-gray-500 dark:text-gray-400
              bg-gray-100 dark:bg-gray-700
              px-2 py-0.5 rounded-full
            "
          >
            <span className={`w-1.5 h-1.5 rounded-full ${accentMap[col.title] ?? 'bg-gray-400'}`} />
            {col.title}
            <span className="font-medium">{col.tasks.length}</span>
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
          {totalTasks > 0 && (
            <span className="text-green-600 dark:text-green-400 font-medium ml-1">
              · {doneTasks} done
            </span>
          )}
        </span>

        {/* Member avatars */}
        {members.length > 0 && (
          <div className="flex items-center">
            {/* Show max 4 avatars, overlap them */}
            {members.slice(0, 4).map((member, index) => (
              <div
                key={member.userId || member.user?.id}
                style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: index }}
                className="relative"
              >
                <MemberAvatar
                  user={member.user}
                  size="xs"
                  role={member.role}
                />
              </div>
            ))}

            {/* +N overflow indicator */}
            {members.length > 4 && (
              <div
                style={{ marginLeft: '-8px', zIndex: 4 }}
                className="
                  relative w-5 h-5 rounded-full
                  bg-gray-200 dark:bg-gray-600
                  ring-2 ring-white dark:ring-gray-800
                  flex items-center justify-center
                  text-xs font-medium
                  text-gray-600 dark:text-gray-300
                "
              >
                +{members.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BoardCard