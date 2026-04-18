import { useState, useEffect, useRef } from 'react'
import { boardApi } from '../../api/board.api.js'

// Returns a human-readable file size string
function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Returns an icon label based on file type
function FileIcon({ mimeType }) {
  const isImage = mimeType?.startsWith('image/')
  const isPdf   = mimeType === 'application/pdf'

  if (isImage) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="text-blue-500">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    )
  }

  if (isPdf) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="text-red-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-gray-400">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function AttachmentSection({ taskId, currentUserId }) {
  const [attachments, setAttachments]   = useState([])
  const [isLoading, setIsLoading]       = useState(false)
  const [isUploading, setIsUploading]   = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError]               = useState('')
  const fileInputRef                    = useRef(null)
  const isTaskSaved = Boolean(taskId)

  useEffect(() => {
    if (!isTaskSaved) {
      setAttachments([])
      setIsLoading(false)
      return
    }
    loadAttachments()
  }, [isTaskSaved, taskId])

  async function loadAttachments() {
    setIsLoading(true)
    try {
      const { data } = await boardApi.getAttachments(taskId)
      setAttachments(data.data.attachments || [])
    } catch {
      setAttachments([])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!isTaskSaved) return

    // Reset input so same file can be re-uploaded
    e.target.value = ''

    setIsUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      const { data } = await boardApi.uploadAttachment(taskId, file)
      setAttachments((prev) => [data.data.attachment, ...prev])
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleDelete(attachmentId) {
    if (!window.confirm('Delete this attachment?')) return
    try {
      await boardApi.deleteAttachment(attachmentId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
    } catch {
      setError('Failed to delete attachment')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Attachments
          {attachments.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              ({attachments.length})
            </span>
          )}
        </h3>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !isTaskSaved}
          className="
            flex items-center gap-1.5
            text-xs font-medium
            text-blue-600 dark:text-blue-400
            hover:text-blue-700 dark:hover:text-blue-300
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        >
          {isUploading ? (
            <>
              <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"/>
              Uploading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Attach file
            </>
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {!isTaskSaved && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Save the task first to attach documents.
        </p>
      )}

      {/* Attachment list */}
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading attachments...</p>
      ) : attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="
            border-2 border-dashed border-gray-200 dark:border-gray-600
            rounded-lg p-4
            text-center text-xs text-gray-400 dark:text-gray-500
            cursor-pointer
            hover:border-blue-300 dark:hover:border-blue-600
            hover:text-blue-400
            transition-colors duration-150
          "
        >
          Click to attach a file — images, PDFs, docs up to 10MB
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="
                flex items-center gap-2.5
                bg-gray-50 dark:bg-gray-700/50
                border border-gray-200 dark:border-gray-600
                rounded-lg px-3 py-2.5
                group
              "
            >
              <FileIcon mimeType={attachment.fileType} />

              <div className="flex-1 min-w-0">
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-xs font-medium
                    text-gray-700 dark:text-gray-300
                    hover:text-blue-600 dark:hover:text-blue-400
                    truncate block
                    transition-colors
                  "
                >
                  {attachment.fileName}
                </a>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatSize(attachment.fileSize)}
                  {attachment.uploader?.name && (
                    <span className="ml-1">· {attachment.uploader.name}</span>
                  )}
                </p>
              </div>

              {/* Delete — only for uploader */}
              {attachment.uploadedBy === currentUserId && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="
                    opacity-0 group-hover:opacity-100
                    text-gray-400 hover:text-red-500
                    transition-all duration-150
                    flex-shrink-0
                  "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AttachmentSection