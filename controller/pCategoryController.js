const Category = require("../models/pCategoryModel")
const asyncHandler = require("express-async-handler")
const { validMongoDbId } = require("../utils/validateMongodbID");

// create new category
const createCategory = asyncHandler(async(req, res)=>{
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory)
    } catch (error) {
        throw new Error(error);
    }
});

// update category
const updateCategory = asyncHandler(async(req, res)=>{
    const {id}=req.params;
    validMongoDbId(id);
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updatedCategory)
    } catch (error) {
        throw new Error(error);
    }
});

// delete category
const deleteCategory = asyncHandler(async(req, res)=>{
    const {id}=req.params;
    validMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        res.json(deletedCategory)
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch a category
const getCategory = asyncHandler(async(req, res)=>{
    const {id}=req.params;
    validMongoDbId(id);
    try {
        const getaCategory = await Category.findById(id);
        res.json(getaCategory)
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch all category
const getAllCategory = asyncHandler(async(req, res)=>{
    try {
        const getallCategory = await Category.find();
        res.json(getallCategory)
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getAllCategory
};