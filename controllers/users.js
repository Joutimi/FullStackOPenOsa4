const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate('blogs', {url: 1, title: 1, author: 1})
    res.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save().catch(next => next.error)
  response.status(201).json(savedUser)

/*   if(username.length< 3) {
    response.status(400).json({error: 'invalid username'})
  } else if(password.length < 3) {
    response.status(400).json({error: 'invalid password'})
  } else if (username.unique === false) {
    response.status(400).json({error: 'expected `username` to be unique'})
  } else {
    const savedUser = await user.save()
    response.status(201).json(savedUser).catch(next => next.error)
  } */
  
 
})

module.exports = usersRouter