import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import Navbar from '../components/Navbar.jsx'
import api from '../api/axios.js'

const PRIORITY_COLORS = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' }
const COLUMN_COLORS   = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

//  Stat card 
function StatCard({ label, value, sub, color = 'blue' }) {
  const styles = {
    blue:  'text-blue-600  dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red:   'text-red-600   dark:text-red-400',
    gray:  'text-gray-600  dark:text-gray-400',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${styles[color] || styles.blue}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

//  Section wrapper 
function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h2>
      {children}
    </div>
  )
}

//  Board analytics view 
function BoardAnalyticsView({ boardId, board }) {
  const [data, setData]         = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.get(`/boards/${boardId}/analytics`)
      .then(({ data: res }) => { setData(res.data); setIsLoading(false) })
      .catch(() => { setError('Failed to load analytics'); setIsLoading(false) })
  }, [boardId])

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"/>
    </div>
  )

  if (error) return (
    <div className="text-center py-24 text-red-500 text-sm">{error}</div>
  )

  if (!data) return null

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total tasks"      value={data.totalTasks}          color="blue" />
        <StatCard label="Completed"        value={data.doneTasks}           color="green" sub={`${data.completionRate}% done`} />
        <StatCard label="Overdue"          value={data.overdueTasks}        color="red" />
        <StatCard label="Completion rate"  value={`${data.completionRate}%`} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority distribution */}
        <Section title="Priority distribution">
          {data.priorityDistribution.every((d) => d.count === 0) ? (
            <p className="text-sm text-gray-400 text-center py-8">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.priorityDistribution}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  label={({ priority, percent }) =>
                    percent > 0 ? `${priority} ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {data.priorityDistribution.map(({ priority }) => (
                    <Cell key={priority} fill={PRIORITY_COLORS[priority] || '#6366F1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Tasks per column */}
        <Section title="Tasks per column">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.tasksPerColumn} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="column" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.tasksPerColumn.map((_, i) => (
                  <Cell key={i} fill={COLUMN_COLORS[i % COLUMN_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Weekly tasks created */}
      {data.weeklyCreated.length > 0 && (
        <Section title="Tasks created — last 6 weeks">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weeklyCreated} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* Tasks per member */}
      {data.tasksPerMember.length > 0 && (
        <Section title="Member progress">
          <div className="flex flex-col gap-3">
            {data.tasksPerMember.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600 dark:text-gray-400 truncate flex-shrink-0">
                  {member.name}
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${member.total > 0 ? (member.done / member.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right flex-shrink-0">
                  {member.done}/{member.total} done
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

//  Global analytics view 
function GlobalAnalyticsView() {
  const [data, setData]           = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.get('/analytics')
      .then(({ data: res }) => { setData(res.data); setIsLoading(false) })
      .catch(() => { setError('Failed to load analytics'); setIsLoading(false) })
  }, [])

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"/>
    </div>
  )

  if (error) return (
    <div className="text-center py-24 text-red-500 text-sm">{error}</div>
  )

  if (!data) return null

  return (
    <div className="flex flex-col gap-6">
      {/* Global stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total boards"     value={data.totalBoards}          color="gray" />
        <StatCard label="Total tasks"      value={data.totalTasks}           color="blue" />
        <StatCard label="Completed"        value={data.doneTasks}            color="green" sub={`${data.completionRate}% done`} />
        <StatCard label="Overdue"          value={data.overdueTasks}         color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority distribution across all boards */}
        <Section title="Priority distribution — all boards">
          {data.priorityDistribution.every((d) => d.count === 0) ? (
            <p className="text-sm text-gray-400 text-center py-8">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.priorityDistribution}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  label={({ priority, percent }) =>
                    percent > 0 ? `${priority} ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {data.priorityDistribution.map(({ priority }) => (
                    <Cell key={priority} fill={PRIORITY_COLORS[priority] || '#6366F1'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Weekly tasks created */}
        {data.weeklyCreated.length > 0 && (
          <Section title="Tasks created — last 8 weeks">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.weeklyCreated} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        )}
      </div>

      {/* Per-board summary table */}
      {data.boardSummaries.length > 0 && (
        <Section title="Board breakdown">
          <div className="flex flex-col gap-3">
            {data.boardSummaries.map((board) => (
              <div key={board.boardId} className="flex items-center gap-3">
                <div className="w-36 text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-shrink-0">
                  {board.boardName}
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${board.completionRate}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 w-20 text-right flex-shrink-0">
                  {board.doneTasks}/{board.totalTasks} done
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

//  Main Analytics page 
function Analytics({ boards, isDark, onToggleTheme }) {
  const { boardId } = useParams()
  const navigate    = useNavigate()

  const board       = boardId ? boards.find((b) => b.id === boardId) : null
  const isGlobal    = !boardId

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Navbar
        boardName={board ? board.name : null}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        onBack={boardId
          ? () => navigate(`/board/${boardId}`)
          : () => navigate('/')
        }
      />

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {isGlobal ? 'Analytics' : `Analytics — ${board?.name || 'Board'}`}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isGlobal ? 'Overview across all your boards' : 'Insights for this board'}
            </p>
          </div>
        </div>

        {isGlobal
          ? <GlobalAnalyticsView />
          : <BoardAnalyticsView boardId={boardId} board={board} />
        }
      </main>
    </div>
  )
}

export default Analytics