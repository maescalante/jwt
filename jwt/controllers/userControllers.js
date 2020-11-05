var asyncHandler = require("express-async-handler");
var User = require("../models/userModel.js");
let jwt = require("jsonwebtoken");
let config = require("../config");
const { use } = require("../routes/index.js");

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    let token = jwt.sign({ email }, config.secret, {
      expiresIn: "24h",
    });
    res.send({
      success: true,
      message: "Autenticado!",
      token: token,
    });
  } else {
    res.status(401);
    res.send("Clave o email incorrecto");
    throw new Error("Email o clave invalida");
  }
  res.send({ email, password });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.decoded.email });

  if (user) {
    res.send({
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    res.send("User not found");
    throw new Error("User not Found");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.decoded.email });
  console.log(user.role);
  if (user.role === "admin" || user.role === "dbAdmin") {
    const users = await User.find();
    res.send(users);
  } else {
    res.status(401);
    res.send("Unauthorized");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const userActual = await User.findOne({ email: req.decoded.email });

  if (userActual.role === "admin") {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      let token = jwt.sign({ email }, config.secret, {
        expiresIn: "24h",
      });
      res.status(201).send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } else {
    res.status(401);
    res.send("Unauthorized");
  }
});
module.exports = { authUser, getUserProfile, getAllUsers, registerUser };
