const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/userModel");

// Create a new product 
const createProduct = asyncHandler(async(req,res) => {
    try {
        if(req.body.title){
            req.body.slug = slugify(req.body.title, {lower: true});
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct)
    } catch (error) {
        throw new error(error);
    }
});

// Update a Product
const updateProduct = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try {
        if(req.body.title){
            req.body.slug = slugify(req.body.title, {lower: true});
        }
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updateProduct);
    } catch (error) {
        throw new Error(error)
    }
})

// Delete a Product
const deleteSingleProduct = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try {
        const deleteProduct = await Product.findByIdAndDelete(id)
        res.json(deleteProduct);
    } catch (error) {
        throw new Error(error)
    }
})

// Get a single product 
const getSingleProduct = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct)
    } catch (error) {
        throw new error(error);
    }
});

// Get all products 
const getAllProduct = asyncHandler(async(req,res)=>{
    try {
        // Filtering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el)=> delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        
        let query = Product.find(JSON.parse(queryStr));

        // Sorting
        if(req.query.sort){
            const sort = req.query.sort.split(",").join(" ");
            query = query.sort(sort);
        } else{
            query.sort("-createdAt");
        }

        // Limiting the fields
        if(req.query.fields){
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else{
            query = query.select('-__v');
        }

        // Pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This page does not exist");
        }
        

        const product = await query
        res.json(product);
    } catch (error) {
        throw new Error(error);
    }
});

// Add product to wishlist
const addToWishlist = asyncHandler(async(req,res)=>{
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
        if(alreadyAdded){
            let user = await User.findByIdAndUpdate(_id, {
                $pull: {wishlist: prodId}
            }, {new: true})
            res.json(user);
        }
        else{
            let user = await User.findByIdAndUpdate(_id, {
                $push: {wishlist: prodId}
            }, {new: true})
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async(req, res)=>{
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedBy.toString() === _id.toString()
        );
        if(alreadyRated){
            const updateRating = await Product.updateOne(
                { ratings: {$elemMatch: alreadyRated} },
                { $set: {"ratings.$.star": star, "ratings.$.comment": comment}},
                {new: true}
            )
            // res.json(updateRating);
        } else{
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    ratings :{
                        star: star,
                        comment: comment,
                        postedBy: _id,
                    },
                },
            }, {new: true});
            // res.json(rateProduct);
        }

        const getAllRatings = await Product.findById(prodId);
        let totalRating = getAllRatings.ratings.length;
        let ratingSum = getAllRatings.ratings
        .map((item) => item.star)
        .reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingSum/totalRating);
        let finalRating = await Product.findByIdAndUpdate(prodId, {
            totalRating: actualRating
        });
        res.json(finalRating)
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {
    createProduct,
    getSingleProduct,
    getAllProduct,
    updateProduct,
    deleteSingleProduct,
    addToWishlist,
    rating
}