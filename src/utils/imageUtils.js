/**
 * Compress an image data URL before storing it.
 *
 * Strategy:
 *  - Resize so neither dimension exceeds MAX_DIM pixels (aspect ratio kept)
 *  - Re-encode as JPEG at QUALITY
 *
 * Cards are rendered at 112–144 px CSS (224–288 px on 2× retina), so
 * 400 px is ample. A typical phone photo (3–8 MB) becomes ≈ 20–60 KB.
 */

const MAX_DIM = 400   // px — maximum width or height after compression
const QUALITY = 0.82  // JPEG quality (0–1)

/**
 * @param {string} dataUrl   — any image data URL (JPEG, PNG, WEBP, …)
 * @returns {Promise<string>} — compressed JPEG data URL
 */
export function compressImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img

      // Scale so the largest dimension fits within MAX_DIM
      const scale = Math.min(1, MAX_DIM / Math.max(w, h, 1))
      const tw = Math.max(1, Math.round(w * scale))
      const th = Math.max(1, Math.round(h * scale))

      const canvas = document.createElement('canvas')
      canvas.width  = tw
      canvas.height = th

      const ctx = canvas.getContext('2d')
      // White background so PNGs with transparency look clean
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, tw, th)
      ctx.drawImage(img, 0, 0, tw, th)

      resolve(canvas.toDataURL('image/jpeg', QUALITY))
    }

    // If anything goes wrong, fall back to original so nothing breaks
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
