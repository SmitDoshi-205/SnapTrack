import prisma from '../config/db.js'

//  Helper — verify membership 
async function checkMembership(boardId, userId) {
  return prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  })
}

//  Per-board analytics 
export async function getBoardAnalytics(req, res, next) {
  try {
    const { boardId } = req.params

    const membership = await checkMembership(boardId, req.user.id)
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    const tasks = await prisma.task.findMany({
      where:   { column: { boardId } },
      include: {
        column:   { select: { title: true } },
        assignee: { select: { id: true, name: true } },
      },
    })

    // Priority distribution
    const priorityCounts = { High: 0, Medium: 0, Low: 0 }
    for (const t of tasks) {
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++
    }
    const priorityDistribution = Object.entries(priorityCounts).map(
      ([priority, count]) => ({ priority, count })
    )

    // Tasks per column
    const colMap = {}
    for (const t of tasks) {
      const col = t.column.title
      colMap[col] = (colMap[col] || 0) + 1
    }
    const tasksPerColumn = Object.entries(colMap).map(
      ([column, count]) => ({ column, count })
    )

    // Completion stats
    const totalTasks     = tasks.length
    const doneTasks      = tasks.filter((t) => t.column.title === 'Done').length
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    // Overdue
    const now          = new Date()
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.column.title !== 'Done'
    ).length

    // Weekly created — last 6 weeks
    const sixWeeksAgo  = new Date()
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42)

    const weeklyMap = {}
    for (const t of tasks) {
      if (new Date(t.createdAt) < sixWeeksAgo) continue
      const d = new Date(t.createdAt)
      d.setDate(d.getDate() - d.getDay()) // start of week
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      weeklyMap[label] = (weeklyMap[label] || 0) + 1
    }
    const weeklyCreated = Object.entries(weeklyMap)
      .map(([week, count]) => ({ week, count }))
      .slice(-6)

    // Tasks per member
    const memberMap = {}
    for (const t of tasks) {
      if (!t.assignee) continue
      const key = t.assignee.id
      if (!memberMap[key]) memberMap[key] = { name: t.assignee.name, total: 0, done: 0 }
      memberMap[key].total++
      if (t.column.title === 'Done') memberMap[key].done++
    }
    const tasksPerMember = Object.values(memberMap)

    res.json({
      success: true,
      data: {
        totalTasks,
        doneTasks,
        completionRate,
        overdueTasks,
        priorityDistribution,
        tasksPerColumn,
        weeklyCreated,
        tasksPerMember,
      },
    })
  } catch (err) {
    next(err)
  }
}

//  Global analytics — across all boards the user belongs to 
export async function getGlobalAnalytics(req, res, next) {
  try {
    const memberships = await prisma.boardMember.findMany({
      where:   { userId: req.user.id },
      include: { board: { select: { id: true, name: true } } },
    })

    const boardIds = memberships.map((m) => m.board.id)

    if (boardIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalBoards:    0,
          totalTasks:     0,
          doneTasks:      0,
          overdueTasks:   0,
          completionRate: 0,
          boardSummaries: [],
          weeklyCreated:  [],
          priorityDistribution: [],
        },
      })
    }

    const tasks = await prisma.task.findMany({
      where:   { column: { boardId: { in: boardIds } } },
      include: {
        column: { select: { title: true, boardId: true } },
      },
    })

    // Global counts
    const totalTasks     = tasks.length
    const doneTasks      = tasks.filter((t) => t.column.title === 'Done').length
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const now            = new Date()
    const overdueTasks   = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.column.title !== 'Done'
    ).length

    // Per-board summary
    const boardTaskMap = {}
    for (const t of tasks) {
      const bid = t.column.boardId
      if (!boardTaskMap[bid]) boardTaskMap[bid] = { total: 0, done: 0 }
      boardTaskMap[bid].total++
      if (t.column.title === 'Done') boardTaskMap[bid].done++
    }

    const boardSummaries = memberships.map((m) => {
      const stats = boardTaskMap[m.board.id] || { total: 0, done: 0 }
      return {
        boardId:        m.board.id,
        boardName:      m.board.name,
        totalTasks:     stats.total,
        doneTasks:      stats.done,
        completionRate: stats.total > 0
          ? Math.round((stats.done / stats.total) * 100)
          : 0,
      }
    })

    // Global priority distribution
    const priorityCounts = { High: 0, Medium: 0, Low: 0 }
    for (const t of tasks) {
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++
    }
    const priorityDistribution = Object.entries(priorityCounts).map(
      ([priority, count]) => ({ priority, count })
    )

    // Weekly created — last 8 weeks
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    const weeklyMap = {}
    for (const t of tasks) {
      if (new Date(t.createdAt) < eightWeeksAgo) continue
      const d = new Date(t.createdAt)
      d.setDate(d.getDate() - d.getDay())
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      weeklyMap[label] = (weeklyMap[label] || 0) + 1
    }
    const weeklyCreated = Object.entries(weeklyMap)
      .map(([week, count]) => ({ week, count }))
      .slice(-8)

    res.json({
      success: true,
      data: {
        totalBoards: boardIds.length,
        totalTasks,
        doneTasks,
        overdueTasks,
        completionRate,
        boardSummaries,
        weeklyCreated,
        priorityDistribution,
      },
    })
  } catch (err) {
    next(err)
  }
}