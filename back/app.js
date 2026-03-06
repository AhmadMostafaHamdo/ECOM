require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const port = process.env.PORT || 5007;
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const DefaultData = require("./defaultdata");
const connectDB = require("./db/conn");
const router = require("./routes/router");
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173").split(",").map((o) => o.trim()).filter(Boolean);

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user_online", (userId) => {
        if (userId) {
            onlineUsers.set(userId, socket.id);
            io.emit("online_users", Array.from(onlineUsers.keys()));
        }
    });

    socket.on("join_conversation", (conversationId) => {
        socket.join(`conversation_${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
    });

    socket.on("send_message", (data) => {
        const { conversationId, message } = data;
        socket.to(`conversation_${conversationId}`).emit("receive_message", {
            conversationId,
            message
        });
    });

    socket.on("typing", (data) => {
        const { conversationId, userId, userName } = data;
        socket.to(`conversation_${conversationId}`).emit("user_typing", {
            conversationId,
            userId,
            userName
        });
    });

    socket.on("stop_typing", (data) => {
        const { conversationId, userId } = data;
        socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
            conversationId,
            userId
        });
    });

    socket.on("disconnect", () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("online_users", Array.from(onlineUsers.keys()));
        console.log("User disconnected:", socket.id);
    });
});

// middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser(""));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate Limiters
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// HTTP request logger
app.use(morgan("dev"));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enforce CSRF token strategy on all state-altering requests
app.use(require("./middleware/csrf"));

app.use(router);

if (process.env.NODE_ENV == "production") {
    const distPath = path.join(__dirname, "..", "front", "dist");
    app.use(express.static(distPath, {
        maxAge: '1y',
        etag: false
    }));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

const startServer = async () => {
    try {
        await connectDB();
        if (process.env.SEED_DB_ON_START === "true") {
            await DefaultData();
        }

        server.listen(port, () => {
            console.log(`your server is running on port ${port} `);
        });
    } catch (error) {
        console.error(`server startup failed: ${error.message}`);
        process.exit(1);
    }
};

startServer();

// Trigger nodemon restart
