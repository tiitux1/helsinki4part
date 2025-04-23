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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
