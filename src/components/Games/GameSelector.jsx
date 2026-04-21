import { useState } from 'react'

export const GAMES = [
  {
    id: 'bubbles',
    name: 'Bubble Pop',
    emoji: '🫧',
    description: 'Pop bubbles as they float up.',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'fish',
    name: 'Fish Catch',
    emoji: '🎣',
    description: 'Tap fish as they swim across the screen.',
    color: 'from-sky-400 to-blue-600',
  },
  {
    id: 'memory',
    name: 'Memory Match',
    emoji: '🃏',
    description: 'Flip cards to find matching pairs.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    id: 'candyland',
    name: 'Candy Trail',
    emoji: '🍬',
    description: 'Draw color cards and race to the finish!',
    color: 'from-pink-400 to-orange-400',
  },
  {
    id: 'coloring',
    name: 'Coloring Book',
    emoji: '🎨',
    description: 'Answer questions to unlock and fill a picture.',
    color: 'from-teal-400 to-green-500',
  },
  {
    id: 'dino',
    name: 'Dino Feed',
    emoji: '🦖',
    description: 'Tap falling food to feed the hungry dinosaur!',
    color: 'from-green-400 to-emerald-600',
  },
]

const DIFFICULTIES = [
  {
    id: 'easy',
    label: '🐢 Easy',
    desc: 'Slower pace · more turns between questions · larger array',
  },
  {
    id: 'medium',
    label: '🐇 Medium',
    desc: 'Standard speed and pacing',
  },
  {
    id: 'hard',
    label: '🚀 Hard',
    desc: 'Faster · questions come more often · smaller targets',
  },
]

export function GameSelector({ onSelectGame }) {
  const [difficulty, setDifficulty] = useState('medium')

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="px-6 pt-6 pb-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose a Game</h2>
          <p className="text-gray-500 text-sm">PEAK questions interrupt gameplay to earn more game time</p>
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⚡ Difficulty</h3>
          <div className="flex gap-2 mb-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all text-center ${
                  difficulty === d.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">{DIFFICULTIES.find(d => d.id === difficulty)?.desc}</p>
        </div>

        {/* Game grid */}
        <div className="grid grid-cols-2 gap-4">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => onSelectGame({ ...game, difficulty })}
              className={`bg-gradient-to-br ${game.color} text-white rounded-2xl p-5 text-left shadow-md hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-white/50`}
            >
              <div className="text-4xl mb-2">{game.emoji}</div>
              <h3 className="text-lg font-bold mb-0.5">{game.name}</h3>
              <p className="text-xs text-white/80 leading-snug">{game.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
