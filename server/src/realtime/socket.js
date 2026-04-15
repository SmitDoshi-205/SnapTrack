import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { env } from '../config/env.js'

let io = null

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
      || socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token) {
      return next(new Error('Unauthorized'))
    }

    try {
      socket.user = jwt.verify(token, env.jwtSecret)
      next()
    } catch (err) {
      next(err)
    }
  })

  io.on('connection', (socket) => {
    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`)
    }

    socket.on('boards:join', (boardIds = []) => {
      boardIds.filter(Boolean).forEach((boardId) => {
        socket.join(`board:${boardId}`)
      })
    })

    socket.on('boards:leave', (boardIds = []) => {
      boardIds.filter(Boolean).forEach((boardId) => {
        socket.leave(`board:${boardId}`)
      })
    })
  })

  return io
}

export function getIO() {
  return io
}

export function emitBoardEvent(boardId, event, payload = {}) {
  if (!io || !boardId) return

  io.to(`board:${boardId}`).emit(event, {
    boardId,
    ...payload,
  })
}
