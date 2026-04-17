import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./Pages/Dashboard.jsx";
import BoardView from "./Pages/BoardView.jsx";
import Login from "./Pages/Login.jsx";
import Register from "./Pages/Register.jsx";
import JoinBoard from "./Pages/JoinBoard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { getInitialTheme, applyTheme } from "./Store/themeStore.js";
import { useAuthStore } from "./Store/authStore.js";
import { authApi } from "./api/auth.api.js";
import { boardApi } from "./api/board.api.js";
import { io } from "socket.io-client";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

function sortTasksByPriority(tasks = []) {
  return [...tasks].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? Number.MAX_SAFE_INTEGER) -
      (PRIORITY_ORDER[b.priority] ?? Number.MAX_SAFE_INTEGER),
  );
}

function sortColumnsByTaskPriority(columns = []) {
  return columns.map((column) => ({
    ...column,
    tasks: sortTasksByPriority(column.tasks || []),
  }));
}

function normalizeTask(task) {
  return {
    ...task,
    tags: Array.isArray(task.tags)
      ? task.tags
          .map((t) => (typeof t === "string" ? t : t?.tag?.name))
          .filter(Boolean)
      : [],
  };
}

function normalizeBoard(board) {
  return {
    ...board,
    columns: (board.columns || []).map((column) => ({
      ...column,
      tasks: (column.tasks || []).map(normalizeTask),
    })),
  };
}

function normalizeAndSortBoard(board) {
  const normalized = normalizeBoard(board);
  return {
    ...normalized,
    columns: sortColumnsByTaskPriority(normalized.columns || []),
  };
}

function normalizeInviteCode(value = "") {
  return value.trim().toUpperCase();
}

function extractInviteCode(input) {
  const raw = (input || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0]?.toLowerCase() === "join" && parts[1]) {
      return normalizeInviteCode(parts[1]);
    }
  } catch {
    // Not a URL. treat as invite code.
  }

  return normalizeInviteCode(raw);
}

