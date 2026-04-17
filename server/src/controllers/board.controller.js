import prisma from '../config/db.js'
import { emitBoardEvent } from '../realtime/socket.js'
import { sendMemberJoinedNotification } from '../services/email.service.js';

//  Helpers 

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'SNAP-'
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

async function uniqueInviteCode() {
  let code, exists
  do {
    code   = generateInviteCode()
    exists = await prisma.board.findUnique({ where: { inviteCode: code } })
  } while (exists)
  return code
}

//  Get all boards for logged-in user 

export async function getBoards(req, res, next) {
  try {
    // Get every board where user is a member (includes boards they own)
    const memberships = await prisma.boardMember.findMany({
      where: { userId: req.user.id },
      include: {
        board: {
          include: {
            columns: {
              include: {
                tasks: {
                  include: {
                    assignee: {
                      select: { id: true, name: true, avatarUrl: true },
                    },
                    tags: { include: { tag: true } },
                  },
                  orderBy: { position: 'asc' },
                },
              },
              orderBy: { position: 'asc' },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    })

    const boards = memberships.map((m) => ({
      ...m.board,
      role: m.role,
    }))

    res.json({ success: true, data: { boards } })
  } catch (err) {
    next(err)
  }
}

//  Get single board 

export async function getBoard(req, res, next) {
  try {
    const { id } = req.params

    // Check user is a member of this board
    const membership = await prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId: id, userId: req.user.id } },
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      })
    }

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                assignee: {
                  select: { id: true, name: true, avatarUrl: true },
                },
                tags: { include: { tag: true } },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    })

    res.json({ success: true, data: { board } })
  } catch (err) {
    next(err)
  }
}

//  Create board 

export async function createBoard(req, res, next) {
  try {
    const { name, description } = req.body
    const inviteCode = await uniqueInviteCode()

    // Create board + default columns + owner membership in one transaction
    const board = await prisma.$transaction(async (tx) => {
      const newBoard = await tx.board.create({
        data: {
          name,
          description,
          ownerId:    req.user.id,
          inviteCode,
        },
      })

      // Create the three default columns
      await tx.column.createMany({
        data: [
          { boardId: newBoard.id, title: 'To Do',       position: 0 },
          { boardId: newBoard.id, title: 'In Progress', position: 1 },
          { boardId: newBoard.id, title: 'Done',        position: 2 },
        ],
      })

      // Add creator as owner member
      await tx.boardMember.create({
        data: {
          boardId: newBoard.id,
          userId:  req.user.id,
          role:    'owner',
        },
      })

      return newBoard
    })

    // Fetch the full board with columns to return
    const fullBoard = await prisma.board.findUnique({
      where: { id: board.id },
      include: {
        columns: {
          include: { tasks: true },
          orderBy: { position: 'asc' },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    })

    res.status(201).json({ success: true, data: { board: fullBoard } })
    emitBoardEvent(board.id, 'board:changed', { reason: 'board-created' })
  } catch (err) {
    next(err)
  }
}

//  Update board 

export async function updateBoard(req, res, next) {
  try {
    const { id } = req.params
    const { name, description } = req.body

    // Only the board owner can rename it
    const board = await prisma.board.findUnique({ where: { id } })

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' })
    }

    if (board.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the owner can edit this board' })
    }

    const updated = await prisma.board.update({
      where: { id },
      data:  { name, description },
    })

    res.json({ success: true, data: { board: updated } })
    emitBoardEvent(id, 'board:changed', { reason: 'board-updated' })
  } catch (err) {
    next(err)
  }
}

//  Delete board 

export async function deleteBoard(req, res, next) {
  try {
    const { id } = req.params

    const board = await prisma.board.findUnique({ where: { id } })

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' })
    }

    if (board.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this board' })
    }

    // Cascade deletes handle columns, tasks, members automatically
    await prisma.board.delete({ where: { id } })

    res.json({ success: true, message: 'Board deleted' })
    emitBoardEvent(id, 'board:deleted', { reason: 'board-deleted' })
  } catch (err) {
    next(err)
  }
}

//  Join board via invite code 

export async function joinBoard(req, res, next) {
  try {
    const { code } = req.params

    const board = await prisma.board.findUnique({
      where: { inviteCode: code.toUpperCase() },
    })

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code',
      })
    }

    // Check if already a member
    const existing = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: { boardId: board.id, userId: req.user.id },
      },
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You are already a member of this board',
      })
    }

    await prisma.boardMember.create({
      data: {
        boardId: board.id,
        userId:  req.user.id,
        role:    'editor',
      },
    })

    const [newMember, owner] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: req.user.id },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where:  { id: board.ownerId },
        select: { id: true, name: true, email: true },
      }),
    ])

    // Only send if the joiner is not the owner themselves
    if (owner?.email && owner.id !== req.user.id) {
      sendMemberJoinedNotification({
        to:            owner.email,
        ownerName:     owner.name,
        newMemberName: newMember?.name || 'Someone',
        boardName:     board.name,
        role:          'editor',
      }).catch((err) => {
        // Non-blocking — don't fail the join request if email fails
        console.error('[Email] Failed to send join notification:', err.message)
      })
    }

    res.json({
      success: true,
      message: 'Joined board successfully',
      data:    { boardId: board.id },
    })
    emitBoardEvent(board.id, 'board:changed', { reason: 'member-joined' })
  } catch (err) {
    next(err)
  }
}

//  Remove member 

export async function removeMember(req, res, next) {
  try {
    const { id, userId } = req.params

    const board = await prisma.board.findUnique({ where: { id } })

    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found' })
    }

    // Only owner can remove members
    // Members can remove themselves 
    if (board.ownerId !== req.user.id && userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    // Owner cannot remove themselves
    if (userId === board.ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner cannot be removed. Delete the board instead.',
      })
    }

    await prisma.boardMember.delete({
      where: { boardId_userId: { boardId: id, userId } },
    })

    res.json({ success: true, message: 'Member removed' })
    emitBoardEvent(id, 'board:changed', { reason: 'member-removed' })
  } catch (err) {
    next(err)
  }
}