const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const knex = require('knex')
const knexConfig = require('./knexfile.js')

const db = knex(knexConfig.development)

const server = express()

server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
  res.send("Learning Auth")
})

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`\n** Running on port:${port} **\n`)
})
