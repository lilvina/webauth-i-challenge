const express = require('express')
const server = express()
const cors = require('cors')
const bcrypt = require('bcryptjs')

const knex = require('knex')
const knexConfig = require('./knexfile.js')

const db = knex(knexConfig.development)


server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
  res.send("Learning Auth")
})

server.post('/api/register', (req, res) => {
  let user = req.body

  //hash password
  const hash = bcrypt.hashSync(user.password, 4)
  user.password = hash

  db('user')
    .insert(user)
    .then(saved => {
      res.status(201).json(saved)
    }).catch(err => {
      res.status(500).json(err)
    })
})

server.post('/api/login', (req, res) => {
  db('user').where({username: req.body.username})
    .first()
    .then(user => {
      if(user && bcrypt.compareSync(req.body.password, user.password)) {
        res.status(200).json({ message: `Logged In`, cookie: user.id})
      } else {
        res.status(401).json({ message: 'Invalid credentials'})
      }
    }).catch(err => {
      res.status(500).json(err)
    })
})

server.get('/api/users', restricted, (req, res) => {
  db('user').then(users => {
    res.status(200).json(users)
  }).catch(err => res.status(500).json(err))
})

function restricted(req, res, next) {
  const { username, password } = req.headers
  if(username && password) {
    db('user').where({ username: username })
      .first()
      .then(user => {
        if(user && bcrypt.compareSync(password, user.password)) {
          next()
        } else {
          res.status(401).json({ message: 'You shall not pass!!' })
        }
      }).catch(err => {
        res.status(500).json(err)
      })
  } else {
    res.status(401).json({ message: 'Please provide credentials' })
  }
}

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`\n** Running on port:${port} **\n`)
})
