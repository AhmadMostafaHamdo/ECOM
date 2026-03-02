const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const keysecret = process.env.KEY

const authenicate = async(req,res,next)=>{
    try {
        const token = req.cookies.eccomerce;

        if (!token) {
            return res.status(401).json({ error: "Unauthorized: token missing" });
        }

        const verifyToken = jwt.verify(token,keysecret);

        const rootUser = await User.findOne({_id:verifyToken._id,"tokens.token":token});

        if(!rootUser){
            res.clearCookie("eccomerce", { path: "/" });
            return res.status(401).json({ error: "Unauthorized: invalid token" });
        }

        req.token = token; 
        req.rootUser = rootUser;   
        req.userID = rootUser._id;   
    
        next();  


    } catch (error) {
        res.clearCookie("eccomerce", { path: "/" });
        res.status(401).json({ error: "Unauthorized: token invalid or expired" });
        console.log(error);
    }
};

module.exports = authenicate;
