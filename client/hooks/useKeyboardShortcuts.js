import { useEffect } from 'react'

export function useKeyboardShortcuts(videoRef, onTogglePlay, onSeek, onVolumeChange, onToggleMute, onToggleFullscreen) {
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return
            }

            const video = videoRef.current

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    onTogglePlay?.()
                    break

                case 'j':
                    e.preventDefault()
                    onSeek?.(-10)
                    break

                case 'l':
                    e.preventDefault()
                    onSeek?.(10)
                    break

                case 'arrowleft':
                    e.preventDefault()
                    onSeek?.(-5)
                    break

                case 'arrowright':
                    e.preventDefault()
                    onSeek?.(5)
                    break

                case 'arrowup':
                    e.preventDefault()
                    onVolumeChange?.(0.1)
                    break

                case 'arrowdown':
                    e.preventDefault()
                    onVolumeChange?.(-0.1)
                    break

                case 'm':
                    e.preventDefault()
                    onToggleMute?.()
                    break

                case 'f':
                    e.preventDefault()
                    onToggleFullscreen?.()
                    break

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault()
                    const percent = parseInt(e.key) / 10
                    if (video) {
                        video.currentTime = video.duration * percent
                    }
                    break

                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [videoRef, onTogglePlay, onSeek, onVolumeChange, onToggleMute, onToggleFullscreen])
}