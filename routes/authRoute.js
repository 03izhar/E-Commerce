const express = require("express");
const { 
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
    resetPassword,
    adminLogin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require("../controller/userController");
const { 
    authMiddleware,
    isAdmin
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);

router.put('/reset-password/:token', resetPassword);
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/password', authMiddleware, updatePassword);

router.post('/login', userLoginCtrl);
router.post('/admin-login', adminLogin);
router.post('/cart',authMiddleware, userCart);
router.post('/cart/apply-coupon', authMiddleware, applyCoupon);
router.post('/cart/cash-order', authMiddleware, createOrder)

router.get('/all-users', getAllUser);
router.get('/all-orders', authMiddleware, getOrders);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/:id', authMiddleware, isAdmin, getSingleUser);

router.delete('/empty-cart', authMiddleware, emptyCart);
router.delete('/:id', deleteSingleUser);

router.put('/edit-user', authMiddleware, updateUser);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);



module.exports = router;