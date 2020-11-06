const Like = require("../models/Like");

exports.addLike = function (req, res) {
  let like = new Like(req.params.id, req.visitorId);
  like
    .create()
    .then(() => {
      req.flash("success", "Successfully liked post.");
      req.session.save(() => res.redirect(`/post/${req.params.id}`));
    })
    .catch((errors) => {
      errors.forEach((error) => {
        req.flash("errors", error);
      });
      req.session.save(() => res.redirect("/"));
    });
};

exports.removeLike = function (req, res) {
  let like = new Like(req.params.id, req.visitorId);

  like
    .delete()
    .then(() => {
      req.flash("success", "Successfully unliked post.");
      req.session.save(() => res.redirect(`/post/${req.params.id}`));
    })
    .catch((errors) => {
      errors.forEach((error) => {
        req.flash("errors", error);
      });
      req.session.save(() => res.redirect("/"));
    });
};

exports.getLikeUsers = function (req, res) {
  Like.findLikeUsers(req.body.postId)
    .then((users) => {
      res.json(users);
    })
    .catch(() => {
      res.json([]);
    });
};
