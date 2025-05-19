const express = require('express')
const Blog = require('../models/blog')
const blogsRouter = express.Router()

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs)
})

blogsRouter.post('/', async (req, res) => {
  try {
    const blogData = req.body
    if (blogData.likes === undefined) {
      blogData.likes = 0
    }
    const blog = new Blog(blogData)
    const savedBlog = await blog.save()
    res.status(201).json(savedBlog)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
    }
    throw error
  }
})

module.exports = blogsRouter
