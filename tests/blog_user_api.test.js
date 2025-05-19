const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../bloglist/app')
const Blog = require('../bloglist/models/blog')
const User = require('../bloglist/models/user')

const api = supertest(app)

let userId = null

beforeAll(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: 'hashedpassword',
  })
  const savedUser = await user.save()
  userId = savedUser._id
})

describe('blog creation with user association', () => {
  test('a blog is created with a user assigned', async () => {
    const newBlog = {
      title: 'Blog with user',
      author: 'Author',
      url: 'http://example.com/blog',
      likes: 5,
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.user).toBeDefined()
    expect(response.body.user.username).toBe('testuser')
  })

  test('all blogs include user info', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    response.body.forEach(blog => {
      expect(blog.user).toBeDefined()
      expect(blog.user.username).toBe('testuser')
    })
  })
})

describe('user listing includes blogs', () => {
  test('users include their blogs', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const user = response.body.find(u => u.username === 'testuser')
    expect(user).toBeDefined()
    expect(user.blogs).toBeDefined()
    expect(user.blogs.length).toBeGreaterThan(0)
    expect(user.blogs[0].title).toBe('Blog with user')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
