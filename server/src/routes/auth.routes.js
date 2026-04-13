import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.middleware.js'
import { protect } from '../middleware/auth.middleware.js'
import {
  register,
  login,
  logout,
  refresh,
  me,
} from '../controllers/auth.controller.js'

const router = Router()

//  Validation schemas 

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase(), // normalise to lowercase before storing
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
})

const loginSchema = z.object({
  email:    z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

//  Routes 

// Public routes — no token needed
router.post('/register', validate(registerSchema), register)
router.post('/login',    validate(loginSchema),    login)
router.post('/logout',   logout)
router.post('/refresh',  refresh)

// Protected route — needs valid JWT
router.get('/me', protect, me)

export default router