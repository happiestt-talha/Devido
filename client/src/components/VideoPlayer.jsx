import { useEffect, useRef } from 'react'

export default function VideoPlayer({ url, title, onEnded, onVideoReady }) {
    const iframeRef = useRef(null)
    const videoRef = useRef(null)

    useEffect(() => {
        // Notify parent when video element is ready
        if (videoRef.current && onVideoReady) {
            onVideoReady(videoRef.current)
        }
    }, [onVideoReady])

    // Check if it's a YouTube video
    const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be')

    // Convert to embed URL if needed
    let embedUrl = url
    if (isYouTube) {
        const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
        embedUrl = `https://www.youtube.com/embed/${videoId}`
    }

    // Check if it's a direct video file
    const isDirectVideo = url?.match(/\.(mp4|webm|ogg|mov)$/i) || url?.includes('cloudinary.com')

    if (isDirectVideo) {
        return (
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                    ref={videoRef}
                    src={url}
                    title={title}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    onEnded={onEnded}
                >
                    <source src={url} type="video/webm" />
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        )
    }

    return (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
                ref={iframeRef}
                src={embedUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    )
}