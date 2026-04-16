import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error.middleware.js'
import authRoutes    from './routes/auth.routes.js'
import boardRoutes   from './routes/board.routes.js'
import columnRoutes  from './routes/column.routes.js'
import taskRoutes    from './routes/task.routes.js'
import memberRoutes  from './routes/member.routes.js'

const app = express()

app.use(cors({
  origin:      env.clientUrl,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/auth',   authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api',        columnRoutes)
app.use('/api',        taskRoutes)
app.use('/api',        memberRoutes)

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SnapTrack API is running' })
})

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)

export default app