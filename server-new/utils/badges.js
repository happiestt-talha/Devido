export const BADGES = {
    FIRST_UPLOAD: {
        id: 'first_upload',
        name: 'First Upload',
        description: 'Upload your first video',
        icon: '🎬',
        points: 50,
        requirement: (stats) => stats.videosUploaded >= 1,
    },
    EARLY_ADOPTER: {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Join Devido in the first 100 users',
        icon: '🌟',
        points: 100,
        requirement: (stats, userId) => true, // Manually awarded
    },
    CONTENT_CREATOR: {
        id: 'content_creator',
        name: 'Content Creator',
        description: 'Upload 10 videos',
        icon: '📹',
        points: 200,
        requirement: (stats) => stats.videosUploaded >= 10,
    },
    SUPER_CREATOR: {
        id: 'super_creator',
        name: 'Super Creator',
        description: 'Upload 50 videos',
        icon: '🎥',
        points: 500,
        requirement: (stats) => stats.videosUploaded >= 50,
    },
    BINGE_WATCHER: {
        id: 'binge_watcher',
        name: 'Binge Watcher',
        description: 'Watch 50 videos',
        icon: '🍿',
        points: 100,
        requirement: (stats) => stats.videosWatched >= 50,
    },
    MOVIE_BUFF: {
        id: 'movie_buff',
        name: 'Movie Buff',
        description: 'Watch 200 videos',
        icon: '🎞️',
        points: 300,
        requirement: (stats) => stats.videosWatched >= 200,
    },
    SOCIAL_BUTTERFLY: {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Post 100 comments',
        icon: '💬',
        points: 150,
        requirement: (stats) => stats.commentsPosted >= 100,
    },
    SUPER_LIKER: {
        id: 'super_liker',
        name: 'Super Liker',
        description: 'Like 100 videos',
        icon: '👍',
        points: 100,
        requirement: (stats) => stats.likesGiven >= 100,
    },
    RISING_STAR: {
        id: 'rising_star',
        name: 'Rising Star',
        description: 'Get 100 subscribers',
        icon: '⭐',
        points: 300,
        requirement: (stats) => stats.subscribersGained >= 100,
    },
    INFLUENCER: {
        id: 'influencer',
        name: 'Influencer',
        description: 'Get 1,000 subscribers',
        icon: '🌟',
        points: 1000,
        requirement: (stats) => stats.subscribersGained >= 1000,
    },
    VIRAL_SENSATION: {
        id: 'viral_sensation',
        name: 'Viral Sensation',
        description: 'Get 10,000 total views',
        icon: '🔥',
        points: 500,
        requirement: (stats) => stats.totalViews >= 10000,
    },
    STREAK_MASTER: {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Log in for 30 consecutive days',
        icon: '🔥',
        points: 250,
        requirement: (stats) => stats.consecutiveDays >= 30,
    },
    DEDICATED: {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Log in for 7 consecutive days',
        icon: '📅',
        points: 75,
        requirement: (stats) => stats.consecutiveDays >= 7,
    },
};

export const calculateLevel = (points) => {
    // Level up every 1000 points
    return Math.floor(points / 1000) + 1;
};

export const getPointsForNextLevel = (currentPoints) => {
    const currentLevel = calculateLevel(currentPoints);
    return currentLevel * 1000 - currentPoints;
};