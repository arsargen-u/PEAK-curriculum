import { useState, useMemo } from 'react'
import { directPrograms, STIMULUS_TYPE } from '../../data/directPrograms'
import { Badge } from '../UI/Badge'

const TYPE_LABELS = {
  [STIMULUS_TYPE.RECEPTIVE]: { label: 'Receptive', color: 'blue' },
  [STIMULUS_TYPE.TACT]: { label: 'Tact', color: 'green' },
  [STIMULUS_TYPE.MATCH]: { label: 'Match', color: 'amber' },
  [STIMULUS_TYPE.DISCRIMINATION]: { label: 'Discrimination', color: 'rose' },
}

export function ProgramLibrary({ onSelectProgram }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  const levels = useMemo(() => [...new Set(directPrograms.map(p => p.level))].sort((a, b) => a - b), [])

  const filtered = useMemo(() => {
    return directPrograms.filter(p => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.typicalStimuli.some(s => s.toLowerCase().includes(q))
      const matchesType = typeFilter === 'all' || p.stimulusType === typeFilter
      const matchesLevel = levelFilter === 'all' || p.level === Number(levelFilter)
      return matchesSearch && matchesType && matchesLevel
    })
  }, [search, typeFilter, levelFilter])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">PEAK Direct — Program Library</h1>
        <p className="text-sm text-gray-500 mt-1">{directPrograms.length} picture-based programs · tap a program to set up a session</p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search by name, code, or stimulus…"
          className="flex-1 min-w-48 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          <option value={STIMULUS_TYPE.RECEPTIVE}>Receptive</option>
          <option value={STIMULUS_TYPE.TACT}>Tact</option>
          <option value={STIMULUS_TYPE.MATCH}>Match</option>
          <option value={STIMULUS_TYPE.DISCRIMINATION}>Discrimination</option>
        </select>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
        >
          <option value="all">All levels</option>
          {levels.map(l => (
            <option key={l} value={l}>Level {l}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <div className="px-6 py-2 text-xs text-gray-500">
        Showing {filtered.length} of {directPrograms.length} programs
      </div>

      {/* Program grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              onSelect={() => onSelectProgram(program)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-lg font-medium">No programs match your search</p>
            <button
              className="mt-3 text-sm text-indigo-500 underline"
              onClick={() => { setSearch(''); setTypeFilter('all'); setLevelFilter('all') }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgramCard({ program, onSelect }) {
  const typeInfo = TYPE_LABELS[program.stimulusType] ?? { label: program.stimulusType, color: 'gray' }
  return (
    <button
      onClick={onSelect}
      className="text-left bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">{program.code}</span>
        <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{program.name}</h3>
      <p className="text-xs text-gray-500 mb-3 italic">"{program.sd}"</p>
      <div className="flex flex-wrap gap-1">
        {program.typicalStimuli.slice(0, 4).map((s, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
            {s.length > 20 ? s.slice(0, 18) + '…' : s}
          </span>
        ))}
        {program.typicalStimuli.length > 4 && (
          <span className="text-xs text-gray-400">+{program.typicalStimuli.length - 4} more</span>
        )}
      </div>
      <div className="mt-3 text-xs text-gray-400">
        Array: {program.arraySize.min}–{program.arraySize.max} items · Level {program.level}
      </div>
    </button>
  )
}
