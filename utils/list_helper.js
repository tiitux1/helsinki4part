const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  let favorite = blogs[0]
  for (const blog of blogs) {
    if ((blog.likes || 0) > (favorite.likes || 0)) {
      favorite = blog
    }
  }
  return favorite
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const counts = {}
  for (const blog of blogs) {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  }
  let maxAuthor = null
  let maxCount = 0
  for (const author in counts) {
    if (counts[author] > maxCount) {
      maxAuthor = author
      maxCount = counts[author]
    }
  }
  return {
    author: maxAuthor,
    blogs: maxCount
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}
