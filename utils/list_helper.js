  const dummy = (blogs) => {
    return 1
  }

  const totalLikes = (blogs) => {
    var likesAmount = blogs.reduce(function(sum, blog) {
      console.log('logi:', sum, blog)
      return sum + blog.likes
    }, 0)
    console.log('likesAmount: ', likesAmount)
    return likesAmount
  }
  
  module.exports = {
    dummy, totalLikes
  }