'use client'

import { useState, useRef, useEffect } from 'react'

export default function ClockIn() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [webcamError, setWebcamError] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize webcam when component mounts - FIXED: Remove stream from dependencies
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: "user",
          },
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setWebcamError("")
        setIsCapturing(true)
        setStatus('✅ Camera ready! Position your face in the frame and click "Clock In".')
      } catch (error) {
        setWebcamError("Unable to access camera. Please check permissions.")
        console.error("Webcam error:", error)
        setStatus('❌ Error accessing camera. Please ensure camera permissions are granted.')
      }
    }

    initWebcam()

    return () => {
      // Cleanup function will be called when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, []) // Empty dependency array - only run once on mount

  const capturePhoto = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")
    if (!context) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    return canvas.toDataURL("image/jpeg", 0.8)
  }

  // Function to stop the webcam stream and update state
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCapturing(false)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleClockIn = async () => {
    const imageBase64 = capturePhoto()
    if (!imageBase64 && !webcamError) {
      setStatus('❌ Failed to capture photo. Please ensure camera is working.')
      return
    }

    setLoading(true)
    setStatus('🔍 Processing clock-in... Please remain still while we verify your identity.')

    try {
      const response = await fetch('/api/clockin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64 ? imageBase64.split(',')[1] : null // Remove data:image/jpeg;base64, prefix
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setStatus(`✅ Clock-in successful! Welcome ${result.employee_name}. 
                   Recognition confidence: ${(result.recognition_confidence * 100).toFixed(1)}%`)
        
        // Stop camera after successful clock-in
        stopCamera()
      } else {
        setStatus(`❌ Clock-in failed: ${result.error}`)
      }
    } catch (error) {
      setStatus('❌ Clock-in failed: Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Employee Clock-In</h1>
        <p className="text-gray-600 mb-6">
          Position your face in the camera frame and click "Clock In" to record your attendance.
          The system will verify your identity and ensure you are physically present.
        </p>
        
        <div className="space-y-4">
          {/* Camera Preview - Using the same approach as your working code */}
          <div className="space-y-2">
            <div className="aspect-video w-full bg-black/5 rounded-lg overflow-hidden flex items-center justify-center">
              {webcamError ? (
                <div className="text-sm text-red-600 p-4 text-center">{webcamError}</div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-xs text-gray-500">A photo will be captured for identity verification when you clock in.</p>
          </div>
          
          <div className="text-center space-x-4">
            <button 
              onClick={handleClockIn} 
              className="btn-primary"
              disabled={loading || !isCapturing || !!webcamError}
            >
              {loading ? 'Processing...' : 'Clock In'}
            </button>
          </div>
          
          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('successful') 
                ? 'bg-green-100 text-green-700' 
                : status.includes('Processing')
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{status}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Security Features</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Passive liveness detection (no user interaction required)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Anti-spoofing protection against photos and videos
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Real-time face recognition with high accuracy
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Secure embedding-only storage (no raw images)
          </li>
        </ul>
      </div>
    </div>
  )
}
