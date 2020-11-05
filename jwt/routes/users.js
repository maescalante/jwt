var express = require("express");
const router = express.Router();
var middleware = require("../middleware.js");
var {
  authUser,
  getUserProfile,
  getAllUsers,
  registerUser,
} = require("../controllers/userControllers.js");

router.post("/login", authUser);

router.route("/profile").get(middleware.checkToken, getUserProfile);

router.route("/").get(middleware.checkToken, getAllUsers);

router.route("/register").post(middleware.checkToken, registerUser);
module.exports = router;
