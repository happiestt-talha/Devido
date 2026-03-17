import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Video from './pages/Video'
import SignIn from './pages/SignIn'
import Search from './pages/Search'
import Profile from './pages/Profile'
import Upload from './pages/Upload'
import Analytics from './pages/Analytics'
import CustomizeChannel from './pages/CustomizeChannel'

import Achievements from './pages/Achievements'
import Leaderboard from './pages/Leaderboard'
import Playlists from './pages/Playlists'
import PlaylistView from './pages/PlaylistView'
import WatchParty from './pages/WatchParty'
import JoinWatchParty from './pages/JoinWatchParty'
import EditProfile from './pages/EditProfile'

function App() {
  const { isDark } = useThemeStore()

  return (
    <div className={isDark ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home type="random" />} />
          <Route path="explore" element={<Home type="trending" />} />
          <Route path="subscriptions" element={<Home type="subscriptions" />} />
          <Route path="video/:id" element={<Video />} />
          <Route path="search" element={<Search />} />
          <Route path="profile" element={<Profile />} />
          <Route path="upload" element={<Upload />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="customize-channel" element={<CustomizeChannel />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="playlist/:id" element={<PlaylistView />} />
          <Route path="watch-party/:id" element={<WatchParty />} />
          <Route path="join-watch-party" element={<JoinWatchParty />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="channel/:id" element={<Profile />} />
        </Route>
        <Route path="signin" element={<SignIn />} />
      </Routes>
    </div>
  )
}

export default App