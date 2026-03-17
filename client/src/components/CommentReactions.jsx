import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/services/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

const REACTIONS = ['👍', '👎', '❤️', '😂', '🔥', '🎉']

export default function CommentReactions({ commentId, reactions = {}, videoId }) {
    const [showPicker, setShowPicker] = useState(false)
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    const reactMutation = useMutation({
        mutationFn: (emoji) =>
            api.post(`/comments/${commentId}/react`, { emoji }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', videoId])
        },
        onError: () => {
            toast.error('Failed to add reaction')
        }
    })

    const handleReact = (emoji) => {
        if (!user) {
            toast.error('Please sign in to react')
            return
        }
        reactMutation.mutate(emoji)
        setShowPicker(false)
    }

    return (
        <div className="relative inline-block mt-2">
            {/* Show existing reactions */}
            <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(reactions).map(([emoji, count]) => (
                    count > 0 && (
                        <button
                            key={emoji}
                            onClick={() => handleReact(emoji)}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors text-sm"
                        >
                            <span>{emoji}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{count}</span>
                        </button>
                    )
                ))}

                {/* Add reaction button */}
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors text-sm text-gray-500"
                >
                    😊 +
                </button>
            </div>

            {/* Reaction picker */}
            <AnimatePresence>
                {showPicker && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowPicker(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            className="absolute bottom-full mb-2 left-0 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg shadow-lg p-2 flex gap-1 z-20"
                        >
                            {REACTIONS.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleReact(emoji)}
                                    className="text-2xl hover:bg-gray-100 dark:hover:bg-dark-700 rounded p-2 transition-colors"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}