/**
 * Screenshot helpers for the feedback dialog: grabbing a frame of the current
 * tab, reading an attached image, and flattening highlight boxes onto it.
 */

export interface HighlightRect {
  x: number
  y: number
  w: number
  h: number
}

export const HIGHLIGHT_FILL = "rgba(239, 68, 68, 0.25)" // semi-transparent red fill
export const HIGHLIGHT_STROKE = "rgba(239, 68, 68, 0.9)" // solid red border

/** Matches the upload route's limit. */
export const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024
/** Longest edge of the uploaded image; full-resolution captures rarely fit in 2 MB. */
const MAX_SCREENSHOT_EDGE = 1920
const JPEG_QUALITIES = [0.9, 0.8, 0.7, 0.6]
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"])

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** Screen capture is missing on most mobile browsers; those get "Attach image" only. */
export const isScreenCaptureSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function"

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Could not load the image"))
    img.src = src
  })

/**
 * Asks the browser to share the current tab and returns one frame of it as a
 * data URL. Rejects with a NotAllowedError when the person cancels the picker.
 */
export const captureTabFrame = async (): Promise<string> => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: "browser" },
    audio: false,
    // Chrome: offer the current tab first.
    preferCurrentTab: true,
  } as DisplayMediaStreamOptions)

  try {
    const track = stream.getVideoTracks()[0]

    // Wait for the track to go live — the picker has resolved and frames are flowing.
    await new Promise<void>((resolve) => {
      if (track.readyState === "live" && !track.muted) {
        resolve()
        return
      }
      const timeout = setTimeout(resolve, 3000)
      track.addEventListener(
        "unmute",
        () => {
          clearTimeout(timeout)
          resolve()
        },
        { once: true }
      )
    })

    // Let the picker overlay finish animating out of the frame before grabbing.
    await wait(500)

    if ("ImageCapture" in window) {
      try {
        const { ImageCapture } = window as unknown as {
          ImageCapture: new (track: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> }
        }
        const bitmap = await new ImageCapture(track).grabFrame()
        const canvas = document.createElement("canvas")
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0)
        return canvas.toDataURL("image/png")
      } catch (error) {
        console.warn("ImageCapture failed, falling back to a video element:", error)
      }
    }

    // Firefox and Safari have no ImageCapture: draw a frame from a <video> instead.
    const video = document.createElement("video")
    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 1500)
      video.onloadedmetadata = () => {
        video
          .play()
          .catch(() => undefined)
          .finally(() => {
            clearTimeout(timeout)
            resolve()
          })
      }
    })

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || window.innerWidth
    canvas.height = video.videoHeight || window.innerHeight
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height)
    video.srcObject = null
    return canvas.toDataURL("image/png")
  } finally {
    stream.getTracks().forEach((t) => t.stop())
  }
}

/** Reads an image the person picked from their device. */
export const readImageFile = (file: File): Promise<string> => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return Promise.reject(new Error("Please choose a JPEG, PNG, GIF or WEBP image."))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read the image"))
    reader.readAsDataURL(file)
  })
}

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the screenshot"))),
      "image/jpeg",
      quality
    )
  })

/**
 * Draws the highlight boxes (given in the image's natural pixels) onto the
 * screenshot and encodes it as a JPEG small enough to upload.
 */
export const renderAnnotatedScreenshot = async (
  baseDataUrl: string,
  rects: HighlightRect[]
): Promise<{ dataUrl: string; file: File }> => {
  const img = await loadImage(baseDataUrl)
  let edge = Math.min(MAX_SCREENSHOT_EDGE, Math.max(img.naturalWidth, img.naturalHeight))

  // Try lower quality first, then a smaller image, until it fits.
  for (let attempt = 0; attempt < 3; attempt++) {
    const scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    ctx.lineWidth = Math.max(2, canvas.width / 500)
    for (const r of rects) {
      ctx.fillStyle = HIGHLIGHT_FILL
      ctx.fillRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale)
      ctx.strokeStyle = HIGHLIGHT_STROKE
      ctx.strokeRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale)
    }

    for (const quality of JPEG_QUALITIES) {
      const blob = await canvasToBlob(canvas, quality)
      if (blob.size <= MAX_SCREENSHOT_BYTES) {
        return {
          dataUrl: canvas.toDataURL("image/jpeg", quality),
          file: new File([blob], "screenshot.jpg", { type: "image/jpeg" }),
        }
      }
    }
    edge = Math.round(edge * 0.7)
  }

  throw new Error("The screenshot is too large to attach")
}
