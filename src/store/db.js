import Dexie from 'dexie'

export const db = new Dexie('PEAKCurriculumApp')

db.version(1).stores({
  // Stimulus images per program target
  images: '++id, programId, targetName, imageUrl, imageData, source',
  // Learner profiles
  learners: '++id, name, createdAt',
  // Session records
  sessions: '++id, learnerId, programId, date, score, trials',
  // Active program selections per learner
  activeProgramTargets: '++id, learnerId, programId, targets, arraySize, messyArray',
})

// Helper: save an image (base64 or url) for a program target
export async function saveImage(programId, targetName, imageData, source = 'upload') {
  const existing = await db.images
    .where({ programId, targetName })
    .first()
  if (existing) {
    return db.images.update(existing.id, { imageData, source })
  }
  return db.images.add({ programId, targetName, imageData, source, imageUrl: null })
}

// Helper: get all images for a program
export async function getProgramImages(programId) {
  return db.images.where({ programId }).toArray()
}

// Helper: log a trial result
export async function logSession(learnerId, programId, trials) {
  const score = trials.filter(t => t.correct).length
  return db.sessions.add({
    learnerId,
    programId,
    date: new Date().toISOString(),
    score,
    trials,
  })
}
