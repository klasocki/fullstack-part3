const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('post', (request) => {
    if (request.method === 'POST')
        return JSON.stringify(request.body)
    else
        return ''
})

morgan.format('tinyPost', ':method :url :status :res[content-length] - :response-time ms :post')
app.use(morgan('tinyPost'))

require('dotenv').config()
const Person = require('./models/person')

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.count({}).then(
        count => response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    )
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const person = new Person(body)
    person.save()
        .then(savedPerson => response.json(savedPerson.toJSON()))
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
    response.status(204).end()
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = request.body

    Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError' || error.name === 'MongoServerError') {
        return response.status(400).json({error: error.message})
    }
    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})