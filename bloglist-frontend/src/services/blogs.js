import axios from 'axios'
const baseUrl = '/api/blogs'
let token = null

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then((response) => response.data)
}

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = async (blogObject) => {
  const config = {
    headers: { Authorization: token },
  }
  console.log('---blog service update---')
  try {
    const response = await axios.put(
      `${baseUrl}/${blogObject.id}`,
      blogObject,
      config,
    )
    console.log('response.data', response.data)
    return response.data
  } catch (error) {
    console.log('error', error)
    return
  }
}

const addComments = async (blogObject) => {
  const config = {
    headers: { Authorization: token },
  }
  console.log('---blog service update---')
  try {
    const response = await axios.put(
      `${baseUrl}/${blogObject.id}/comments`,
      blogObject,
      config,
    )
    console.log('response.data', response.data)
    return response.data
  } catch (error) {
    console.log('error', error)
    return
  }
}

const deleteBlog = async (blogId) => {
  console.log('---blog service delete---')
  const config = {
    headers: { Authorization: token },
  }
  try {
    const response = await axios.delete(`${baseUrl}/${blogId}`, config)
    console.log('response.data', response.data)
    return blogId
  } catch (error) {
    console.log('error', error)
    return
  }
}

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

export default { getAll, setToken, create, update, deleteBlog, addComments }
