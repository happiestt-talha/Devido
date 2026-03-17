import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized
            window.location.href = '/signin'
        }
        return Promise.reject(error)
    }
)

// Auth APIs
export const authAPI = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
}

// User APIs
export const userAPI = {
    getUser: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
    subscribe: (id) => api.put(`/users/subscribe/${id}`),
    unsubscribe: (id) => api.put(`/users/unsubscribe/${id}`),
    likeVideo: (videoId) => api.put(`/users/like/${videoId}`),
    dislikeVideo: (videoId) => api.put(`/users/dislike/${videoId}`),
}

// Video APIs
export const videoAPI = {
    createVideo: (data) => api.post('/videos', data),
    updateVideo: (id, data) => api.put(`/videos/${id}`, data),
    deleteVideo: (id) => api.delete(`/videos/${id}`),
    getVideo: (id) => api.get(`/videos/${id}`),
    addView: (id) => api.put(`/videos/view/${id}`),
    getTrending: () => api.get('/videos/feed/trending'),
    getRandom: () => api.get('/videos/feed/random'),
    getSubscriptions: () => api.get('/videos/feed/subscriptions'),
    getUserVideos: (userId) => api.get(`/videos/user/${userId}`),
    search: (query) => api.get(`/videos/search/query?q=${query}`),
    getByTags: (tags) => api.get(`/videos/search/tags?tags=${tags}`),
}

// Comment APIs
export const commentAPI = {
    addComment: (data) => api.post('/comments', data),
    getComments: (videoId) => api.get(`/comments/${videoId}`),
    updateComment: (id, data) => api.put(`/comments/${id}`, data),
    deleteComment: (id) => api.delete(`/comments/${id}`),
}

export const playlistAPI = {
    create: (data) => api.post('/playlists', data),
    getUserPlaylists: (userId) => api.get(`/playlists/user/${userId}`),
    getPlaylist: (id) => api.get(`/playlists/${id}`),
    update: (id, data) => api.put(`/playlists/${id}`, data),
    delete: (id) => api.delete(`/playlists/${id}`),
    addVideo: (id, videoId) => api.post(`/playlists/${id}/videos`, { videoId }),
    removeVideo: (id, videoId) => api.delete(`/playlists/${id}/videos/${videoId}`),
    getWatchLater: () => api.get('/playlists/watch-later'),
}

// Achievement APIs
export const achievementAPI = {
    get: () => api.get('/achievements'),
    updateStats: (action, value) => api.post('/achievements/stats', { action, value }),
    getLeaderboard: (type = 'points', limit = 50) =>
        api.get(`/achievements/leaderboard?type=${type}&limit=${limit}`),
    getRank: () => api.get('/achievements/rank'),
}

// Watch Party APIs
export const watchPartyAPI = {
    create: (data) => api.post('/watch-parties', data),
    join: (code) => api.post('/watch-parties/join', { code }),
    leave: (id) => api.post(`/watch-parties/${id}/leave`),
    get: (id) => api.get(`/watch-parties/${id}`),
    sendMessage: (id, message) => api.post(`/watch-parties/${id}/message`, { message }),
    sendReaction: (id, emoji) => api.post(`/watch-parties/${id}/reaction`, { emoji }),
    syncPlayback: (id, currentTime, isPlaying) =>
        api.post(`/watch-parties/${id}/sync`, { currentTime, isPlaying }),
    getUserParties: () => api.get('/watch-parties/user/active'),
}

export default api