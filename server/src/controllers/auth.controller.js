import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/db.js'
import { env } from '../config/env.js'

// Helpers 
function generateAccessToken(user) {
  return jwt.sign(
    // Payload 
    { id: user.id, email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  )
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    env.refreshSecret,
    { expiresIn: env.refreshExpiresIn }
  )
}

// Refresh token 
function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   env.nodeEnv === 'production', 
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,    
  })
}

// Calculate expiry date for storing in DB
function refreshTokenExpiry() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}

// Register 
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body

    // Check if email is already registered
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      })
    }

    // Hash the password 
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    // Generate tokens
    const accessToken  = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token in DB so we can invalidate it on logout
    await prisma.refreshToken.create({
      data: {
        token:     refreshToken,
        userId:    user.id,
        expiresAt: refreshTokenExpiry(),
      },
    })

    // Set refresh token as httpOnly cookie
    setRefreshCookie(res, refreshToken)

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        accessToken,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

// Login 
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Compare submitted password against stored hash
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // Generate tokens
    const accessToken  = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token:     refreshToken,
        userId:    user.id,
        expiresAt: refreshTokenExpiry(),
      },
    })

    setRefreshCookie(res, refreshToken)

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        accessToken,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

// Refresh token 
export async function refresh(req, res, next) {
  try {
    // Read refresh token from cookie
    const token = req.cookies?.refreshToken

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token',
      })
    }

    // Verify the token signature and expiry
    let decoded
    try {
      decoded = jwt.verify(token, env.refreshSecret)
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      })
    }

    // Check the token exists in DB — if not, user logged out
    const stored = await prisma.refreshToken.findUnique({
      where: { token },
    })

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token revoked or expired',
      })
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Issue a new access token
    const newAccessToken = generateAccessToken(user)

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    })
  } catch (err) {
    next(err)
  }
}

// Logout 
export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken

    if (token) {
      // Delete the refresh token from DB so it cannot be reused
      await prisma.refreshToken.deleteMany({ where: { token } })
    }

    // Clear the cookie from the browser
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure:   env.nodeEnv === 'production',
      sameSite: 'strict',
    })

    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    next(err)
  }
}

// Me 
export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:        true,
        name:      true,
        email:     true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    res.json({ success: true, data: { user } })
  } catch (err) {
    next(err)
  }
}