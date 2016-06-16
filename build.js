'use strict'

const ndjson = require('ndjson')
const fs = require('fs')
const hafas = require('vbb-hafas')
const stations = require('vbb-stations')
const cfg = require('./config')



const fetch = (id, db) => {
	let i = 0
	const self = () => {
		if (++i < cfg.iterations) setTimeout(self, cfg.interval * 60 * 1000)

		const when = new Date(Date.now() + 60 * 1000)
		hafas.departures(id, {when, duration: cfg.interval}).then((deps) => {

			console.info(i, id)
			for (let dep of deps) db.write({
				  w:  dep.when / 1000
				, d:  'delay' in dep ? dep.delay / 1000 : null
				, s:  dep.station.id
				, l:  dep.product.line
				, dr: dep.direction
			})

		}, console.error)
	}
	return self
}



const db = ndjson.stringify()
db.pipe(fs.createWriteStream('data.ndjson'))

let x = 0
stations('all').on('error', console.error)
.on('data', (s) => setTimeout(fetch(s.id, db), x++ * 100)) // spread load
