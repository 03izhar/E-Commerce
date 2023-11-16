const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { validMongoDbId } = require("../utils/validateMongodbID");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailController");
const crypto = require("crypto");
const { log } = require("console");

// Register a new user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        // create new user
        const newUser = await User.create(req.body)
        res.json(newUser);
    } else {
        throw new Error("User already exist")
    }
});

// Login a user
const userLoginCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email: email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser.id, { refreshToken: refreshToken }, { new: true });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000
        });
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error("Invalid Credentials");
    }
});

// Handle Refresh Token 
const handleRefreshToken = asyncHandler(async (req, res) => {
    try {
        const cookie= req.cookies;
        if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
        const refreshToken = cookie.refreshToken;
        // console.log(refreshToken);
        const user = await User.findOne({refreshToken});
        if(!user) throw new Error("Invalid Refresh Token or Not Found");
        // res.json(user);
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if(err || user.id !== decoded.id) throw new Error("There is something wrong with Refresh Token");
            const accessToken = generateToken(user?.id);
            res.json({accessToken});
        })
    } catch (error) {
        throw new Error(error);
    }
});

// Logout Functionality
const logout = asyncHandler(async (req, res) => {
    try {
        const cookie = req.cookies;
        if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({refreshToken});
        if(!user){
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true
            });
            return res.sendStatus(204);  // forbidden
        } else{
            await User.findOneAndUpdate({refreshToken: ""});
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true
            });
        }
        res.sendStatus(204);  // forbidden
    } catch (error) {
        throw new Error(error)
    }
})

//Update a user
const updateUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validMongoDbId(_id);
    try {
        const UpdateUser = await User.findByIdAndUpdate(_id, {
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            mobile: req?.body?.mobile
        }, { new: true });
        res.json(UpdateUser);
    } catch (error) {
        throw new Error(error);
    }
})

// Get all users
const getAllUser = asyncHandler(async (req, res) => {
    try {
        const AllUsers = await User.find();
        res.json(AllUsers);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a single user
const getSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validMongoDbId(id);
    try {
        const GetUser = await User.findById(id);
        res.json(GetUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a user
const deleteSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validMongoDbId(id);
    try {
        const DeleteUser = await User.findByIdAndDelete(id);
        res.json(DeleteUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Block a user
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        res.json({ message: "User Blocked" });
    } catch (error) {
        throw new Error(error)
    }
});

// Block a user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
        res.json({ message: "User UnBlocked" });
    } catch (error) {
        throw new Error(error)
    }
});

// Password Update 
const updatePassword = asyncHandler(async(req, res)=>{
    const {_id} = req.user;
    const {password} = req.body;
    validMongoDbId(_id);
    const user = await User.findById(_id);
    if(password){
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    } else{
        res.json(user)
    }
});

// Forgot password token 
const forgotPasswordToken = asyncHandler(async(req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new Error("User not found with this email")
    try {
        const token = await user.createResetPasswordToken();
        await user.save();
        const resetURL = `Hii, Please follow this link to reset your Password. This link is valid for 10 minutes only. <a href='http://127.0.0.1:5000/api/user/reset-password/${token}'>Click Here</a>`;
        const data = {
            to: email,
            text: "Hey! User",
            subject: "Forgot Password Link",
            html: resetURL,

        };
        sendEmail(data)
        res.json(token);
    } catch (error) {
        throw new Error(error)
    }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const {password} = req.body;
    const {token} = req.params;
    console.log(token)
    const hashedToken = crypto.createHash("sha256").update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if(!user) throw new Error("Token Expired! Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});


module.exports = {
    createUser,
    userLoginCtrl,
    getAllUser,
    getSingleUser,
    deleteSingleUser,
    updateUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword
};