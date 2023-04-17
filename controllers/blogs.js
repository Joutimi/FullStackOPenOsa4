const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// Get kaikki postaukset, palauttaa JSON muotoisen
blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
	response.json(blogs)
})

// Uuden postauksen postaus
blogsRouter.post('/', async (request, response, next) => {
	const blog = new Blog(request.body)
	if (!blog.likes) {
		blog.likes = 0
	}

	if (!blog.title || !blog.url) {
		return response.status(400).json({
			error: 'bad request'
		})
	}

	await blog
		.save()
		.then(result => {
			response.status(201).json(result)
		})
	
	.catch(error => next.error)
})

// Blogin poisto
blogsRouter.delete('/:id', async (req, res) => {
	await Blog.findByIdAndRemove(req.params.id)
	res.status(204).end()
})

// Blogin päivitys
blogsRouter.put('/:id', (req, res, next) => {
	const {title, author, url, likes} = req.body

	Blog.findByIdAndUpdate(
		req.params.id,
		{ title, author, url, likes },
		{ new: true, context: 'query' }
	  )
		.then(updatedBlog => {
		  res.json(updatedBlog)
		})
		.catch(error => next(error))
})


module.exports = blogsRouter