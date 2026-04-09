import { useState, useEffect } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";

function BoardModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  function handleCreate() {
    if (!name.trim()) {
      setError("Board name is required");
      return;
    }
    onCreate({ name: name.trim(), description: description.trim() || null });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="
          bg-white dark:bg-gray-800
          rounded-2xl shadow-xl
          w-full max-w-md
          p-6 flex flex-col gap-5
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            New board
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <Input
            label="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Personal, Work, Side Project"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this board for? (optional)"
            type="textarea"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate}>
            Create board
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BoardModal;