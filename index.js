'use strict'

const hafas = require('vbb-hafas')
const ndjson = require('ndjson')
const zlib = require('zlib')
const fs = require('fs')
const stations = require('vbb-stations')



const interval = 20
const db = ndjson.stringify()
db.pipe(zlib.createGzip()).pipe(fs.createWriteStream('db.ndjson'))

const fetch = (id) => () => {
	console.info('->', id)
	hafas.departures(id, {duration: interval})
	.then((deps) => {
		console.info('<-', id)
		for (let dep of deps) db.write({
			  w:  dep.when / 1000
			, d:  'delay' in dep ? dep.delay / 1000 : null
			, s:  dep.station.id
			, p:  dep.product.line
			, dr: dep.direction
		})
	}, console.error)
}



stations('all').on('error', console.error)
.on('data', (s) => {
	const f = fetch(s.id)
	setInterval(f, interval * 60 * 1000)
	f()
})
