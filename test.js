'use strict'

const test = require('tape-catch')
const sinon = require('sinon')
const isStream = require('is-stream')

const monitor = require('./index')



const stations = [9100003, 9023201] // alex & zoo
const interval = 10 * 1000 // 10s

const mockedDeparture = (id, opt) => () => ({
	  station: {id}
	, when: new Date(opt.when + 5 * 1000)
	, delay: 2 * 1000
	, direction: 'foo'
	, product: {line: 123}
	, trip: Math.round(Math.random() * 30000)
})

const mockedDepartures = (id, opt) => new Promise((yay, nay) =>
	setTimeout(yay, 500, new Array(opt.duration).map(mockedDeparture(id, opt))))

const mockedHafas = () => ({departures: sinon.spy(mockedDepartures)})



// todo
