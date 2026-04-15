import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import InviteCodeDisplay from "../components/Boards/InviteCodeDisplay.jsx";
import Navbar from "../components/Navbar.jsx";
import Column from "../components/Kanban/Column.jsx";
import TaskCard from "../components/Kanban/TaskCard.jsx";
import TaskModal from "../components/Kanban/TaskModal.jsx";
import SkeletonCard from "../components/UI/SkeletonCard.jsx";

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

function BoardView({
  boards,
  isLoading,
  isDark,
  onToggleTheme,
  onUpdateBoard,
  onDeleteBoard,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) {
  const { boardId } = useParams(); // reads boardId from /board/:boardId
  const navigate = useNavigate();

  // Find the board that matches the URL
  const board = boards.find((b) => b.id === boardId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColId, setActiveColId] = useState(null);

  // Drag state
  const [draggingTask, setDraggingTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Updates this board's columns and notifies App.jsx
  function updateColumns(updater) {
    if (!board) return;
    const updated = sortAllColumns(updater(board.columns));
    onUpdateBoard(boardId, updated);
  }

  // ── Modal handlers ────────────────────────────────────────────────────────
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

  // ── Task CRUD ─────────────────────────────────────────────────────────────
  async function handleAddNewTask(columnId, newTask) {
    await onCreateTask(boardId, columnId, newTask);
  }

  async function handleEditTask(updatedTask) {
    await onUpdateTask(boardId, updatedTask.id, updatedTask);
  }

  async function handleDeleteTask(taskId) {
    await onDeleteTask(boardId, taskId);
  }

  // ── Drag and drop ─────────────────────────────────────────────────────────
  function handleDragStart(event) {
    const task = board?.columns
      .flatMap((col) => col.tasks)
      .find((t) => t.id === event.active.id);
    setDraggingTask(task || null);
  }

  function handleDragEnd(event) {
    setDraggingTask(null);
    const { active, over } = event;
    if (!over || !board) return;

    const taskId = active.id;
    const columns = board.columns;

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
    if (!task) return;

    const previousColumns = board.columns;

    // Optimistic UI: move card instantly before API round-trip.
    updateColumns((cols) =>
      cols.map((col) => {
        if (col.id === fromColumn.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }

        if (col.id === toColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, { ...task, columnId: toColumn.id }],
          };
        }

        return col;
      }),
    );

    const position = toColumn.tasks.length * 1000;
    onMoveTask(boardId, taskId, { columnId: toColumn.id, position }).catch(() => {
      // Roll back local state if move fails.
      onUpdateBoard(boardId, previousColumns);
    });
  }

  // Loading state while fetching boards from backend
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navbar isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className="p-6 flex gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 w-80 flex-shrink-0"
            >
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse" />
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <SkeletonCard key={i} type="task" />
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  // ── Board not found ───────────────────────────────────────────────────────
  if (!board) {
    return (
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500 dark:text-gray-400">Board not found</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-500 hover:underline"
        >
          ← Back to boards
        </button>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex flex-col overflow-hidden">
      <Navbar
        boardName={board.name}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onBack={() => navigate("/")}
      />

      {board.inviteCode && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Share this board with your team
          </p>
          <InviteCodeDisplay inviteCode={board.inviteCode} />
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-5 min-w-max pb-4">
            {board.columns.map((column) => (
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

export default BoardView;
