const express = require("express");
const router = express.Router();
const FashionShopData = require("../models/FashionShop");

// 1.5 Add
router.post("/add", async (req, res) => {
  try {
    const doc = await FashionShopData.create(req.body);
    res.status(201).json({ message: "Inserted ✅", data: doc });
  } catch (e) {
    res.status(400).json({ message: "Insert failed ❌", error: e.message });
  }
});

// 1.6 Update by productName
router.post("/update", async (req, res) => {
  try {
    const { productName, ...updates } = req.body;
    if (!productName) return res.status(400).json({ message: "productName is required" });

    const updated = await FashionShopData.findOneAndUpdate(
      { productName },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Updated ✅", data: updated });
  } catch (e) {
    res.status(400).json({ message: "Update failed ❌", error: e.message });
  }
});

// 1.7 Delete by productName
router.post("/delete", async (req, res) => {
  try {
    const { productName } = req.body;
    if (!productName) return res.status(400).json({ message: "productName is required" });

    const deleted = await FashionShopData.findOneAndDelete({ productName });
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Deleted ✅", data: deleted });
  } catch (e) {
    res.status(400).json({ message: "Delete failed ❌", error: e.message });
  }
});

// 1.8 Totals for season
router.get("/totals/:season", async (req, res) => {
  try {
    const season = req.params.season;

    const out = await FashionShopData.aggregate([
      { $match: { season } },
      {
        $group: {
          _id: "$season",
          totalUnitsSold: { $sum: "$unitsSold" },
          totalReturns: { $sum: "$returns" },
          totalRevenue: { $sum: "$revenue" }
        }
      }
    ]);

    if (out.length === 0) {
      return res.status(404).json({
        message: "No records for that season",
        season,
        totals: { totalUnitsSold: 0, totalReturns: 0, totalRevenue: 0 }
      });
    }

    res.json({ season: out[0]._id, totals: out[0] });
  } catch (e) {
    res.status(400).json({ message: "Totals query failed ❌", error: e.message });
  }
});

// 1.9 First 10 records where unitsSold > value for a season
router.get("/top10-units", async (req, res) => {
  try {
    const season = req.query.season;
    const minUnitsSold = Number(req.query.minUnitsSold);

    if (!season) return res.status(400).json({ message: "season is required" });
    if (!Number.isFinite(minUnitsSold))
      return res.status(400).json({ message: "minUnitsSold must be a number" });

    const data = await FashionShopData.find({
      season,
      unitsSold: { $gt: minUnitsSold }
    }).limit(10);

    res.json({ season, minUnitsSold, count: data.length, data });
  } catch (e) {
    res.status(400).json({ message: "Top10 query failed ❌", error: e.message });
  }
});

// 1.10 Products where avg rating meets condition
router.get("/rating-condition", async (req, res) => {
  try {
    const season = req.query.season;
    const op = (req.query.op || "gte").toLowerCase();
    const value = Number(req.query.value);

    if (!season) return res.status(400).json({ message: "season is required" });
    if (!Number.isFinite(value)) return res.status(400).json({ message: "value must be a number" });

    const opMap = {
      gt: (v) => ({ $gt: v }),
      gte: (v) => ({ $gte: v }),
      lt: (v) => ({ $lt: v }),
      lte: (v) => ({ $lte: v }),
      eq: (v) => ({ $eq: v })
    };

    if (!opMap[op]) {
      return res.status(400).json({ message: "op must be one of: gt, gte, lt, lte, eq" });
    }

    const data = await FashionShopData.aggregate([
      { $match: { season } },
      {
        $group: {
          _id: "$productName",
          avgRating: { $avg: "$customerRating" },
          anyDoc: { $first: "$$ROOT" }
        }
      },
      { $match: { avgRating: opMap[op](value) } },
      {
        $project: {
          _id: 0,
          avgRating: 1,
          product: "$anyDoc"
        }
      }
    ]);

    res.json({ season, condition: { op, value }, count: data.length, data });
  } catch (e) {
    res.status(400).json({ message: "Rating condition query failed ❌", error: e.message });
  }
});

module.exports = router;
