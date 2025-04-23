const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('dummy', () => {
  test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    assert.strictEqual(result, 1)
  })
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })
})

describe('favorite blog', () => {
  const listWithBlogs = [
    {
      _id: '1',
      title: 'Blog One',
      author: 'Author One',
      url: 'http://example.com/1',
      likes: 2,
      __v: 0
    },
    {
      _id: '2',
      title: 'Blog Two',
      author: 'Author Two',
      url: 'http://example.com/2',
      likes: 5,
      __v: 0
    },
    {
      _id: '3',
      title: 'Blog Three',
      author: 'Author Three',
      url: 'http://example.com/3',
      likes: 3,
      __v: 0
    }
  ]

  test('returns the blog with most likes', () => {
    const result = listHelper.favoriteBlog(listWithBlogs)
    const expected = {
      _id: '2',
      title: 'Blog Two',
      author: 'Author Two',
      url: 'http://example.com/2',
      likes: 5,
      __v: 0
    }
    assert.deepStrictEqual(result, expected)
  })

  test('returns null for empty list', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })
})
