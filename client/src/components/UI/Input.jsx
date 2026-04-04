function Input({
  label,          // text label shown above the input
  value,          // current value — controlled by parent state
  onChange,       // function called every time user types
  placeholder,
  type = 'text',  // default to text
  options = [],   // only used when type is select
  required = false,
}) {

  const baseClass = `
    w-full px-3 py-2 text-sm rounded-lg
    border border-gray-200 dark:border-gray-600
    bg-white dark:bg-gray-700
    text-gray-800 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-colors duration-150
  `

  return (
    <div className="flex flex-col gap-1.5">

      {label && (
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {type === 'textarea' && (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      )}

      {type === 'select' && (
        <select
          value={value}
          onChange={onChange}
          className={baseClass}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {type !== 'textarea' && type !== 'select' && (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}

    </div>
  )
}

export default Input