const express = require("express"),
	  passport = require("passport"),
	  User = require("../models/user"),
	  Campground = require("../models/campground");
const campground = require("../models/campground");
var router = express.Router();

//root route
router.get("/", (req, res) => {
	// res.send("This is the Yelp Camp Landing Page!");
	res.render("landing");
});

// ===================
//Authenticate Route
// ===================

//show register form
router.get("/register", (req, res) => {
	res.render("register", {page: 'register'});
});

//handle register logic
router.post("/register", (req, res) => {
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		avatar: req.body.avatar,
		email: req.body.email
	});
	console.log(req.body.adminCode);
	if(req.body.adminCode === 'secretcode'){
		newUser.isAdmin = true;
	}
	console.log(newUser.isAdmin);
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
		else{
			passport.authenticate("local")(req,res, () => {
				req.flash("success", "Successfully registered");
				res.redirect("/campgrounds");
			});
		}
	});
});

//show login form
router.get("/login", (req, res) =>{
	res.render("login", {page: 'login'});
});

//Login Logic
router.post("/login", passport.authenticate("local",  {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), 
	(req, res) => {
		
	});

//Logout Route
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Successfully Logged Out")
	res.redirect("/campgrounds");
});

//User Profile
router.get("/users/:id", (req, res) => {
	User.findById(req.params.id, (err, foundUser) => {
		if(err){
			req.flash(error, "Something went wrong");
			req.redirect("back");
		}
		else{
			Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
				if(err) {
					req.flash("error", "Something went wrong");
					res.redirect("back");
				}
				else{
					res.render("users/show", {user: foundUser, campgrounds: campgrounds});
				}
			})
			
		}
	});
});

module.exports = router;