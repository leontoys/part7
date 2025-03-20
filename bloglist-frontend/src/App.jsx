import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [message, setMessage] = useState({ message: null, className: null })
  //reference
  const blogFormRef = useRef()

  useEffect(() => {
    console.log('use effect -- check if user already loggd in')
    // Retrieve the JSON string from localStorage
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')

    // Check if the JSON string exists
    if (loggedUserJSON) {
      // Parse the JSON string into a JavaScript object
      const user = JSON.parse(loggedUserJSON)

      // Update the state with the user object
      setUser(user)

      // Set the token for the blogService
      blogService.setToken(user.token)
    }
  }, []) // The empty dependency array means this effect runs only once after the initial render

  useEffect(() => {
    console.log('se effect -- blog get all')
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  const handleLogin = async (event) => {
    console.log('---handle login')
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      console.log('---set token---')
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      const newMessage = {
        message: 'user name or password is wrong',
        className: 'error',
      }
      setMessage(newMessage)
      setTimeout(() => {
        const newMessage = {
          message: null,
          className: null,
        }
        setMessage(newMessage)
      }, 5000)
    }
  }

  const handleLogout = async (event) => {
    console.log('---handle logout')
    event.preventDefault()
    try {
      window.localStorage.clear()
      setUser(null)
    } catch (exception) {
      const newMessage = {
        message: 'log out failed',
        className: 'error',
      }
      setMessage(newMessage)
      setTimeout(() => {
        const newMessage = {
          message: null,
          className: null,
        }
        setMessage(newMessage)
      }, 5000)
    }
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    try {
      blogService.create(blogObject).then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog))
        const newMessage = {
          message: `a new blog ${blogObject.title} by ${blogObject.author} added`,
          className: 'notification',
        }
        setMessage(newMessage)
        setTimeout(() => {
          const newMessage = {
            message: null,
            className: null,
          }
          setMessage(newMessage)
        }, 5000)
      })
    } catch (exception) {
      const newMessage = {
        message: 'error creating blog',
        className: 'error',
      }
      setMessage(newMessage)
      setTimeout(() => {
        const newMessage = {
          message: null,
          className: null,
        }
        setMessage(newMessage)
      }, 5000)
    }
  }

  const updateBlog = (blogObject) => {
    try {
      console.log('----update blog-----')
      blogService.update(blogObject).then((returnedBlog) => {
        console.log(returnedBlog)
        const updatedBlogs = blogs.map((blog) =>
          blog.id === returnedBlog.id ? returnedBlog : blog,
        )
        setBlogs(updatedBlogs)
      })
    } catch (exception) {
      const newMessage = {
        message: 'error liking blog',
        className: 'error',
      }
      setMessage(newMessage)
      setTimeout(() => {
        const newMessage = {
          message: null,
          className: null,
        }
        setMessage(newMessage)
      }, 5000)
    }
  }

  const deleteBlog = (blogId) => {
    try {
      console.log('----delete blog-----')
      blogService.deleteBlog(blogId).then(() => {
        // Filter out the deleted blog from the list
        const updatedBlogs = blogs.filter((blog) => blog.id !== blogId)
        setBlogs(updatedBlogs)

        // Optionally set a success message
        const newMessage = {
          message: 'Blog deleted successfully',
          className: 'success',
        }
        setMessage(newMessage)
        setTimeout(() => {
          const newMessage = {
            message: null,
            className: null,
          }
          setMessage(newMessage)
        }, 5000)
      })
    } catch (exception) {
      // Set error message in case of an exception
      const newMessage = {
        message: 'Error deleting blog',
        className: 'error',
      }
      setMessage(newMessage)
      setTimeout(() => {
        const newMessage = {
          message: null,
          className: null,
        }
        setMessage(newMessage)
      }, 5000)
    }
  }

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <h2>login to application</h2>
      <div>
        username
        <input
          id='username'
          type='text'
          value={username}
          name='Username'
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          id='password'
          type='password'
          value={password}
          name='Password'
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button id='login-button' type='submit'>
        login
      </button>
    </form>
  )

  // sort by value
  blogs.sort((a, b) => b.likes - a.likes)

  const blogForm = () => {
    //console.log(blogs)
    return (
      <div>
        <h2>blogs</h2>
        <p>
          {user.name} logged in <button onClick={handleLogout}>logout</button>
        </p>
        <Togglable buttonLabel='new blog' ref={blogFormRef}>
          <BlogForm createBlog={addBlog}></BlogForm>
        </Togglable>
        <br />
        {blogs.map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            loggedUser={user}
            updateBlog={updateBlog}
            deleteBlog={deleteBlog}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <Notification message={message.message} className={message.className} />
      {!user && loginForm()}
      {user && blogForm()}
    </div>
  )
}

export default App
