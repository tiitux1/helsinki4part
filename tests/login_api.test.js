const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../bloglist/app')
const User = require('../bloglist/models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()
})

describe('login', () => {
  test('succeeds with valid credentials', async () => {
    const loginData = {
      username: 'root',
      password: 'sekret',
    }

    const response = await api
      .post('/api/login')
      .send(loginData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.token).toBeDefined()
    expect(response.body.username).toBe(loginData.username)
  })

  test('fails with invalid username', async () => {
    const loginData = {
      username: 'wronguser',
      password: 'sekret',
    }

    const response = await api
      .post('/api/login')
      .send(loginData)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })

  test('fails with invalid password', async () => {
    const loginData = {
      username: 'root',
      password: 'wrongpassword',
    }

    const response = await api
      .post('/api/login')
      .send(loginData)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('invalid username or password')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
