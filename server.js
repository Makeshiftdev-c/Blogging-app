const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const csrf = require("csurf");
const server = express();
const sanitizeHTML = require("sanitize-html");

if (process.env.NODE_ENV === "production") {
  server.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
}

server.use(express.urlencoded({ extended: false }));
server.use(express.json());

server.use("/api", require("./router-api"));

let sessionOptions = session({
  secret: process.env.SECRET,
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
});

server.use(sessionOptions);
server.use(flash());

server.use((req, res, next) => {
  //make markdown function available to ejs templates
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "i",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      allowedAttributes: {},
    });
  };

  //make error and success flash messages available from all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  //make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }

  //make user session data available from within view template
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");

server.use(express.static("public"));
server.set("views", "views");
server.set("view engine", "ejs");

server.use(csrf());

server.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

server.use("/", router);

server.use((error, req, res, next) => {
  if (error) {
    if (error.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross site request forgery detected.");
      req.session.save(() => res.redirect("/"));
    } else {
      res.render("404");
    }
  }
});

const app = require("http").createServer(server);
const io = require("socket.io")(app);

io.use((socket, next) => {
  sessionOptions(socket.request, socket.request.res, next);
});

io.on("connection", (socket) => {
  if (socket.request.session.user) {
    let user = socket.request.session.user;

    socket.emit("newConnection", {
      avatar: user.avatar,
    });
    socket.on("chatMessageBrowser", (data) => {
      socket.broadcast.emit("chatMessageServer", {
        username: user.username,
        message: sanitizeHTML(data.message, {
          allowedTags: [],
          allowedAttributes: {},
        }),
        avatar: user.avatar,
      });
    });
  }
});

module.exports = app;
