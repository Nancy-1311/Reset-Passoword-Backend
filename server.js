require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use(express.json());
app.use(cors({
  origin: "https://reset-passoword-frontend-vd2b.vercel.app"
}));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

app.use("/api/auth", require("./routes/authRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
