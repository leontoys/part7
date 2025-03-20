import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'
import { expect } from 'vitest'

describe('BlogForm', async () => {
  const mockHandler = vi.fn()

  beforeEach(() => {
    render(<BlogForm createBlog={mockHandler} />)
  })

  test('calls event handler with input when a new blog is created', async () => {
    const user = userEvent.setup()

    // Fill out the form fields
    await user.type(screen.getByPlaceholderText('title'), 'Test Blog Title')
    await user.type(screen.getByPlaceholderText('author'), 'Test Author')
    await user.type(screen.getByPlaceholderText('url'), 'http://testurl.com')

    // Submit the form
    await user.click(screen.getByText('create'))

    // Assert that createBlog was called with the correct details
    expect(mockHandler).toHaveBeenCalledWith({
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'http://testurl.com',
    })
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })
})
