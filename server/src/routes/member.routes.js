import { Router } from 'express'
import { z } from 'zod'
import { protect } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { getComments, createComment, deleteComment } from '../controllers/comment.controller.js'

const router = Router()

router.use(protect)

const commentSchema = z.object({
  body: z.string().min(1).max(2000),
})

// Comments are nested under tasks
router.get('/tasks/:taskId/comments',    getComments)
router.post('/tasks/:taskId/comments',   validate(commentSchema), createComment)
router.delete('/comments/:id',           deleteComment)

export default router