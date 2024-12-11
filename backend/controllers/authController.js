const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      fullName: user.fullName,
    },
    process.env.ACCESS_KEY,
    { expiresIn: "5h" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      fullName: user.fullName,
    },
    process.env.REFRESH_KEY,
    { expiresIn: "36500d" }
  );
}

const authController = {
  register: async (req, res) => {
    try {
      const username = req.body.username;
      if (username.length < 5 || !username.match(/^\S+$/)) {
        return res
          .status(400)
          .json(
            "Username must be longer than 4 characters and not contain spaces"
          );
      }
      // Check if username already exists
      const existedUsername = await User.findOne({ username: username });
      if (existedUsername) {
        return res.status(400).json("The username has been registered");
      }
      // Validate email format
      const email = req.body.email;
      if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.status(400).json("Invalid email format");
      }
      // Check if email already exists
      const existedEmail = await User.findOne({ email: email });
      if (existedEmail) {
        return res.status(400).json("The email has been registered");
      }
      var password = req.body.password;
      if (password.length < 6) {
        return res
          .status(400)
          .send("Password must be longer than 5 characters");
      }
      if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)) {
        return res
          .status(400)
          .json(
            "Password must include at least one uppercase letter, one number, and one special character"
          );
      }
      //hash password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });
      const user = await newUser.save();
      const refreshToken = generateRefreshToken(user);
      await User.findByIdAndUpdate(user._id, { token: refreshToken });
      var { password, token, ...others } = user._doc;
      return res.status(200).json(others);
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  login: async (req, res) => {
    try {
      let user = await User.findOne({ username: req.body.email });
      if (!user) {
        user = await User.findOne({ email: req.body.email });
        if (!user) {
          return res.status(404).json("Incorrect username or password.");
        }
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Incorrect username or password.");
      }
      if (user && validPassword) {
        const accessToken = generateAccessToken(user);
        res.cookie("refreshToken", user.token, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, token, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken});
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  googleLogin: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const accessToken = generateAccessToken(user);
        res.cookie("refreshToken", user.token, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, token, ...others } = user._doc;
        return res.status(200).json({ ...others, accessToken });
      } else {
        const generatedPassword =
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8);
        const hashedPassword = bcrypt.hashSync(generatedPassword, 10);
        const newUser = new User({
          username:
            req.body.name.split(" ").join("").toLowerCase() +
            Math.random().toString(36).slice(-8),
          email: req.body.email,
          password: hashedPassword,
          avatar: req.body.photo,
        });
        const userGoogle = await newUser.save();
        const refreshToken = generateRefreshToken(userGoogle);
        await User.findByIdAndUpdate(userGoogle._id, { token: refreshToken });
        const accessToken = generateAccessToken(userGoogle);
        res.cookie("refreshToken", refreshToken, {
          maxAge: 365 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, token, ...others } = userGoogle._doc;
        return res.status(200).json({ ...others, accessToken });
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  },

  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    try {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_KEY,
        async (err, decoded) => {
          if (err) {
            return res.status(403).json("Refresh token is not valid");
          }
          const newAccessToken = generateAccessToken(decoded);
          res.status(200).json({
            accessToken: newAccessToken
          });
        }
      );
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  logout: async (req, res) => {
    res.clearCookie("refreshToken");
    res.status(200).json("Logged out successfully!");
  },
};

module.exports = { authController, generateAccessToken, generateRefreshToken };
