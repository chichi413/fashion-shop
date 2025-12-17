require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const fashionShopRoutes = require("./routes/fashionShopRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Fashion Shop API running ✅"));

app.use("/api/fashion", fashionShopRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
