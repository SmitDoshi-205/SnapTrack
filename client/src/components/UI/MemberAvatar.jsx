import { useState } from 'react'

function stringToColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    'bg-blue-500',   'bg-purple-500', 'bg-green-500',
    'bg-amber-500',  'bg-rose-500',   'bg-teal-500',
    'bg-indigo-500', 'bg-orange-500',
  ]
  return colors[Math.abs(hash) % colors.length]
}

function MemberAvatar({ user, size = 'sm', showName = false, role = null }) {
  const [showTooltip, setShowTooltip] = useState(false)

  if (!user) return null

  const initial    = user.name?.charAt(0).toUpperCase() || '?'
  const colorClass = stringToColor(user.name)

  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : null

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Avatar circle */}
      <div className={`
        ${sizeClasses[size] || sizeClasses.sm}
        ${colorClass}
        rounded-full
        flex items-center justify-center
        flex-shrink-0
        font-semibold text-white
        ring-2 ring-white dark:ring-gray-800
        cursor-default
        transition-transform duration-100
        ${showTooltip ? 'scale-110' : ''}
      `}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      {/* Inline name */}
      {showName && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user.name}
        </span>
      )}

      {/* Hover tooltip */}
      {showTooltip && (role !== undefined) && (
        <div className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          bg-gray-900 dark:bg-gray-700
          text-white text-xs
          px-2.5 py-1.5 rounded-lg
          whitespace-nowrap
          pointer-events-none
          z-50
          shadow-lg
        ">
          <p className="font-medium">{user.name}</p>
          {roleLabel && (
            <p className="text-gray-400 text-xs">{roleLabel}</p>
          )}
          {/* Tooltip arrow */}
          <div className="
            absolute top-full left-1/2 -translate-x-1/2
            border-4 border-transparent border-t-gray-900 dark:border-t-gray-700
          "/>
        </div>
      )}
    </div>
  )
}

export default MemberAvatar