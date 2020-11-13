const commentsCollection = require("../db").db().collection("comments");
const santizeHTML = require("sanitize-html");
const ObjectID = require("mongodb").ObjectID;
const User = require("./User");

let Comment = function (data, userId, postId) {
  this.data = data;
  this.userId = userId;
  this.postId = postId;
  this.errors = [];
};

Comment.prototype.cleanUp = function () {
  if (typeof this.data.body != "string") {
    this.data.body = "";
  }

  //remove unauthorised attributes
  this.data = {
    post: new ObjectID(this.postId),
    author: new ObjectID(this.userId),
    comment: santizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    createdDate: new Date(),
  };
};

Comment.prototype.validate = function () {
  if (this.data.comment == "") {
    this.errors.push("You must provide comment content.");
  }
};

Comment.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      commentsCollection
        .insertOne(this.data)
        .then(() => resolve())
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Comment.reusableCommentQuery = function (uniqueOperations, visitorId) {
  return new Promise(async (resolve, reject) => {
    let aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      {
        $project: {
          _id: 1,
          comment: 1,
          createdDate: 1,
          author: { $arrayElemAt: ["$userDoc", 0] },
        },
      },
    ]);

    let comments = await commentsCollection.aggregate(aggOperations).toArray();

    comments = comments.map((comment) => {
      let user = new User(comment.author, true);
      comment.isVisitorsComment = comment.author._id.equals(visitorId);
      return {
        _id: comment._id,
        comment: comment.comment,
        createdDate: comment.createdDate,
        author: comment.author.username,
        avatar: user.avatar,
        isVisitorsComment: comment.isVisitorsComment,
      };
    });

    resolve(comments);
  });
};

Comment.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    let comments = await Comment.reusableCommentQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );

    if (comments.length) {
      resolve(comments[0]);
    } else {
      reject();
    }
  });
};

Comment.delete = function (commentIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let comment = await Comment.findSingleById(
        commentIdToDelete,
        currentUserId
      );
      if (comment.isVisitorsComment) {
        await commentsCollection.deleteOne({
          _id: new ObjectID(commentIdToDelete),
        });
        resolve();
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Comment.prototype.update = function (commentId) {
  return new Promise(async (resolve, reject) => {
    try {
      let comment = await Comment.findSingleById(commentId, this.userId);
      if (comment.isVisitorsComment) {
        //update db
        let status = await this.safeToUpdate(commentId);
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Comment.prototype.safeToUpdate = function (commentId) {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      await commentsCollection.findOneAndUpdate(
        { _id: new ObjectID(commentId) },
        { $set: { comment: this.data.comment, createdDate: new Date() } }
      );
      resolve("success");
    } else {
      resolve("failure");
    }
  });
};

Comment.getCommentsByPostId = function (postId, visitorId) {
  return Comment.reusableCommentQuery(
    [{ $match: { post: new ObjectID(postId) } }],
    visitorId
  );
};

Comment.countCommentsByPostId = function (postId) {
  return new Promise(async (resolve, reject) => {
    let commentCount = await commentsCollection.countDocuments({
      post: new ObjectID(postId),
    });
    resolve(commentCount);
  });
};

Comment.getCommentsPerPost = function (posts) {
  postsPromise = posts.map(async (post) => {
    let commentCount = await commentsCollection.countDocuments({
      post: new ObjectID(post._id),
    });
    post.commentCount = commentCount;
    return post;
  });

  return Promise.all(postsPromise);
};

module.exports = Comment;
