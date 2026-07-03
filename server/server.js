const express=require("express");

const mongoose=require("mongoose");

const cors=require("cors");

const session=require("express-session");

const passport=require("passport");

const authRoute=require("./routes/auth");

const userRoutes=require("./routes/userRoutes");

require("./config/passport")(passport);

const app=express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json());

app.use(
session({
secret:"secretkey",
resave:false,
saveUninitialized:false
})
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/passportdb")
.then(()=>console.log("MongoDB Connected"))
.catch((err)=>console.log("MongoDB Connection Error:", err));

app.use("/api/auth",authRoute);
app.use("/api/users",userRoutes);

app.listen(5000,()=>{
console.log("Server Started");
});