function App() {
  const location = useLocation();
  const socketRef = useRef(null);
  const joinedBoardIdsRef = useRef([]);
  const fetchBoardsReqIdRef = useRef(0);
  const refreshBoardReqIdRef = useRef({});

  //  Theme
  const [isDark, setIsDark] = useState(getInitialTheme);
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);
  function handleToggleTheme() {
    setIsDark((prev) => !prev);
  }

  //  Auth
  const { user, accessToken, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setAuth(data.data.user, token);
      } catch {
        clearAuth();
      }
    }
    checkAuth();
  }, []);

  //  Boards
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchBoards() {
    if (!user) return;

    const requestId = ++fetchBoardsReqIdRef.current;

    const { data } = await boardApi.getAll();
    if (requestId !== fetchBoardsReqIdRef.current) return;

    const nextBoards = (data.data.boards || []).map(normalizeAndSortBoard);
    setBoards(nextBoards);
  }

  async function refreshBoard(boardId) {
    const nextRequestId = (refreshBoardReqIdRef.current[boardId] || 0) + 1;
    refreshBoardReqIdRef.current[boardId] = nextRequestId;

    const { data } = await boardApi.getOne(boardId);
    if (refreshBoardReqIdRef.current[boardId] !== nextRequestId) return;

    const normalized = normalizeAndSortBoard(data.data.board);
    setBoards((prev) => prev.map((b) => (b.id === boardId ? normalized : b)));
  }

  useEffect(() => {
    let active = true;

    async function loadBoards() {
      if (!user) {
        setBoards([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data } = await boardApi.getAll();
        if (!active) return;
        const nextBoards = (data.data.boards || []).map(normalizeAndSortBoard);
        setBoards(nextBoards);
      } catch {
        if (active) setBoards([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBoards();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user) return undefined;
    if (/^\/board\/[^/]+/.test(location.pathname)) return undefined;

    const id = setInterval(() => {
      fetchBoards().catch(() => {});
    }, 8000);

    return () => clearInterval(id);
  }, [user?.id, location.pathname]);

  useEffect(() => {
    if (!accessToken) return undefined;

    const socket = io(
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
        "http://localhost:5000",
      {
        auth: { token: accessToken },
        withCredentials: true,
      },
    );

    socketRef.current = socket;

    socket.on("board:changed", async ({ boardId }) => {
      if (!boardId) return;
      try {
        await refreshBoard(boardId);
      } catch {
        // If the board was removed or inaccessible, drop it from local state.
        setBoards((prev) => prev.filter((board) => board.id !== boardId));
      }
    });

    socket.on("board:deleted", ({ boardId }) => {
      if (!boardId) return;
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, accessToken]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const currentIds = boards.map((board) => board.id).filter(Boolean);
    const previousIds = joinedBoardIdsRef.current;

    const toJoin = currentIds.filter((id) => !previousIds.includes(id));
    const toLeave = previousIds.filter((id) => !currentIds.includes(id));

    if (toJoin.length) socket.emit("boards:join", toJoin);
    if (toLeave.length) socket.emit("boards:leave", toLeave);

    joinedBoardIdsRef.current = currentIds;
  }, [boards]);

  useEffect(() => {
    if (!user) return;
    fetchBoards().catch(() => {});
  }, [location.pathname, user?.id]);

  async function handleCreateBoard({ name, description }) {
    const { data } = await boardApi.create({ name, description });
    const created = normalizeBoard(data.data.board);
    setBoards((prev) => [...prev, created]);
    return created;
  }

  async function handleDeleteBoard(boardId) {
    await boardApi.delete(boardId);
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
  }

  async function handleJoinByCode(code) {
    const cleaned = extractInviteCode(code);
    if (!cleaned) throw new Error("Invite code is required");

    const { data } = await boardApi.join(cleaned);
    await fetchBoards();
    return data.data.boardId;
  }

  async function handleJoinByLink(link) {
    const cleaned = extractInviteCode(link);
    if (!cleaned) throw new Error("Invite link is invalid");
    return handleJoinByCode(cleaned);
  }

  function handleUpdateBoard(boardId, updatedColumns) {
    setBoards((prev) =>
      prev.map((b) =>
        b.id === boardId
          ? { ...b, columns: sortColumnsByTaskPriority(updatedColumns || []) }
          : b,
      ),
    );
  }

  async function handleCreateTask(boardId, columnId, taskPayload) {
    try {
      const { data } = await boardApi.createTask(columnId, taskPayload);
      const createdTask = normalizeTask(data.data.task);

      setBoards((prev) =>
        prev.map((board) => {
          if (board.id !== boardId) return board;
          return {
            ...board,
            columns: board.columns.map((column) => {
              if (column.id !== columnId) return column;
              // Add new task and re-sort by priority
              const updatedTasks = sortTasksByPriority([
                ...column.tasks,
                createdTask,
              ]);
              return { ...column, tasks: updatedTasks };
            }),
          };
        }),
      );

      return createdTask;
    } catch (err) {
      throw err;
    }
  }

  async function handleUpdateTask(boardId, taskId, taskPayload) {
    try {
      const { data } = await boardApi.updateTask(taskId, taskPayload);
      const updatedTask = normalizeTask(data.data.task);

      setBoards((prev) =>
        prev.map((board) => {
          if (board.id !== boardId) return board;
          return {
            ...board,
            columns: board.columns.map((column) => {
              const hasTask = column.tasks.some((t) => t.id === taskId);
              if (!hasTask) return column;
              const updatedTasks = sortTasksByPriority(
                column.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updatedTask } : t,
                ),
              );
              return { ...column, tasks: updatedTasks };
            }),
          };
        }),
      );

      return updatedTask;
    } catch (err) {
      throw err;
    }
  }

  async function handleDeleteTask(boardId, taskId) {
    await boardApi.deleteTask(taskId);

    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board;

        return {
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          })),
        };
      }),
    );
  }

  async function handleMoveTask(boardId, taskId, movePayload) {
    await boardApi.moveTask(taskId, movePayload);
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join/:code" element={<JoinBoard />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard
              boards={boards}
              isLoading={isLoading}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
              onCreate={handleCreateBoard}
              onDelete={handleDeleteBoard}
              onJoinByCode={handleJoinByCode}
              onJoinByLink={handleJoinByLink}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/:boardId"
        element={
          <ProtectedRoute>
            <BoardView
              boards={boards}
              isLoading={isLoading}
              isDark={isDark}
              onToggleTheme={handleToggleTheme}
              onUpdateBoard={handleUpdateBoard}
              onDeleteBoard={handleDeleteBoard}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;