import { Form, Button } from 'react-bootstrap'
import { useState, useEffect, useRef,  useReducer } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import userSerivce from './services/users'
import loginService from './services/login'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate, replace,
  useNavigate, useMatch
} from 'react-router-dom'

const LoginForm = (props) => {

  return (
    <div>
      <Form onSubmit={props.handleLogin}>
        <h2>login to application</h2>
        <Form.Group>
          <Form.Label>username:</Form.Label>
          <Form.Control
            id='username'
            type='text'
            value={props.username}
            name='Username'
            onChange={({ target }) => props.setUsername(target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>password:</Form.Label>
          <Form.Control
            id='password'
            type='password'
            value={props.password}
            name='Password'
            onChange={({ target }) => props.setPassword(target.value)}
          />
        </Form.Group>
        <Button id='login-button' type='submit'>
      login
        </Button>
      </Form>
    </div>
  )
}

const App = () => {
  //const [user, setUser] = useState(null)
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')

  //Query Client and Mutation
  const queryClient = useQueryClient()
  const newBlogMutation = useMutation({
    mutationFn:blogService.create,
    onSuccess : (returnedBlog) => {
      //get the blogs from the state?
      const blogs = queryClient.getQueryData(['blogs']) || []
      console.log('blogs',blogs)
      queryClient.setQueryData(['blogs'],blogs.concat(returnedBlog) )

      notificationDispatch({ type : 'SUCCESS_ADDBLOG'})
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
  const updateCommentsMutation = useMutation({
    mutationFn : blogService.addComments,
    onSuccess : (updatedBlog) => {
      const blogs = queryClient.getQueryData(['blogs'])||[]
      console.log(updatedBlog,blogs)
      const updatedBlogs = blogs.map(blog => blog.id===updatedBlog.id?updatedBlog:blog)
      console.log(updatedBlogs)
      queryClient.setQueryData(['blogs'],updatedBlogs)
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
        message: 'blog added',
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


  const result = useQuery({
    queryKey : ['blogs'],
    queryFn : blogService.getAll
  })

  const blogs = result.data || []

  //reference
  const blogFormRef = useRef()

  const userReducer = (state,action) => {
    switch(action.type){
    case 'LOGIN':
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(action.payload))
      blogService.setToken(action.payload.token)
      setUsername('')
      setPassword('')
      return action.payload//user object
    case 'LOGOUT':
      blogService.setToken('')
      window.localStorage.clear()
      return null
    case 'CACHE':
      blogService.setToken(action.payload.token)
      return action.payload
    default:
      return state
    }
  }
  const [notification,notificationDispatch] = useReducer(notificationReducer,{ message:'',className:'' })
  const [user,userDispatch] = useReducer(userReducer,null)

  useEffect(() => {
    console.log('use effect -- check if user already loggd in')
    // Retrieve the JSON string from localStorage
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    // Check if the JSON string exists
    if (loggedUserJSON) {
      // Parse the JSON string into a JavaScript object
      const response = JSON.parse(loggedUserJSON)
      userDispatch({ type:'CACHE', payload:response })
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
      userDispatch({ type:'LOGIN', payload:user })
    }
    catch (exception) {
      notificationDispatch({ type : 'ERROR_LOGIN' })
      setTimeout(() => notificationDispatch({ type : 'CLEAR' }), 5000)

    }
  }

  const handleLogout = async (event) => {
    console.log('---handle logout')
    event.preventDefault()
    try {
      userDispatch({ type:'LOGOUT' })
    }
    catch (exception) {
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

  const addComments = (blogObject) => {
    updateCommentsMutation.mutate(blogObject)
  }

  const deleteBlog = (id) => {
    deleteBlogMutation.mutate(id)
  }

  // sort by value
  blogs.sort((a, b) => b.likes - a.likes)

  const blogForm = () => {
    //console.log(blogs)
    return (
      <div>
        <Togglable buttonLabel='new blog' ref={blogFormRef}>
          <BlogForm createBlog={addBlog}></BlogForm>
        </Togglable>
        <br />
      </div>
    )
  }

  const response = useQuery(({
    queryKey : ['users'],
    queryFn : userSerivce.getAll
  }))

  const users = response.data || []

  const Users = () => {
    return(
      <div>
        <h2>Users</h2>
        <h3>blogs created</h3>
        {users.map(user => (
          <div key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
            <span>{user.blogs.length}</span>
          </div>
        ))}
      </div>)


  }

  const User = ({ users }) => {
    const id = useParams().id
    const user = users.find(user => user.id === id)
    if(!user) return null//to prevent error
    return(
      <div>
        <h2>{user.name}</h2>
        <h3>added blogs</h3>
        <ul>
          {user.blogs.map( blog => <li key={blog.id}>{blog.title}</li> )}
        </ul>
      </div>)
  }

  const Home = () => {
    return(
      <div>
        {user && blogForm()}
      </div>
    )
  }

  const Blogs = () => {
    return(
      <div>
        <h2>blogs</h2>
        {blogs.map((blog) => (
          <Link key={blog.id} to={`/blogs/${blog.id}`}>
            <p>{blog.title} {blog.author}</p>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className='container'>
      <Router>
        <Notification message={notification.message} className={notification.className} />
        <div>
          <nav>
            <Link to='/'>home</Link>
            <Link to='/blogs'> blogs </Link>
            <Link to='/users'> users </Link>
            {user &&
              <p>
                {user.name} logged in <Button onClick={handleLogout}>logout</Button>
              </p>}
          </nav>
        </div>
        <Routes>
          <Route path='/' element={user?<Home/>:<LoginForm handleLogin={handleLogin}
            username={username} setUsername={setUsername}
            password={password} setPassword={setPassword}
          />}></Route>
          <Route path='/users' element={user?<Users/> : <Navigate replace to='/'/>}></Route>
          <Route path='/users/:id' element={<User users={users}/>}></Route>
          <Route path='/blogs' element={user?<Blogs/>:<Navigate replace to='/'/>}></Route>
          <Route path='/blogs/:id' element={<Blog blogs={blogs}
            updateBlog={updateBlog} deleteBlog={deleteBlog} addComments={addComments}
          />}></Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App
