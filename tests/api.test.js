const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

// Blogilista tietokannan alustukseen
const blogsForTesting = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
      },
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
      },
      {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
      },
      {
        _id: "5a422b891b54a676234d17fa",
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0
      },
      {
        _id: "5a422ba71b54a676234d17fb",
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0
      },
      {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
      },
]

//  Tietokannan alustus
beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(blogsForTesting)
})

describe('GET tests', () => {
    test('returned amount is correct', async () => {
        const response = await api.get('/api/blogs')
        const len = blogsForTesting.length
        expect(response.body).toHaveLength(len)
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
            'likes': 5 
        }
        
        await api
            .post('/api/blogs')
            .send(newBlogi)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const res = await api.get('/api/blogs')
        const resTitle = res.body.map(blg => blg.title)
        expect(resTitle).toContain('Otsikko1')
    })

    test('if likes is left empty, it will auto-set to 0', async () => {
        const newBlogi = {
            'title': 'Otsikko1',
            'author': 'Kirjoittaja Kirjanen',
            'url': 'ja/urlizzz/tassa.com',
            'likes': null
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
            'likes': 7
        }

        await api
        .post('/api/blogs')
        .send(newBlogi)
        .expect(400)

    }) 
})

describe('DELETE tests', () => {
    test('deleting works', async () => {
        const blogsAtBeginning = blogsForTesting
        const blogToBeDeleted = blogsAtBeginning[0]

        await api
            .delete(`/api/blogs/${blogToBeDeleted._id}`)
            .expect(204)

        const getBlogsAfterDeleting = async () => {
            const blogs = await Blog.find({})
            //console.log(blogs)
            return blogs.map(blog => blog.toJSON())
        }

        const blogsAtEnd = await getBlogsAfterDeleting()
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

        const getBlogsAfterUpdating = async () => {
            const blogs = await Blog.find({})
            //console.log(blogs)
            return blogs.map(blog => blog.toJSON())
        }

        const blogsAfterUpdate = await getBlogsAfterUpdating()
        //console.log(blogsAfterUpdate)
        expect(blogsAfterUpdate[0].likes).toEqual(10)

    })
})

afterAll(async () => {
    await mongoose.connection.close()
})