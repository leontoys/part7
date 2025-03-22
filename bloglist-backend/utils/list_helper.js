const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const result = blogs.reduce((accumulator, item, index, array) => {
    return accumulator + item.likes;
  }, 0);
  return result;
};

const favoriteBlog = (blogs) => {
  const result = blogs.reduce((accumulator, item, index, array) => {
    return accumulator.likes > item.likes ? accumulator : item;
  }, {});
  const { title, author, likes } = result;
  const extractedBlog = { title, author, likes };
  return extractedBlog;
};

function mostBlogs(blogs) {
  let blogCount = [];
  //for each entry
  blogs.forEach((element) => {
    console.log("author", element.author);
    //check if the author exists in the blogscount
    if (blogCount.find((count) => count.author === element.author)) {
      console.log("found");
      //if yes add+1
      const foundIndex = blogCount.findIndex(
        (count) => count.author === element.author,
      );
      blogCount[foundIndex].blogs += 1;
    } else {
      //if author is not found, then add author
      console.log("not found");
      blogCount.push({ author: element.author, blogs: 1 });
    }
  });
  console.log("count", blogCount);
  //find the maximum value of blogs
  let maxValue = blogCount.reduce((acc, value) => {
    return (acc = acc > value.blogs ? acc : value.blogs);
  }, 0);
  console.log(maxValue);
  //find the entry that has maximum value
  const mostBlogs = blogCount.filter((count) => count.blogs === maxValue);
  console.log(mostBlogs);
  //return object
  return mostBlogs[0];
}

function mostLikes(blogs) {
  let likesCount = [];
  //for each entry
  blogs.forEach((element) => {
    console.log("author", element.author);
    //check if the author exists in the blogscount
    if (likesCount.find((count) => count.author === element.author)) {
      console.log("found");
      //if yes add+1
      const foundIndex = likesCount.findIndex(
        (count) => count.author === element.author,
      );
      likesCount[foundIndex].likes += element.likes;
    } else {
      //if author is not found, then add author
      console.log("not found");
      likesCount.push({ author: element.author, likes: element.likes });
    }
  });
  console.log("count", likesCount);
  //find the maximum value of blogs
  let maxValue = likesCount.reduce((acc, value) => {
    return (acc = acc > value.likes ? acc : value.likes);
  }, 0);
  console.log(maxValue);
  //find the entry that has maximum value
  const mostLikes = likesCount.filter((count) => count.likes === maxValue);
  console.log(mostLikes);
  //return object
  return mostLikes[0];
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
