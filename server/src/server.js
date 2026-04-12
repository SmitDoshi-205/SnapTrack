import { env } from './config/env.js'
import app from './app.js'
import prisma from './config/db.js'

async function main() {
  // Test database connection before starting
  try {
    await prisma.$connect()
    console.log('Database connected')
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }

  app.listen(env.port, () => {
    console.log(`SnapTrack server running on http://localhost:${env.port}`)
    console.log(`Environment: ${env.nodeEnv}`)
  })
}

main()