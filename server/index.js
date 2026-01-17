const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();

app.use(express.json());
app.use(cors());


const db = require("./models");


const schedulesRouter = require("./router/Schedules");
const usersRouter = require("./router/Users");
const menuRouter = require("./router/Menu");
const cartsRouter = require("./router/Carts");
const ordersRouter = require("./router/Orders");
const scanMoodRouter = require("./router/ScanMood");
const menuByMoodRouter = require("./router/MenuByMood");
const recommendationRouter = require("./router/Recommendation");
const adminRouter = require("./router/Admin");
const adminCartsRouter = require("./router/AdminCarts");
const transactionsRouter = require("./router/Transactions");
const uploadImagesRouter = require("./router/UploadImages");

app.use("/api/schedules", schedulesRouter);
app.use("/api/users", usersRouter);
app.use("/api/menu", menuRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/scan-mood", scanMoodRouter);
app.use("/api/menu-by-mood", menuByMoodRouter);
app.use("/api/recommendation", recommendationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin-carts", adminCartsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/upload-images", uploadImagesRouter);


// Static files.
app.use('/api/assets/images/products', express.static('uploads/products'));

const port = process.env.SERVER_PORT || 3001;
db.sequelize.sync().then(() =>
{
    app.listen(port, () =>
    {
        console.log("run port 3001");
    });
});