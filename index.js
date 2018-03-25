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
	stations = Array.from(stations) // clone
	interval = interval || 60 * 1000
	const duration = Math.ceil(interval / 60 / 1000)

	let step
	const recomputeStep = () => {
		step = Math.floor(interval / stations.length)
	}
	recomputeStep()

	const addStation = (station) => {
		if (!stations.includes(station)) stations.push(station)
		recomputeStep()
	}
	const removeStation = (station) => {
		const i = stations.indexOf(station)
		if (i >= 0) stations.splice(i, 1)
		recomputeStep()
	}

	const avgDuration = createAvgWindow(5, 0)
	let reqs = 0, departures = 0
	const fetch = (id) => {
		const start = Date.now()
		reqs++

		const when = new Date(start + 60 * 1000)
		hafas.departures(id, {when, duration})
		.then((deps) => {
			if (stopped) return

			departures += deps.length
			for (let dep of deps) out.push(dep)

			avgDuration.push(Date.now() - start)
			// todo: debounce this
			out.emit('stats', {
				reqs, departures, avgDuration: avgDuration.get()
			})
		})
		.catch(err => out.emit('error', err))
	}

	const fetchAll = () => {
		if (stations.length === 0) return

		// clone because they might change during the execution
		let _stations = stations, i = 1
		const interval = setInterval(() => {
			if (stopped || i >= _stations.length) return clearInterval(interval)
			fetch(_stations[i])
			i++
		}, step)
		fetch(_stations[0])
	}

	const out = new Readable({
		objectMode: true,
		read: () => {}
	})
	out.manual = fetch
	out.addStation = addStation
	out.removeStation = removeStation

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
