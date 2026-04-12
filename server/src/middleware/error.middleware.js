// This middleware catches any error thrown in a route handler
// It always returns a consistent JSON shape so the frontend
export function errorHandler(err, req, res, next) {
  console.error(`[${req.method}] ${req.path} →`, err.message)

  // Prisma unique constraint violation 
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: `${err.meta?.target?.[0] ?? 'Field'} already exists`,
    })
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found',
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' })
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
}