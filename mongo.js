const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://abc:${password}@cluster0.m0mvp.mongodb.net/phonebook?retryWrites=true&w=majority`

console.log(url)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: {type: String, minLength: 3, required: true},
    number: {type: String, minLength: 8, required: true},
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 5) {
    Person.find({}).then(result => {
        result.forEach(note => {
            console.log(note)
        })
        mongoose.connection.close()
    })
} else {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(() => {
        console.log('person saved!')
        mongoose.connection.close()
    })

}
