import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getBoardAnalytics,
  getGlobalAnalytics,
} from "../controllers/analytics.controller.js";

const router = Router();
router.use(protect);

router.get("/analytics", getGlobalAnalytics);
router.get("/boards/:boardId/analytics", getBoardAnalytics);

export default router;