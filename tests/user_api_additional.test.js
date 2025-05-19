const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../bloglist/app')
const User = require('../bloglist/models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
})

describe('user creation edge cases', () => {
  test('creation fails with missing username', async () => {
    const newUser = {
      name: 'No Username',
      password: 'validpassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be at least 3 characters long')
  })

  test('creation fails with missing password', async () => {
    const newUser = {
      username: 'nopassword',
      name: 'No Password',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password must be at least 3 characters long')
  })

  test('creation fails with empty username', async () => {
    const newUser = {
      username: '',
      name: 'Empty Username',
      password: 'validpassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be at least 3 characters long')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
