const express = require("express"),
	  Campground = require("../models/campground"),
	  Comment = require("../models/comment"),
	  middleware = require("../middleware");
var router = express.Router({mergeParams: true});

//New Comments form Route
router.get("/new", middleware.isLoggedIn, (req, res) => {
	//find campground by id
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new", {campground: campground});
		}
	});
});

//Create the new comment post Route 
router.post("/", middleware.isLoggedIn, (req, res) => {
	//find campground by id
	Campground.findById(req.params.id, (err, campground) => {
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			//create new comments
			Comment.create(req.body.comment, (err, newlyCreatedComment) =>{
				if(err){
					req.flash("error", "Something went wrong");
					console.log(err);
				}
				else{
					//add username and id to comment
					newlyCreatedComment.author.id = req.user._id;
					newlyCreatedComment.author.username = req.user.username;
					//save comment
					newlyCreatedComment.save();
					//associate the comment to the campground
					campground.comments.push(newlyCreatedComment);
					campground.save();
					req.flash("success", "Successfully added comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("back");
		}
		else{
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});
});

//COMMENT UPDATE ROUTE => PUT ROUTE
router.put("/:comment_id", (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("back");
		}
		else{
			req.flash("success", "Successfully edited comment");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


//Destroy comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err){
			req.flash("error", "Something went wrong");
			res.redirect("back");
		}
		else{
			req.flash("success", "Successfully deleted comment");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


module.exports = router;