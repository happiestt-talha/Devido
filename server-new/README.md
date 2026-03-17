# 🎥 Devido - Modern Video Sharing Platform API

A complete refactor of the Devido backend with modern best practices, security enhancements, and clean architecture.

## ✨ Features

- 🔐 **Secure Authentication** - JWT with HTTP-only cookies
- 📹 **Video Management** - Upload, update, delete videos
- 💬 **Comments System** - Nested comments with user info
- 👤 **User Profiles** - Subscriptions, likes, profile updates
- 🔍 **Search & Discovery** - Trending, random, tag-based search
- 🛡️ **Security** - Helmet, rate limiting, input validation
- ✅ **Validation** - Express-validator on all inputs
- 📊 **Clean API** - Consistent response format

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (Atlas or local)
- npm >= 9.0.0

### Installation

1. **Clone & Install**
```bash
cd devido-backend-refactored
npm install
```

2. **Setup Environment**
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Copy Models**
```bash
# Copy your existing models
cp ../server/models/*.js ./models/
```

4. **Start Server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 📁 Project Structure

```
devido-backend-refactored/
├── config/
│   ├── database.js       # MongoDB connection
│   └── cloudinary.js     # Cloudinary setup
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── video.controller.js
│   └── comment.controller.js
├── middlewares/
│   ├── auth.js           # JWT verification
│   ├── validation.js     # Input validation rules
│   └── errorHandler.js   # Error handling
├── models/
│   ├── User.js
│   ├── Video.js
│   └── Comments.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── video.routes.js
│   └── comment.routes.js
├── utils/
│   ├── ApiError.js       # Custom error class
│   ├── ApiResponse.js    # Consistent responses
│   └── asyncHandler.js   # Async error wrapper
├── .env.example
├── .gitignore
├── package.json
├── server.js             # Entry point
└── REFACTOR_GUIDE.md     # Migration guide
```

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/signup` | POST | ❌ | Register new user |
| `/login` | POST | ❌ | Login user |
| `/logout` | POST | ❌ | Logout user |
| `/me` | GET | ✅ | Get current user |
| `/google` | POST | ❌ | Google OAuth |

### Users (`/api/users`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/:id` | GET | ❌ | Get user profile |
| `/:id` | PUT | ✅ | Update own profile |
| `/:id` | DELETE | ✅ | Delete own account |
| `/subscribe/:id` | PUT | ✅ | Subscribe to channel |
| `/unsubscribe/:id` | PUT | ✅ | Unsubscribe from channel |
| `/like/:videoId` | PUT | ✅ | Like video |
| `/dislike/:videoId` | PUT | ✅ | Dislike video |

### Videos (`/api/videos`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Upload video |
| `/:id` | GET | ❌ | Get video |
| `/:id` | PUT | ✅ | Update video |
| `/:id` | DELETE | ✅ | Delete video |
| `/view/:id` | PUT | ❌ | Increment views |
| `/feed/trending` | GET | ❌ | Trending videos |
| `/feed/random` | GET | ❌ | Random videos |
| `/feed/subscriptions` | GET | ✅ | Subscribed videos |
| `/user/:id` | GET | ❌ | User's videos |
| `/search/query?q=` | GET | ❌ | Search videos |
| `/search/tags?tags=` | GET | ❌ | Videos by tags |

### Comments (`/api/comments`)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | POST | ✅ | Add comment |
| `/:videoId` | GET | ❌ | Get video comments |
| `/:id` | PUT | ✅ | Update comment |
| `/:id` | DELETE | ✅ | Delete comment |

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message"
}
```

## 🧪 Testing Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Trending Videos
```bash
curl http://localhost:5000/api/videos/feed/trending
```

### Search Videos
```bash
curl "http://localhost:5000/api/videos/search/query?q=javascript"
```

## 🔒 Security Features

- ✅ Helmet.js security headers
- ✅ Rate limiting (100 req/15min)
- ✅ Input validation on all routes
- ✅ Password hashing (bcrypt)
- ✅ JWT with expiration
- ✅ HTTP-only secure cookies
- ✅ CORS configuration
- ✅ MongoDB injection prevention

## 🛠️ Development

### Available Scripts
```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
```

### Environment Variables
See `.env.example` for all required variables

## 📝 Migration from Old Backend

See [REFACTOR_GUIDE.md](./REFACTOR_GUIDE.md) for detailed migration steps.

**Key Changes:**
- `/api/user` → `/api/users`
- `/api/video` → `/api/videos`
- `/api/comment` → `/api/comments`
- Removed hardcoded JWT secret
- Added proper validation
- Improved error responses

## 🐛 Troubleshooting

**MongoDB Connection Failed?**
- Check `MONGO_URI` format
- Whitelist IP in MongoDB Atlas
- Add database name in URI

**JWT Errors?**
- Verify `JWT_SECRET` is set
- Check cookie settings
- Clear browser cookies

**Port Already in Use?**
- Change `PORT` in `.env`
- Kill process on port 5000

## 📚 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** Helmet, rate-limit
- **File Upload:** Multer + Cloudinary
- **Logging:** Morgan

## 🎯 Next Steps

- [ ] Add file upload endpoints (Cloudinary)
- [ ] Implement video transcoding
- [ ] Add email verification
- [ ] Create admin panel
- [ ] Add video analytics
- [ ] Implement playlists
- [ ] Add notifications system

## 📄 License

MIT

## 👨‍💻 Author

Talha - [GitHub](https://github.com/happiestt-talha)

---

**Made with ❤️ for learning modern backend development**
