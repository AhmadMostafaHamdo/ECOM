require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
app.set("trust proxy", 1);
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
const router = require("./routes/index"); // Modular router
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
        socket.to(`conversation_${conversationId}`).emit("receive_message", { conversationId, message });
    });

    socket.on("typing", (data) => {
        const { conversationId, userId, userName } = data;
        socket.to(`conversation_${conversationId}`).emit("user_typing", { conversationId, userId, userName });
    });

    socket.on("stop_typing", (data) => {
        const { conversationId, userId } = data;
        socket.to(`conversation_${conversationId}`).emit("user_stop_typing", { conversationId, userId });
    });

    socket.on("disconnect", () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("online_users", Array.from(onlineUsers.keys()));
    });
});

// middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

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
    max: 2000,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Auth Limiter
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts
    message: "Too many login/registration attempts from this IP, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

// Contact Limiter
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 messages
    message: "Too many contact messages from this IP, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/contact", contactLimiter);

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Logging
if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined")); // Standard production logging
} else {
    app.use(morgan("dev"));
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Custom CSRF Protection
app.use(require("./middleware/csrf"));

// Prefix all API routes with /api for better organization
app.use("/api", router);

// Global Error Handler (Must be at the bottom)
const { errorHandler } = require("./middleware/errorMiddleware");
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "..", "front", "dist");
    app.use(express.static(distPath, {
        maxAge: '1y',
        etag: false
    }));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

const { ensureCategoryCatalog } = require("./controllers/productController");

const startServer = async () => {
    try {
        await connectDB();

        // Sync category catalog based on existing products
        await ensureCategoryCatalog();

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
