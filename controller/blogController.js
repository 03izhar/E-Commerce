const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { validMongoDbId } = require("../utils/validateMongodbID");

// Create Blog
const createBlog = asyncHandler(async(req,res)=>{
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Update Blog
const updateBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validMongoDbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updateBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get a Blog
const getSingleBlog = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validMongoDbId(id);
    try {
        const getSingleBlog = await Blog.findById(id).populate("likes").populate("dislikes");
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            {$inc: {numViews: 1}},
            {new:true}
        );
        res.json(getSingleBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Get all blog
const getAllBlog = asyncHandler(async(req, res)=>{
    try {
        const getAllBlog = await Blog.find();
        res.json(getAllBlog);
    } catch (error) {
        throw new Error(error);
    }
})

// Delete blog
const deleteBlog = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    validMongoDbId(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    } catch (error) {
        throw new Error(error);
    }
});

// Like a blog
const likeBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.body;
    validMongoDbId(blogId);
    // Find the blog which you want to like
    const blog = await Blog.findById(blogId);
    // Find the login user
    const loginUserId = req?.user?._id;
    // Find if the user has liked the post
    const isLiked = blog?.isLiked;
    // Find if the user has disliked the post
    const alreadyDisliked = blog?.dislikes?.find(
        (userId => userId?.toString() === loginUserId?.toString())
    );
    if(alreadyDisliked){
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {dislikes: loginUserId},
            isDisliked: false
        }, {new: true});
        res.json(blog); 
    }
    if(isLiked){
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {likes: loginUserId},
            isLiked: false
        }, {new: true});
        res.json(blog);
    }
    else{
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: {likes: loginUserId},
            isLiked: true
        }, {new: true});
        res.json(blog);
    }
});

// dislike a blog
const dislikeBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.body;
    validMongoDbId(blogId);
    // Find the blog which you want to like
    const blog = await Blog.findById(blogId);
    // Find the login user
    const loginUserId = req?.user?._id;
    // Find if the user has liked the post
    const isDisLiked = blog?.isDisliked;
    // Find if the user has disliked the post
    const alreadyLiked = blog?.likes?.find(
        (userId => userId?.toString() === loginUserId?.toString())
    );
    if(alreadyLiked){
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {likes: loginUserId},
            isLiked: false
        }, {new: true});
        res.json(blog); 
    }
    if(isDisLiked){
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: {dislikes: loginUserId},
            isDisliked: false
        }, {new: true});
        res.json(blog);
    }
    else{
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: {dislikes: loginUserId},
            isDisliked: true
        }, {new: true});
        res.json(blog);
    }
});


module.exports = {
    createBlog,
    updateBlog,
    getSingleBlog,
    getAllBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog
};