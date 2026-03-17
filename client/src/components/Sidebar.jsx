import { Link, useLocation } from 'react-router-dom'
import {
    Home,
    TrendingUp,
    Users,
    Upload,
    User as UserIcon,
    Moon,
    Sun,
    LogOut,
    Video,
    BarChart3,
    ListVideo,
    Trophy,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authAPI } from '@/services/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function Sidebar({ isOpen }) {
    const location = useLocation()
    const { user, logout } = useAuthStore()
    const { isDark, toggleTheme } = useThemeStore()

    const handleLogout = async () => {
        try {
            await authAPI.logout()
            logout()
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error('Failed to logout')
        }
    }

    const menuItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: TrendingUp, label: 'Trending', path: '/explore' },
        { icon: Users, label: 'Subscriptions', path: '/subscriptions', requireAuth: true },
        { icon: Upload, label: 'Upload', path: '/upload', requireAuth: true },
        { icon: UserIcon, label: 'Profile', path: '/profile', requireAuth: true },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', requireAuth: true },
        { icon: ListVideo, label: 'Playlists', path: '/playlists', requireAuth: true },
        { icon: Trophy, label: 'Achievements', path: '/achievements', requireAuth: true },
        { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
        { icon: Users, label: 'Join Party', path: '/join-watch-party' },
    ]

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-40"
                    onClick={() => { }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-transform duration-300",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    "w-64 lg:w-64"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200 dark:border-dark-700">
                        <Link to="/" className="flex items-center gap-3">
                            <Video className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                                Devido
                            </span>
                        </Link>
                    </div>

                    {/* Menu items */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-1 px-3">
                            {menuItems.map((item) => {
                                if (item.requireAuth && !user) return null

                                const Icon = item.icon
                                const isActive = location.pathname === item.path

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center gap-4 px-4 py-3 rounded-lg transition-colors",
                                            isActive
                                                ? "bg-gray-100 dark:bg-dark-700 text-primary font-medium"
                                                : "hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-200"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-dark-700 my-4" />

                        {/* Theme toggle */}
                        <div className="px-3">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors w-full text-gray-700 dark:text-gray-200"
                            >
                                {isDark ? (
                                    <>
                                        <Sun className="w-5 h-5" />
                                        <span>Light Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <Moon className="w-5 h-5" />
                                        <span>Dark Mode</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Login/Logout */}
                        {!user ? (
                            <div className="px-3 mt-4">
                                <Link
                                    to="/signin"
                                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span>Sign In</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="px-3 mt-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors w-full"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-dark-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            © 2024 Devido. Made with ❤️
                        </p>
                    </div>
                </div>
            </aside>
        </>
    )
}