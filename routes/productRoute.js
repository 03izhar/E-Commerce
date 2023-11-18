const express = require("express");
const { 
    createProduct,
    getSingleProduct,
    getAllProduct,
    updateProduct,
    deleteSingleProduct,
    addToWishlist,
    rating,
    uploadImages
} = require("../controller/productController");
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, prodImgResize } = require("../middlewares/uploadImages");
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createProduct);

router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array("images", 10), prodImgResize, uploadImages);

router.get('/:id', getSingleProduct);

router.put('/wishlist',authMiddleware, addToWishlist);

router.put('/rating',authMiddleware, rating);

router.put('/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/:id', authMiddleware, isAdmin, deleteSingleProduct);

router.get('/', getAllProduct);

module.exports = router;