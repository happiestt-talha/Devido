import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function VideoChapters({ description, onSeek }) {
    const [chapters, setChapters] = useState([])
    const [activeChapter, setActiveChapter] = useState(0)

    useEffect(() => {
        // Parse timestamps from description
        // Format: "0:00 - Intro" or "2:30 - Chapter Name"
        const timestampRegex = /(\d+):(\d+)\s*-\s*(.+)/g
        const matches = [...(description || '').matchAll(timestampRegex)]

        const parsed = matches.map(match => ({
            time: parseInt(match[1]) * 60 + parseInt(match[2]),
            title: match[3].trim(),
            timestamp: `${match[1]}:${match[2]}`
        }))

        setChapters(parsed)
    }, [description])

    if (chapters.length === 0) return null

    const handleChapterClick = (time) => {
        onSeek?.(time)
    }

    return (
        <div className="card p-4 mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Chapters
            </h3>
            <div className="space-y-2">
                {chapters.map((chapter, index) => (
                    <button
                        key={index}
                        onClick={() => handleChapterClick(chapter.time)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${activeChapter === index
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-gray-100 dark:hover:bg-dark-700'
                            }`}
                    >
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {chapter.timestamp}
                        </span>
                        <span className="text-sm">{chapter.title}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}