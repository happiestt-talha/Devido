import { useQuery } from '@tanstack/react-query'
import { achievementAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { Trophy, Award, TrendingUp, Star, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const BADGES = {
    first_upload: { name: 'First Upload', icon: '🎬', description: 'Upload your first video', points: 50 },
    early_adopter: { name: 'Early Adopter', icon: '🌟', description: 'Join Devido early', points: 100 },
    content_creator: { name: 'Content Creator', icon: '📹', description: 'Upload 10 videos', points: 200 },
    super_creator: { name: 'Super Creator', icon: '🎥', description: 'Upload 50 videos', points: 500 },
    binge_watcher: { name: 'Binge Watcher', icon: '🍿', description: 'Watch 50 videos', points: 100 },
    movie_buff: { name: 'Movie Buff', icon: '🎞️', description: 'Watch 200 videos', points: 300 },
    social_butterfly: { name: 'Social Butterfly', icon: '💬', description: 'Post 100 comments', points: 150 },
    super_liker: { name: 'Super Liker', icon: '👍', description: 'Like 100 videos', points: 100 },
    rising_star: { name: 'Rising Star', icon: '⭐', description: 'Get 100 subscribers', points: 300 },
    influencer: { name: 'Influencer', icon: '🌟', description: 'Get 1,000 subscribers', points: 1000 },
    viral_sensation: { name: 'Viral Sensation', icon: '🔥', description: 'Get 10,000 total views', points: 500 },
    streak_master: { name: 'Streak Master', icon: '🔥', description: 'Log in for 30 consecutive days', points: 250 },
    dedicated: { name: 'Dedicated', icon: '📅', description: 'Log in for 7 consecutive days', points: 75 },
}

export default function Achievements() {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const { data: achievements } = useQuery({
        queryKey: ['achievements', user?._id],
        queryFn: () => achievementAPI.get().then(res => res.data.data),
        enabled: !!user,
    })

    const { data: rankData } = useQuery({
        queryKey: ['achievement-rank', user?._id],
        queryFn: () => achievementAPI.getRank().then(res => res.data.data),
        enabled: !!user,
    })

    if (!user) {
        navigate('/signin')
        return null
    }

    const unlockedBadges = achievements?.badges || []
    const allBadgeIds = Object.keys(BADGES)
    const lockedBadges = allBadgeIds.filter(
        id => !unlockedBadges.some(b => b.badgeId === id)
    )

    const pointsForNextLevel = achievements ? (achievements.level * 1000 - achievements.points) : 1000

    return (
        <div className="space-y-8 text-black dark:text-white">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={<Trophy className="w-8 h-8" />}
                    label="Points"
                    value={achievements?.points || 0}
                    color="text-yellow-500"
                />
                <StatCard
                    icon={<Star className="w-8 h-8" />}
                    label="Level"
                    value={achievements?.level || 1}
                    color="text-blue-500"
                    subtitle={`${pointsForNextLevel} pts to next level`}
                />
                <StatCard
                    icon={<Award className="w-8 h-8" />}
                    label="Badges"
                    value={`${unlockedBadges.length}/${allBadgeIds.length}`}
                    color="text-purple-500"
                />
                <StatCard
                    icon={<TrendingUp className="w-8 h-8" />}
                    label="Rank"
                    value={rankData ? `#${rankData.rank}` : '-'}
                    color="text-green-500"
                    subtitle={rankData ? `of ${rankData.totalUsers} users` : ''}
                />
            </div>

            {/* Progress Bar */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Level {achievements?.level || 1}</span>
                    <span className="text-sm text-gray-500">
                        {achievements?.points || 0} / {(achievements?.level || 1) * 1000} pts
                    </span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((achievements?.points || 0) % 1000) / 10}%`
                        }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                </div>
            </div>

            {/* Activity Stats */}
            <div className="card p-6">
                <h2 className="text-2xl font-bold mb-6">Your Activity</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ActivityStat
                        label="Videos Watched"
                        value={achievements?.stats.videosWatched || 0}
                    />
                    <ActivityStat
                        label="Videos Uploaded"
                        value={achievements?.stats.videosUploaded || 0}
                    />
                    <ActivityStat
                        label="Comments Posted"
                        value={achievements?.stats.commentsPosted || 0}
                    />
                    <ActivityStat
                        label="Likes Given"
                        value={achievements?.stats.likesGiven || 0}
                    />
                    <ActivityStat
                        label="Total Views"
                        value={achievements?.stats.totalViews || 0}
                    />
                    <ActivityStat
                        label="Subscribers"
                        value={achievements?.stats.subscribersGained || 0}
                    />
                    <ActivityStat
                        label="Login Streak"
                        value={`${achievements?.stats.consecutiveDays || 0} days`}
                    />
                </div>
            </div>

            {/* Unlocked Badges */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Unlocked Badges ({unlockedBadges.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {unlockedBadges.map((badge) => (
                        <BadgeCard
                            key={badge.badgeId}
                            badge={BADGES[badge.badgeId]}
                            unlocked={true}
                            unlockedAt={badge.unlockedAt}
                        />
                    ))}
                </div>
            </div>

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-500">
                        Locked Badges ({lockedBadges.length})
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {lockedBadges.map((badgeId) => (
                            <BadgeCard
                                key={badgeId}
                                badge={BADGES[badgeId]}
                                unlocked={false}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ icon, label, value, color, subtitle }) {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-3">
                <div className={color}>{icon}</div>
            </div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
    )
}

function ActivityStat({ label, value }) {
    return (
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
    )
}

function BadgeCard({ badge, unlocked, unlockedAt }) {
    return (
        <motion.div
            whileHover={{ scale: unlocked ? 1.05 : 1 }}
            className={`card p-4 text-center ${unlocked ? '' : 'opacity-50 grayscale'
                }`}
        >
            <div className="text-4xl mb-2">
                {unlocked ? badge.icon : '🔒'}
            </div>
            <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
            <div className="flex items-center justify-center gap-1 text-yellow-500">
                <Trophy className="w-3 h-3" />
                <span className="text-xs font-medium">{badge.points} pts</span>
            </div>
            {unlocked && unlockedAt && (
                <p className="text-xs text-gray-400 mt-2">
                    {new Date(unlockedAt).toLocaleDateString()}
                </p>
            )}
        </motion.div>
    )
}