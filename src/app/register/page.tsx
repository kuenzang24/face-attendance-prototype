'use client'

import { useState, useRef, useEffect } from 'react'

export default function Register() {
  const [employeeId, setEmployeeId] = useState('')
  const [name, setName] = useState('')
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
        setStatus('✅ Camera ready! Position your face in the frame.')
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

  const handleRegister = async () => {
    if (!employeeId.trim() || !name.trim()) {
      setStatus('❌ Please fill in both Employee ID and Name')
      return
    }

    const imageBase64 = capturePhoto()
    if (!imageBase64 && !webcamError) {
      setStatus('❌ Failed to capture photo. Please ensure camera is working.')
      return
    }

    setLoading(true)
    setStatus('🔍 Processing registration... Please remain still while we capture your face.')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          name: name,
          image: imageBase64 ? imageBase64.split(',')[1] : null
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setStatus(`✅ Registration successful! Employee ${name} registered with recognition confidence: ${(result.recognition_confidence * 100).toFixed(1)}%`)
        setEmployeeId('')
        setName('')
      } else {
        setStatus(`❌ Registration failed: ${result.error}`)
      }
    } catch (error) {
      setStatus('❌ Registration failed: Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Employee Registration</h1>
        <p className="text-gray-600 mb-6">
          Register a new employee by capturing their face for recognition. The system will
          perform liveness detection to ensure security and prevent spoofing attacks.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="input-field"
              placeholder="Enter employee ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter full name"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Face Capture</h2>
        
        <div className="space-y-4">
          {/* Camera Preview - Fixed flickering issue */}
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
            <p className="text-xs text-gray-500">
              Position your face in the center of the frame. The system will automatically detect and analyze your face.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleRegister} 
              className="btn-primary px-8 py-3"
              disabled={loading || !isCapturing || !!webcamError}
            >
              {loading ? 'Processing...' : 'Register Employee'}
            </button>
          </div>
          
          {status && (
            <div className={`p-4 rounded-lg ${
              status.includes('successful') 
                ? 'bg-green-100 text-green-700' 
                : status.includes('Processing') || status.includes('ready')
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
            High-quality face embedding generation for recognition
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            Secure storage (no raw images saved, only face embeddings)
          </li>
        </ul>
      </div>
    </div>
  )
}
