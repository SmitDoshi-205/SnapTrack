import prisma from '../config/db.js'
import { emitBoardEvent } from '../realtime/socket.js'

// Helper 

async function requireBoardMembership(columnId, userId) {
  const column = await prisma.column.findUnique({
    where:   { id: columnId },
    include: { board: { include: { members: true } } },
  })

  if (!column) return null

  const isMember = column.board.members.some((m) => m.userId === userId)
  return isMember ? column : null
}

function normalizeTags(tags) {
  return [...new Set((tags || []).map((tag) => String(tag).trim()).filter(Boolean))]
}

function buildTaskTagCreates(boardId, tags) {
  return tags.map((tagName) => ({
    tag: {
      connectOrCreate: {
        where: {
          boardId_name: {
            boardId,
            name: tagName,
          },
        },
        create: {
          boardId,
          name: tagName,
        },
      },
    },
  }))
}

// Create task 

export async function createTask(req, res, next) {
  try {
    const { columnId } = req.params
    const { title, description, priority, dueDate, assignedTo, tags } = req.body

    const column = await requireBoardMembership(columnId, req.user.id)
    if (!column) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Put new task at the end of the column
    const lastTask = await prisma.task.findFirst({
      where:   { columnId },
      orderBy: { position: 'desc' },
    })
    const position = lastTask ? lastTask.position + 1000 : 0

    const normalizedTags = normalizeTags(tags)

    const task = await prisma.task.create({
      data: {
        columnId,
        title,
        description,
        priority:   priority  || 'Medium',
        dueDate:    dueDate   ? new Date(dueDate) : null,
        assignedTo: assignedTo || null,
        createdBy:  req.user.id,
        position,
        tags: normalizedTags.length
          ? {
              create: buildTaskTagCreates(column.boardId, normalizedTags),
            }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        tags:     { include: { tag: true } },
      },
    })

    res.status(201).json({ success: true, data: { task } })
    emitBoardEvent(column.boardId, 'board:changed', { reason: 'task-created' })
  } catch (err) {
    next(err)
  }
}

// Get single task 

export async function getTask(req, res, next) {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({
      where:   { id },
      include: {
        column: {
          select: { boardId: true },
        },
        assignee:    { select: { id: true, name: true, avatarUrl: true } },
        creator:     { select: { id: true, name: true } },
        tags:        { include: { tag: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const membership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.column.boardId,
          userId: req.user.id,
        },
      },
    })

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const { column, ...safeTask } = task

    res.json({ success: true, data: { task: safeTask } })
  } catch (err) {
    next(err)
  }
}

// Update task 

export async function updateTask(req, res, next) {
  try {
    const { id } = req.params
    const { title, description, priority, dueDate, assignedTo, tags } = req.body

    const task = await prisma.task.findUnique({
      where:   { id },
      include: { column: { include: { board: { include: { members: true } } } } },
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const isMember = task.column.board.members.some((m) => m.userId === req.user.id)
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const normalizedTags = tags !== undefined ? normalizeTags(tags) : null

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        dueDate:    dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        assignedTo: assignedTo !== undefined ? assignedTo : undefined,
        tags:
          normalizedTags === null
            ? undefined
            : {
                deleteMany: {},
                create: buildTaskTagCreates(task.column.boardId, normalizedTags),
              },
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        tags:     { include: { tag: true } },
      },
    })

    res.json({ success: true, data: { task: updated } })
    emitBoardEvent(task.column.boardId, 'board:changed', { reason: 'task-updated' })
  } catch (err) {
    next(err)
  }
}

// Delete task 

export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params

    const task = await prisma.task.findUnique({
      where:   { id },
      include: { column: { include: { board: true } } },
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const isMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: task.column.boardId,
          userId:  req.user.id,
        },
      },
    })

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    await prisma.task.delete({ where: { id } })

    res.json({ success: true, message: 'Task deleted' })
    emitBoardEvent(task.column.boardId, 'board:changed', { reason: 'task-deleted' })
  } catch (err) {
    next(err)
  }
}

// Move task between columns 

export async function moveTask(req, res, next) {
  try {
    const { id } = req.params
    const { columnId, position } = req.body

    const task = await prisma.task.findUnique({
      where:   { id },
      include: { column: { include: { board: { include: { members: true } } } } },
    })

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const isMember = task.column.board.members.some((m) => m.userId === req.user.id)
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const targetColumn = await prisma.column.findUnique({ where: { id: columnId } })
    if (!targetColumn) {
      return res.status(404).json({ success: false, message: 'Target column not found' })
    }

    if (targetColumn.boardId !== task.column.boardId) {
      return res.status(400).json({
        success: false,
        message: 'Task can only be moved within the same board',
      })
    }

    const updated = await prisma.task.update({
      where: { id },
      data:  { columnId, position },
    })

    res.json({ success: true, data: { task: updated } })
    emitBoardEvent(task.column.boardId, 'board:changed', { reason: 'task-moved' })
  } catch (err) {
    next(err)
  }
}