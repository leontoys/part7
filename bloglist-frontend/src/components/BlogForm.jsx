import { Table, Form, Button, FormGroup } from 'react-bootstrap'
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
    <Form onSubmit={addBlog}>
      <h2>Create New</h2>
      <FormGroup>
        <Form.Label>title:</Form.Label>
        <Form.Control
          id='title'
          type='text'
          value={title}
          name='Title'
          onChange={handleTitleChange}
          placeholder='title'
        />
      </FormGroup>
      <FormGroup>
        <Form.Label>author:</Form.Label>
        <Form.Control
          id='author'
          type='text'
          value={author}
          name='Author'
          onChange={handleAuthorChange}
          placeholder='author'
        />
      </FormGroup>
      <FormGroup>
        <Form.Label>url:</Form.Label>
        <Form.Control
          id='url'
          type='text'
          value={url}
          name='Url'
          onChange={handleUrlChange}
          placeholder='url'
        />
      </FormGroup>
      <div>
        <Button type='submit'>create</Button>
      </div>
    </Form>
  )
}

BlogForm.propTypes = {
  createBlog: PropTypes.func.isRequired,
}

export default BlogForm
