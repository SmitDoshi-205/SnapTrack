function BoardCard({ board, onOpen, onDelete }) {
  const { name, description, columns } = board;

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);
  const doneTasks =
    columns.find((c) => c.title === "Done")?.tasks.length ?? 0;

  const accentMap = {
    "To Do": "bg-gray-400",
    "In Progress": "bg-blue-500",
    "Done": "bg-green-500",
  };

  return (
    <div
      onClick={onOpen}
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
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
              onDelete(board.id);
            }
          }}
          className="
            opacity-0 group-hover:opacity-100
            text-gray-400 hover:text-red-500
            transition-all duration-150
            text-lg leading-none ml-2 flex-shrink-0
          "
        >
          ×
        </button>
      </div>

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
            <span
              className={`w-1.5 h-1.5 rounded-full ${accentMap[col.title] ?? "bg-gray-400"}`}
            />
            {col.title}
            <span className="font-medium">{col.tasks.length}</span>
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
        </span>
        {totalTasks > 0 && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            {doneTasks}/{totalTasks} done
          </span>
        )}
      </div>
    </div>
  );
}

export default BoardCard;