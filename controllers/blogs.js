const blogsRouter = require('express').Router()
const { request } = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.startsWith('Bearer ')) {
	  return authorization.replace('Bearer ', '')
	}
	return null
  }

// Get kaikki postaukset, palauttaa JSON muotoisen
blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
	response.json(blogs)
})

// Uuden postauksen postaus
blogsRouter.post('/', async (request, response, next) => {
	const body = request.body
	const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
	if (!decodedToken.id) {
	  return response.status(401).json({ error: 'token invalid' })
	}
	const user = await User.findById(decodedToken.id)

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
		user: user._id
	})

	if (!blog.likes) {
		blog.likes = 0
	}

	if (!blog.title || !blog.url) {
		return response.status(400).json({
			error: 'bad request'
		})
	}

	const blogSaved = await blog.save()
	user.blogs = user.blogs.concat(blogSaved._id)
	await user.save()
	response.status(201).json(blogSaved)
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