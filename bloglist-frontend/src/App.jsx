import { useState, useEffect, useRef,  useReducer } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [message, setMessage] = useState({ message: null, className: null })

  //useReducer
  const notificationReducer = (state,action) => {
    console.log('action',action)
    switch(action.type){
    case 'ERROR_LOGIN' :
      return {
        message: 'user name or password is wrong',
        className : 'error'
      }
    case 'ERROR_LOGOUT' :
      return {
        message: 'logout failed',
        className : 'error'
      }
    case 'SUCCESS_ADDBLOG' :
      return {
        message: action.payload,
        className : 'notification'
      }
    case 'ERROR_ADDBLOG':
      return{
        message : 'error creating blog',
        className : 'error'
      }
    case 'SUCCESS_UPDATEBLOG':
      return{
        message : 'liked blog',
        className : 'notification'
      }
    case 'ERROR_UPDATEBLOG':
      return{
        message : 'error liking blog',
        className : 'error'
      }
    case 'SUCCESS_DELETEBLOG' :
      return {
        message: 'successfully deleted blog',
        className : 'notification'
      }
    case 'ERROR_DELETEBLOG':
      return{
        message : 'error deleting blog',
        className : 'error'
      }
    case 'CLEAR' :
      return {
        message: '',
        className : ''
      }
    default:
      state
    }
  }

  const [notification,notificationDispatch] = useReducer(notificationReducer,{ message:'',className:'' })

  //Query Client and Mutation
  const queryClient = useQueryClient()
  const newBlogMutation = useMutation({
    mutationFn:blogService.create,
    onSuccess : (returnedBlog) => {
      //get the blogs from the state?
      const blogs = queryClient.getQueryData(['blogs']) || []
      console.log('blogs',blogs)
      queryClient.setQueryData(['blogs'],blogs.concat(returnedBlog) )

      notificationDispatch({ type : 'SUCCESS_ADDBLOG', payload :`blog ${returnedBlog.blog} added` })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)
    },
    onError : (exception) => {
      console.log(exception.message)
      notificationDispatch({ type : 'ERROR_ADDBLOG' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)
    }
  })
  const updateBlogMutation = useMutation({
    mutationFn : blogService.update,
    onSuccess : (updatedBlog) => {
      const blogs = queryClient.getQueryData(['blogs'])||[]
      console.log(updatedBlog,blogs)
      const updatedBlogs = blogs.map(blog => blog.id===updatedBlog.id?updatedBlog:blog)
      console.log(updatedBlogs)
      queryClient.setQueryData(['blogs'],updatedBlogs)
      notificationDispatch({ type : 'SUCCESS_UPDATEBLOG' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)
    },
    onError : (exception) => {
      console.log(exception.message)
      notificationDispatch({ type : 'ERROR_UPDATEBLOG' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)
    }
  })
  const deleteBlogMutation = useMutation({
    mutationFn : blogService.deleteBlog,
    onSuccess : (id) => {
      const blogs = queryClient.getQueryData(['blogs'])||[]
      console.log('typeof id:', typeof id)
      blogs.forEach(blog => console.log('typeof blog.id:', typeof blog.id, 'value:', blog.id))
      console.log('Deleting blog with id:', id)
      console.log('Existing blogs:', blogs)
      const updatedBlogs = blogs.filter(blog => blog.id !== id)
      console.log('After deletion:', updatedBlogs)
      queryClient.setQueryData(['blogs'],updatedBlogs)
      notificationDispatch({ type : 'SUCCESS_DELETEBLOG' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)
    },
    onError : (exception) => {
      console.log(exception.message)
      notificationDispatch({ type : 'ERROR_DELETEBLOG' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)
    }
  })

  const result = useQuery({
    queryKey : ['blogs'],
    queryFn : blogService.getAll
  })

  const blogs = result.data || []

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

      notificationDispatch({ type : 'ERROR_LOGIN' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)

    }
  }

  const handleLogout = async (event) => {
    console.log('---handle logout')
    event.preventDefault()
    try {
      window.localStorage.clear()
      setUser(null)
    } catch (exception) {

      notificationDispatch({ type : 'ERROR_LOGOUT' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)

    }
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    newBlogMutation.mutate(blogObject)
  }

  const updateBlog = (blogObject) => {
    updateBlogMutation.mutate(blogObject)
  }

  const deleteBlog = (id) => {
    deleteBlogMutation.mutate(id)
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
      <Notification message={notification.message} className={notification.className} />
      {!user && loginForm()}
      {user && blogForm()}
    </div>
  )
}

export default App
