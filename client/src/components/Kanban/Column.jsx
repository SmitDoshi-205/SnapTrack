import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TaskCard from "./TaskCard.jsx";
import Button from "../UI/Button";

function Column({ column, onAddTask, onTaskClick }) {
  const { id, title, tasks } = column;

  // useDroppable marks this div as a valid drop target and takes column ID to identify the target
  const { setNodeRef, isOver } = useDroppable({ id });

  const accentColor = {
    "To Do": "bg-gray-400",
    "In Progress": "bg-blue-500",
    Done: "bg-green-500",
  };

  const accent = accentColor[title] || "bg-gray-400";

  const isDone = title === "Done";

  return (
    <div
      className="
      bg-gray-50 dark:bg-gray-800/60
      rounded-2xl p-4
      w-80 flex-shrink-0
      flex flex-col
      transition-colors duration-200
    "
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accent}`} />
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
            {title}
          </h2>
          <span
            className="
            bg-gray-200 dark:bg-gray-700
            text-gray-500 dark:text-gray-400
            text-xs font-medium
            px-2 py-0.5 rounded-full
          "
          >
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" onClick={onAddTask}>
          + Add
        </Button>
      </div>

      {/* 
        SortableContext tells dnd-kit which items are sortable within this column*/}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {/* 
          setNodeRef attaches to this div — dnd-kit watches this area for drops
          isOver is true when a card is being dragged over this column
        */}
        <div
          ref={setNodeRef}
          className={`
            flex flex-col gap-3 flex-1
            min-h-24 rounded-xl
            transition-colors duration-150
            ${isOver ? "bg-blue-50 dark:bg-blue-900/20" : "bg-transparent"}
          `}
        >
          {tasks.length === 0 ? (
            <div
              className="
              text-center py-8
              text-gray-400 dark:text-gray-600
              text-sm
            "
            >
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
                isDone={isDone}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default Column;