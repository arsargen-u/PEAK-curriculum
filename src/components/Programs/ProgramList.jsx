import { useState, useEffect } from 'react'
import { getAllPrograms, deleteProgram } from '../../store/db'

export function ProgramList({ onSelectProgram, onNewProgram, onEditProgram }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllPrograms().then(p => { setPrograms(p); setLoading(false) })
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this program and all its images?')) return
    await deleteProgram(id)
    setPrograms(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900">My Programs</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tact · Array · Works with VB-MAPP, PEAK, ABLLS-R, or any custom targets
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <p className="text-center text-gray-400 py-12 text-sm">Loading…</p>
        )}

        {!loading && programs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <span className="text-6xl">📋</span>
            <p className="text-gray-700 font-semibold text-lg">No programs yet</p>
            <p className="text-gray-400 text-sm">Create your first program to get started.</p>
            <p className="text-gray-300 text-xs">Add any targets from any curriculum — or make your own.</p>
            <button
              onClick={onNewProgram}
              className="mt-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              + New Program
            </button>
          </div>
        )}

        {!loading && programs.length > 0 && (
          <div className="space-y-3">
            {programs.map(program => (
              <div
                key={program.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{program.trialType === 'tact' ? '🗣️' : '👆'}</span>
                      <span className="font-semibold text-gray-900 truncate">{program.name}</span>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        program.trialType === 'tact'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {program.trialType === 'tact' ? 'Tact' : 'Array'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {program.targets?.length ?? 0} targets
                      {program.arraySize && program.trialType !== 'tact' ? ` · array of ${program.arraySize}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEditProgram(program)}
                      className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(program.id, e)}
                      className="text-xs text-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onSelectProgram(program)}
                  className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
                >
                  Start Session →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {programs.length > 0 && (
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onNewProgram}
            className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-indigo-400 text-gray-500 hover:text-indigo-600 rounded-xl text-sm font-semibold transition-all"
          >
            + New Program
          </button>
        </div>
      )}
    </div>
  )
}
