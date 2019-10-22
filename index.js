'use strict'

const {Readable} = require('stream')
const createAvgWindow = require('live-moving-average')

const T_QUERY = Symbol('hafas-monitor-departures query time')

const createStationsMonitor = (hafas, stations, opt = {}) => {
	if (!hafas || 'function' !== typeof hafas.departures) {
		throw new Error('Invalid HAFAS client passed.')
	}
	if (!stations || stations.length === 0) {
		throw new Error('At least one station must be passed.')
	}

	const interval = opt.interval || 60 * 1000
	const step = opt.step || Math.floor(interval / stations.length)
	const duration = opt.duration || Math.ceil(interval / 60 / 1000)

	const avgDuration = createAvgWindow(5, 0)
	let reqs = 0, departures = 0
	const fetch = (id) => {
		const t0 = Date.now()
		reqs++

		const when = new Date(t0 + 60 * 1000)
		hafas.departures(id, {when, duration})
		.then((deps) => {
			if (stopped) return

			// collect metadata
			avgDuration.push(Date.now() - t0)
			departures += deps.length

			for (let dep of deps) {
				Object.defineProperty(dep, T_QUERY, {value: t0})
				out.push(dep)
			}

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
			if (stopped || i >= stations.length) return clearInterval(interval)
			fetch(stations[i])
			i++
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

	out.tQuery = T_QUERY
	return out
}

createStationsMonitor.tQuery = T_QUERY
module.exports = createStationsMonitor
