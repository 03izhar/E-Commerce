const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?._id);
                req.user = user;
                // console.log(req.user);

                next();
            }
        } catch (error) {
            throw new Error("Not Authorized Token Expired, Login again");
        }
    } else {
        throw new Error("There is no Token attached to header")
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    console.log(req.user);


    // if (req?.user?.role === "admin") {
    //     next();
    // } else {
    //     throw new Error("You are not Admin");
    // }
})

module.exports = {
    authMiddleware,
    isAdmin
}