import prisma from '../config/db.js'
import { emitBoardEvent } from '../realtime/socket.js'

// Get all comments for a task
export async function getComments(req, res, next) {
  try {
    const { taskId } = req.params

    const task = await prisma.task.findUnique({
      where:   { id: taskId },
      include: { column: { select: { boardId: true } } },
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    // Verify user is a board member
    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.column.boardId,
          userId:  req.user.id,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const comments = await prisma.comment.findMany({
      where:   { taskId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json({ success: true, data: { comments } })
  } catch (err) {
    next(err)
  }
}

// Add a comment to a task
export async function createComment(req, res, next) {
  try {
    const { taskId } = req.params
    const { body } = req.body

    const task = await prisma.task.findUnique({
      where:   { id: taskId },
      include: { column: { select: { boardId: true } } },
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.column.boardId,
          userId:  req.user.id,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const comment = await prisma.comment.create({
      data: { taskId, userId: req.user.id, body },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    emitBoardEvent(task.column.boardId, 'board:changed', { reason: 'comment-added' })

    res.status(201).json({ success: true, data: { comment } })
  } catch (err) {
    next(err)
  }
}

// Delete a comment — only the author can delete their own
export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params

    const comment = await prisma.comment.findUnique({ where: { id } })

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' })
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      })
    }

    await prisma.comment.delete({ where: { id } })

    res.json({ success: true, message: 'Comment deleted' })
  } catch (err) {
    next(err)
  }
}