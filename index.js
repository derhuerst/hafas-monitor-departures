'use strict'

const ReadableStream = require('stream').Readable
const hafas = require('vbb-hafas')



const fetch = (id, duration, out) => () => {
	const when = new Date(Date.now() + 60 * 1000)
	hafas.departures(id, {when, duration})
	.then((deps) => {
		for (let dep of deps) out.push({
			  when: dep.when
			, delay: dep.delay
			, station: dep.station.id
			, line: dep.product ? dep.product.line : null
			, trip: dep.trip
			, direction: dep.direction
		})
	}, (err) => out.emit(err))
}



module.exports = (stations, interval = 60 * 1000) => {
	if (!stations || stations.length === 0)
		throw new Error('At least one station must be passed.')



	const out = new ReadableStream({objectMode: true})
	out._read = () => {}
	out.stop = () => {
		stop()
		out.emit('close')
	}



	const intervals = {} // by station id

	const start = () => {
		const step = Math.min(Math.floor(interval / stations.length), 100)
		let delay = 0
		stations.forEach((id) => {
			if (intervals[id]) clearInterval(intervals[id])
			setTimeout(() => {
				const cb = fetch(id, interval / 60 / 1000, out)
				intervals[id] = setInterval(cb, interval)
				cb()
			}, delay)
			delay += step
		})
	}

	const stop = () => {
		for (let id in intervals) clearInterval(intervals[id])
	}



	start()
	return out
}
