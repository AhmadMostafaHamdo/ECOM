require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const port = process.env.PORT || 5007;
const cookieParser = require("cookie-parser");
const compression = require("compression");
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
app.use(compression());
app.use(express.json());
app.use(cookieParser(""));
app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const originToUse = allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : (process.env.CLIENT_ORIGIN || allowedOrigins[0] || "http://localhost:5173");

    res.header("Access-Control-Allow-Origin", originToUse);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(router);

if (process.env.NODE_ENV == "production") {
    const distPath = path.join(__dirname, "client", "dist");
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
