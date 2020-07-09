const app = require('../src/app')
const { API_KEY } = require('../src/config')
const { expect } = require('chai')
const supertest = require('supertest')

const validUser = {
	firstName: 'mike',
	lastName: 'loser',
	address1: '123 Main St',
	address2: '',
	city: 'Dallas',
	state: 'TX',
	zip: '12345',
}
const invalidUser = {
	firstName: 'mike',
	lastName: 'loser',
	address1: '',
	address2: '',
	city: 'Dallas',
	state: 'TX',
	zip: '12345',
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

describe('App', () => {
	it(`GET / responds with 200 containg "Hello, world!"`, () => {
		return supertest(app).get('/').expect(200, `Hello, world!`)
	})

	it(`GET /address responds with 200 containg an array of addresses, without bearer token validation`, () => {
		return supertest(app)
			.get('/address')
			.expect(200)
			.expect('Content-Type', /json/)
			.then((res) => {
				expect(res.body).to.be.an('array')
			})
	})

	describe('POST ', () => {
		it('POST /address responds 400 when submitting blank required fields', () => {
			return supertest(app)
				.post('/address')
				.set('Authorization', `bearer ${API_KEY}`)
				.send(invalidUser)
				.expect(400)
		})
		it('POST /address responds 400 when state is more than 2 chars', () => {
			const stateInvlaid = { ...invalidUser, state: 'TXX' }
			return supertest(app)
				.post('/address')
				.set('Authorization', `bearer ${API_KEY}`)
				.send(stateInvlaid)
				.expect(400)
				.then((res) => {
					expect(
						res.body.message,
						'State must be provided and two characteres in length'
					)
				})
		})
		it('POST /address respond 400 when zip is more or less than 5', () => {
			const zipInvalid = { ...invalidUser, zip: '123456' }
			return supertest(app)
				.post('/address')
				.set('Authorization', `bearer ${API_KEY}`)
				.send(zipInvalid)
				.expect(400)
		})

		it('POST /address responds 200 when given a valid user', () => {
			return supertest(app)
				.post('/address')
				.set('Authorization', `bearer ${API_KEY}`)
				.send(validUser)
				.expect(200)
				.then((res) => {
					expect(res.body.message, 'posted!')
				})
		})
	})
	describe('DELETE', () => {
		it('DELETE /address should return 200 and set "archived" on deleted address', () => {
			const id = 'cb9753b4-feb4-4812-9688-70e939f184e4'
			const index = ADDRESSES.findIndex(
				(address) => address.id === id
			)
			ADDRESSES[index].archived = true
			const currentAddress = ADDRESSES.filter(
				(address) => address.id === id
			)
			const archived = 'archived'

			return supertest(app)
				.delete(`/address/${id}`)
				.set('Authorization', `bearer ${API_KEY}`)
				.expect(200)
				.expect('Content-Type', /json/)
				.then((res) => {
					expect(res.body).to.eql({
						message: 'deleted!',
						deletedItem: [
							{
								id:
									'cb9753b4-feb4-4812-9688-70e939f184e4',
								firstName: 'Bob',
								lastName: 'Drifter',
								address1: '123 Main',
								address2: '',
								city: 'Dallas',
								state: 'TX',
								zip: 12345,
								archived: true,
							},
						],
					})
				})
		})
	})
})
