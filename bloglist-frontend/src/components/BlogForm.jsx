import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: title,
      author: author,
      url: url,
    })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  const handleTitleChange = ({ target }) => setTitle(target.value)

  const handleAuthorChange = ({ target }) => setAuthor(target.value)

  const handleUrlChange = ({ target }) => setUrl(target.value)

  return (
    <form onSubmit={addBlog}>
      <h2>Create New</h2>
      <div>
        title
        <input
          id='title'
          type='text'
          value={title}
          name='Title'
          onChange={handleTitleChange}
          placeholder='title'
        />
      </div>
      <div>
        author
        <input
          id='author'
          type='text'
          value={author}
          name='Author'
          onChange={handleAuthorChange}
          placeholder='author'
        />
      </div>
      <div>
        url
        <input
          id='url'
          type='text'
          value={url}
          name='Url'
          onChange={handleUrlChange}
          placeholder='url'
        />
      </div>
      <div>
        <button type='submit'>create</button>
      </div>
    </form>
  )
}

BlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
}

export default BlogForm
