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

function MemberAvatar({ user, size = 'sm', showName = false }) {
  if (!user) return null

  const initial    = user.name?.charAt(0).toUpperCase() || '?'
  const colorClass = stringToColor(user.name)

  const sizeClasses = {
    xs: 'w-5 h-5 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`
        ${sizeClasses[size] || sizeClasses.sm}
        ${colorClass}
        rounded-full
        flex items-center justify-center
        flex-shrink-0
        font-semibold text-white
        ring-2 ring-white dark:ring-gray-800
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
      {showName && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user.name}
        </span>
      )}
    </div>
  )
}

export default MemberAvatar