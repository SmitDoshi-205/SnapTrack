import { Router } from 'express'
import { z } from 'zod'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  joinBoard,
  removeMember,
} from '../controllers/board.controller.js'

const router = Router()

router.use(protect)

const createBoardSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().max(500).optional().nullable(),
})

const updateBoardSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
})

router.get('/',                      getBoards)
router.post('/',   validate(createBoardSchema), createBoard)
router.get('/:id',                   getBoard)
router.patch('/:id', validate(updateBoardSchema), updateBoard)
router.delete('/:id',                deleteBoard)
router.post('/join/:code',           joinBoard)
router.delete('/:id/members/:userId', removeMember)

export default router