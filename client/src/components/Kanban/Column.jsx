import TaskCard from './TaskCard.jsx'
import Button from '../UI/Button.jsx'

function Column({ title, tasks, onAddTask }) {
  const accentColor = {
    'To Do':       'bg-gray-400',
    'In Progress': 'bg-blue-500',
    'Done':        'bg-green-500',
  }

  const accent = accentColor[title] || 'bg-gray-400'

  return (
    <div className="bg-gray-50 rounded-2xl p-4 w-80 flex-shrink-0 flex flex-col">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accent}`} />
          <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
          <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

       <Button variant="ghost" onClick={onAddTask}>
          + Add
        </Button>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks yet
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>

    </div>
  )
}

export default Column