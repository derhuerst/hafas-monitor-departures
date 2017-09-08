'use strict'

const monitor = require('.')

const alexanderplatz = '900000100003'
const stations = [alexanderplatz] // array of station ids
const interval = 2 * 60 * 1000 // every two minutes

monitor(stations, interval)
.on('error', console.error)
.on('data', console.log)

setTimeout(() => {
	departures.stop() // stop querying
}, interval * 3)
