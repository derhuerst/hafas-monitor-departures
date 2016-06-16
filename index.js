'use strict'

const hafas = require('vbb-hafas')
const ndjson = require('ndjson')
const fs = require('fs')
const stations = require('vbb-stations')



const interval = 20
const db = ndjson.stringify()
db.pipe(fs.createWriteStream('db.ndjson'))

const fetch = (id) => setInterval(() => {
	console.info('->', id)
	hafas.departures(id, {duration: interval})
	.then((deps) => {
		console.info('<-', id)
		for (let dep of deps) db.write({
			  when:      dep.when / 1000
			, delay:     'delay' in dep ? dep.delay / 1000 : null
			, station:   dep.station.id
			, product:   dep.product.line
			, direction: dep.direction
		})
	}, console.error)
}, interval * 60 * 1000)



stations('all').on('error', console.error)
.on('data', (s) => fetch(s.id))
