const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')

mongoose.set('strictQuery', false)

// Yhdistäminen alkaa -logi
logger.infolog('connecting to', config.MONGODBURL)

// Yhdistäminen
mongoose.connect(config.MONGODBURL)
	.then(() => {
		logger.infolog('Connected to MongoDB')
	})
	.catch((error) => {
		logger.errorlog('Error connecting to MongoDB', error.message)
	})

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

module.exports = app