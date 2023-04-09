require('dotenv').config()

let PORT = process.env.PORT
let MONGODBURL = process.env.MONGODB_URL

module.exports = {
    MONGODBURL,
    PORT
}