const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");
const likeController = require("./controllers/likeController");

//user related routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/doesUsernameExist", userController.doesUsernameExist);
router.post("/doesEmailExist", userController.doesEmailExist);

//profile related routes
router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profilePostsScreen
);
router.get(
  "/profile/:username/liking",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profileLikesScreen
);
router.get(
  "/profile/:username/followers",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profileFollowersScreen
);
router.get(
  "/profile/:username/following",
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profileFollowingScreen
);

//post related routes
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
);
router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.create
);
router.get(
  "/post/:id",
  postController.sharedPostData,
  postController.viewSingle
);
router.get(
  "/post/:id/edit",
  userController.mustBeLoggedIn,
  postController.viewEditScreen
);
router.post(
  "/post/:id/edit",
  userController.mustBeLoggedIn,
  postController.edit
);
router.post(
  "/post/:id/delete",
  userController.mustBeLoggedIn,
  postController.delete
);
router.post("/search", postController.search);

//follow related routes
router.post(
  "/addFollow/:username",
  userController.mustBeLoggedIn,
  followController.addFollow
);
router.post(
  "/removeFollow/:username",
  userController.mustBeLoggedIn,
  followController.removeFollow
);

//like related routes
router.post(
  "/post/:id/like",
  userController.mustBeLoggedIn,
  likeController.addLike
);
router.post(
  "/post/:id/removeLike",
  userController.mustBeLoggedIn,
  likeController.removeLike
);
router.post("/getLikers", likeController.getLikeUsers);

module.exports = router;
