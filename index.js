const express = require('express');
const bodyParser = require("body-parser")
const dbConnect = require('./config/dbConnect');
const app = express();
const dotenv = require('dotenv').config()
const PORT = 6000;

const authRouter = require("./routes/authRoute");
const ProductRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const pCategoryRouter = require("./routes/pCategoryRoute");
const bCategoryRouter = require("./routes/bCategoryRoute");
const brandRouter = require("./routes/brandRoute");
const couponRouter = require("./routes/couponRoute");

const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");

dbConnect();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api/user', authRouter);
app.use('/api/product', ProductRouter);
app.use('/api/blog', blogRouter);
app.use('/api/category', pCategoryRouter);
app.use('/api/blogCategory', bCategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/coupon', couponRouter);

app.use(notFound);
app.use(errorHandler);


app.listen(PORT, ( ) => {
    console.log(`Server running on port ${PORT}`)
});