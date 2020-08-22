require('dotenv').config();

const express 		= require('express'),
	  app 			= express(),
	  mongoose 		= require("mongoose"),
      flash			= require("connect-flash"),
	  passport		= require("passport"),
	  LocalStrategy = require("passport-local"),
      methodOverride = require("method-override"),
	  Campground 	= require("./models/campground"),
	  seedDB 		= require("./seeds"),
	  Comment = require("./models/comment"),
	  User = require("./models/user");

//requiring routes
const campgroundRoutes = require("./routes/campgrounds"),
	  commentRoutes = require("./routes/comments"),
	  indexRoutes = require("./routes/index");

// Seed the database
// seedDB();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(url);
// if(url === "mongodb://localhost/yelp_camp"){
// 	require('dotenv').config();
// }

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.set("view engine", "ejs");
app.locals.moment = require('moment');

//PASSPORT CONFIGURATION 
app.use(require("express-session")({
	secret: "test test test",
	resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, () =>{
	console.log("Yelp Camp Project Server Started!");
});