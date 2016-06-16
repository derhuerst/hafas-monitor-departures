'use strict'

const ndjson = require('ndjson')
const rfs = require('rotating-file-stream')
const hafas = require('vbb-hafas')
const stations = require('vbb-stations')



const interval = 1
const filename = (t, i) => {
	if (!t) return 'db.ndjson'
	return `db-${i}.ndjson`
}
const db = ndjson.stringify()
db.pipe(rfs(filename, {size: '1G', compress: true}))

const fetch = (id) => () => {
	const when = new Date(Date.now() + 60 * 1000)
	hafas.departures(id, {when, duration: interval})
	.then((deps) => {
		console.info(id)
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
