const Comment = require("../models/Comment");

exports.create = function (req, res) {
  let comment = new Comment(req.body, req.session.user._id, req.params.id);
  comment
    .create()
    .then(() => {
      req.session.save(() => {
        res.redirect(`/post/${req.params.id}`);
      });
    })
    .catch((errors) => {
      errors.forEach((error) => req.flash("errors", error));
      req.session.save(() => res.redirect(`/post/${req.params.id}`));
    });
};

exports.edit = function (req, res) {
  let comment = new Comment(req.body, req.visitorId, req.params.id);
  comment
    .update(req.params.commentId)
    .then((status) => {
      if (status == "success") {
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}`);
        });
      } else {
        comment.errors.forEach((error) => {
          req.flash("errors", error);
        });
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}`);
        });
      }
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.delete = function (req, res) {
  Comment.delete(req.params.commentId, req.visitorId)
    .then(() => {
      req.session.save(() => {
        res.redirect(`/post/${req.params.id}`);
      });
    })
    .catch((errors) => {
      errors.forEach((error) => req.flash("errors", error));
      req.session.save(() => res.redirect(`/post/${req.params.id}`));
    });
};
