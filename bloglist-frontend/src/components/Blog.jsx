import { useState } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Link, useParams } from 'react-router-dom'

const Blog = ({ blogs, updateBlog, deleteBlog }) => {
  const [likes, setLikes] = useState('')

  const id = useParams().id
  console.log(id)
  blogs.map( blog => console.log(blog))
  const blog = blogs.find( blog => blog.id === id )
  if(!blog ) return
  console.log(blog)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const likeBlog = (event) => {
    event.preventDefault()
    console.log('blog', blog)
    const updatedLikes = blog.likes + 1
    setLikes(updatedLikes)
    updateBlog({
      id: blog.id,
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: updatedLikes,
      user: blog.user,
    })
  }

  const removeBlog = (event) => {
    event.preventDefault()
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      console.log('deleting blog')
      console.log('blog id', blog.id)
      deleteBlog(blog.id)
    }
  }


  return (
    <div style={blogStyle} className="blog">
      <h2>{blog.title} {blog.author}</h2>
      <div>{blog.url}</div>
      {blog.likes} <button onClick={likeBlog}>like</button>
    </div>
  )
}

export default Blog
