const postsCollection = require("../db").db().collection("posts");
const likesCollection = require("../db").db().collection("likes");
const usersCollection = require("../db").db().collection("users");
const User = require("./User");
const ObjectID = require("mongodb").ObjectID;

let Like = function (likedPostId, likerId) {
  this.likedPostId = likedPostId;
  this.likerId = likerId;
  this.errors = [];
};

Like.prototype.cleanUp = function () {
  if (typeof this.likedPostId != "string") {
    this.likedPostId = "";
  }
};

Like.prototype.validate = async function (action) {
  //liked post must exist in database
  let likedPost = await postsCollection.findOne({
    _id: new ObjectID(this.likedPostId),
  });
  if (likedPost) {
    this.likedPostAuthor = likedPost.author;
  } else {
    this.errors.push("You cannot like a post that does not exist.");
  }

  let doesLikeAlreadyExist = await likesCollection.findOne({
    likedPostId: new ObjectID(this.likedPostId),
    likerId: ObjectID(this.likerId),
  });
  if (action == "create") {
    if (doesLikeAlreadyExist) {
      this.errors.push("You are already liking this post.");
    }
  }
  if (action == "delete") {
    if (!doesLikeAlreadyExist) {
      this.errors.push("You cannot unlike a post you are not already liking.");
    }
  }
};

Like.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("create");
    if (!this.errors.length) {
      await likesCollection.insertOne({
        likedPostId: new ObjectID(this.likedPostId),
        likerId: new ObjectID(this.likerId),
        likedPostAuthor: this.likedPostAuthor,
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Like.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("delete");
    if (!this.errors.length) {
      await likesCollection.deleteOne({
        likedPostId: new ObjectID(this.likedPostId),
        likerId: new ObjectID(this.likerId),
        likedPostAuthor: this.likedPostAuthor,
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Like.isVisitorLiking = async function (postId, visitorId) {
  let likeDoc = await likesCollection.findOne({
    likedPostId: postId,
    likerId: new ObjectID(visitorId),
  });

  if (likeDoc) {
    return true;
  } else {
    return false;
  }
};

Like.countLikesById = function (id) {
  return new Promise(async (resolve, reject) => {
    let likesCount = await likesCollection.countDocuments({
      likerId: id,
    });
    resolve(likesCount);
  });
};

Like.getLikedById = function (id) {
  return new Promise(async (resolve, reject) => {
    try {
      let likes = await likesCollection
        .aggregate([
          { $match: { likerId: id } },
          {
            $lookup: {
              from: "posts",
              localField: "likedPostId",
              foreignField: "_id",
              as: "likeDoc",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "likedPostAuthor",
              foreignField: "_id",
              as: "userDoc",
            },
          },
          {
            $project: {
              author: { $arrayElemAt: ["$userDoc", 0] },
              authorUsername: { $arrayElemAt: ["$userDoc.username", 0] },
              title: { $arrayElemAt: ["$likeDoc.title", 0] },
              _id: { $arrayElemAt: ["$likeDoc._id", 0] },
            },
          },
        ])
        .toArray();
      likes = likes.map((like) => {
        let user = new User(like.author, true);
        return {
          _id: like._id,
          title: like.title,
          avatar: user.avatar,
          authorUsername: like.authorUsername,
        };
      });
      resolve(likes);
    } catch {
      reject();
    }
  });
};

Like.findLikeUsers = function (postId) {
  return new Promise(async (resolve, reject) => {
    if (typeof postId == "string") {
      let users = await likesCollection
        .aggregate([
          { $match: { likedPostId: new ObjectID(postId) } },
          {
            $lookup: {
              from: "users",
              localField: "likerId",
              foreignField: "_id",
              as: "userDoc",
            },
          },
          {
            $project: {
              userDoc: { $arrayElemAt: ["$userDoc", 0] },
            },
          },
        ])
        .toArray();
      users = users.map((user) => {
        let userProfile = new User(user.userDoc, true);
        return {
          username: user.userDoc.username,
          avatar: userProfile.avatar,
        };
      });
      resolve(users);
    } else {
      reject();
    }
  });
};

Like.getLikesPerPost = function (posts) {
  postsPromise = posts.map(async (post) => {
    let likeCount = await likesCollection.countDocuments({
      likedPostId: new ObjectID(post._id),
    });
    post.likeCount = likeCount;
    return post;
  });

  return Promise.all(postsPromise);
};

module.exports = Like;
