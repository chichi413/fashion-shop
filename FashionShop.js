const mongoose = require("mongoose");

const FashionShopSchema = new mongoose.Schema(
  {
    productCategory: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true, unique: true },
    unitsSold: { type: Number, required: true, min: 0 },
    returns: { type: Number, required: true, min: 0 },
    revenue: { type: Number, required: true, min: 0 },
    customerRating: { type: Number, required: true, min: 0, max: 5 },
    stockLevel: { type: Number, required: true, min: 0 },
    season: { type: String, required: true, trim: true },
    trendScore: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FashionShopData", FashionShopSchema);
