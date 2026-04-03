function Button({ children, onClick, variant = 'primary', disabled = false }) {
  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
    ghost:     'hover:bg-gray-100 text-gray-600',
  }

  const variantClass = variants[variant] || variants.primary

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass}
      `}
    >
      {children}
    </button>
  )
}

export default Button