import { useState } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter as Router, Link  } from 'react-router-dom'

const Blog = ({ blog, updateBlog, loggedUser, deleteBlog }) => {
  const [visible, setVisible] = useState(false)
  const [likes, setLikes] = useState('')

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

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

  //console.log('logged user', loggedUser.username)
  //console.log('blog user', blog.user.username)
  return (
    <div style={blogStyle} className="blog">
      <Router>
        <div style={hideWhenVisible} className="blogInfo">
          <Link to={`/blogs/${blog.id}`}>
            {blog.title} {blog.author}
          </Link>
          {/* <button onClick={toggleVisibility}>view</button> */}
        </div>
      {/* <div style={showWhenVisible} className="blogDetails">
        <div>
          {blog.title} {blog.author}{''}
          <button onClick={toggleVisibility}>cancel</button>
        </div>
        <div>{blog.url}</div>
        <div>
          {blog.likes} <button onClick={likeBlog}>like</button>
        </div>
        {blog.user ? <div>{blog.user.username}</div> : <div></div>}
        {blog.user?.username && loggedUser.username === blog.user.username && (
          <div>
            <button onClick={removeBlog}>delete</button>
          </div>
        )}
      </div> */}
      </Router>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  updateBlog: PropTypes.func.isRequired,
  loggedUser: PropTypes.object.isRequired,
  deleteBlog: PropTypes.func.isRequired,
}

export default Blog
