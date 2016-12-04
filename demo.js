'use strict'

const monitor = require('./index')

const stations = [9100003] // array of station ids
const interval = 2 * 60 * 1000 // every two minutes

monitor(stations, interval)
.on('error', console.error)
.on('data', console.log)

setTimeout(() => {
	departures.stop() // stop querying
}, interval * 3)
