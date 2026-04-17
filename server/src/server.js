import { env } from './config/env.js'
import app from './app.js'
import prisma from './config/db.js'
import { startDueDateReminderJob } from './jobs/dueDateReminder.job.js'

async function main() {
  try {
    await prisma.$connect()
    console.log('Database connected')
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }

  // Start background jobs
  startDueDateReminderJob()

  app.listen(env.port, () => {
    console.log(`SnapTrack server running on http://localhost:${env.port}`)
    console.log(`Environment: ${env.nodeEnv}`)
  })
}

main()