require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { v4: uuid } = require('uuid')
const { NODE_ENV, API_KEY } = require('./config')
const { contentSecurityPolicy } = require('helmet')

const app = express()

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganOption))
app.use(express.json())
app.use(helmet())
app.use(cors())

function validateBearerToken(req, res, next) {
	const authToken = req.get('Authorization')
	const apiToken = API_KEY

	if (!authToken || authToken.split(' ')[1] !== apiToken) {
		return res.status(401).json({ error: 'Unauthorized request' })
	}

	next()
}

let ADDRESSES = [
	{
		id: 'cb9753b4-feb4-4812-9688-70e939f184e3',
		firstName: 'person',
		lastName: 'lastname',
		address1: '153 Avenue avenue',
		address2: 'apt 5',
		city: 'Dallas',
		state: 'TX',
		zip: 12345,
		archived: false,
	},
	{
		id: 'cb9753b4-feb4-4812-9688-70e939f184e4',
		firstName: 'Bob',
		lastName: 'Drifter',
		address1: '123 Main',
		address2: '',
		city: 'Dallas',
		state: 'TX',
		zip: 12345,
		archived: false,
	},
	{
		id: 'cb9753b4-feb4-4812-9688-70e939f184e5',
		firstName: 'Mary',
		lastName: 'Sullivan',
		address1: '152 Mulbery St',
		address2: '',
		city: 'Houston',
		state: 'TX',
		zip: 12347,
		archived: false,
	},
]

app.get('/', (req, res) => res.send('Hello, world!'))

app.get('/address', (req, res) => {
	const addressBook = ADDRESSES

	res.json(
		addressBook.filter((address) => address.archived === false)
	)
})

app.post('/address', validateBearerToken, (req, res) => {
	const {
		firstName,
		lastName,
		address1,
		address2,
		city,
		state,
		zip,
	} = req.body

	if (!firstName || !lastName) {
		return res
			.status(400)
			.send({ message: 'Firstname and Lastname is required' })
	}

	if (!address1 || !city) {
		return res
			.status(400)
			.send({ message: 'Address and City is required' })
	}

	if (!state || state.length !== 2) {
		return res.status(400).send({
			message:
				'State must be provided and be exactly two characteres in length',
		})
	}

	if (!zip || zip.length !== 5) {
		return res.status(400).send({
			message: 'Zip is required and must be exactly 5 digits',
		})
	}
	res.send({ message: 'posted!' })
})

app.delete('/address/:id', validateBearerToken, (req, res) => {
	const { id } = req.params
	const index = ADDRESSES.findIndex((address) => address.id === id)

	ADDRESSES[index].archived = true

	const currentAddress = ADDRESSES.filter(
		(address) => address.id === id
	)
	res.send({
		message: `deleted!`,
		deletedItem: currentAddress,
	})
})

app.use(
	(errorHandler = (error, req, res, _next) => {
		let response
		if (NODE_ENV === 'production') {
			response = { error: { message: 'server error' } }
		} else {
			console.error(error)
			response = { message: error.message, error }
		}
		res.status(500).json(response)
	})
)

module.exports = app
