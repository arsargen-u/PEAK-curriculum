import { useState, useCallback, useMemo } from 'react'
import { ProgramList }    from './components/Programs/ProgramList'
import { ProgramEditor }  from './components/Programs/ProgramEditor'
import { QuestionInterrupt } from './components/Session/QuestionInterrupt'
import { GameSelector }   from './components/Games/GameSelector'
import { BubblePop }      from './components/Games/BubblePop'
import { FishCatch }      from './components/Games/FishCatch'
import { MemoryGame }     from './components/Games/MemoryGame'
import { CandyTrail }     from './components/Games/CandyTrail'
import { ColoringGame }   from './components/Games/ColoringGame'
import { DinoFeed }       from './components/Games/DinoFeed'
import { SettingsPanel }  from './components/Settings/SettingsPanel'
import { LibraryManager } from './components/Library/LibraryManager'
import { getProgramImages, getProgramVariants } from './store/db'

const SCREEN = {
  PROGRAMS:       'programs',
  PROGRAM_EDITOR: 'program_editor',
  GAME_SELECT:    'game_select',
  PLAYING:        'playing',
  IMAGE_LIBRARY:  'image_library',
}

export default function App() {
  const [screen,         setScreen]         = useState(SCREEN.PROGRAMS)
  const [editingProgram, setEditingProgram] = useState(null)   // null = new, object = edit
  const [sessionConfig,  setSessionConfig]  = useState(null)
  const [selectedGame,   setSelectedGame]   = useState(null)

  const [questionActive,  setQuestionActive]  = useState(false)
  const [resumeCallback,  setResumeCallback]  = useState(null)
  const [sessionResults,  setSessionResults]  = useState([])
  const [showSettings,    setShowSettings]    = useState(false)

  const consecutiveCorrects = useMemo(() => {
    let count = 0
    for (let i = sessionResults.length - 1; i >= 0; i--) {
      if (sessionResults[i].correct) count++
      else break
    }
    return count
  }, [sessionResults])

  // Select a saved program → load its images from DB then go to game select
  const handleSelectProgram = async (program) => {
    const [imgs, variants] = await Promise.all([
      getProgramImages(program.id),
      getProgramVariants(program.id),
    ])
    const images = {}
    for (const img of imgs) images[img.targetName] = img.imageData
    const imageVariants = {}
    for (const [t, items] of Object.entries(variants)) {
      imageVariants[t] = items.map(v => v.imageData)
    }
    setSessionConfig({
      program: {
        id: program.id,
        name: program.name,
        stimulusType: program.trialType === 'tact' ? 'tact' : 'receptive',
        sd: program.sd || (program.trialType === 'tact' ? 'What is this?' : 'Touch the ___.'),
      },
      selectedTargets: program.targets ?? [],
      arraySize: program.arraySize ?? 3,
      messyArray: program.messyArray ?? false,
      images,
      imageVariants,
      promptConfig: { type: program.promptType ?? 'none', fading: program.promptFading ?? 'none' },
      trialSets: null,
      errorCorrection: { enabled: program.errorCorrection ?? false },
    })
    setSessionResults([])
    setScreen(SCREEN.GAME_SELECT)
  }

  // ProgramEditor "Start →" → session config is already built by the editor
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
    if (resumeCallback) resumeCallback(result)
    setResumeCallback(null)
  }

  const handleEndSession = () => {
    setScreen(SCREEN.PROGRAMS)
    setEditingProgram(null)
    setSessionConfig(null)
    setSelectedGame(null)
    setSessionResults([])
  }

  const difficulty = selectedGame?.difficulty ?? 'medium'

  return (
    <div className="w-full h-full flex flex-col">

      {/* Nav (hidden while playing) */}
      {screen !== SCREEN.PLAYING && (
        <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center gap-4 shadow-lg flex-shrink-0">
          <span className="font-bold text-lg tracking-tight">Tact + Array</span>
          <div className="flex gap-1 ml-2">
            <NavTab
              active={screen === SCREEN.PROGRAMS || screen === SCREEN.PROGRAM_EDITOR}
              onClick={() => { setScreen(SCREEN.PROGRAMS); setEditingProgram(null) }}
            >
              📋 Programs
            </NavTab>
            <NavTab
              active={screen === SCREEN.IMAGE_LIBRARY}
              onClick={() => setScreen(SCREEN.IMAGE_LIBRARY)}
            >
              🖼 Images
            </NavTab>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {sessionConfig && screen !== SCREEN.GAME_SELECT && (
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
            >
              ⚙ Settings
            </button>
          </div>
        </nav>
      )}

      {/* Playing header */}
      {screen === SCREEN.PLAYING && (
        <div className="bg-gray-900 text-white px-6 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-bold text-sm flex-shrink-0">{selectedGame?.emoji} {selectedGame?.name}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-300 text-xs truncate">{sessionConfig?.program?.name}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-400 text-xs capitalize flex-shrink-0">{difficulty}</span>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-xs text-gray-400">
              {sessionResults.length} trial{sessionResults.length !== 1 ? 's' : ''} ·{' '}
              {sessionResults.filter(r => r.correct).length} correct
            </span>
            <button onClick={handleEndSession} className="text-xs text-gray-400 hover:text-white underline">
              End session
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {screen === SCREEN.PROGRAMS && (
          <div className="absolute inset-0">
            <ProgramList
              onSelectProgram={handleSelectProgram}
              onNewProgram={() => { setEditingProgram(null); setScreen(SCREEN.PROGRAM_EDITOR) }}
              onEditProgram={(p) => { setEditingProgram(p); setScreen(SCREEN.PROGRAM_EDITOR) }}
            />
          </div>
        )}

        {screen === SCREEN.PROGRAM_EDITOR && (
          <div className="absolute inset-0">
            <ProgramEditor
              program={editingProgram}
              onStartSession={handleStartSession}
              onBack={() => { setScreen(SCREEN.PROGRAMS); setEditingProgram(null) }}
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
            {selectedGame?.id === 'bubbles'   && <BubblePop   onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />}
            {selectedGame?.id === 'fish'      && <FishCatch   onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />}
            {selectedGame?.id === 'memory'    && <MemoryGame  onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />}
            {selectedGame?.id === 'candyland' && <CandyTrail  onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />}
            {selectedGame?.id === 'coloring'  && <ColoringGame onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />}
            {selectedGame?.id === 'dino'      && <DinoFeed    onNeedQuestion={handleNeedQuestion} difficulty={difficulty} />}
          </div>
        )}
      </main>

      {/* Question interrupt */}
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
