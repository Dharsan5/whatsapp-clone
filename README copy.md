# WhatsApp Web Clone

A full-stack real-time chat application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Socket.IO**. Replicates the core functionality, design, and user experience of WhatsApp Web — including real-time messaging, media sharing, status updates, and profile management.

## Features

### Core Messaging
- **Real-Time Chat** — Instant message delivery using Socket.IO (no page refresh)
- **Typing Indicators** — Shows "typing..." in real-time in both sidebar and chat header
- **Online/Offline Status** — Green dot indicator with pulse animation for online users
- **Message Persistence** — All messages stored in MongoDB, persist after page refresh
- **Last Message Preview** — Sidebar shows latest message text and timestamp per conversation
- **Date Separators** — Messages grouped by "Today", "Yesterday", or full date
- **Message Ticks** — Single/double tick indicators on sent messages

### Media & File Sharing
- **Image Upload** — Send images with preview before sending
- **Video Upload** — Send and play videos inline
- **Document Sharing** — Share PDF, Word, Excel, PowerPoint, TXT, ZIP files
- **Location Sharing** — Send location with map preview
- **Cloudinary Storage** — All media stored on Cloudinary CDN

### Status (Stories)
- **Create Status** — Post image, video, or text statuses
- **24-Hour Expiry** — Statuses auto-delete after 24 hours (MongoDB TTL index)
- **View Statuses** — Browse other users' statuses with progress indicators
- **Reply to Status** — Send direct message reply to any status

### User Management
- **Registration** — Sign up with username, email, phone number, and password
- **Login** — Authenticate with email or phone number
- **Onboarding** — Set profile picture, full name, and about after registration
- **Profile Editing** — Update avatar, name, and about text anytime
- **JWT Authentication** — Secure token-based auth with 7-day expiration

### UI/UX
- **WhatsApp Dark Theme** — Pixel-accurate dark mode matching WhatsApp Web
- **Navigation Sidebar** — Tabs for Chats, Status, Communities, and Settings
- **Search** — Search users by name or phone number in sidebar
- **Emoji Picker** — Built-in emoji selector with categories
- **Attachment Menu** — Animated popup for Photos, Camera, Documents, Location
- **Responsive Design** — Works on desktop and mobile with back navigation
- **Settings Page** — Account, Privacy, Chats, Notifications, Help, and more

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 19, React Router 7, Axios, Socket.IO Client, Emoji Picker React, React Icons |
| **Backend** | Node.js, Express.js 5, Socket.IO, Express Validator |
| **Database** | MongoDB with Mongoose 9 |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Media** | Cloudinary, Multer, Multer Storage Cloudinary |
| **Dev Tools** | Nodemon |

## Project Structure

