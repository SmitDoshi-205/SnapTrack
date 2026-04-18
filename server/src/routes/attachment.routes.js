import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { upload } from '../services/upload.service.js'
import {
  uploadAttachment,
  getAttachments,
  deleteAttachment,
} from '../controllers/attachment.controller.js'

const router = Router()
router.use(protect)

router.post('/tasks/:taskId/attachments',  upload.single('file'), uploadAttachment)
router.get('/tasks/:taskId/attachments',   getAttachments)
router.delete('/attachments/:id',          deleteAttachment)

export default router