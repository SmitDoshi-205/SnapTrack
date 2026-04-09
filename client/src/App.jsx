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
import Dashboard from "./Pages/Dashboard.jsx";
import { saveBoards, loadBoards } from "./Store/boardStore.js";
import { getInitialTheme, applyTheme } from "./Store/themeStore.js";

// ─── helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

function sortByPriority(tasks) {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1),
  );
}

function sortAllColumns(columns) {
  return columns.map((col) => ({ ...col, tasks: sortByPriority(col.tasks) }));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeDefaultColumns() {
  return [
    {
      id: `col-todo-${generateId()}`,
      title: "To Do",
      tasks: [],
    },
    {
      id: `col-inprogress-${generateId()}`,
      title: "In Progress",
      tasks: [],
    },
    {
      id: `col-done-${generateId()}`,
      title: "Done",
      tasks: [],
    },
  ];
}

// ─── seed data (only used when localStorage is empty) ─────────────────────────

const SEED_BOARDS = [
  {
    id: "board-1",
    name: "My First Board",
    description: "Getting started with SnapTrack",
    columns: [
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
    ],
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  // Theme
  const [isDark, setIsDark] = useState(getInitialTheme);
  useEffect(() => { applyTheme(isDark); }, [isDark]);
  function handleToggleTheme() { setIsDark((prev) => !prev); }

  // Boards — array of board objects, each with { id, name, description, columns }
  const [boards, setBoards] = useState(() => loadBoards() || SEED_BOARDS);

  // Persist whenever boards change
  useEffect(() => { saveBoards(boards); }, [boards]);

  // Which board is open (null = Dashboard)
  const [activeBoardId, setActiveBoardId] = useState(null);

  // Derived: the board currently being viewed
  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;

  // ── Board CRUD ──────────────────────────────────────────────────────────────

  function handleCreateBoard({ name, description }) {
    const newBoard = {
      id: `board-${generateId()}`,
      name,
      description,
      columns: makeDefaultColumns(),
    };
    setBoards((prev) => [...prev, newBoard]);
  }

  function handleDeleteBoard(boardId) {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (activeBoardId === boardId) setActiveBoardId(null);
  }

  // Helper: update columns for the active board only
  function updateActiveColumns(updater) {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === activeBoardId
          ? { ...b, columns: updater(b.columns) }
          : b,
      ),
    );
  }

  // ── Modal state ─────────────────────────────────────────────────────────────

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
    updateActiveColumns((cols) =>
      cols.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col,
      ),
    );
  }

  function handleEditTask(updatedTask) {
    updateActiveColumns((cols) =>
      cols.map((col) =>
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
    updateActiveColumns((cols) =>
      cols.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col,
      ),
    );
  }

  // ── Drag and drop ───────────────────────────────────────────────────────────

  const [draggingTask, setDraggingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event) {
    const task = activeBoard?.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === event.active.id);
    setDraggingTask(task || null);
  }

  function handleDragEnd(event) {
    setDraggingTask(null);
    const { active, over } = event;
    if (!over || !activeBoard) return;

    const taskId = active.id;
    const columns = activeBoard.columns;

    const fromColumn = columns.find((col) =>
      col.tasks.some((t) => t.id === taskId),
    );
    if (!fromColumn) return;

    const isOverColumn = columns.some((col) => col.id === over.id);
    const toColumn = isOverColumn
      ? columns.find((col) => col.id === over.id)
      : columns.find((col) => col.tasks.some((t) => t.id === over.id));

    if (!toColumn || fromColumn.id === toColumn.id) return;

    const task = fromColumn.tasks.find((t) => t.id === taskId);

    updateActiveColumns((cols) =>
      sortAllColumns(
        cols.map((col) => {
          if (col.id === fromColumn.id)
            return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
          if (col.id === toColumn.id)
            return { ...col, tasks: [...col.tasks, task] };
          return col;
        }),
      ),
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 overflow-hidden flex flex-col">
      <Navbar
        boardName={activeBoard ? activeBoard.name : null}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onBack={activeBoard ? () => setActiveBoardId(null) : null}
      />

      {/* Dashboard or Kanban board */}
      {!activeBoard ? (
        <Dashboard
          boards={boards}
          onCreate={handleCreateBoard}
          onOpen={setActiveBoardId}
          onDelete={handleDeleteBoard}
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <main className="flex-1 p-6 overflow-x-auto">
            <div className="flex gap-5 min-w-max">
              {activeBoard.columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  onAddTask={() => handleAddTask(column.id)}
                  onTaskClick={(task) => handleTaskClick(task, column.id)}
                />
              ))}
            </div>
          </main>

          <DragOverlay>
            {draggingTask ? (
              <div className="rotate-2 opacity-95">
                <TaskCard task={draggingTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

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
