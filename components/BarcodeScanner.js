'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FiX, FiEdit2, FiCheck } from 'react-icons/fi'

/**
 * Shared barcode scanner component.
 * Uses native BarcodeDetector API when available (Chrome/Android — highest accuracy),
 * falls back to @zxing/browser with properly-configured hints.
 *
 * Props:
 *   onDetect(code: string) — called on every unique scan (debounced 2 s)
 *   onClose()              — called when user taps ✕
 *   title                  — optional header text
 */
export default function BarcodeScanner({ onDetect, onClose, title = 'اسکن بارکد' }) {
  const videoRef      = useRef(null)
  const streamRef     = useRef(null)
  const animFrameRef  = useRef(null)
  const zxingCtrlRef  = useRef(null)
  const stoppedRef    = useRef(false)
  const lastCodeRef   = useRef('')
  const lastTimeRef   = useRef(0)
  // Canvas for native BarcodeDetector — capturing a frame is more reliable than
  // passing the <video> element directly on mobile browsers.
  const canvasRef     = useRef(null)

  const [status, setStatus]         = useState('در حال راه‌اندازی دوربین...')
  const [hasError, setHasError]     = useState(false)
  const [flash, setFlash]           = useState(false)
  const [manualInput, setManual]    = useState('')
  const [showManual, setShowManual] = useState(false)
  const [detected, setDetected]     = useState('')

  // ── Debounced detection handler ───────────────────────────────────────────
  const handleCode = useCallback((code) => {
    if (!code || stoppedRef.current) return
    const now = Date.now()
    if (code === lastCodeRef.current && now - lastTimeRef.current < 2000) return
    lastCodeRef.current = code
    lastTimeRef.current = now
    navigator.vibrate?.(150)
    setFlash(true)
    setDetected(code)
    setTimeout(() => { setFlash(false); setDetected('') }, 800)
    onDetect(code)
  }, [onDetect])

  // ── Camera + scanner bootstrap ────────────────────────────────────────────
  useEffect(() => {
    stoppedRef.current = false

    // ── Native BarcodeDetector path ──────────────────────────────────────
    const startNative = async (stream) => {
      const formats = [
        'ean_13', 'ean_8', 'code_128', 'code_39',
        'upc_a', 'upc_e', 'qr_code', 'itf', 'codabar',
      ]
      let supported = formats
      try {
        const all = await window.BarcodeDetector.getSupportedFormats()
        const filtered = formats.filter(f => all.includes(f))
        if (filtered.length > 0) supported = filtered
      } catch { /* ignore — use all formats */ }

      const detector = new window.BarcodeDetector({ formats: supported })

      // Use an offscreen canvas to grab a frame — more reliable on Android
      // than feeding the <video> element directly.
      const canvas = canvasRef.current || document.createElement('canvas')
      canvasRef.current = canvas
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      const scan = async () => {
        if (stoppedRef.current) return
        const video = videoRef.current
        if (video && video.readyState >= 2 && video.videoWidth > 0) {
          // Match canvas size to actual video frame dimensions
          if (canvas.width !== video.videoWidth) {
            canvas.width  = video.videoWidth
            canvas.height = video.videoHeight
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          try {
            const barcodes = await detector.detect(canvas)
            if (barcodes.length > 0) handleCode(barcodes[0].rawValue)
          } catch { /* detection error — skip frame */ }
        }
        animFrameRef.current = requestAnimationFrame(scan)
      }
      animFrameRef.current = requestAnimationFrame(scan)
      setStatus('دوربین آماده است — بارکد را جلوی دوربین نگه دارید')
    }

    // ── ZXing fallback path ───────────────────────────────────────────────
    const startZxing = async () => {
      try {
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')
        const hints = new Map([
          [DecodeHintType.TRY_HARDER, true],
          [DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
            BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
            BarcodeFormat.UPC_A,   BarcodeFormat.UPC_E,
            BarcodeFormat.QR_CODE, BarcodeFormat.ITF,
            BarcodeFormat.CODABAR,
          ]],
          // Improve read rate on blurry / low-contrast frames
          [DecodeHintType.ASSUME_GS1, false],
        ])
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: 150,   // scan every 150 ms instead of the 500 ms default
          delayBetweenScanSuccess:  500,
        })

        // decodeFromConstraints both starts the camera AND sets srcObject on the
        // video element, so we must NOT open the stream beforehand on the ZXing path.
        zxingCtrlRef.current = await reader.decodeFromConstraints(
          {
            video: {
              facingMode:  { exact: 'environment' },   // rear camera — REQUIRED on mobile
              width:       { ideal: 1280 },
              height:      { ideal: 720 },
              focusMode:   { ideal: 'continuous' },     // continuous autofocus
              exposureMode:{ ideal: 'continuous' },
            },
          },
          videoRef.current,
          (result, err) => {
            if (result) handleCode(result.getText())
            // err is a NotFoundException when no barcode found — safe to ignore
          },
        )
        setStatus('دوربین آماده است — بارکد را نگه دارید')
      } catch (err) {
        if (!stoppedRef.current) {
          // If `exact: 'environment'` fails (e.g. desktop webcam), retry without it
          if (err?.name === 'OverconstrainedError' || err?.name === 'NotFoundError') {
            await startZxingFallbackCamera()
          } else {
            setStatus('خطا در اسکنر: ' + (err?.message || 'نامشخص'))
            setHasError(true)
          }
        }
      }
    }

    // Retry ZXing without `exact` facing-mode constraint (desktop / front-only cameras)
    const startZxingFallbackCamera = async () => {
      try {
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')
        const hints = new Map([
          [DecodeHintType.TRY_HARDER, true],
          [DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
            BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
            BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
            BarcodeFormat.QR_CODE,
          ]],
        ])
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: 150,
          delayBetweenScanSuccess:  500,
        })
        zxingCtrlRef.current = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } },
          videoRef.current,
          (result) => { if (result) handleCode(result.getText()) },
        )
        setStatus('دوربین آماده است — بارکد را نگه دارید')
      } catch (err) {
        if (!stoppedRef.current) {
          setStatus('خطا در دسترسی به دوربین: ' + (err?.message || 'نامشخص'))
          setHasError(true)
        }
      }
    }

    // ── Main init ─────────────────────────────────────────────────────────
    const init = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('مرورگر شما از دسترسی به دوربین پشتیبانی نمی‌کند (HTTPS لازم است)')
        setHasError(true)
        return
      }

      if ('BarcodeDetector' in window) {
        // Native path: open the stream ourselves so we can read frames into a canvas
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode:  { ideal: 'environment' },
              width:       { ideal: 1920 },
              height:      { ideal: 1080 },
              focusMode:   { ideal: 'continuous' },
              exposureMode:{ ideal: 'continuous' },
            },
          })
          if (stoppedRef.current) { stream.getTracks().forEach(t => t.stop()); return }
          streamRef.current = stream
          const video = videoRef.current
          if (video) {
            video.srcObject = stream
            // Wait for video metadata so videoWidth/Height are known before scanning
            await new Promise(resolve => {
              if (video.readyState >= 1) { resolve(); return }
              video.onloadedmetadata = resolve
            })
            await video.play()
          }
          await startNative(stream)
        } catch (err) {
          if (!stoppedRef.current) {
            setStatus('خطا در دسترسی به دوربین: ' + (err?.message || ''))
            setHasError(true)
          }
        }
      } else {
        // ZXing path manages the stream internally
        await startZxing()
      }
    }

    init()

    return () => {
      stoppedRef.current = true
      cancelAnimationFrame(animFrameRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      try { zxingCtrlRef.current?.stop() } catch { /* ignore */ }
    }
  }, [handleCode])

  // ── Manual entry ──────────────────────────────────────────────────────────
  const submitManual = () => {
    const code = manualInput.trim()
    if (!code) return
    handleCode(code)
    setManual('')
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <span className="text-white font-semibold text-sm">{title}</span>
        <button onClick={onClose} aria-label="بستن"
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />

        {/* Green flash on detection */}
        {flash && (
          <div className="absolute inset-0 bg-acid-400/25 pointer-events-none transition-opacity" />
        )}

        {/* Scan frame overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Semi-dark surround */}
          <div className="absolute inset-0 bg-black/55" style={{
            maskImage: 'radial-gradient(ellipse 300px 180px at center, transparent 0%, black 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 300px 180px at center, transparent 0%, black 100%)',
          }} />

          {/* Scan window */}
          <div className="relative w-72 h-44 z-10">
            {/* Corner brackets */}
            {[['top-0 right-0', 'border-t-2 border-r-2 rounded-tr-lg'],
              ['top-0 left-0',  'border-t-2 border-l-2 rounded-tl-lg'],
              ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-lg'],
              ['bottom-0 left-0', 'border-b-2 border-l-2 rounded-bl-lg'],
            ].map(([pos, cls]) => (
              <div key={pos} className={`absolute ${pos} w-7 h-7 border-brand-400 ${cls}`} />
            ))}

            {/* Animated scan line */}
            <div className="animate-scan absolute right-3 left-3 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-90" />

            {/* Detected code flash */}
            {detected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-acid-400/90 text-black text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <FiCheck className="w-3 h-3" />
                  {detected}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-black/90 backdrop-blur-sm border-t border-white/10 px-4 py-4 space-y-3">
        <p className={`text-center text-xs ${hasError ? 'text-red-400' : 'text-zinc-400'}`}>
          {status}
        </p>

        {showManual ? (
          <div className="flex gap-2">
            <input
              value={manualInput}
              onChange={e => setManual(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitManual()}
              placeholder="بارکد را تایپ کنید..."
              dir="ltr"
              autoFocus
              className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/30 text-sm font-mono placeholder:text-zinc-600"
            />
            <button onClick={submitManual}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-sm font-semibold transition-colors">
              تأیید
            </button>
            <button onClick={() => setShowManual(false)}
              className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowManual(true)}
            className="w-full py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 text-sm flex items-center justify-center gap-2 transition-all duration-200">
            <FiEdit2 className="w-4 h-4" />
            ورود دستی بارکد
          </button>
        )}
      </div>
    </div>
  )
}