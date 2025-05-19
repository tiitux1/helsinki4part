const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../bloglist/app')
const User = require('../bloglist/models/user')
const Blog = require('../bloglist/models/blog')

const api = supertest(app)

let token = null

beforeAll(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()

  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })

  token = response.body.token
})

describe('blog creation with token authentication', () => {
  test('fails without token', async () => {
    const newBlog = {
      title: 'Blog without token',
      author: 'Author',
      url: 'http://example.com/no-token',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })

  test('succeeds with valid token and assigns user', async () => {
    const newBlog = {
      title: 'Blog with token',
      author: 'Author',
      url: 'http://example.com/with-token',
      likes: 10,
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.user).toBeDefined()
    expect(response.body.user.username).toBe('root')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
