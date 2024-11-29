const Store = require("../models/Store");
const Address = require("../models/Address");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");

const storeController = {
    createStore : async (req, res) => {
        try {
            const owner = await Store.findOne({ owner: req.user.id });
            if(owner) return res.status(400).json({msg: "You already have a store"});
            const newStore = new Store({
                name: req.body.name,
                description: req.body.description,
                owner: req.user.id,
                image: req.body.image,
                classifications: req.body.classifications,
                openingTime: req.body.openingTime,
                closingTime: req.body.closingTime,
            });
            const store = await newStore.save();
            const address = new Address({
                owner: store._id,
                ownerModel: "Store",
                location: {
                    type: "Point",
                    coordinates: [req.body.long, req.body.lat],
                },
                address: req.body.address,
            });
            await address.save();
            return res.status(200).json(store);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
    ,
    getStore : async (req, res) => {
        try {
            const store = await Store.findOne({ owner: req.user.id }).lean();
            if(!store) return res.status(400).json({msg: "Store not found"});
            const address = await Address.findOne({ owner: store._id });
            store.address = address;
            return res.status(200).json(store);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    createCategory : async (req, res) => {
        try {
            const store = await Store.findOne({ owner: req.user.id });
            if(!store) return res.status(400).json({msg: "Store not found"});
            const newCategory = new Category({
                name: req.body.name,
                store: store._id,
                owner: req.user.id,
            });
            const category = await newCategory.save();
            return res.status(200).json(category);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    editCategory : async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if(!category) return res.status(404).json({msg: "Category not found"});
            if(category.owner.toString() !== req.user.id) return res.status(401).json({msg: "Unauthorized"});
            category.name = req.body.name;
            await category.save();
            return res.status(200).json(category);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    deleteCategory : async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if(!category) return res.status(404).json({msg: "Category not found"});
            if(category.owner.toString() !== req.user.id) return res.status(401).json({msg: "Unauthorized"});
            await Product.deleteMany({ category: category._id });
            await Category.findByIdAndDelete(req.params.id);
            return res.status(200).json({msg: "Category deleted"});
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    getCategories : async (req, res) => {
        try {
            const store = await Store.findOne({ owner: req.user.id });
            if(!store) return res.status(400).json({msg: "Store not found"});
            const categories = await Category.find({ store: store._id }).lean();
            for(let i = 0; i < categories.length; i++){
                const products = await Product.aggregate([
                    { 
                      $match: { category: categories[i]._id } 
                    },
                    {
                      $addFields: {
                        mostRecent: { $max: ["$updatedAt", "$createdAt"] }
                      }
                    },
                    {
                      $sort: { mostRecent: -1 }
                    }
                  ]);
                categories[i].products = products;
            }
            return res.status(200).json(categories);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    }
    ,
    createProduct : async (req, res) => {
        try {
            const store = await Store.findOne({ owner: req.user.id });
            if(!store) return res.status(400).json({msg: "Store not found"});
            const newProduct = new Product({
                name: req.body.name,
                price: req.body.price,
                description: req.body.description,
                image: req.body.image,
                category: req.body.category,
                store: store._id,
                owner: req.user.id
            });
            const product = await newProduct.save();
            return res.status(200).json(product);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    editProduct : async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if(!product) return res.status(404).json({msg: "Product not found"});
            if(product.owner.toString() !== req.user.id) return res.status(401).json({msg: "Unauthorized"});
            product.name = req.body.name;
            product.price = req.body.price;
            product.description = req.body.description;
            product.image = req.body.image;
            product.category = req.body.category;
            product.updatedAt = Date.now();
            await product.save();
            return res.status(200).json(product);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    enableProduct : async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if(!product) return res.status(404).json({msg: "Product not found"});
            if(product.owner.toString() !== req.user.id) return res.status(401).json({msg: "Unauthorized"});
            if(product.enable){
                product.enable = false;
            } else {
                product.enable = true;
            }
            await product.save();
            return res.status(200).json(product);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    deleteProduct : async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if(!product) return res.status(404).json({msg: "Product not found"});
            if(product.owner.toString() !== req.user.id) return res.status(401).json({msg: "Unauthorized"});
            await Product.findByIdAndDelete(req.params.id);
            return res.status(200).json({msg: "Product deleted"});
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    getProducts : async (req, res) => {
        try {
            const store = await Store.findOne({ owner: req.user.id });
            if(!store) return res.status(400).json({msg: "Store not found"});
            const products = await Product.find({ store: store._id }).lean();
            return res.status(200).json(products);
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },
    getPendingOrders: async (req, res) => {
        try {
          const store = await Store.findOne({ owner: req.user.id });
          const orders = await Order.find({ store: store._id, status: "pending" })
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
          const store = await Store.findOne({ owner: req.user.id });
          const orders = await Order.find({
            store: store._id,
            status: "shipped",
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
            const store = await Store.findOne({ owner: req.user.id });
          const orders = await Order.find({
            store: store._id,
            status: "delivered"
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
          const store = await Store.findOne({ owner: req.user.id });
          const orders = await Order.find({
            store: store._id,
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

      getDeliveredOrderStatistics: async (req, res) => {
        try {
            const store = await Store.findOne({ owner: req.user.id });
            if (!store) return res.status(400).json({ msg: "Store not found" });

            // Get current date and calculate date range for the past 7 days
            const currentDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
            const sevenDaysAgo = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
            sevenDaysAgo.setDate(currentDate.getDate() - 7);

            // 1. Total Orders Sold (All time)
            const totalOrders = await Order.countDocuments({
                store: store._id,
                status: "delivered"
            });

            // 2. Total Revenue (All time)
            const totalRevenueAllTime = await Order.aggregate([
                {
                    $match: {
                        store: store._id,
                        status: "delivered"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                }
            ]);

            // 3. Revenue in the Last 7 Days
            const revenueLast7Days = await Order.aggregate([
                {
                    $match: {
                        store: store._id,
                        status: "delivered",
                        createdAt: { $gte: sevenDaysAgo, $lte: currentDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPrice" }
                    }
                }
            ]);

            // 4. Calculate total revenue and revenue growth
            const totalRevenue = totalRevenueAllTime[0]?.totalRevenue || 0;
            const totalRevenue7Days = revenueLast7Days[0]?.totalRevenue || 0;

            return res.status(200).json({
                totalOrders: totalOrders,
                totalRevenue: totalRevenue,
                revenueIncreaseLast7Days: totalRevenue7Days,
                revenueGrowth: (totalRevenue > totalRevenue7Days) ? (totalRevenue7Days/(totalRevenue - totalRevenue7Days ) *100).toFixed(2) + "%" : 100 + "%"
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json(error);
        }
    },

    getCustomerStatistics: async (req, res) => {
      try {
          const store = await Store.findOne({ owner: req.user.id });
          if (!store) return res.status(400).json({ msg: "Store not found" });

          // Get current date and calculate date range for the past 7 days
          const currentDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
          const sevenDaysAgo = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
          sevenDaysAgo.setDate(currentDate.getDate() - 7);

          // 1. Total Unique Customers
          const totalUniqueCustomers = await Order.distinct("user", {
              store: store._id,
              status: "delivered"
          });

          // 2. Unique Customers Who Ordered for the First Time This Week
          const newCustomersThisWeek = await Order.aggregate([
              {
                  $match: {
                      store: store._id,
                      status: "delivered",
                      createdAt: { $gte: sevenDaysAgo, $lte: currentDate }
                  }
              },
              {
                  $group: {
                      _id: "$user",
                      firstOrderDate: { $min: "$createdAt" }
                  }
              },
              {
                  $match: {
                      firstOrderDate: { $gte: sevenDaysAgo, $lte: currentDate }
                  }
              }
          ]);

          // 3. Average Time to Complete an Order (from createdAt to updatedAt)
          const avgCompletionTime = await Order.aggregate([
              {
                  $match: {
                      store: store._id,
                      status: "delivered"
                  }
              },
              {
                  $project: {
                      duration: { $subtract: ["$updatedAt", "$createdAt"] }
                  }
              },
              {
                  $group: {
                      _id: null,
                      avgDuration: { $avg: "$duration" }
                  }
              }
          ]);

          // Convert the average duration from milliseconds to a human-readable format (hours)
          const avgTimeInHours = avgCompletionTime[0]?.avgDuration
              ? avgCompletionTime[0].avgDuration / (1000 * 60 * 60)
              : 0;

          return res.status(200).json({
              totalUniqueCustomers: totalUniqueCustomers.length,
              newCustomersThisWeek: newCustomersThisWeek.length,
              rateOfNewCustomers: (totalUniqueCustomers.length > newCustomersThisWeek.length) ? newCustomersThisWeek.length / ((totalUniqueCustomers.length -newCustomersThisWeek.length) * 100).toFixed(2) + "%" : 100 + "%",
              avgTimeToCompleteOrder: avgTimeInHours.toFixed(2)
          });
      } catch (error) {
          console.log(error);
          return res.status(500).json(error);
      }
  },

  getCancelledOrderStatistics: async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user.id });
        if (!store) return res.status(400).json({ msg: "Store not found" });

        // Get current date and calculate date range for the past 7 days
        const currentDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
        const sevenDaysAgo = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        // 1. Total Cancelled Orders (All time)
        const totalCancelledOrders = await Order.countDocuments({
            store: store._id,
            status: "cancelled"
        });

        // 2. Cancelled Orders in the Last 7 Days
        const cancelledOrdersLast7Days = await Order.countDocuments({
            store: store._id,
            status: "cancelled",
            createdAt: { $gte: sevenDaysAgo, $lte: currentDate }
        });

        // 3. Total Orders (All time)
        const totalOrders = await Order.countDocuments({
            store: store._id
        });

        // 4. Calculate Cancellation Rate (All time)
        const cancellationRate = (totalOrders > 0) 
            ? (totalCancelledOrders / totalOrders) * 100 
            : 0;

        // 5. Calculate Cancellation Rate in the Last 7 Days
        const cancellationRateLast7Days = (totalOrders > 0 && cancelledOrdersLast7Days > 0)
            ? (cancelledOrdersLast7Days / totalOrders) * 100
            : 0;

        return res.status(200).json({
            totalCancelledOrders: totalCancelledOrders,
            cancelledOrdersLast7Days: cancelledOrdersLast7Days,
            cancellationRate: cancellationRate.toFixed(2) + "%",
            cancellationRateLast7Days: cancellationRateLast7Days.toFixed(2) + "%"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
},
getBestSellingProducts: async (req, res) => {
  try {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(400).json({ msg: "Store not found" });

      // Find the best-selling products based on the sold count, for this store
      const bestSellingProducts = await Product.find({ store: store._id })
          .select("name sold")  // Select only the product name and sold fields
          .sort({ sold: -1 })  // Sort by sold count in descending order
          .limit(10);  // You can limit the results to a specific number if needed, e.g., top 10

      return res.status(200).json(bestSellingProducts);
  } catch (error) {
      console.log(error);
      return res.status(500).json(error);
  }
},

getTotalRevenueByMonth: async (req, res) => {
  try {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(400).json({ msg: "Store not found" });

      const currentYear = new Date().getFullYear();

      // Aggregate total revenue by month for the current year
      const revenueByMonth = await Order.aggregate([
          {
              $match: {
                  store: store._id,
                  status: "delivered",
                  createdAt: {
                      $gte: new Date(`${currentYear}-01-01`),
                      $lt: new Date(`${currentYear + 1}-01-01`)
                  }
              }
          },
          {
              $group: {
                  _id: { $month: "$createdAt" }, // Group by month
                  totalRevenue: { $sum: "$totalPrice" }
              }
          },
          {
              $sort: { _id: 1 } // Sort by month ascending
          }
      ]);

      // Initialize an array for all 12 months with default revenue = 0
      const months = [
          { month: "January", totalRevenue: 0 },
          { month: "February", totalRevenue: 0 },
          { month: "March", totalRevenue: 0 },
          { month: "April", totalRevenue: 0 },
          { month: "May", totalRevenue: 0 },
          { month: "June", totalRevenue: 0 },
          { month: "July", totalRevenue: 0 },
          { month: "August", totalRevenue: 0 },
          { month: "September", totalRevenue: 0 },
          { month: "October", totalRevenue: 0 },
          { month: "November", totalRevenue: 0 },
          { month: "December", totalRevenue: 0 }
      ];

      // Fill in the totalRevenue for each month if it exists in the aggregation result
      revenueByMonth.forEach(item => {
          months[item._id - 1].totalRevenue = item.totalRevenue;
      });

      return res.status(200).json(months);
  } catch (error) {
      console.log(error);
      return res.status(500).json(error);
  }
}
,
getTotalRevenueLast30Days: async (req, res) => {
  try {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(400).json({ msg: "Store not found" });

      const currentDate = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
      // Normalize the time to 00:00:00 for consistency in comparison
      currentDate.setHours(0, 0, 0, 0);

      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(currentDate.getDate() - 29); // Adjust to include today (total of 30 days)

      // Aggregate total revenue for each day in the last 30 days
      const revenueLast30Days = await Order.aggregate([
          {
              $match: {
                  store: store._id,
                  status: "delivered",
                  createdAt: { $gte: thirtyDaysAgo, $lte: currentDate }
              }
          },
          {
              $group: {
                  _id: {
                      $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } // Group by day
                  },
                  totalRevenue: { $sum: "$totalPrice" }
              }
          },
          {
              $sort: { _id: 1 } // Sort by date ascending
          }
      ]);

      // Initialize an array for the last 30 days with default revenue = 0
      const revenuePerDay = [];
      let currentDay = new Date(thirtyDaysAgo);

      // Loop through the last 30 days
      for (let i = 0; i < 30; i++) {
          const isoDate = currentDay.toISOString().split("T")[0]; // Format the date as YYYY-MM-DD
          revenuePerDay.push({ date: isoDate, totalRevenue: 0 });
          currentDay.setDate(currentDay.getDate() + 1); // Move to the next day
      }

      // Fill in the revenue for each day if it exists in the aggregation result
      revenueLast30Days.forEach(item => {
          const index = revenuePerDay.findIndex(day => day.date === item._id);
          if (index !== -1) {
              revenuePerDay[index].totalRevenue = item.totalRevenue;
          }
      });

      return res.status(200).json(revenuePerDay);
  } catch (error) {
      console.log(error);
      return res.status(500).json(error);
  }
},


getTotalRevenueLast7Days: async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user.id });
        if (!store) return res.status(400).json({ msg: "Store not found" });
  
        // Get current date in Asia/Ho_Chi_Minh timezone and set time to midnight
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set currentDate to midnight
  
        const vietnamTzOffset = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh timezone offset (7 hours ahead of UTC)
        const adjustedCurrentDate = new Date(currentDate.getTime() + vietnamTzOffset); // Adjust currentDate to Asia/Ho_Chi_Minh
  
        // Get the date 6 days ago to complete 7 days (today + last 6 days)
        const sevenDaysAgo = new Date(adjustedCurrentDate);
        sevenDaysAgo.setDate(adjustedCurrentDate.getDate() - 6); // Get the start of the period (7 days ago)
  
        // Aggregate total revenue for each day in the last 7 days
        const revenueLast7Days = await Order.aggregate([
            {
                $match: {
                    store: store._id,
                    status: "delivered",
                    createdAt: { $gte: sevenDaysAgo, $lte: adjustedCurrentDate } // Between 7 days ago and today
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Ho_Chi_Minh" } // Group by day in Vietnam timezone
                    },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            {
                $sort: { _id: 1 } // Sort by date ascending
            }
        ]);
  
        // Initialize an array for the days of the week (starting from today, going back 7 days)
        const daysOfWeek = [];
        let currentDay = new Date(adjustedCurrentDate);
  
        for (let i = 0; i < 7; i++) {
            const isoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(currentDay); // ISO format in Vietnam timezone
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(currentDay);
            daysOfWeek.unshift({ day: dayName, date: isoDate, totalRevenue: 0 });
            currentDay.setDate(currentDay.getDate() - 1); // Go back one day
        }
  
        // Fill in the totalRevenue for each day
        revenueLast7Days.forEach(item => {
            const dayIndex = daysOfWeek.findIndex(day => day.date === item._id);
            if (dayIndex !== -1) {
                daysOfWeek[dayIndex].totalRevenue = item.totalRevenue;
            }
        });
  
        return res.status(200).json(daysOfWeek);
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
  },
  



getTodayOrdersAndRevenue: async (req, res) => {
  try {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(400).json({ msg: "Store not found" });

      const today = new Date(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }).format());
      today.setHours(0, 0, 0, 0); // Set time to the start of the day

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // Set the time to the start of tomorrow

      // Aggregate total orders and revenue for today
      const todayOrdersAndRevenue = await Order.aggregate([
          {
              $match: {
                  store: store._id,
                  status: "delivered", // Only count delivered orders
                  createdAt: { $gte: today, $lt: tomorrow } // Filter orders for today
              }
          },
          {
              $group: {
                  _id: null, // Group all orders for today
                  totalOrders: { $sum: 1 }, // Count the number of orders
                  totalRevenue: { $sum: "$totalPrice" } // Sum the total revenue
              }
          }
      ]);

      // Handle case where there are no orders today
      const result = {
          totalOrders: todayOrdersAndRevenue[0]?.totalOrders || 0,
          totalRevenue: todayOrdersAndRevenue[0]?.totalRevenue || 0
      };

      return res.status(200).json(result);
  } catch (error) {
      console.log(error);
      return res.status(500).json(error);
  }
},
searchProduct: async (req, res) => {
    try {
      const products = await Product.find({
        enable:true, name: { $regex: req.query.text, $options: "i" },
      }).sort({ sold: -1 });
      res.status(200).json(products);
    } catch (err) {
      return res.status(500).json(err);
    }
},

searchStore: async (req, res) => {
    try {
      const store = await Store.find({
         name: { $regex: req.query.text, $options: "i" },
      }).sort({ createdAt: -1 });
      res.status(200).json(store);
    } catch (err) {
      return res.status(500).json(err);
    }
},


confirmationStore: async (req, res) => {
    try {
      const store = await Store.find({verified: false,
      }).sort({ createdAt: -1 }).populate("owner", "fullName");
      res.status(200).json(store);
    } catch (err) {
      return res.status(500).json(err);
    }
},

verifyStore: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ msg: "Store not found" });
      store.verified = true;
      await store.save();
      return res.status(200).json(store);
    } catch (err) {
      return res.status(500).json(err);
    }
}






      

      

}

module.exports = storeController;