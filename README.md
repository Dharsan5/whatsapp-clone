# WhatsApp Web Clone

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. Replicates the core functionality and UI of WhatsApp Web.

## Features

- **User Authentication** — Register and login with email/password (JWT-based)
- **Real-Time Messaging** — Instant message delivery using Socket.IO (no page refresh needed)
- **Typing Indicator** — Shows "typing..." when the other user is typing
- **Online Status** — Green dot indicator for online users
- **Message Persistence** — All messages stored in MongoDB, persist after page refresh
- **Last Message Preview** — Sidebar shows last message and timestamp for each conversation
- **Date Separators** — Messages grouped by date (Today, Yesterday, or full date)
- **Responsive Design** — Works on desktop and mobile devices
- **WhatsApp-like UI** — Dark theme matching WhatsApp Web's design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB (Atlas) |
| Auth | JWT (JSON Web Tokens), bcrypt |

## Project Structure

```
whatsapp-clone/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register & Login
│   │   ├── messageController.js  # Send & Fetch messages
│   │   └── userController.js     # Get all users
│   ├── middleware/auth.js        # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Message.js            # Message schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── socket/socket.js          # Socket.IO event handlers
│   ├── server.js                 # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js        # Chat list panel
│   │   │   └── ChatWindow.js     # Message window
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Chat.js           # Main chat page
│   │   ├── services/
│   │   │   └── api.js            # Axios instance
│   │   └── App.js
│   └── package.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/whatsapp-clone.git
cd whatsapp-clone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (use `.env.example` as reference):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/whatsapp-clone?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

**To get your MongoDB URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free cluster
2. Create a database user under **Database Access**
3. Allow network access from anywhere (`0.0.0.0/0`) under **Network Access**
4. Click **Connect** → **Connect your application** → Copy the URI
5. Replace `<username>` and `<password>` with your database user credentials

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Open the App

1. Open `http://localhost:3000` in your browser
2. Register a new user (e.g., User A)
3. Open an incognito/private window at `http://localhost:3000`
4. Register another user (e.g., User B)
5. Select each other from the sidebar and start chatting!

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/users` | Yes | Get all users (except self) |
| POST | `/api/messages` | Yes | Send a message |
| GET | `/api/messages/last-messages` | Yes | Get last message per conversation |
| GET | `/api/messages/:userId` | Yes | Get chat history with a user |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user_online` | Client → Server | Register user as online |
| `online_users` | Server → Client | Broadcast online users list |
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → Client | Deliver message to receiver |
| `typing` | Client → Server | User started typing |
| `user_typing` | Server → Client | Notify receiver of typing |
| `stop_typing` | Client → Server | User stopped typing |
| `user_stop_typing` | Server → Client | Notify receiver stopped typing |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT token generation |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:3000) |
