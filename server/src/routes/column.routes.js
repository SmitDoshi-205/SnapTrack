import { Router } from "express";
import { z } from "zod";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from "../controllers/column.controller.js";

const router = Router();

router.use(protect);

const columnSchema = z.object({
  title: z.string().min(1).max(100),
});

const reorderSchema = z.object({
  columns: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().min(0),
    }),
  ),
});

router.post("/boards/:boardId/columns", validate(columnSchema), createColumn);
router.patch("/columns/:id", validate(columnSchema), updateColumn);
router.delete("/columns/:id", deleteColumn);
router.patch(
  "/boards/:boardId/columns/reorder",
  validate(reorderSchema),
  reorderColumns,
);

export default router;
