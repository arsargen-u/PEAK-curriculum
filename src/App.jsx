import { useState, useCallback, useMemo, useEffect } from 'react'
import { initAppDefaults } from './utils/defaults'
import { ProgramLibrary } from './components/Library/ProgramLibrary'
import { SessionBuilder } from './components/Session/SessionBuilder'
import { QuestionInterrupt } from './components/Session/QuestionInterrupt'
import { GameSelector } from './components/Games/GameSelector'
import { BubblePop } from './components/Games/BubblePop'
import { FishCatch } from './components/Games/FishCatch'
import { MemoryGame } from './components/Games/MemoryGame'
import { CandyTrail } from './components/Games/CandyTrail'
import { ColoringGame } from './components/Games/ColoringGame'
import { DinoFeed } from './components/Games/DinoFeed'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { LibraryManager } from './components/Library/LibraryManager'

const SCREEN = {
  LIBRARY: 'library',
  SESSION_BUILDER: 'session_builder',
  GAME_SELECT: 'game_select',
  PLAYING: 'playing',
  IMAGE_LIBRARY: 'image_library',
}

export default function App() {
  // Seed API keys and other defaults on first launch
  useEffect(() => { initAppDefaults() }, [])

  const [screen, setScreen] = useState(SCREEN.LIBRARY)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [sessionConfig, setSessionConfig] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)

  const [questionActive, setQuestionActive] = useState(false)
  const [resumeCallback, setResumeCallback] = useState(null)
  const [sessionResults, setSessionResults] = useState([])
  const [showSettings, setShowSettings] = useState(false)

  // Consecutive correct answers (for prompt fading)
  const consecutiveCorrects = useMemo(() => {
    let count = 0
    for (let i = sessionResults.length - 1; i >= 0; i--) {
      if (sessionResults[i].correct) count++
      else break
    }
    return count
  }, [sessionResults])

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

  const handleNeedQuestion = useCallback((resumeFn) => {
    setResumeCallback(() => resumeFn)
    setQuestionActive(true)
  }, [])

  const handleQuestionComplete = (result) => {
    setSessionResults(prev => [...prev, result])
    setQuestionActive(false)
    if (resumeCallback) resumeCallback(result)   // pass result so games can react (e.g. Memory, Candy)
    setResumeCallback(null)
  }

  const handleEndSession = () => {
    setScreen(SCREEN.LIBRARY)
    setSelectedProgram(null)
    setSessionConfig(null)
    setSelectedGame(null)
    setSessionResults([])
  }

  const difficulty = selectedGame?.difficulty ?? 'medium'

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
              📚 Programs
            </NavTab>
            <NavTab
              active={screen === SCREEN.IMAGE_LIBRARY}
              onClick={() => setScreen(SCREEN.IMAGE_LIBRARY)}
            >
              🖼 Images
            </NavTab>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {sessionConfig && (
              <button
                onClick={() => setScreen(SCREEN.GAME_SELECT)}
                className="text-sm text-indigo-200 hover:text-white underline"
              >
                Continue to game →
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="text-sm text-indigo-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Settings"
            >
              ⚙ Settings
            </button>
          </div>
        </nav>
      )}

      {/* Playing header */}
      {screen === SCREEN.PLAYING && (
        <div className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">{selectedGame?.emoji} {selectedGame?.name}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-300 text-xs">{sessionConfig?.program?.code} {sessionConfig?.program?.name}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-400 text-xs capitalize">{difficulty}</span>
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

        {screen === SCREEN.IMAGE_LIBRARY && (
          <div className="absolute inset-0">
            <LibraryManager />
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
              <BubblePop onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />
            )}
            {selectedGame?.id === 'fish' && (
              <FishCatch onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />
            )}
            {selectedGame?.id === 'memory' && (
              <MemoryGame onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />
            )}
            {selectedGame?.id === 'candyland' && (
              <CandyTrail onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />
            )}
            {selectedGame?.id === 'coloring' && (
              <ColoringGame onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />
            )}
            {selectedGame?.id === 'dino' && (
              <DinoFeed onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />
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
          imageVariants={sessionConfig.imageVariants}
          promptConfig={sessionConfig.promptConfig}
          consecutiveCorrects={consecutiveCorrects}
          trialSets={sessionConfig.trialSets}
          errorCorrectionEnabled={sessionConfig.errorCorrection?.enabled ?? false}
          onComplete={handleQuestionComplete}
          onSkip={() => {
            setQuestionActive(false)
            if (resumeCallback) resumeCallback({ skipped: true })
            setResumeCallback(null)
          }}
        />
      )}

      {/* Settings panel */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
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
