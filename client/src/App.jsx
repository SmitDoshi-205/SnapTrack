import { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import Navbar from "./components/Navbar.jsx";
import Column from "./components/Kanban/Column.jsx";
import TaskCard from "./components/Kanban/TaskCard.jsx";
import TaskModal from "./components/Kanban/TaskModal.jsx";
import { saveBoard, loadBoard } from "./store/boardStore.js";
import { getInitialTheme, applyTheme } from "./Store/themeStore.js";

{
  /*Priority sort helper */
}
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

function sortByPriority(tasks) {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1),
  );
}

function sortAllColumns(columns) {
  return columns.map((col) => ({
    ...col,
    tasks: sortByPriority(col.tasks),
  }));
}

const DEFAULT_COLUMNS = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "1",
        title: "Design the login page",
        description: "Create wireframes and finalise the colour palette",
        priority: "High",
        tags: ["UI", "Design"],
        dueDate: "2025-04-01",
      },
      {
        id: "2",
        title: "Set up Prisma schema",
        description: "Define User, Board, Column, Task models",
        priority: "High",
        tags: ["Backend", "DB"],
        dueDate: "2025-04-10",
      },
      {
        id: "3",
        title: "Write README",
        description: null,
        priority: "Low",
        tags: ["Docs"],
        dueDate: null,
      },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    tasks: [
      {
        id: "4",
        title: "Build Navbar component",
        description: "Responsive navbar with logo, board name, user avatar",
        priority: "Medium",
        tags: ["UI"],
        dueDate: "2025-04-05",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "5",
        title: "Initialise Vite project",
        description: "Set up React + Tailwind + folder structure",
        priority: "Low",
        tags: ["Setup"],
        dueDate: null,
      },
    ],
  },
];

function App() {
  // getInitialTheme — checks localStorage then OS preference
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  function handleToggleTheme() {
    setIsDark((prev) => !prev);
  }

  {
    /* Board state */
  }
  const [columns, setColumns] = useState(() => loadBoard() || DEFAULT_COLUMNS);

  useEffect(() => {
    saveBoard(columns);
  }, [columns]);

  {
    /* Modal state */
  }
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColId, setActiveColId] = useState(null);

  function handleAddTask(columnId) {
    setActiveTask(null);
    setActiveColId(columnId);
    setModalOpen(true);
  }

  function handleTaskClick(task, columnId) {
    setActiveTask(task);
    setActiveColId(columnId);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setActiveTask(null);
    setActiveColId(null);
  }

  function handleAddNewTask(columnId, newTask) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col,
      ),
    );
  }

  function handleEditTask(updatedTask) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === activeColId
          ? {
              ...col,
              tasks: col.tasks.map((t) =>
                t.id === updatedTask.id ? updatedTask : t,
              ),
            }
          : col,
      ),
    );
  }

  function handleDeleteTask(taskId, columnId) {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col,
      ),
    );
  }

  {
    /* Drag and Drop */
  }

  // Track which task is currently being dragged
  const [draggingTask, setDraggingTask] = useState(null);

  // PointerSensor — works for both mouse and touch
  // activationConstraint means you need to drag 8px before it activates
  // This prevents accidental drags when clicking to open the modal
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  function handleDragStart(event) {
    // Find and store the task being dragged
    const task = columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === event.active.id)
    setDraggingTask(task || null)
  }

  function handleDragEnd(event) {
    setDraggingTask(null)
    const { active, over } = event

    // Dropped outside everything — do nothing
    if (!over) return

    const taskId = active.id

    // Find the column the task is currently in
    const fromColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === taskId)
    )
    if (!fromColumn) return

    // over.id could be either a column ID or a task ID
    // if column ID 
    const isOverColumn = columns.some((col) => col.id === over.id)

    // if task ID
    const toColumn = isOverColumn
      ? columns.find((col) => col.id === over.id)
      : columns.find((col) => col.tasks.some((t) => t.id === over.id))

    // No valid destination found
    if (!toColumn) return

    // Same column 
    if (fromColumn.id === toColumn.id) return

    // Different column — move the task across
    const task = fromColumn.tasks.find((t) => t.id === taskId)

    setColumns((prev) =>
      sortAllColumns(
        prev.map((col) => {
          if (col.id === fromColumn.id) {
            return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          }
          if (col.id === toColumn.id) {
            return { ...col, tasks: [...col.tasks, task] }
          }
          return col
        })
      )
    )
  }

  {
    /* Render */
  }
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 overflow-hidden flex flex-col">
      <Navbar
        boardName="My First Board"
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/*
        sensors — how drag is initiated (pointer/mouse/touch)
        onDragStart — fires when user starts dragging
        onDragEnd — fires when user releases
      */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-5 min-w-max">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={() => handleAddTask(column.id)}
                onTaskClick={(task) => handleTaskClick(task, column.id)}
              />
            ))}
          </div>
        </main>

        {/*
          DragOverlay renders a floating copy of the card while dragging*/}
        <DragOverlay>
          {draggingTask ? (
            <div className="rotate-2 opacity-95">
              <TaskCard task={draggingTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddNewTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        task={activeTask}
        columnId={activeColId}
      />
    </div>
  );
}

export default App;
