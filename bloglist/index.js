require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

const Blog = require('./models/blog')

// MongoDB yhteys
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloglist'
mongoose.connect(mongoUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error))

const blogsRouter = require('./controllers/blogs')

// Reitit
app.use('/api/blogs', blogsRouter)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
