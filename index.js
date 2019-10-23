'use strict'

const createAvgWindow = require('live-moving-average')
const {EventEmitter} = require('events')
const debug = require('debug')('hafas-monitor-departures')

const WATCH_EVENTS = [
	'departure',
	'stopover',
	'stats'
]

const T_QUERY = Symbol('hafas-monitor-departures query time')

const defaults = {
	interval: 6 * 1000,
	departuresOpt: {}
}

const createStationsMonitor = (hafas, stations, opt = {}) => {
	if (!hafas || 'function' !== typeof hafas.departures) {
		throw new Error('Invalid HAFAS client passed.')
	}
	if (!stations || stations.length === 0) {
		throw new Error('At least one station must be passed.')
	}

	const {interval, departuresOpt} = {...defaults, ...opt}
	const step = opt.step || Math.floor(interval / stations.length)
	const duration = opt.duration || Math.ceil(interval / 60 / 1000)

	const avgDuration = createAvgWindow(5, 0)
	let reqs = 0, departures = 0
	const fetch = (id) => {
		const t0 = Date.now()
		reqs++

		const when = new Date(t0 + 60 * 1000)
		hafas.departures(id, {
			...departuresOpt,
			when, duration, stopovers: fetchStopovers
		})
		.then((deps) => {
			if (!running) return

			// collect metadata
			avgDuration.push(Date.now() - t0)
			departures += deps.length

			for (let dep of deps) {
				Object.defineProperty(dep, T_QUERY, {value: t0})
				out.emit('departure', dep)
				if (Array.isArray(dep.nextStopovers)) {
					for (const st of dep.nextStopovers) {
						out.emit('stopover', st)
					}
				}
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
			if (!running || i >= stations.length) {
				clearInterval(interval)
				return;
			}
			fetch(stations[i])
			i++
		}, step)
		fetch(stations[0])
	}

	const out = new EventEmitter()
	out.manual = fetch

	let listeners = 0, running = false, timer = null
	let fetchStopovers = false
	out.on('newListener', (eventName) => {
		if (!WATCH_EVENTS.includes(eventName) || listeners > 0) return;
		debug('starting monitor')

		timer = setInterval(fetchAll, interval)
		setImmediate(fetchAll)
		running = true
		listeners++

		if (eventName === 'stopover') fetchStopovers = true
	})
	out.on('removeListener', (eventName) => {
		if (!WATCH_EVENTS.includes(eventName) || listeners < 1) return;
		debug('stopping monitor')

		clearInterval(timer)
		running = false
		listeners--

		fetchStopovers = out.listenerCount('stopover') <= 1
	})

	out.tQuery = T_QUERY
	return out
}

createStationsMonitor.tQuery = T_QUERY
module.exports = createStationsMonitor
