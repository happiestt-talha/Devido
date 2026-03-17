import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
    Monitor,
    MonitorStop,
    Pause,
    Play,
    Download,
    Upload,
    Trash2,
    Mic,
    MicOff,
    Video as VideoIcon,
    X
} from 'lucide-react'
import Button from './Button'

export default function ScreenRecorder({ onRecordingComplete }) {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [includeAudio, setIncludeAudio] = useState(true)
    const [includeWebcam, setIncludeWebcam] = useState(false)

    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const streamRef = useRef(null)
    const webcamStreamRef = useRef(null)
    const timerRef = useRef(null)
    const previewRef = useRef(null)

    useEffect(() => {
        return () => {
            stopAllStreams()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    const stopAllStreams = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }
        if (webcamStreamRef.current) {
            webcamStreamRef.current.getTracks().forEach(track => track.stop())
        }
    }

    const startRecording = async () => {
        try {
            // Request screen capture
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: 1920,
                    height: 1080,
                },
                audio: includeAudio,
            })

            streamRef.current = displayStream

            // Add webcam if requested
            if (includeWebcam) {
                try {
                    const webcamStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: 320,
                            height: 240,
                        },
                    })
                    webcamStreamRef.current = webcamStream

                    // Show webcam preview
                    if (previewRef.current) {
                        previewRef.current.srcObject = webcamStream
                    }
                } catch (err) {
                    toast.error('Could not access webcam')
                }
            }

            // Create media recorder
            const options = { mimeType: 'video/webm;codecs=vp9' }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm'
            }

            mediaRecorderRef.current = new MediaRecorder(displayStream, options)

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' })
                setRecordedBlob(blob)
                chunksRef.current = []
                stopAllStreams()
            }

            // Handle user stopping share
            displayStream.getVideoTracks()[0].addEventListener('ended', () => {
                stopRecording()
            })

            mediaRecorderRef.current.start(1000) // Collect data every second
            setIsRecording(true)

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

            toast.success('Recording started')
        } catch (err) {
            console.error('Error starting recording:', err)
            toast.error('Failed to start recording. Please grant screen share permission.')
        }
    }

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume()
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1)
                }, 1000)
            } else {
                mediaRecorderRef.current.pause()
                if (timerRef.current) clearInterval(timerRef.current)
            }
            setIsPaused(!isPaused)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setIsPaused(false)
            if (timerRef.current) clearInterval(timerRef.current)
            toast.success('Recording stopped')
        }
    }

    const downloadRecording = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `screen-recording-${Date.now()}.webm`
            a.click()
            URL.revokeObjectURL(url)
            toast.success('Recording downloaded')
        }
    }

    const uploadRecording = () => {
        if (recordedBlob && onRecordingComplete) {
            onRecordingComplete(recordedBlob)
        }
    }

    const deleteRecording = () => {
        if (window.confirm('Delete this recording?')) {
            setRecordedBlob(null)
            setRecordingTime(0)
            toast.success('Recording deleted')
        }
    }

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return hrs > 0
            ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            : `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
                <Monitor className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Screen Recorder</h2>
            </div>

            {!isRecording && !recordedBlob && (
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Record your screen directly from your browser
                    </p>

                    {/* Options */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeAudio}
                                onChange={(e) => setIncludeAudio(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <Mic className="w-5 h-5" />
                            <span>Include system audio</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeWebcam}
                                onChange={(e) => setIncludeWebcam(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <VideoIcon className="w-5 h-5" />
                            <span>Include webcam</span>
                        </label>
                    </div>

                    <Button onClick={startRecording} variant="primary" className="w-full">
                        <Monitor className="w-5 h-5" />
                        Start Recording
                    </Button>
                </div>
            )}

            {isRecording && (
                <div className="space-y-4">
                    {/* Recording indicator */}
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-mono text-2xl font-bold">
                            {formatTime(recordingTime)}
                        </span>
                    </div>

                    {/* Webcam preview */}
                    {includeWebcam && (
                        <div className="relative">
                            <video
                                ref={previewRef}
                                autoPlay
                                muted
                                className="w-48 h-36 rounded-lg bg-black"
                            />
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                LIVE
                            </span>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex gap-3">
                        <Button onClick={pauseRecording} variant="secondary" className="flex-1">
                            {isPaused ? (
                                <>
                                    <Play className="w-5 h-5" />
                                    Resume
                                </>
                            ) : (
                                <>
                                    <Pause className="w-5 h-5" />
                                    Pause
                                </>
                            )}
                        </Button>
                        <Button onClick={stopRecording} variant="danger" className="flex-1">
                            <MonitorStop className="w-5 h-5" />
                            Stop
                        </Button>
                    </div>
                </div>
            )}

            {recordedBlob && !isRecording && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-400">
                                Recording Complete!
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-500">
                                Duration: {formatTime(recordingTime)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Size: {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                    </div>

                    {/* Preview */}
                    <video
                        src={URL.createObjectURL(recordedBlob)}
                        controls
                        className="w-full rounded-lg bg-black"
                    />

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        <Button onClick={downloadRecording} variant="outline">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                        <Button onClick={uploadRecording} variant="primary">
                            <Upload className="w-4 h-4" />
                            Upload
                        </Button>
                        <Button onClick={deleteRecording} variant="danger">
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}