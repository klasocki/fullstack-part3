const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
morgan.token('post', (request) => {
    if (request.method === 'POST')
        return JSON.stringify(request.body)
    else
        return ''
})
morgan.format('tinyPost', ':method :url :status :res[content-length] - :response-time ms :post')
app.use(morgan('tinyPost'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }
    if (persons.find(p => person.name === p.name)) {
        return response.status(400).json({
            error: `${person.name} is already in the phonebook`
        })
    }
    person.id = Math.floor(Math.random() * 1e6)
    persons = persons.concat(person)
    response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})