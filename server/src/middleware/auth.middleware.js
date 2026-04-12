import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function protect(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.jwtSecret)
    req.user = decoded  // { id, email, name }
    next()
  } catch (err) {
    next(err)  // Passes to error middleware 
  }
}