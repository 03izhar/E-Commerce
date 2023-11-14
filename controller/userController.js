const User = require("../models/userModel")
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken")

// Register a new user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({email: email});
    if(!findUser){
        // create new user
        const newUser = await User.create(req.body)
        res.json(newUser);
    } else{
        throw new Error("User already exist")
    }
});

// Login a user
const userLoginCtrl = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email: email});
    if(findUser &&  await findUser.isPasswordMatched(password)){
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else{
        throw new Error("Invalid Credentials");
    }
});

//Update a user
const updateUser = asyncHandler(async(req,res) => {
    try {
        const UpdateUser = await User.findByIdAndUpdate(req.params.id, {
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
const getSingleUser = asyncHandler(async(req, res) => {
    try {
        const GetUser = await User.findById(req.params.id);
        res.json(GetUser);
    } catch (error) {
        throw new Error(error);
    }
});

// Delete a user
const deleteSingleUser = asyncHandler(async(req, res) => {
    try {
        const DeleteUser = await User.findByIdAndDelete(req.params.id);
        res.json(DeleteUser);
    } catch (error) {
        throw new Error(error);
    }
});


module.exports = {
    createUser,
    userLoginCtrl,
    getAllUser,
    getSingleUser,
    deleteSingleUser,
    updateUser
};