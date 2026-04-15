import { env } from './config/env.js'
import app from './app.js'
import prisma from './config/db.js'
import http from 'http'
import { initSocket } from './realtime/socket.js'

async function main() {
  // Test database connection before starting
  try {
    await prisma.$connect()
    console.log('Database connected')
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }

  const server = http.createServer(app)
  initSocket(server)

  server.listen(env.port, () => {
    console.log(`SnapTrack server running on http://localhost:${env.port}`)
    console.log(`Environment: ${env.nodeEnv}`)
  })
}

main()