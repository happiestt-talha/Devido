import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { achievementAPI } from '@/services/api'
import { Trophy, Award, Star, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

export default function Leaderboard() {
    const [type, setType] = useState('points')
    const { user } = useAuthStore()

    const { data: leaderboard, isLoading } = useQuery({
        queryKey: ['leaderboard', type],
        queryFn: () => achievementAPI.getLeaderboard(type, 100).then(res => res.data.data),
    })

    return (
        <div className="space-y-6 text-black dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Leaderboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        See how you rank against other creators
                    </p>
                </div>

                {/* Type selector */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setType('points')}
                        className={`px-4 py-2 rounded-lg transition-colors ${type === 'points'
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 dark:bg-dark-700'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Points
                    </button>
                    <button
                        onClick={() => setType('level')}
                        className={`px-4 py-2 rounded-lg transition-colors ${type === 'level'
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 dark:bg-dark-700'
                            }`}
                    >
                        <Star className="w-4 h-4 inline mr-2" />
                        Level
                    </button>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="card overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-dark-700">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="skeleton h-20" />
                        ))
                    ) : leaderboard && leaderboard.length > 0 ? (
                        leaderboard.map((entry, index) => (
                            <LeaderboardRow
                                key={entry._id}
                                rank={index + 1}
                                user={entry.user}
                                points={entry.points}
                                level={entry.level}
                                badges={entry.badges.length}
                                isCurrentUser={entry.userId === user?._id}
                            />
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            No data yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function LeaderboardRow({ rank, user, points, level, badges, isCurrentUser }) {
    const getMedalColor = () => {
        if (rank === 1) return 'text-yellow-500'
        if (rank === 2) return 'text-gray-400'
        if (rank === 3) return 'text-orange-600'
        return 'text-gray-500'
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.05 }}
            className={`flex items-center gap-4 p-4 ${isCurrentUser ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
        >
            {/* Rank */}
            <div className={`w-12 text-center ${getMedalColor()}`}>
                {rank <= 3 ? (
                    <Trophy className="w-8 h-8 mx-auto" />
                ) : (
                    <span className="text-2xl font-bold">#{rank}</span>
                )}
            </div>

            {/* User Info */}
            <img
                src={user?.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt={user?.name}
                className="w-12 h-12 rounded-full"
            />
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                    {user?.name || 'Unknown'}
                    {isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                            You
                        </span>
                    )}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {points} pts
                    </span>
                    <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        Lvl {level}
                    </span>
                    <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {badges} badges
                    </span>
                </div>
            </div>
        </motion.div>
    )
}