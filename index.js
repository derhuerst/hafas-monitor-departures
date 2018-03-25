'use strict'

const {Readable} = require('stream')
const createAvgWindow = require('live-moving-average')

const createMonitor = (hafas, stations, interval) => {
	if (!hafas || 'function' !== typeof hafas.departures) {
		throw new Error('Invalid HAFAS client passed.')
	}
	if (!stations || stations.length === 0) {
		throw new Error('At least one station must be passed.')
	}
	interval = interval || 60 * 1000
	const step = Math.floor(interval / stations.length)
	const duration = Math.ceil(interval / 60 / 1000)

	const avgDuration = createAvgWindow(5, 0)
	let reqs = 0, departures = 0
	const fetch = (id) => {
		const start = Date.now()
		reqs++

		const when = new Date(start + 60 * 1000)
		hafas.departures(id, {when, duration})
		.then((deps) => {
			if (stopped) return

			avgDuration.push(Date.now() - start)
			departures += deps.length

			for (let dep of deps) out.push(dep)

			// todo: debounce this
			out.emit('stats', {
				reqs, departures, avgDuration: avgDuration.get()
			})
		})
		.catch(err => out.emit('error', err))
	}

	const fetchAll = () => {
		let i = 1
		const interval = setInterval(() => {
			fetch(stations[i])
			i++
			if (stopped || i >= stations.length) clearInterval(interval)
		}, step)
		fetch(stations[0])
	}

	const out = new Readable({
		objectMode: true,
		read: () => {}
	})
	out.manual = fetch

	let stopped = false
	let _interval = setInterval(fetchAll, interval)
	setImmediate(fetchAll)
	out.stop = () => {
		if (!stopped) {
			stopped = true
			clearInterval(_interval)
			_interval = null
		}
		out.emit('close')
		out.push(null) // end
	}

	return out
}

module.exports = createMonitor
