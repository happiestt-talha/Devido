# 🔥 Devido Backend Refactor Guide

## ✅ What's Been Improved

### 1. **Better Error Handling**
- Custom `ApiError` and `ApiResponse` classes
- Consistent error responses across all endpoints
- Proper HTTP status codes
- Detailed error messages in development mode

### 2. **Input Validation**
- `express-validator` on all routes
- Prevents invalid data from reaching controllers
- Clear validation error messages
- MongoDB ID format validation

### 3. **Security Enhancements**
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- Secure cookie settings
- JWT token expiration (7 days)
- Password hashing with bcrypt (10 salt rounds)

### 4. **Code Organization**
```
├── config/           # Database & third-party configs
├── controllers/      # Business logic
├── middlewares/      # Auth, validation, error handling
├── models/          # MongoDB schemas (reused from old)
├── routes/          # API route definitions
├── utils/           # Helper functions
└── server.js        # Main entry point
```

### 5. **Better API Responses**
**Old:**
```json
{
  "success": true,
  "_id": "...",
  "name": "...",
  "email": "..."
}
```

**New:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "_id": "...",
    "name": "...",
    "email": "..."
  }
}
```

### 6. **Async Error Handling**
- `asyncHandler` wrapper eliminates try-catch repetition
- All errors automatically caught and passed to error middleware

### 7. **Database Connection**
- Better connection error handling
- Connection event listeners
- Auto-reconnect on disconnect

---

## 🚀 Migration Steps

### Step 1: Copy Models
Your existing models are fine! Just copy them to the new structure:

```bash
# From your project root
cp server/models/*.js devido-backend-refactored/models/
```

### Step 2: Install Dependencies
```bash
cd devido-backend-refactored
npm install
```

### Step 3: Setup Environment
```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://talha:TalhaKiDB@devido.i62fufo.mongodb.net/devido?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
FE_URL=http://localhost:3000

# Cloudinary (get free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Start the Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.mongodb.net
🚀 Server running on http://localhost:5000
📝 Environment: development
🌐 Frontend URL: http://localhost:3000
```

---

## 🔄 API Route Changes

### **Auth Routes** (`/api/auth`)
| Old | New | Method |
|-----|-----|--------|
| `/signup` | `/signup` | POST |
| `/login` | `/login` | POST |
| `/google` | `/google` | POST |
| ❌ None | ✅ `/logout` | POST |
| ❌ None | ✅ `/me` | GET |

### **User Routes** (`/api/users`) - **Changed from `/api/user`**
| Old | New | Method |
|-----|-----|--------|
| `/find/:id` | `/:id` | GET |
| `/:id` | `/:id` | PUT |
| `/:id` | `/:id` | DELETE |
| `/sub/:id` | `/subscribe/:id` | PUT |
| `/unsub/:id` | `/unsubscribe/:id` | PUT |
| `/like/:videoId` | `/like/:videoId` | PUT |
| `/dislike/:videoId` | `/dislike/:videoId` | PUT |

### **Video Routes** (`/api/videos`) - **Changed from `/api/video`**
| Old | New | Method |
|-----|-----|--------|
| `/` | `/` | POST |
| `/:id` | `/:id` | PUT |
| `/:id` | `/:id` | DELETE |
| `/find/:id` | `/:id` | GET |
| `/view/:id` | `/view/:id` | PUT |
| `/trend` | `/feed/trending` | GET |
| `/random` | `/feed/random` | GET |
| `/sub` | `/feed/subscriptions` | GET |
| `/uploads/:id` | `/user/:id` | GET |
| `/tags` | `/search/tags` | GET |
| `/search` | `/search/query` | GET |

### **Comment Routes** (`/api/comments`) - **Changed from `/api/comment`**
| Old | New | Method |
|-----|-----|--------|
| `/` | `/` | POST |
| `/:id` | `/:id` | DELETE |
| `/:videoId` | `/:videoId` | GET |
| ❌ None | ✅ `/:id` | PUT |

---

## 🧪 Testing the API

### 1. Test Health Check
```bash
curl http://localhost:5000/
```

### 2. Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testuser",
    "password": "password123"
  }'
```

---

## 🐛 Common Issues & Fixes

### Issue: "JWT_SECRET is not defined"
**Fix:** Make sure `.env` file has `JWT_SECRET` set

### Issue: "MongoDB connection error"
**Fix:** 
1. Check `MONGO_URI` in `.env`
2. Add `/devido` database name after cluster URL
3. Whitelist your IP in MongoDB Atlas

### Issue: "Cannot find module"
**Fix:** Make sure you ran `npm install`

### Issue: Port 5000 already in use
**Fix:** Change `PORT` in `.env` to 5001 or kill the process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 📝 Next Steps

1. ✅ Copy your existing models
2. ✅ Test all endpoints with Postman/Thunder Client
3. ✅ Update frontend API calls to match new routes
4. ✅ Add Cloudinary upload functionality (next phase)
5. ✅ Deploy to Vercel/Railway

---

## 🎯 Key Improvements Summary

| Feature | Old | New |
|---------|-----|-----|
| Error Handling | Basic try-catch | Centralized middleware |
| Validation | None | express-validator on all routes |
| Security | Basic | Helmet + Rate limiting + Secure cookies |
| API Structure | Inconsistent | RESTful + Consistent responses |
| Code Quality | Mixed concerns | Clean separation |
| JWT Secret | Hardcoded | Environment variable |
| Password Storage | ✅ bcrypt | ✅ bcrypt (improved) |
| Logging | Console.log | Morgan (HTTP logger) |

---

## 💡 Pro Tips

1. **Use environment variables** - Never hardcode secrets
2. **Test with tools** - Use Postman or Thunder Client
3. **Check logs** - Morgan logs all HTTP requests in dev mode
4. **Validate everything** - Never trust client input
5. **Keep secrets safe** - Add `.env` to `.gitignore`

---

**Ready to test?** Start the server with `npm run dev` and let me know if you hit any issues!
