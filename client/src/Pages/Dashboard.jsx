import { useState } from "react";
import BoardCard from "../components/Boards/BoardCard";
import BoardModal from "../components/Boards/BoardModal";
import Button from "../components/UI/Button";

function Dashboard({ boards, onCreate, onOpen, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            My boards
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {boards.length} {boards.length === 1 ? "board" : "boards"}
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + New board
        </Button>
      </div>

      {/* Empty state */}
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 dark:text-gray-600"
            >
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No boards yet
          </p>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Create your first board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onOpen={() => onOpen(board.id)}
              onDelete={onDelete}
            />
          ))}

          {/* New board ghost card */}
          <button
            onClick={() => setModalOpen(true)}
            className="
              border-2 border-dashed border-gray-200 dark:border-gray-700
              rounded-2xl p-5
              flex flex-col items-center justify-center gap-2
              min-h-[140px]
              text-gray-400 dark:text-gray-600
              hover:border-blue-300 dark:hover:border-blue-600
              hover:text-blue-400 dark:hover:text-blue-500
              transition-all duration-150
              cursor-pointer
            "
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs font-medium">New board</span>
          </button>
        </div>
      )}

      <BoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
      />
    </div>
  );
}

export default Dashboard;