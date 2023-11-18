const Brand = require("../models/brandModel")
const asyncHandler = require("express-async-handler")
const { validMongoDbId } = require("../utils/validateMongodbID");

// create new Brand
const createBrand = asyncHandler(async(req, res)=>{
    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand)
    } catch (error) {
        throw new Error(error);
    }
});

// update Brand
const updateBrand = asyncHandler(async(req, res)=>{
    const {id}=req.params;
    validMongoDbId(id);
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {new:true});
        res.json(updatedBrand)
    } catch (error) {
        throw new Error(error);
    }
});

// delete Brand
const deleteBrand = asyncHandler(async(req, res)=>{
    const {id}=req.params;
    validMongoDbId(id);
    try {
        const deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand)
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch a Brand
const getBrand = asyncHandler(async(req, res)=>{
    const {id}=req.params;
    validMongoDbId(id);
    try {
        const getBrand = await Brand.findById(id);
        res.json(getBrand)
    } catch (error) {
        throw new Error(error);
    }
});

// Fetch all Brand
const getAllBrand = asyncHandler(async(req, res)=>{
    try {
        const getAllBrand = await Brand.find();
        res.json(getAllBrand)
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getBrand,
    getAllBrand
};