```
whatsapp-clone/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── cloudinary.js            # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Profile update
│   │   ├── userController.js        # Get all users
│   │   ├── messageController.js     # Send/fetch messages & media
│   │   └── statusController.js      # Create/fetch statuses
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Message.js               # Message schema (text, media, location)
│   │   └── Status.js                # Status schema (24hr TTL)
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── userRoutes.js            # /api/users/*
│   │   ├── messageRoutes.js         # /api/messages/*
│   │   └── statusRoutes.js          # /api/status/*
│   ├── socket/
│   │   └── socket.js                # Socket.IO event handlers
│   ├── server.js                    # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavSidebar.js        # Left navigation bar (Chat/Status/Settings tabs)
│   │   │   ├── Sidebar.js           # Chat list with search, filters, previews
│   │   │   ├── ChatWindow.js        # Messages, input, media upload, emoji picker
│   │   │   ├── DefaultAvatar.js     # Color-coded avatar with initials
│   │   │   └── MediaModal.js        # Global media/documents gallery viewer
│   │   ├── context/
│   │   │   └── AuthContext.js       # Auth state management (login/register/logout)
│   │   ├── pages/
│   │   │   ├── Login.js             # Login with email or phone
│   │   │   ├── Register.js          # Registration with validation
│   │   │   ├── Onboarding.js        # Profile setup (avatar, name, about)
│   │   │   ├── Chat.js              # Main chat page (connects all components)
│   │   │   ├── Status.js            # Create & view statuses
│   │   │   └── Settings.js          # Settings with 8 sub-pages
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with JWT interceptor
│   │   ├── utils/
│   │   │   └── constants.js         # Image URLs and constants
│   │   └── App.js                   # Route definitions
│   └── package.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) — Local installation **or** [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- [Cloudinary](https://cloudinary.com/) account (free tier — for media uploads)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Dharsan5/whatsapp-clone.git
cd whatsapp-clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### MongoDB Options

**Option A — Local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
```
Install [MongoDB Community Server](https://www.mongodb.com/try/download/community) and ensure the service is running.

**Option B — MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/whatsapp-clone?retryWrites=true&w=majority
```
1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user under **Database Access**
3. Allow network access from `0.0.0.0/0` under **Network Access**
4. Click **Connect** → **Connect your application** → Copy the URI

#### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/) (free)
2. Go to **Dashboard** → Copy your Cloud Name, API Key, and API Secret
3. Paste them into the `.env` file

Start the backend:

```bash
npm run dev
```

You should see: `MongoDB Connected: localhost` and `Server running on port 5000`

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

### 4. Open the App

1. Open `http://localhost:3000` in your browser
2. **Register** a new user (e.g., User A)
3. Complete the **onboarding** (set profile picture, name, about)
4. Open an **incognito/private window** at `http://localhost:3000`
5. Register another user (e.g., User B)
6. Select each other from the sidebar and start chatting!

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register with username, email, phone, password |
| POST | `/api/auth/login` | No | Login with email/phone + password, returns JWT |
| PUT | `/api/auth/profile` | Yes | Update profile (name, about, avatar upload) |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Yes | Get all users except current user |

### Messages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/messages` | Yes | Send message (text, image, video, document, location) |
| GET | `/api/messages/last-messages` | Yes | Get last message per conversation |
| GET | `/api/messages/global-media` | Yes | Get all media received by current user |
| GET | `/api/messages/:userId` | Yes | Get chat history with a specific user |

### Status
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/status` | Yes | Create status (image/video + caption) |
| GET | `/api/status` | Yes | Get all active (non-expired) statuses |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user_online` | Client → Server | Register user as online |
| `online_users` | Server → Client | Broadcast updated online users list |
| `send_message` | Client → Server | Send a message to receiver |
| `receive_message` | Server → Client | Deliver incoming message |
| `typing` | Client → Server | User started typing |
| `user_typing` | Server → Client | Notify receiver of typing |
| `stop_typing` | Client → Server | User stopped typing |
| `user_stop_typing` | Server → Client | Notify receiver stopped typing |

## Database Schemas

### User
| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Unique username (min 3 chars) |
| `email` | String | Unique email address |
| `phoneNumber` | String | Unique phone number |
| `password` | String | Hashed password (bcrypt) |
| `fullName` | String | Display name (set during onboarding) |
| `about` | String | Status text (default: "Hey there! I am using WhatsApp.") |
| `avatar` | String | Profile picture URL (Cloudinary) |
| `isOnboarded` | Boolean | Whether user completed profile setup |

### Message
| Field | Type | Description |
|-------|------|-------------|
| `sender` | ObjectId → User | Who sent the message |
| `receiver` | ObjectId → User | Who receives the message |
| `content` | String | Text content |
| `messageType` | Enum | `text`, `image`, `video`, `document`, `location` |
| `mediaUrl` | String | Cloudinary URL for uploaded files |
| `fileName` | String | Original filename for documents |
| `location` | Object | `{ latitude, longitude, label }` |
| `repliedStatus` | Object | Status reply metadata |

### Status
| Field | Type | Description |
|-------|------|-------------|
| `sender` | ObjectId → User | Who posted the status |
| `mediaUrl` | String | Cloudinary URL |
| `mediaType` | Enum | `image`, `video` |
| `content` | String | Text/emoji caption |
| `expiresAt` | Date | Auto-delete after 24 hours (TTL index) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Backend server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `CLIENT_URL` | No | Frontend URL for CORS (default: http://localhost:3000) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
