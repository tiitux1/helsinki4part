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

blogsRouter.delete('/:id', async (req, res) => {
  await Blog.findByIdAndRemove(req.params.id)
  res.status(204).end()
})

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, context: 'query' }
    )
    if (updatedBlog) {
      res.json(updatedBlog)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter
