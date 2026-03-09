const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keysecret = process.env.KEY
const TOKEN_EXPIRES_IN = "365d";

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not valid email address");
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    carts: Array,
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "products"
    }],
    // User rating system
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    reputationScore: {
        type: Number,
        default: 0
    },
    // Profile enhancements
    profileImage: String,
    bio: {
        type: String,
        maxlength: 500
    },
    location: String,
    country: String,
    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    // Ban system
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: ""
    },
    bannedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});


// password hasing 
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }
});

// generting token
userSchema.methods.generatAuthtoken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, keysecret, {
            expiresIn: TOKEN_EXPIRES_IN
        });
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;

    } catch (error) {
        console.log(error);
    }
}

// addto cart data
userSchema.methods.addcartdata = async function (cart) {
    try {
        this.carts = this.carts.concat(cart);
        await this.save();
        return this.carts;
    } catch (error) {
        console.log(error + "bhai cart add time aai error");
    }
}



const User = new mongoose.model("USER", userSchema);

module.exports = User;




// carts:Array
// jo aavi rite carts ne add karso to pn chale other wise je old methods 6 eto use krvij
// carts:[
//     {
//         cart:Object
//     }
// ]
//  this.carts = this.carts.concat({cart}); // to pachi cart ne destructring krine lakhvu
