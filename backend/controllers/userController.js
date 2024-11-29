const User = require("../models/User");
const Address = require("../models/Address");
const Notification = require("../models/Notification");
const bcrypt = require("bcrypt");
const { get } = require("mongoose");

const userController = {
  viewUser: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username: username });
      const { password, token, ...others } = user._doc;
      res.status(200).json(others);
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      if (userId === req.params.id || req.user.role === "admin") {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        },
        {new: true});
        const { password, token, ...others } = updatedUser._doc;
        res.status(200).json(others);
      } else {
        return res.status(403).json("You can update only your account!");
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  changePassword: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const currentPassword = req.body.currentPassword;
      const newPassword = req.body.newPassword;
      const confirmPassword = req.body.confirmPassword;

      if (!user) {
        return res.status(404).json("User not found");
      }
      const validPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!validPassword) {
        return res.status(401).json("Current password is not correct");
      }
      if (currentPassword == newPassword) {
        return res
          .status(400)
          .json("The current password must be different from the new password");
      }
      const lengthPassword = newPassword.length;
      if (lengthPassword < 4) {
        return res
          .status(400)
          .json("New password needs to be longer than 4 characters");
      }
      if (newPassword != confirmPassword) {
        return res.status(401).json("New password & confirm password do not match");
      }
      if (validPassword && newPassword == confirmPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);
        await user.updateOne({ password: hashed }, { new: true });
        const { password, token, ...others } = user._doc;
        res
          .status(200)
          .json({ messenger: "Change password successfully", ...others });
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  searchUser: async (req, res) => {
    try {
      const users = await User.find({
        $or: [
          { username: { $regex: req.query.text, $options: "i" } },
          { fullName: { $regex: req.query.text, $options: "i" } }
        ]
      });
      res.status(200).json(users);
    } catch (err) {
      return res.status(500).json(err);
    }
  },
  changeAddress : async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let address = await Address.findOne({ owner: req.user.id });
      if (!address) {
        const newAddress = new Address({
          owner: req.user.id,
          ownerModel: "User",
          location: {
            type: "Point",
            coordinates: [req.body.long, req.body.lat],
          },
          address: req.body.address,
        });
        
        const savedAddress = await newAddress.save();
        return res.status(201).json(savedAddress);
      }
      address = await Address.findByIdAndUpdate(
        address._id,
        {
          location: {
            type: "Point",
            coordinates: [req.body.long, req.body.lat],
          },
          address: req.body.address,
        },
        { new: true }
      );
      return res.status(200).json(address);
    } catch (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }
  },
  findAddress : async (req, res) => {
    try {
      const address = await Address.findOne({ owner: req.user.id });
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      return res.status(200).json(address);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  followUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);
      if (!user.follower.includes(req.user.id)) {
        await user.updateOne({ $push: { follower: req.user.id } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        let notification = await Notification.findOne({ 
          user: user._id, 
          type: "follow", 
          peopleID: { $in: [req.user.id] } 
      });
      if (!notification) {
        const newNotification = new Notification({
          message: `<b>${currentUser.fullName}</b> is following you.`,
          user: user._id,
          peopleID: [req.user.id],
          type: "follow",
        });
        await newNotification.save(req.user.id);
      }
        res.status(200).json();
      } else {
        await user.updateOne({ $pull: { follower: req.user.id } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json(req.user.id);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  getRandomUser: async (req, res) => {
  try {
    const users = await User.aggregate([{ $sample: { size: 5 } }]);
    res.status(200).json(users);
  } catch (err) {
    return res.status(500).json(err);
  }
}

};

module.exports = userController;
