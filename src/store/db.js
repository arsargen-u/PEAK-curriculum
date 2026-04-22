import Dexie from 'dexie'

export const db = new Dexie('PEAKCurriculumApp')

db.version(1).stores({
  images: '++id, programId, targetName, imageUrl, imageData, source',
  learners: '++id, name, createdAt',
  sessions: '++id, learnerId, programId, date, score, trials',
  activeProgramTargets: '++id, learnerId, programId, targets, arraySize, messyArray',
})

// v2: add internal image library
db.version(2).stores({
  images: '++id, programId, targetName, imageUrl, imageData, source',
  learners: '++id, name, createdAt',
  sessions: '++id, learnerId, programId, date, score, trials',
  activeProgramTargets: '++id, learnerId, programId, targets, arraySize, messyArray',
  libraryImages: '++id, label, category, createdAt',
})

// v3: variant exemplar images per program+target
db.version(3).stores({
  images: '++id, programId, targetName, imageUrl, imageData, source',
  learners: '++id, name, createdAt',
  sessions: '++id, learnerId, programId, date, score, trials',
  activeProgramTargets: '++id, learnerId, programId, targets, arraySize, messyArray',
  libraryImages: '++id, label, category, createdAt',
  programVariants: '++id, programId, targetName',
})

// --- Program stimulus images ---

export async function saveImage(programId, targetName, imageData, source = 'upload') {
  const existing = await db.images.where({ programId, targetName }).first()
  if (existing) {
    return db.images.update(existing.id, { imageData, source })
  }
  return db.images.add({ programId, targetName, imageData, source, imageUrl: null })
}

export async function getProgramImages(programId) {
  return db.images.where({ programId }).toArray()
}

// --- Variant exemplar images ---

export async function saveVariant(programId, targetName, imageData) {
  return db.programVariants.add({ programId, targetName, imageData, createdAt: Date.now() })
}

/** Returns { [targetName]: [{ id, imageData }, …] } for a program */
export async function getProgramVariants(programId) {
  const rows = await db.programVariants.where({ programId }).toArray()
  const map = {}
  for (const row of rows) {
    if (!map[row.targetName]) map[row.targetName] = []
    map[row.targetName].push({ id: row.id, imageData: row.imageData })
  }
  return map
}

export async function deleteVariant(id) {
  return db.programVariants.delete(id)
}

export async function clearTargetVariants(programId, targetName) {
  return db.programVariants.where({ programId, targetName }).delete()
}

// --- Program config (non-image settings) saved in localStorage ---

const configKey = (programId) => `peak_config_${programId}`

export function saveProgramConfig(programId, config) {
  try { localStorage.setItem(configKey(programId), JSON.stringify(config)) } catch (_) {}
}

export function loadProgramConfig(programId) {
  try {
    const raw = localStorage.getItem(configKey(programId))
    return raw ? JSON.parse(raw) : null
  } catch (_) { return null }
}

// --- Session logging ---

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

// --- Internal image library ---

export async function addLibraryImage({ label, category = '', imageData, source = 'upload' }) {
  return db.libraryImages.add({
    label: label.trim(),
    category: category.trim(),
    imageData,
    source,
    createdAt: Date.now(),
  })
}

export async function getAllLibraryImages() {
  return db.libraryImages.orderBy('createdAt').reverse().toArray()
}

export async function searchLibraryImages(query) {
  if (!query.trim()) return getAllLibraryImages()
  const q = query.toLowerCase()
  return db.libraryImages
    .filter(img => img.label.toLowerCase().includes(q) || img.category.toLowerCase().includes(q))
    .toArray()
}

export async function updateLibraryImage(id, updates) {
  return db.libraryImages.update(id, updates)
}

export async function deleteLibraryImage(id) {
  return db.libraryImages.delete(id)
}

export async function clearLibrary() {
  return db.libraryImages.clear()
}
