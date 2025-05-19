const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../bloglist/app')
const Blog = require('../bloglist/models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Author One',
    url: 'http://example.com/1',
    likes: 1,
  },
  {
    title: 'Second blog',
    author: 'Author Two',
    url: 'http://example.com/2',
    likes: 2,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  for (const blog of initialBlogs) {
    const blogObject = new Blog(blog)
    await blogObject.save()
  }
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    blogs.forEach(blog => {
      expect(blog.id).toBeDefined()
      expect(blog._id).not.toBeDefined()
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('deletion edge cases', () => {
  test('deleting a non-existing blog returns 204', async () => {
    const validNonexistingId = await (async () => {
      const blog = new Blog({
        title: 'willremovethissoon',
        author: 'temp',
        url: 'http://temp.com',
        likes: 0,
      })
      await blog.save()
      await blog.remove()
      return blog._id.toString()
    })()

    await api.delete(`/api/blogs/${validNonexistingId}`).expect(204)
  })

  test('deleting with invalid id returns 400', async () => {
    const invalidId = '12345invalidid'
    await api.delete(`/api/blogs/${invalidId}`).expect(400)
  })
})

describe('performance and concurrency', () => {
  test('multiple blogs can be added concurrently', async () => {
    const newBlogs = [
      {
        title: 'Concurrent Blog 1',
        author: 'Author 1',
        url: 'http://example.com/concurrent1',
        likes: 1,
      },
      {
        title: 'Concurrent Blog 2',
        author: 'Author 2',
        url: 'http://example.com/concurrent2',
        likes: 2,
      },
      {
        title: 'Concurrent Blog 3',
        author: 'Author 3',
        url: 'http://example.com/concurrent3',
        likes: 3,
      },
    ]

    await Promise.all(
      newBlogs.map(blog =>
        api.post('/api/blogs').send(blog).expect(201).expect('Content-Type', /application\/json/)
      )
    )

    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)
    newBlogs.forEach(blog => {
      expect(titles).toContain(blog.title)
    })
  })
})

describe('edge cases and validation', () => {
  test('adding a blog without title returns 400', async () => {
    const newBlog = {
      author: 'Author NoTitle',
      url: 'http://example.com/notitle',
      likes: 1,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })

  test('adding a blog without url returns 400', async () => {
    const newBlog = {
      title: 'No URL Blog',
      author: 'Author NoUrl',
      likes: 1,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })

  test('adding a blog with empty title and url returns 400', async () => {
    const newBlog = {
      title: '',
      author: 'Author Empty',
      url: '',
      likes: 1,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })

  test('adding a blog with invalid likes value returns 400', async () => {
    const newBlog = {
      title: 'Invalid Likes',
      author: 'Author Invalid',
      url: 'http://example.com/invalidlikes',
      likes: 'not-a-number',
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Author New',
      url: 'http://example.com/new',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('New blog')
  })

  test('blog without likes defaults to 0', async () => {
    const newBlog = {
      title: 'No likes blog',
      author: 'Author NoLikes',
      url: 'http://example.com/nolikes',
    }

    const response = await api.post('/api/blogs').send(newBlog).expect(201)
    expect(response.body.likes).toBe(0)
  })

  test('blog without title and url is not added', async () => {
    const newBlog = {
      author: 'Author Missing',
      likes: 1,
    }

    await api.post('/api/blogs').send(newBlog).expect(400)
  })
})

describe('deletion of a blog', () => {
  test('a blog can be deleted', async () => {
    const response = await api.get('/api/blogs')
    const blogToDelete = response.body[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAfterDeletion = await api.get('/api/blogs')
    expect(blogsAfterDeletion.body).toHaveLength(initialBlogs.length - 1)

    const titles = blogsAfterDeletion.body.map(r => r.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('a blog can be updated', async () => {
    const response = await api.get('/api/blogs')
    const blogToUpdate = response.body[0]

    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
    }

    await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog).expect(200)

    const blogsAfterUpdate = await api.get('/api/blogs')
    const updated = blogsAfterUpdate.body.find(b => b.id === blogToUpdate.id)
    expect(updated.likes).toBe(blogToUpdate.likes + 1)
  })
})
