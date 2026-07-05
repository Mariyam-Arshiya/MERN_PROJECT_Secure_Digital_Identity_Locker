require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");

const authRoute = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const shareRoutes = require("./routes/shareRoutes");
const logRoutes = require("./routes/logRoutes");

require("./config/passport")(passport);

const app = express();
app.disable("x-powered-by");

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/logs", logRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server Started on port " + PORT);
});