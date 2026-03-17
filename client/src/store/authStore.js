import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isLoading: false,

            setUser: (user) => set({ user }),

            login: (user) => set({ user, isLoading: false }),

            logout: () => set({ user: null, isLoading: false }),

            setLoading: (isLoading) => set({ isLoading }),

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            })),

            toggleSubscribe: (channelId) => set((state) => {
                if (!state.user) return state

                const subscribedUsers = state.user.subscribedUsers || []
                const isSubscribed = subscribedUsers.includes(channelId)

                return {
                    user: {
                        ...state.user,
                        subscribedUsers: isSubscribed
                            ? subscribedUsers.filter(id => id !== channelId)
                            : [...subscribedUsers, channelId]
                    }
                }
            }),
        }),
        {
            name: 'devido-auth',
            partialize: (state) => ({ user: state.user }),
        }
    )
)