const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const tools = require('./testTools')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)


//  Tietokannan alustus
beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(tools.blogsForTesting)
})

describe('GET tests', () => {
    test('returned amount is correct', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(tools.blogsForTesting.length)
    })

    test('returns blogs as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('returned blog is identified correctly with id', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })

})

describe('POST tests', () => {
    test('adding new blog works', async () => {
        const newBlogi = {
            'title': 'Otsikko1',
            'author': 'Kirjoittaja Kirjanen',
            'url': 'ja/urlizzz/tassa.com',
            'likes': 5, 
            'userId': '6440f5c84234f396ff5f9907'
        }
        
        await api
            .post('/api/blogs')
            .send(newBlogi)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const res = await api.get('/api/blogs')
        const resTitle = res.body.map(blg => blg.title)
        expect(resTitle).toContain(newBlogi.title)
    })

    test('if likes is left empty, it will auto-set to 0', async () => {
        const newBlogi = {
            'title': 'Otsikko1',
            'author': 'Kirjoittaja Kirjanen',
            'url': 'ja/urlizzz/tassa.com',
            'likes': null,
            'userId': '6440f5c84234f396ff5f9907'
        }

        await api
        .post('/api/blogs')
        .send(newBlogi)
        .expect(201)
        .expect('Content-Type', /application\/json/)

        const res = await api.get('/api/blogs')
        const resLikes = res.body.map(blg => blg.likes)
        expect(resLikes[6]).toEqual(0)
    })

    test('title and/or url dont exist', async () => {
        const newBlogi = {
            'author': 'Kirjoittaja Kirjanen',
            'likes': 7,
            'userId': '6440f5c84234f396ff5f9907'
        }

        await api
        .post('/api/blogs')
        .send(newBlogi)
        .expect(400)

    }) 
})

describe('DELETE tests', () => {
    test('deleting works', async () => {
        const blogsAtBeginning = tools.blogsForTesting
        const blogToBeDeleted = blogsAtBeginning[0]

        await api
            .delete(`/api/blogs/${blogToBeDeleted._id}`)
            .expect(204)

        const blogsAtEnd = await tools.getBlogsAfter()
        //console.log(blogsAtEnd)

        expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length-1)


        const titles = blogsAtEnd.map(b => b.title)
        //console.log(titles)

        expect(titles).not.toContain(blogToBeDeleted.title)
    })
})

describe('PUT tests', () => {
    test('updating a blog works', async () => {

        const blogToBeUpdated = {
            id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 10
        }

        await api
            .put(`/api/blogs/${blogToBeUpdated.id}`)
            .send(blogToBeUpdated)
            .expect('Content-Type', /application\/json/)

        const blogsAfterUpdate = await tools.getBlogsAfter()
        //console.log(blogsAfterUpdate)
        expect(blogsAfterUpdate[0].likes).toEqual(10)

    })
})

// User tests
describe('user creation tests: when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await tools.getUsersAfter()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await tools.getUsersAfter()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await tools.getUsersAfter()
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('expected `username` to be unique')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

describe('user creation tests: username or password too short', () => {
    test('username is too short', async () => {
        const newUser = {
            username: 'je',
            name: 'Testiukkeli Makkonen',
            password: 'tamaonsalasana',
          }
        
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
    })

    test('password is too short', async () => {
        const newUser = {
            username: 'jeepulis',
            name: 'Testiukkeli Makkonen',
            password: 'ok',
          }
        
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})