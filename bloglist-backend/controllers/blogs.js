const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const logger = require("../utils/logger");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const middleware = require("../utils/middleware");

//helper method
const getTokenFrom = (request) => {
  //from the request get authorization part
  const authorization = request.get("authorization");
  //check if it starts with bearer - we are using bearer scheme
  if (authorization && authorization.startsWith("Bearer ")) {
    //if yes, clean up by removing the bearer
    return authorization.replace("Bearer ", "");
  }
  return null;
};

blogsRouter.get("/", async (request, response) => {
  console.log("get all");
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  //console.log("blogs",blogs)
  response.json(blogs);
});

blogsRouter.get("/:id", (request, response, next) => {
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        response.json(blog);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

blogsRouter.post(
  "/",
  middleware.userExtractor,
  async (request, response, next) => {
    const body = request.body;

    //const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }
    console.log("token decoded with middleware");
    const user = request.user;
    //const user = await User.findById(decodedToken.id)

    if (!body.title || !body.url) {
      return response.sendStatus(400);
    }

    //find any user
    //const user = await User.findOne()

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id,
    });

    try {
      const savedBlog = await blog.save();
      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();
      response.status(201).json(savedBlog);
    } catch (exception) {
      next(exception);
    }
  },
);

blogsRouter.delete(
  "/:id",
  middleware.userExtractor,
  async (request, response, next) => {
    console.log("reached here");

    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }
    console.log("token decoded with middleware");
    //first find user
    //const user = await User.findById(decodedToken.id)
    const user = request.user;

    //then find the blog
    console.log("parameter", request.params.id);
    const blog = await Blog.findById(request.params.id);
    //console and return for now
    console.log("blog", blog);
    console.log("user", user);

    //so the blog contains the user as object
    if (blog.user.toString() != user._id.toString()) {
      console.log("users are not same");
      response
        .status(401)
        .json({ error: "Only the user created can delete the blog" });
    } else {
      try {
        console.log("users are same");
        await Blog.findByIdAndDelete(request.params.id);
        response.status(204).end();
      } catch (exception) {
        next(exception);
      }
    }
  },
);

blogsRouter.put(
  "/:id",
  middleware.userExtractor,
  async (request, response, next) => {
    console.log("----reached backend put----");
    logger.info("put", request.body);
    const body = request.body;

    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }
    console.log("token decoded with middleware");
    const user = request.user;
    //const user = await User.findById(decodedToken.id)

    if (!body.title || !body.url) {
      return response.sendStatus(400);
    }

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id
    };

    Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
      .populate("user", { username: 1, name: 1 })
      .then((updatedBlog) => {
        logger.info("blog updated in the backend");
        logger.info(updatedBlog);
        response.json(updatedBlog);
      })
      .catch((error) => next(error));
  },
);

blogsRouter.put(
  "/:id/comments",
  middleware.userExtractor,
  async (request, response, next) => {
    console.log("----reached backend put----");
    logger.info("patch", request.body);
    const body = request.body;

    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: "token invalid" });
    }
    console.log("token decoded with middleware");
    const user = request.user;
    //const user = await User.findById(decodedToken.id)

    if (!body.title || !body.url) {
      return response.sendStatus(400);
    }

    console.log(body.comments)
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user.id,
      comments : body.comments
    };

    Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
      .populate("user", { username: 1, name: 1 })
      .then((updatedBlog) => {
        logger.info("blog updated in the backend");
        logger.info(updatedBlog);
        response.json(updatedBlog);
      })
      .catch((error) => next(error));
  },
);

module.exports = blogsRouter;
