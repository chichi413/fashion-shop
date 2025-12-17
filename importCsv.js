require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const connectDB = require("../config/db");
const FashionShopData = require("../models/FashionShop");

function toNumber(v) {
  if (v === undefined || v === null) return 0;
  const cleaned = String(v).replace(/[,£$]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function run() {
  await connectDB();

  const csvPath = path.join(__dirname, "..", "fashion_Dataset.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("❌ CSV not found at:", csvPath);
    process.exit(1);
  }

  const rows = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      try {
        const docs = rows.map((r) => ({
          productCategory: r["Product Category"],
          productName: r["Product Name"],
          unitsSold: toNumber(r["Units Sold"]),
          returns: toNumber(r["Returns"]),
          revenue: toNumber(r["Revenue"]),
          customerRating: toNumber(r["Customer Rating"]),
          stockLevel: toNumber(r["Stock Level"]),
          season: r["Season"],
          trendScore: toNumber(r["Trend Score"])
        }));

        // upsert by productName (avoids duplicates)
        for (const d of docs) {
          await FashionShopData.updateOne(
            { productName: d.productName },
            { $set: d },
            { upsert: true }
          );
        }

        console.log(`✅ Imported/Updated ${docs.length} rows into FashionShopData`);
      } catch (e) {
        console.error("❌ Import error:", e.message);
      } finally {
        process.exit(0);
      }
    });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
