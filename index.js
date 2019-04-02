const express = require('express')
const server = express()
const cors = require('cors')
const bcrypt = require('bcryptjs')
const knex = require('knex')
const knexConfig = require('./knexfile.js')
const session = require('express-session')
const KnexSessionStore = require('connect-session-knex')(session)

const db = knex(knexConfig.development)

const sessionConfig = {
  name: 'monster',
  secret: 'keep it a secret, keep it safe',
  cookie: {
    maxAge: 1000 * 60 * 10, //milliseconds
    secure: false, // use cookie over https
    httpOnly: true, // false means can JS access the cookie
  },
  resave: false, // resave recreating unchanged sessions
  saveUnitialized: false, // GDPR compliance
  store: new KnexSessionStore({
    knex: db,
    tablename: 'sessions',
    sidfieldname: 'sid',
    clearInterval: 1000 * 60 * 30, // deletes expired sessions
  })
}


server.use(express.json())
server.use(cors())
server.use(session(sessionConfig))

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
        req.session.user = user
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

server.get('/api/logout', (req, res) => {
  if(req.session) {
    req.session.destroy(err => {
      if(err) {
        res.status(500).json({ message: 'You can checkout but cannot leave' })
      } else {
        res.status(200).json({ message: 'Bye, thanks for visiting!' })
      }
    })
  } else {
    res.status(200).json({ message: 'Bye, thanks for visiting! Come back soon!' })
  }
})

const port = process.env.PORT || 5000
server.listen(port, () => {
  console.log(`\n** Running on port:${port} **\n`)
})
