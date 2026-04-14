import prisma from '../config/db.js'

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
        // Create tag connections if tags were provided
        tags: tags?.length
          ? {
              create: tags.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        tags:     { include: { tag: true } },
      },
    })

    res.status(201).json({ success: true, data: { task } })
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

    res.json({ success: true, data: { task } })
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

    // If tags provided, delete existing and recreate
    if (tags !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId: id } })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        dueDate:    dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        assignedTo: assignedTo !== undefined ? assignedTo : undefined,
        tags: tags?.length
          ? {
              create: tags.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        tags:     { include: { tag: true } },
      },
    })

    res.json({ success: true, data: { task: updated } })
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

    const updated = await prisma.task.update({
      where: { id },
      data:  { columnId, position },
    })

    res.json({ success: true, data: { task: updated } })
  } catch (err) {
    next(err)
  }
}