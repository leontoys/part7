const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const loginRouter = require("express").Router();
const User = require("../models/user");

//when we do a post via the login router
loginRouter.post("/", async (request, response) => {
  //get the user name and password
  const { username, password } = request.body;
  //find the user from db
  const user = await User.findOne({ username });
  //if user exists encrypt and compare password
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);
  console.log("is password correct?",passwordCorrect)
  //if anything goes wrong, raise it
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }
  console.log("---valid---user---")
  //create a user object for token generation
  const userForToken = {
    username: user.username,
    id: user._id,
  };
  //create a token
  console.log("secret", process.env.SECRET);
  const token = jwt.sign(userForToken, process.env.SECRET);
  //in the response send the token to the client
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
