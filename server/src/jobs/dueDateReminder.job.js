import cron from 'node-cron'
import prisma from '../config/db.js'
import {
  sendMemberDueReminder,
  sendOwnerDueSummary,
} from '../services/email.service.js'

export function startDueDateReminderJob() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running due date reminder job...')

    try {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfter = new Date(tomorrow)
      dayAfter.setDate(dayAfter.getDate() + 1)

      // Get all tasks due tomorrow that have an assigned user
      const tasks = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: tomorrow,
            lt:  dayAfter,
          },
          assignedTo: { not: null },
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          column: {
            include: {
              board: {
                include: {
                  owner: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      })

      console.log(`[Cron] Found ${tasks.length} task(s) due tomorrow`)

      if (tasks.length === 0) return

      for (const task of tasks) {
        if (!task.assignee?.email) continue

        await sendMemberDueReminder({
          to:        task.assignee.email,
          userName:  task.assignee.name,
          taskTitle: task.title,
          boardName: task.column.board.name,
          dueDate:   task.dueDate,
        })

        console.log(`[Cron] Member reminder → ${task.assignee.email} for "${task.title}"`)
      }

      const boardTaskMap = {}

      for (const task of tasks) {
        const board = task.column.board
        if (!boardTaskMap[board.id]) {
          boardTaskMap[board.id] = {
            board,
            owner: board.owner,
            tasks: [],
          }
        }
        boardTaskMap[board.id].tasks.push({
          title:     task.title,
          dueDate:   task.dueDate,
          assignees: task.assignee ? [task.assignee] : [],
        })
      }

      for (const { board, owner, tasks: boardTasks } of Object.values(boardTaskMap)) {
        if (!owner?.email) continue

        await sendOwnerDueSummary({
          to:        owner.email,
          ownerName: owner.name,
          boardName: board.name,
          tasks:     boardTasks,
        })

        console.log(`[Cron] Owner summary → ${owner.email} for board "${board.name}" (${boardTasks.length} tasks)`)
      }

      console.log('[Cron] Due date reminder job completed')
    } catch (err) {
      console.error('[Cron] Due date reminder job failed:', err.message)
    }
  })

  console.log('[Cron] Due date reminder job scheduled — runs daily at 9:00am')
}