const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

// Express modules
const express = require("express");
const app = express();
// Port for Heroku and local
const port = process.env.PORT || 3004;
// Database modules, and parsing
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// For database access
require("dotenv").config();

// JSON parse output
app.use(bodyParser.json());

// CORS access unrestricted
const cors = require("cors");
app.use(cors());

// Importing routes
const diseaseNodeRoute = require("./routes/diseaseNode");
var AuthController = require('./auth/auth_controller');
var UserController = require('./user/user_controller');

// Set Log file
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
    flags: "a",
});
// Logs to a file
app.use(morgan("short", { stream: accessLogStream }));

// Logs to stdout
app.use(morgan("dev"));

// Route Middleware
app.use("/disease", diseaseNodeRoute);
app.use('/auth', AuthController);
app.use('/users', UserController);

// Connect to mongoDB
mongoose.connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("Connected to DB!")
);
// throw an error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    // we're connected!
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});