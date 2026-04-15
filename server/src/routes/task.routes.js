import { Router } from "express";
import { z } from "zod";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
} from "../controllers/task.controller.js";

const router = Router();

router.use(protect);

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const moveTaskSchema = z.object({
  columnId: z.string(),
  position: z.number().int().min(0),
});

router.post("/columns/:columnId/tasks", validate(createTaskSchema), createTask);
router.get("/tasks/:id", getTask);
router.patch("/tasks/:id", validate(updateTaskSchema), updateTask);
router.delete("/tasks/:id", deleteTask);
router.patch("/tasks/:id/move", validate(moveTaskSchema), moveTask);

export default router;
