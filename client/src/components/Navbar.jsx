function Navbar({ boardName }) {
  return (
    <nav className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">

      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">K</span>
        </div>
        <span className="font-semibold text-gray-800">Kanban</span>
        {boardName && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 text-sm">{boardName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 text-xs font-semibold">S</span>
        </div>
      </div>

    </nav>
  )
}

export default Navbar