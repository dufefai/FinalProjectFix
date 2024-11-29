const cron = require("node-cron");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address");
const Notification = require("../models/Notification");

const tasks = {};

const scheduleAutoConfirm = (orderId) => {
  const task = cron.schedule(
    "0 * * * *",
    async () => {
      const order = await Order.findById(orderId);
      if (order && order.status === "delivered" && !order.sellerConfirmed) {
        await Order.findByIdAndUpdate(orderId, { sellerConfirmed: true });
        for (const product of order.items) {
          await Product.findByIdAndUpdate(product.id, {
            $inc: { sold: product.quantity },
          });
        }
        task.stop();
        delete tasks[orderId];
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
    }
  );

  task.start();
  tasks[orderId] = task;
};

const orderController = {
  createOrder: async (req, res) => {
    try {
      const newOrder = new Order({
        user: req.user.id,
        store: req.body.store,
        items: req.body.items,
        totalPrice: req.body.totalPrice,
        fullName: req.body.fullName,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        address: req.body.address,
        isPaid: req.body.isPaid,
      });
      await newOrder.save();

      const newNotification = new Notification({
        message: `Your order has been created, click here to view details.`,
        user: req.user.id,
        order: newOrder._id,
        type: "order",
        updatedAt: Date.now(),
      });
      await newNotification.save();

      return res.status(200).json(newOrder);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getPendingOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user.id, status: "pending" })
        .populate("store")
        .lean()
        .sort({ updatedAt: -1 });
      return res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getShippedOrders: async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user.id,
        sellerConfirmed: false,
        $or: [{ status: "shipped" }, { status: "delivered" }],
      })
        .populate("store")
        .lean()
        .sort({ updatedAt: -1 });
      return res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getDeliveredOrders: async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user.id,
        status: "delivered",
        sellerConfirmed: true,
      })
        .populate("store")
        .lean()
        .sort({ updatedAt: -1 });
      return res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getCancelledOrders: async (req, res) => {
    try {
      const orders = await Order.find({
        user: req.user.id,
        status: "cancelled",
      })
        .populate("store")
        .lean()
        .sort({ updatedAt: -1 });
      return res.status(200).json(orders);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  cancelOrder: async (req, res) => {
    try {
      await Order.findByIdAndUpdate(req.params.id, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      await Notification.findOneAndUpdate({order: req.params.id}, {
        message: "Your order has been cancelled.",
        updatedAt: Date.now(),
      });
      return res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  changeStatus: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
          updatedAt: new Date(
            new Intl.DateTimeFormat("en-US", {
              timeZone: "Asia/Ho_Chi_Minh",
            }).format()
          ),
        },
        { new: true }
      );
      if (req.body.status === "shipped") {
        await Notification.findOneAndUpdate({order: req.params.id}, {
          message: "Your order is on its way to you.",
          updatedAt: Date.now(),
        });
      } else if (req.body.status === "delivered") {
        await Notification.findOneAndUpdate({order: req.params.id}, {
          message: "Your order has been delivered.",
          updatedAt: Date.now(),
        });
      }

      if (req.body.status === "delivered" && !order.sellerConfirmed) {
        scheduleAutoConfirm(order._id);
      }
      return res.status(200).json(order);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  confirmOrder: async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          sellerConfirmed: true,
          updatedAt: new Date(
            new Intl.DateTimeFormat("en-US", {
              timeZone: "Asia/Ho_Chi_Minh",
            }).format()
          ),
        },
        { new: true }
      );
      for (const product of order.items) {
        await Product.findByIdAndUpdate(product.id, {
          $inc: { sold: product.quantity },
        });
      }
      if (tasks[req.params.id]) {
        tasks[req.params.id].stop();
        delete tasks[req.params.id];
      }
      return res.status(200).json(order);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },

  getOrderdetails: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("store")
        .lean();
      const address = await Address.findOne({
        owner: order.store,
        ownerModel: "Store",
      });
      order.store.address = address;
      return res.status(200).json(order);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
};

module.exports = orderController;
