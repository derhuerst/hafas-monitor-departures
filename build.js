'use strict'

const ndjson = require('ndjson')
const zlib = require('zlib')
const fs = require('fs')
const hafas = require('vbb-hafas')
const multipipe = require('multipipe')
const stations = require('vbb-stations')
const cfg = require('./config')



const fetch = (id, db, cb) => {
	let i = 0
	const self = () => {
		if (++i < cfg.iterations) setTimeout(self, cfg.interval * 60 * 1000)

		const when = new Date(Date.now() + 60 * 1000)
		hafas.departures(id, {when, duration: cfg.interval}).then((deps) => {

			if (deps.length > 0) console.info(i, id, deps.length)
			for (let dep of deps) db.write({
				  w: dep.when / 1000
				, d: 'delay' in dep ? dep.delay / 1000 : null
				, s: dep.station.id
				, l: dep.product.line
				, t: dep.trip
			})

			if (i >= cfg.iterations) cb()
		}, console.error)
	}
	return self
}



const db = multipipe(
	  ndjson.stringify()
	, zlib.createGzip()
	, fs.createWriteStream('data.ndjson.gzip', {flags: 'a'})
)
db.on('error', console.error)
db.on('finish', () => console.log('finish'))

const noop = () => {}
stations(true, cfg.filter).then((stations) => {
	for (let i = 0; i < stations.length; i++) {
		const cb = i === (stations.length - 1) ? () => {db.end()} : noop
		setTimeout(fetch(stations[i].id, db, cb), i * 100) // spread load
	}
}, console.error)

process.on('SIGINT', () => {
	db.end()
	process.exit(0)
})
