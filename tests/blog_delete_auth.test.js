const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../bloglist/app')
const User = require('../bloglist/models/user')
const Blog = require('../bloglist/models/blog')

const api = supertest(app)

let token = null
let blogId = null

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

  const newBlog = {
    title: 'Blog to be deleted',
    author: 'Author',
    url: 'http://example.com/delete',
    likes: 0,
  }

  const blogResponse = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)

  blogId = blogResponse.body.id
})

describe('blog deletion authorization', () => {
  test('fails without token', async () => {
    await api
      .delete(`/api/blogs/${blogId}`)
      .expect(401)
  })

  test('fails with token of different user', async () => {
    // Create another user
    const passwordHash = await bcrypt.hash('sekret2', 10)
    const otherUser = new User({ username: 'other', name: 'Other User', passwordHash })
    await otherUser.save()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'other', password: 'sekret2' })

    const otherToken = loginResponse.body.token

    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)
  })

  test('succeeds with token of creator', async () => {
    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
