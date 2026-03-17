import { create } from 'zustand'

export const useVideoStore = create((set) => ({
    currentVideo: null,
    isLoading: false,

    setCurrentVideo: (video) => set({ currentVideo: video, isLoading: false }),

    setLoading: (isLoading) => set({ isLoading }),

    toggleLike: (userId) => set((state) => {
        if (!state.currentVideo) return state

        const likes = state.currentVideo.likes || []
        const dislikes = state.currentVideo.dislikes || []
        const isLiked = likes.includes(userId)

        return {
            currentVideo: {
                ...state.currentVideo,
                likes: isLiked
                    ? likes.filter(id => id !== userId)
                    : [...likes.filter(id => id !== userId), userId],
                dislikes: dislikes.filter(id => id !== userId)
            }
        }
    }),

    toggleDislike: (userId) => set((state) => {
        if (!state.currentVideo) return state

        const likes = state.currentVideo.likes || []
        const dislikes = state.currentVideo.dislikes || []
        const isDisliked = dislikes.includes(userId)

        return {
            currentVideo: {
                ...state.currentVideo,
                dislikes: isDisliked
                    ? dislikes.filter(id => id !== userId)
                    : [...dislikes.filter(id => id !== userId), userId],
                likes: likes.filter(id => id !== userId)
            }
        }
    }),

    incrementViews: () => set((state) => ({
        currentVideo: state.currentVideo
            ? { ...state.currentVideo, views: (state.currentVideo.views || 0) + 1 }
            : null
    })),

    clearVideo: () => set({ currentVideo: null }),
}))