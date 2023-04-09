const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// Get kaikki postaukset, palauttaa JSON muotoisen
blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
    response.json(blogs)
    })
})

// Uuden postauksen postaus
blogsRouter.post('/', (request, response) => {
const blog = new Blog(request.body)
  blog
    .save()
    .then(result => {
    response.status(201).json(result)
    })
})


module.exports = blogsRouter