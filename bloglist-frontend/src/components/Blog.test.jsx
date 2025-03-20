import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { expect } from 'vitest'

describe('Blog', async () => {
  const blog = {
    title: 'hello world',
    author: 'leon',
    url: 'www.helloworld.com/blogs',
    likes: 1000,
    id: '1',
  }
  const mockUser = { name: 'leon' }

  const mockHandler = vi.fn()

  let container

  beforeEach(() => {
    container = render(
      <Blog
        blog={blog}
        updateBlog={mockHandler}
        loggedUser={mockUser}
        deleteBlog={mockHandler}
      />,
    ).container
  })

  test('at start title and author displayed', () => {
    const div = container.querySelector('.blogInfo')
    expect(div).toHaveStyle('display: block')
  })

  test('at start url or likes not displayed', () => {
    const div = container.querySelector('.blogDetails')
    expect(div).toHaveStyle('display: none')
  })

  test('after clicking the button url and likes are displayed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const div = container.querySelector('.blogDetails')
    expect(div).not.toHaveStyle('display: none')
  })

  test('like button click calls event handler twice', async () => {
    const user = userEvent.setup()

    // Click the 'view' button to show the like button
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    // Get the like button and click it twice
    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    // Assert that the updateBlog handler is called twice
    expect(mockHandler).toHaveBeenCalledTimes(2)
  })
})
