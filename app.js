//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(session({
  secret: "I am Unnati",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsDB",{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encrytedFields: ["password"]});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
  res.render("home");
});

app.get("/login",(req,res)=>{
  res.render("login");
});

app.get("/register",(req,res)=>{
  res.render("register");
});

app.get("/sercrets",(req,res)=>{
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
});

app.get("/logout",(req,res)=>{
  res.logout();
  res.redirect("/");cre
})

app.post("/register",(req,res)=>{
  User.register({username: req.body.username}, req.body.password,(err,user)=>{
    if(err){
      console.log(err);
      res.redirect("/");
    }else{
      passport.authenticate("local")(req,res,()=>{
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login",(req,res)=>{
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  req.login(newUser,(err)=>{
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,()=>{
        res.redirect("/secrets");
      })
    }
  })
})


// app.post("/register",(req,res)=>{
//   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     const newUser = new User({
//       email: req.body.username,
//       // password: md5(req.body.password)
//       password: hash
//     });
//     newUser.save((err)=>{
//       if(err){
//         console.log(err);
//       }else{
//         res.render("secrets");
//       }
//     });
//   });
// });

// app.post("/login",(req,res)=>{
//   const enteredUsername = req.body.username;
//   const enteredPassword = md5(req.body.password);
//    User.findOne({email: enteredUsername},(err,foundUser)=>{
//     if(err){
//       console.log(err);
//     }else{
//       if(foundUser){
//         bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
//           if(result === true){
//               res.render("secrets");
//           }
//         });
//       }
//     }
//   });
// });


app.listen(3000,()=>{
  console.log("Server running on port 3000");
})
