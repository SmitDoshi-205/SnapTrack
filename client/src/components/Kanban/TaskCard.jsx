import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Badge from "../UI/Badge.jsx";

function TaskCard({ task, onClick, isDone = false }) {
  const { title, description, priority, tags, dueDate } = task;

  // useSortable takes the id as input so that dnd-kit knows which item is being dragged
  const {
    attributes, // accessibility attributes (aria- props)
    listeners, // event handlers — onMouseDown, onTouchStart etc
    setNodeRef, // ref to attach to the DOM element
    transform, // current drag position offset
    transition, // smooth animation when dropping
    isDragging, // true while this card is being dragged
  } = useSortable({ id: task.id });

  // CSS.Transform.toString converts the transform object to a CSS string
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = {
    High: "red",
    Medium: "yellow",
    Low: "green",
  };

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const isOverdue = !isDone && dueDate && new Date(dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-700
        rounded-xl p-4
        border border-gray-200 dark:border-gray-600
        hover:border-blue-300 dark:hover:border-blue-500
        hover:shadow-sm
        transition-all duration-150
        cursor-grab active:cursor-grabbing
        group
        ${
          isDone
            ? // Done card
              "bg-green-50 dark:bg-green-900/10 border-l-4 border-l-green-500 border-t-gray-100 border-r-gray-100 border-b-gray-100 dark:border-t-gray-700 dark:border-r-gray-700 dark:border-b-gray-700"
            : // Active card
              "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
        }
        ${isDragging ? "opacity-40 shadow-lg scale-105" : "opacity-100"}
      `}
    >
      {/* Priority + overdue row */}
      <div className="flex items-center justify-between mb-2">
        {isDone ? (
          // Completed indicator
          <span
            className="
            inline-flex items-center gap-1
            text-xs font-medium
            text-green-700 dark:text-green-400
            bg-green-100 dark:bg-green-900/40
            px-2 py-0.5 rounded-full
          "
          >
            {/* Checkmark icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Completed
          </span>
        ) : (
          // Priority badge
          <Badge label={priority} color={priorityColor[priority] || "gray"} />
        )}

        {isOverdue && (
          <span className="text-xs text-red-500 font-medium">Overdue</span>
        )}
      </div>

      {/* Title */}
      <h3
        className={`
        text-sm font-semibold mb-1
        transition-colors
        ${
          isDone
            ? "text-gray-500 dark:text-gray-400 line-through"
            : "text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
        }
      `}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`
          text-xs mb-3 line-clamp-2
          ${
            isDone
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-500 dark:text-gray-400"
          }
        `}
        >
          {description}
        </p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} label={tag} color={isDone ? "gray" : "blue"} />
          ))}
        </div>
      )}

      {/* Due date */}
      {formattedDate && (
        <div
          className={`
          text-xs mt-2
          ${
            isOverdue
              ? "text-red-500"
              : isDone
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-400 dark:text-gray-500"
          }
        `}
        >
          {isDone ? "Completed by " : "Due "}
          {formattedDate}
        </div>
      )}
    </div>
  );
}

export default TaskCard;