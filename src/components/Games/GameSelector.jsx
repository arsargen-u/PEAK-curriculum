export const GAMES = [
  {
    id: 'bubbles',
    name: 'Bubble Pop',
    emoji: '🫧',
    description: 'Pop bubbles as they float up. Questions interrupt every few pops.',
    color: 'from-indigo-400 to-purple-500',
  },
  {
    id: 'fish',
    name: 'Fish Catch',
    emoji: '🎣',
    description: 'Tap fish as they swim across the screen. Questions interrupt every few catches.',
    color: 'from-sky-400 to-blue-600',
  },
]

export function GameSelector({ onSelectGame }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 px-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Game</h2>
      <p className="text-gray-500 text-sm mb-8">PEAK questions will interrupt gameplay to earn more game time</p>
      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className={`bg-gradient-to-br ${game.color} text-white rounded-2xl p-6 text-left shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-white`}
          >
            <div className="text-5xl mb-3">{game.emoji}</div>
            <h3 className="text-xl font-bold mb-1">{game.name}</h3>
            <p className="text-sm text-white/80">{game.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
