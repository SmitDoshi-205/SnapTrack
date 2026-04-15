import { useState } from 'react'

function InviteCodeDisplay({ inviteCode }) {
  const [copied, setCopied] = useState(false)

  // Join URL
  const joinUrl = `${window.location.origin}/join/${inviteCode}`

  async function handleCopy() {
  try {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  } catch (err) {
    console.error('Clipboard API failed:', err)

    try {
      const input = document.createElement('input')
      input.value = joinUrl
      input.style.position = 'fixed'
      input.style.opacity = '0'

      document.body.appendChild(input)
      input.focus()
      input.select()

      const success = document.execCommand('copy')
      document.body.removeChild(input)

      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        alert('Copy failed. Please copy manually.')
      }
    } catch (fallbackErr) {
      console.error('Fallback failed:', fallbackErr)
      alert('Copy failed. Please copy manually.')
    }
  }
}

  return (
    <div className="flex items-center gap-2">
      {/* Invite code pill */}
      <div className="
        flex items-center gap-2
        bg-gray-100 dark:bg-gray-700
        border border-gray-200 dark:border-gray-600
        rounded-lg px-3 py-1.5
      ">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Invite
        </span>
        <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-200">
          {inviteCode}
        </span>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="
          text-xs px-3 py-1.5 rounded-lg
          bg-blue-50 dark:bg-blue-900/30
          text-blue-600 dark:text-blue-400
          hover:bg-blue-100 dark:hover:bg-blue-900/50
          border border-blue-200 dark:border-blue-800
          transition-colors duration-150
          flex items-center gap-1.5
        "
      >
        {copied ? (
          <>
            {/* Checkmark icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            {/* Copy icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy link
          </>
        )}
      </button>
    </div>
  )
}

export default InviteCodeDisplay