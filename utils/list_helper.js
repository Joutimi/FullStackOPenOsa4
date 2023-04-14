  const _ = require('lodash')
  
  const dummy = (blogs) => {
    return 1
  }

  const totalLikes = (blogs) => {
    var likesAmount = blogs.reduce(function(sum, blog) {
      return sum + blog.likes
    }, 0)
    return likesAmount
  }

  const favoriteBlog = (blogs) => {
    if(blogs.length != 0) {
      const mostLikes = blogs.reduce(
        (prev, current) => {
          return prev.likes > current.likes ? prev : current
      })
    return mostLikes
    } else return 0
  }

  const mostBlogs = (blogs) => {
    var blogsSummed = _(blogs)
      .groupBy('author')
      .map(function(items, author) {
        return { 
          author: author,
          blogs: items.length
        }
      }).value()
    return favoriteBlog(blogsSummed)
  }

  const mostLikes = (blogs) => {
    var likesSummed = _(blogs)
      .groupBy('author')
      .map(function(items, author) {
        return {
          author: author,
          likes: _.sumBy(items, function(item) {return item.likes})
        }
      })
    return favoriteBlog(likesSummed)
  }
  
  module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
  }