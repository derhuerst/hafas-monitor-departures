'use strict'

const test = require('tape')
const hafas = require('vbb-hafas')
const sinon = require('sinon')
const isStream = require('is-stream')

const createMonitor = require('./index')

const stations = ['900000100003', '900000023201'] // alex & zoo
const interval = 10 * 1000 // 10s
const step = Math.floor(interval / stations.length)



const mockedDeparture = (id, opt) => () => ({
	station: {id},
	when: new Date(opt.when + 5 * 1000).toISOString(),
	delay: 2,
	direction: 'foo',
	line: {
		type: 'line',
		id: '123',
		name: '123 Line',
		public: true,
		mode: 'train'
	},
	trip: Math.round(Math.random() * 30000)
})

const mockedDepartures = (id, opt) =>
	new Promise((yay, nay) => {
		setTimeout(() => {
			const deps = new Array(opt.duration).fill(null)
				.map(mockedDeparture(id, opt))
			yay(deps)
		}, 500)
	})

const mockedHafas = () => ({
	departures: sinon.spy(mockedDepartures)
})



test('returns a stream', (t) => {
	t.plan(2)
	const s1 = createMonitor(hafas, stations, interval)
	const s2 = createMonitor(hafas, stations)

	t.ok(isStream(s1))
	t.ok(isStream(s2))

	s1.stop()
	s2.stop()
})



test('starts querying in steps', (t) => {
	t.plan(3)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval)
	t.equal(hafasMock.departures.callCount, 0)
	clock.tick(1)
	t.equal(hafasMock.departures.callCount, 1)
	clock.tick(step)
	t.equal(hafasMock.departures.callCount, 2)

	s.stop()
	clock.restore()
})



test('checks for every `interval` milliseconds', (t) => {
	t.plan(3)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval)
	t.equal(hafasMock.departures.callCount, 0)
	clock.tick(step)
	t.equal(hafasMock.departures.callCount, stations.length)
	clock.tick(interval)
	t.equal(hafasMock.departures.callCount, 2 * stations.length)

	s.stop()
	clock.restore()
})



test('runs a manual check', (t) => {
	t.plan(2)
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval)
	const oldCount = hafasMock.departures.callCount

	s.manual('900000100003')
	t.equal(hafasMock.departures.callCount, oldCount + 1)
	t.equal(hafasMock.departures.getCall(oldCount).args[0], '900000100003')

	s.stop()
})



test('clears all intervals on `stop()`', (t) => {
	t.plan(1)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval)
	clock.tick(step + 5 * interval)
	const count = hafasMock.departures.callCount

	s.stop()
	clock.tick(5 * interval)
	t.equal(hafasMock.departures.callCount, count)

	clock.restore()
})



test('emits `close` & `end` on `stop()`', (t) => {
	t.plan(2)
	const s = createMonitor(hafas, stations, interval)
	s.on('data', () => {})
	const onClose = sinon.spy()
	const onEnd = sinon.spy()
	s.on('close', onClose)
	s.on('end', onEnd)

	setImmediate(() => {
		s.stop()
		setImmediate(() => {
			t.equal(onClose.callCount, 1)
			t.equal(onEnd.callCount, 1)
		})
	})
})
