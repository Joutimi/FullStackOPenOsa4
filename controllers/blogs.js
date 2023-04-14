const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// Get kaikki postaukset, palauttaa JSON muotoisen
blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
	response.json(blogs)


})

// Uuden postauksen postaus
blogsRouter.post('/', (request, response, next) => {
	const blog = new Blog(request.body)
	if (!blog.likes) {
		blog.likes = 0
	}

	if (!blog.title || !blog.url) {
		return response.status(400).json({
			error: 'bad request'
		})
	}

	blog
		.save()
		.then(result => {
			response.status(201).json(result)
		})
	
	.catch(error => next.error)
})


module.exports = blogsRouter