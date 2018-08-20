'use strict'

const test = require('tape')
const createHafas = require('vbb-hafas')
const sinon = require('sinon')
const isStream = require('is-stream')

const createMonitor = require('.')

const stations = ['900000100003', '900000023201'] // alex & zoo
const interval = 5 * 1000 // 5s



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
	const hafasMock = mockedHafas()
	const clock = sinon.useFakeTimers()
	const s1 = createMonitor(hafasMock, stations, interval)
	const s2 = createMonitor(hafasMock, stations)

	t.ok(isStream(s1))
	t.ok(isStream(s2))

	s1.destroy()
	s2.destroy()
	clock.tick(30 * 1000)
	clock.restore()
})



test('starts querying in steps', (t) => {
	t.plan(3)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval, 50)
	t.equal(hafasMock.departures.callCount, 0)
	clock.tick(1)
	t.equal(hafasMock.departures.callCount, 1)
	clock.tick(50)
	t.equal(hafasMock.departures.callCount, 2)

	s.destroy()
	clock.restore()
})



test('checks for every `interval` milliseconds', (t) => {
	t.plan(3)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval, 1)
	t.equal(hafasMock.departures.callCount, 0)
	clock.tick(1)
	t.equal(hafasMock.departures.callCount, stations.length)
	clock.tick(interval)
	t.equal(hafasMock.departures.callCount, 2 * stations.length)

	s.destroy()
	clock.restore()
})



test('runs a manual check', (t) => {
	t.plan(2)
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval, 10)
	const oldCount = hafasMock.departures.callCount

	s.manual('900000100003')
	t.equal(hafasMock.departures.callCount, oldCount + 1)
	t.equal(hafasMock.departures.getCall(oldCount).args[0], '900000100003')

	s.destroy()
})



test('clears all intervals on `destroy()`', (t) => {
	t.plan(1)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, interval, 1)
	clock.tick(1 + 5 * interval)
	const count = hafasMock.departures.callCount

	s.destroy()
	clock.tick(5 * interval)
	t.equal(hafasMock.departures.callCount, count)

	clock.restore()
})



test('emits `close` & `end` on `destroy()`', (t) => {
	t.plan(2)

	const hafas = createHafas('hafas-monitor-departures test')
	const s = createMonitor(hafas, stations, interval, 100)
	s.on('data', () => {})

	const onClose = sinon.spy()
	const onEnd = sinon.spy()
	s.on('close', onClose)
	s.on('end', onEnd)

	setImmediate(() => {
		s.destroy()
		setImmediate(() => {
			t.equal(onClose.callCount, 1)
			t.equal(onEnd.callCount, 1)
		})
	})
})
