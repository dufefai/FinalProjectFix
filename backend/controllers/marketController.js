const Store = require("../models/Store");
const Address = require("../models/Address");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");


const marketController = {
  storeRecommendation: async (req, res) => {
    try {
      const userAddress = await Address.findOne({
        owner: req.user.id,
        ownerModel: "User",
      });
      if (!userAddress) {
        return res.status(404).json({ message: "User address not found" });
      }
      let storesNearby = await Address.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: userAddress.location.coordinates,
            },
            distanceField: "distance",
            maxDistance: 10000,
            spherical: true,
            query: { ownerModel: "Store" },
          },
        },
      ]);

      const storeIds = storesNearby.map((store) => store.owner);
      let stores = await Store.find({ _id: { $in: storeIds } });
      const now = new Date();
      const currentTime = `${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

      stores = stores.filter((store) => {
        return (
          store.openingTime <= currentTime && store.closingTime >= currentTime
        );
      });
      const topRatedStores = [...stores]
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 3);
      const randomStores = [...stores]
        .filter((store) => store.verified)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
      const combinedStores = [
        ...topRatedStores,
        ...randomStores,
      ];
      const uniqueStores = combinedStores.filter(
        (store, index, self) =>
          index === self.findIndex((s) => s._id.toString() === store._id.toString())
      );

      const storesWithAddressAndDistance = await Promise.all(
        uniqueStores.map(async (store) => {
          const storeAddress = storesNearby.find((address) =>
            address.owner.equals(store._id)
          );
          return {
            ...store._doc,
            address: storeAddress ? storeAddress.address : null,
            distance: storeAddress ? storeAddress.distance : null,
          };
        })
      );
      return res.status(200).json(storesWithAddressAndDistance);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getStoreDetail : async (req, res) => {
    try {
      const store = await Store.findById(req.params.id).lean();
      if(!store) return res.status(400).json({msg: "Store not found"});
      const address = await Address.findOne({ owner: store._id });
      store.address = address;
      return res.status(200).json(store);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getProduct: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
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
  },

  reviewStore: async (req, res) => {
    try {
      const store = await Store.findById(req.body.store);
      if (!store) return res.status(400).json({ msg: "Store not found" });
      
      const order = await Order.findById(req.body.order);
      if(!order) return res.status(400).json({msg: "Order not found"});
      if(order.user.toString() !== req.user.id) return res.status(401).json({msg: "Unauthorized"});
      if(order.reviewed) return res.status(400).json({msg: "Order already reviewed"});
      const review = {
        user: req.user.id,
        rate: req.body.rate,
        comment: req.body.comment,
        order: req.body.order,
        rateImage: req.body.image,
      };
      store.reviews.push(review);

      const totalReviews = store.reviews.length;
      const currentRate = parseFloat(store.rate) || 0;
      const newRate = parseFloat(req.body.rate); 
      const updatedRate = ((currentRate * (totalReviews - 1) + newRate) / totalReviews).toFixed(2);
      store.rate = updatedRate;
  
      await store.save();

      const updatedOrder = await Order.findByIdAndUpdate(req.body.order, { reviewed: true }, { new: true });
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getStoreReviews: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(400).json({ msg: "Store not found" });
      
      const reviews = await Promise.all(
        store.reviews.map(async (review) => {
          const order = await Order.findById(review.order).lean();
          const user = await User.findById(review.user).lean();
          const { fullName, avatar, ...others} = user;
  
          return {
            ...review.toObject(),
            order: order.items,
            user: {fullName, avatar},
          };
        })
      );
      
      return res.status(200).json(reviews);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  searchStore : async (req, res) => {
    try {
      const { text } = req.query;
  
      const userAddress = await Address.findOne({
        owner: req.user.id,
        ownerModel: "User",
      });
  
      if (!userAddress) {
        return res.status(404).json({ message: "User address not found" });
      }
  
      let storesNearby = await Address.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: userAddress.location.coordinates,
            },
            distanceField: "distance",
            maxDistance: 10000, // 10km radius
            spherical: true,
            query: { ownerModel: "Store" },
          },
        },
      ]);
  
      if (storesNearby.length === 0) {
        return res.status(404).json({ message: "No stores found within 10km" });
      }
      const storeIds = storesNearby.map((store) => store.owner);
  
      let stores = await Store.find({
        _id: { $in: storeIds },
        $or: [
          { name: { $regex: text, $options: "i" } },
          { classifications: { $regex: text, $options: "i" } },
        ],
      });
  
      const now = new Date();
      const currentTime = `${now
        .getHours()
        .toString()
        .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  
      stores = stores.filter((store) => {
        return store.openingTime <= currentTime && store.closingTime >= currentTime;
      });
  
      const storesWithAddressAndDistance = stores.map((store) => {
        const storeAddress = storesNearby.find((address) =>
          address.owner.equals(store._id)
        );
        return {
          ...store._doc,
          address: storeAddress ? storeAddress.address : null,
          distance: storeAddress ? storeAddress.distance : null,
        };
      });
  
      return res.status(200).json(storesWithAddressAndDistance);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
  
  
  
  
};


module.exports = marketController;
