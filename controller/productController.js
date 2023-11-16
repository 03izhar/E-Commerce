const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify")

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
})


module.exports = {
    createProduct,
    getSingleProduct,
    getAllProduct,
    updateProduct,
    deleteSingleProduct
}