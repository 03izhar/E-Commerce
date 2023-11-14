const express = require("express");
const { 
    createUser, 
    userLoginCtrl, 
    getAllUser,
    getSingleUser,
    deleteSingleUser,
    updateUser
} = require("../controller/userController");
const { 
    authMiddleware,
    isAdmin
} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);

router.get('/login', userLoginCtrl);

router.get('/all-users', getAllUser);

router.get('/:id', authMiddleware, getSingleUser);

router.delete('/:id', deleteSingleUser);

router.put('/:id', updateUser);



module.exports = router;