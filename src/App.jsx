import { useState, useCallback } from 'react'
import { ProgramLibrary } from './components/Library/ProgramLibrary'
import { SessionBuilder } from './components/Session/SessionBuilder'
import { QuestionInterrupt } from './components/Session/QuestionInterrupt'
import { GameSelector } from './components/Games/GameSelector'
import { BubblePop } from './components/Games/BubblePop'
import { FishCatch } from './components/Games/FishCatch'

// App screens
const SCREEN = {
  LIBRARY: 'library',
  SESSION_BUILDER: 'session_builder',
  GAME_SELECT: 'game_select',
  PLAYING: 'playing',
}

export default function App() {
  const [screen, setScreen] = useState(SCREEN.LIBRARY)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [sessionConfig, setSessionConfig] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)

  // Question interrupt state
  const [questionActive, setQuestionActive] = useState(false)
  const [resumeCallback, setResumeCallback] = useState(null)
  const [sessionResults, setSessionResults] = useState([])

  const handleSelectProgram = (program) => {
    setSelectedProgram(program)
    setScreen(SCREEN.SESSION_BUILDER)
  }

  const handleStartSession = (config) => {
    setSessionConfig(config)
    setSessionResults([])
    setScreen(SCREEN.GAME_SELECT)
  }

  const handleSelectGame = (game) => {
    setSelectedGame(game)
    setScreen(SCREEN.PLAYING)
  }

  // Called by game when it's time for a question
  const handleNeedQuestion = useCallback((resumeFn) => {
    setResumeCallback(() => resumeFn)
    setQuestionActive(true)
  }, [])

  // Called when therapist scores the question
  const handleQuestionComplete = (result) => {
    setSessionResults(prev => [...prev, result])
    setQuestionActive(false)
    if (resumeCallback) resumeCallback()
    setResumeCallback(null)
  }

  const handleEndSession = () => {
    setScreen(SCREEN.LIBRARY)
    setSelectedProgram(null)
    setSessionConfig(null)
    setSelectedGame(null)
    setSessionResults([])
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Nav bar (hidden while playing) */}
      {screen !== SCREEN.PLAYING && (
        <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center gap-6 shadow-lg flex-shrink-0">
          <span className="font-bold text-lg tracking-tight">PEAK Curriculum</span>
          <div className="flex gap-1 ml-4">
            <NavTab
              active={screen === SCREEN.LIBRARY || screen === SCREEN.SESSION_BUILDER}
              onClick={() => setScreen(SCREEN.LIBRARY)}
            >
              📚 Library
            </NavTab>
          </div>
          {sessionConfig && (
            <button
              onClick={() => setScreen(SCREEN.GAME_SELECT)}
              className="ml-auto text-sm text-indigo-200 hover:text-white underline"
            >
              Continue to game →
            </button>
          )}
        </nav>
      )}

      {/* Playing header */}
      {screen === SCREEN.PLAYING && (
        <div className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">{selectedGame?.emoji} {selectedGame?.name}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-300 text-xs">{sessionConfig?.program?.code} {sessionConfig?.program?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              {sessionResults.length} trial{sessionResults.length !== 1 ? 's' : ''} ·{' '}
              {sessionResults.filter(r => r.correct).length} correct
            </span>
            <button
              onClick={handleEndSession}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              End session
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {screen === SCREEN.LIBRARY && (
          <div className="absolute inset-0">
            <ProgramLibrary onSelectProgram={handleSelectProgram} />
          </div>
        )}

        {screen === SCREEN.SESSION_BUILDER && selectedProgram && (
          <div className="absolute inset-0">
            <SessionBuilder
              program={selectedProgram}
              onStartSession={handleStartSession}
              onBack={() => setScreen(SCREEN.LIBRARY)}
            />
          </div>
        )}

        {screen === SCREEN.GAME_SELECT && (
          <div className="absolute inset-0">
            <GameSelector onSelectGame={handleSelectGame} />
          </div>
        )}

        {screen === SCREEN.PLAYING && sessionConfig && (
          <div className="absolute inset-0">
            {selectedGame?.id === 'bubbles' && (
              <BubblePop
                onNeedQuestion={handleNeedQuestion}
                questionInterval={5}
              />
            )}
            {selectedGame?.id === 'fish' && (
              <FishCatch
                onNeedQuestion={handleNeedQuestion}
                questionInterval={5}
              />
            )}
          </div>
        )}
      </main>

      {/* Question interrupt overlay */}
      {questionActive && sessionConfig && (
        <QuestionInterrupt
          program={sessionConfig.program}
          selectedTargets={sessionConfig.selectedTargets}
          arraySize={sessionConfig.arraySize}
          messyArray={sessionConfig.messyArray}
          images={sessionConfig.images}
          onComplete={handleQuestionComplete}
        />
      )}
    </div>
  )
}

function NavTab({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-white/20 text-white' : 'text-indigo-200 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}
