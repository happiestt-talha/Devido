# 🎥 Devido Frontend - Modern Video Sharing Platform

Complete refactor with React, Vite, Tailwind CSS, Zustand, and React Query.

## ✨ Features

- ⚡ **Vite** - Lightning fast dev server
- 🎨 **Tailwind CSS** - Modern utility-first styling
- 🌓 **Dark Mode** - Smooth theme switching
- 📦 **Zustand** - Simple state management (no Redux!)
- 🔄 **React Query** - Smart data fetching & caching
- 🎭 **Framer Motion** - Smooth animations
- 🎯 **TypeScript Ready** - Easy to migrate
- 📱 **Fully Responsive** - Mobile-first design

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## 📁 Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── store/          # Zustand stores
├── services/       # API service layer
├── lib/            # Utility functions
├── hooks/          # Custom React hooks
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## 🔧 Configuration

### API Proxy
Configured in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

### Tailwind Theme
Edit colors in `tailwind.config.js`

### Dark Mode
Uses class-based dark mode. Toggle via theme store.

## 📦 Key Dependencies

- **react-router-dom** - Routing
- **@tanstack/react-query** - Data fetching
- **zustand** - State management
- **axios** - HTTP client
- **sonner** - Toast notifications
- **lucide-react** - Icon library
- **framer-motion** - Animations
- **date-fns** - Date formatting

## 🎨 Features Implemented

- ✅ Home page with video grid
- ✅ Video player with comments
- ✅ Search functionality
- ✅ User authentication
- ✅ Profile page
- ✅ Video upload
- ✅ Like/dislike system
- ✅ Subscribe/unsubscribe
- ✅ Comments CRUD
- ✅ Dark/light mode
- ✅ Responsive design
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Optimistic UI updates

## 🔥 What Changed from Old Version

| Old | New |
|-----|-----|
| Create React App | Vite |
| Styled Components | Tailwind CSS |
| Redux + Redux Persist | Zustand |
| Firebase | Backend API only |
| Manual data fetching | React Query |
| No loading states | Skeleton loaders |
| No optimistic updates | Instant UI feedback |

## 🚀 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 📝 Notes

- Backend must be running on `http://localhost:5000`
- No Firebase - pure backend authentication
- Images use placeholder service (replace with Cloudinary later)
- Video URLs support YouTube embeds

## 🎯 Next Steps

- [ ] Add Cloudinary file uploads
- [ ] Implement video playback analytics
- [ ] Add playlist feature
- [ ] Email verification
- [ ] Social sharing
- [ ] Advanced search filters

---

**Made with ❤️ by Talha**