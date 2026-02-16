require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5007;
const cookieParser = require("cookie-parser");
const DefaultData = require("./defaultdata");
const connectDB = require("./db/conn");
const router = require("./routes/router");


// middleware
app.use(express.json());
app.use(cookieParser(""));
app.use((req, res, next) => {
    const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(router);
// app.get("/",(req,res)=>{
//     res.send("your server is running");
// });


if(process.env.NODE_ENV == "production"){
    const distPath = path.join(__dirname, "client", "dist");
    app.use(express.static(distPath));
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

        app.listen(port, () => {
            console.log(`your server is running on port ${port} `);
        });
    } catch (error) {
        console.error(`server startup failed: ${error.message}`);
        process.exit(1);
    }
};

startServer();
