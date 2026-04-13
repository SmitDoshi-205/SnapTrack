import prisma from '../config/db.js'

//  Helper — verify user is a board member 

async function requireMembership(boardId, userId) {
  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  })
  return membership
}

//  Create column 

export async function createColumn(req, res, next) {
  try {
    const { boardId } = req.params
    const { title } = req.body

    const membership = await requireMembership(boardId, req.user.id)
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Put new column at the end 
    const lastColumn = await prisma.column.findFirst({
      where:   { boardId },
      orderBy: { position: 'desc' },
    })

    const position = lastColumn ? lastColumn.position + 1 : 0

    const column = await prisma.column.create({
      data: { boardId, title, position },
      include: { tasks: true },
    })

    res.status(201).json({ success: true, data: { column } })
  } catch (err) {
    next(err)
  }
}

//  Update column 

export async function updateColumn(req, res, next) {
  try {
    const { id } = req.params
    const { title } = req.body

    const column = await prisma.column.findUnique({ where: { id } })
    if (!column) {
      return res.status(404).json({ success: false, message: 'Column not found' })
    }

    const membership = await requireMembership(column.boardId, req.user.id)
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const updated = await prisma.column.update({
      where: { id },
      data:  { title },
    })

    res.json({ success: true, data: { column: updated } })
  } catch (err) {
    next(err)
  }
}

//  Delete column 

export async function deleteColumn(req, res, next) {
  try {
    const { id } = req.params

    const column = await prisma.column.findUnique({ where: { id } })
    if (!column) {
      return res.status(404).json({ success: false, message: 'Column not found' })
    }

    // Only board owner can delete a column
    const board = await prisma.board.findUnique({ where: { id: column.boardId } })
    if (board.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete columns' })
    }

    await prisma.column.delete({ where: { id } })

    res.json({ success: true, message: 'Column deleted' })
  } catch (err) {
    next(err)
  }
}

//  Reorder columns 

export async function reorderColumns(req, res, next) {
  try {
    const { boardId } = req.params
    const { columns } = req.body // [{ id: 'col-1', position: 0 }, ...]

    const membership = await requireMembership(boardId, req.user.id)
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Update all column positions in a transaction
    await prisma.$transaction(
      columns.map(({ id, position }) =>
        prisma.column.update({ where: { id }, data: { position } })
      )
    )

    res.json({ success: true, message: 'Columns reordered' })
  } catch (err) {
    next(err)
  }
}