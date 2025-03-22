const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const bcrypt = require("bcrypt");
const User = require("../models/user");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are five blogs", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test("the first of the blogs is React patterns", async () => {
  const response = await api.get("/api/blogs");

  const titles = response.body.map((e) => e.title);
  assert(titles.includes("React patterns"));
});

test("the unique identifier is id and not _id", async () => {
  const response = await api.get("/api/blogs");
  const ids = response.body.map((e) => e.id);
  assert(ids);
});

test("a valid blog can be added ", async () => {
  const newBlog = {
    title: "Free Code Camp",
    author: "Quincy Larson",
    url: "https://www.freecodecamp.org/news/",
    likes: 100,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");

  const titles = response.body.map((r) => r.title);

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1);

  assert(titles.includes("Free Code Camp"));
});

test("if likes is missing it defaults to zero", async () => {
  const newBlog = {
    title: "Free Code Camp",
    author: "Quincy Larson",
    url: "https://www.freecodecamp.org/news/",
  };
  //the response returns the added blog
  const response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(response.body.likes, 0);
});

test("if title or url is missing we get 400 bad request", async () => {
  const newBlog = {
    author: "Quincy Larson",
    url: "https://www.freecodecamp.org/news/",
    likes: 100,
  };
  //the response returns 400 bad request
  await api.post("/api/blogs").send(newBlog).expect(400);
});

test("delete by id", async () => {
  const newBlog = {
    title: "Free Code Camp",
    author: "Quincy Larson",
    url: "https://www.freecodecamp.org/news/",
  };
  //the response returns the added blog
  const response = await api.post("/api/blogs").send(newBlog);

  console.log("response", response.body.id);
  await api.delete(`/api/blogs/${response.body.id}`).expect(204);
});

test("update by id", async () => {
  const likes = 1000;
  //if we leave blank - the new blog likes will be zero
  const newBlog = {
    title: "Free Code Camp",
    author: "Quincy Larson",
    url: "https://www.freecodecamp.org/news/",
  };
  //the response returns the added blog
  const response = await api.post("/api/blogs").send(newBlog);
  //update likes
  newBlog.likes = likes;
  console.log("response", response.body.id);
  console.log("new blog", newBlog);
  const updatedBlog = await api
    .put(`/api/blogs/${response.body.id}`)
    .send(newBlog);
  console.log("updated", updatedBlog.body);
  assert.strictEqual(updatedBlog.body.likes, likes);
});

/**User */
describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails if username is not given", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: "Superuser",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("creation fails if password is not given ", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "super",
      name: "Superuser",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("creation fails if username is shorter than 3", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "ab",
      name: "Superuser",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("creation fails if password is shorter than 3 ", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "super",
      password: "cd",
      name: "Superuser",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });
});

after(async () => {
  await mongoose.connection.close();
});
