const express = require('express');
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config()
const authRoute = require("./routes/auth");
const courseRoute = require("./routes/course-route");
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");



mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
      console.log("Mongo Altas DB connected");
  }).catch((err) => {
    console.log(err);
  })

  // middleware
  app.use(express.json());
  app.use(express
    .urlencoded({ extended: true }));

  // cors
  app.use(cors());
  app.use("/api/user", authRoute);
  app.use("/api", passport.authenticate("jwt", { session: false }), courseRoute);// protect course route
  app.use("/api/courses", courseRoute);

  app.listen(8080, () => {
    console.log("server is running on port 8080");
  });