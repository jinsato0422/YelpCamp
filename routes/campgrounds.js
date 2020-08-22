const express = require("express"),
	  Campground = require("../models/campground"),
      middleware = require("../middleware"),
      NodeGeocoder = require('node-geocoder');
 
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
 
var geocoder = NodeGeocoder(options);
var router = express.Router();

router.get("/", (req, res) => {
	//get all data from mongo db
	Campground.find({}, (err, campgrounds) =>{
		if(err){
			console.log("something went wrong");
			console.log(err);
		}
		else{
			res.render("campgrounds/index", {campgrounds: campgrounds, page: 'campgrounds'});
		}
	});
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

//Show Route 
router.get("/:id", (req, res) => {
	//find the campground with provided id
	Campground.findById(req.params.id).populate("comments").exec ((err, foundCampground) =>{
		if(err){
			console.log("something went wrong");
			console.log(err);
		}
		else{
			//redirect back to campgrounds page
			// console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});	
		}
	});
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name, image: image, price: price, description: desc, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                
                res.redirect("/campgrounds");
            }
        });
    });
  });

//EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});	
		}
	)}
);

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        req.flash('error', 'Invalid address');
        return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
  
      Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              req.flash("success","Successfully Updated Campground!");
              res.redirect("/campgrounds/" + campground._id);
          }
      });
    });
  });


//Destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if(err){
			res.redirect("/campgrounds");
		}
		else{
            req.flash("success","Successfully Deleted Campground!");
			res.redirect("/campgrounds");
		}
	});
});




module.exports = router;