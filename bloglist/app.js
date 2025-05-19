require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const middleware = require('./utils/middleware')

const app = express()
app.use(express.json())
app.use(cors())

const Blog = require('./models/blog')

// MongoDB connection
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist'
mongoose.connect(mongoUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error))

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

app.use(middleware.tokenExtractor)

// Routes
app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

module.exports = app
