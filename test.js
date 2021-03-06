'use strict'

const test = require('tape')
const createHafas = require('vbb-hafas')
const sinon = require('sinon')

const createMonitor = require('.')

const stations = ['900000100003', '900000023201'] // alex & zoo
const interval = 5 * 1000 // 5s



const mockedDeparture = (id, opt) => () => ({
	tripId: Math.round(Math.random() * 30000),
	stop: {type: 'stop', id},
	when: new Date(opt.when + 5 * 1000).toISOString(),
	plannedWhen: new Date(opt.when + 7 * 1000).toISOString(),
	delay: 2,
	direction: 'foo',
	line: {
		type: 'line',
		id: '123',
		name: '123 Line',
		public: true,
		mode: 'train'
	}
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



test('exposes query time', (t) => {
	t.plan(2)
	const hafasMock = mockedHafas()
	const clock = sinon.useFakeTimers()
	const m = createMonitor(hafasMock, stations)

	m.once('departure', (dep) => {
		t.equal(typeof dep[createMonitor.tQuery], 'number')
		t.equal(typeof dep[m.tQuery], 'number')
	})
	clock.tick(30 * 1000)
	clock.restore()
})



test('starts querying in steps', (t) => {
	t.plan(3)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, {interval, step: 50})
	s.once('departure', () => {})
	t.equal(hafasMock.departures.callCount, 0)
	clock.tick(1)
	t.equal(hafasMock.departures.callCount, 1)
	clock.tick(50)
	t.equal(hafasMock.departures.callCount, 2)

	clock.restore()
})



test('checks for every `interval` milliseconds', (t) => {
	t.plan(3)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()
	const onDep = () => {}

	const s = createMonitor(hafasMock, stations, {interval, step: 1})
	s.on('departure', onDep)
	t.equal(hafasMock.departures.callCount, 0)
	clock.tick(1)
	t.equal(hafasMock.departures.callCount, stations.length)
	clock.tick(interval)
	t.equal(hafasMock.departures.callCount, 2 * stations.length)

	s.removeListener('departure', onDep)
	clock.restore()
})



test('runs a manual check', (t) => {
	t.plan(2)
	const hafasMock = mockedHafas()

	const s = createMonitor(hafasMock, stations, {interval, step: 10})
	const oldCount = hafasMock.departures.callCount

	s.manual('900000100003')
	t.equal(hafasMock.departures.callCount, 1)
	t.equal(hafasMock.departures.getCall(0).args[0], '900000100003')
})



test('clears all intervals on `stop()`', (t) => {
	t.plan(1)
	const clock = sinon.useFakeTimers()
	const hafasMock = mockedHafas()
	const onDep = () => {}

	const s = createMonitor(hafasMock, stations, {interval, step: 1})
	s.on('departure', onDep)
	clock.tick(1 + 5 * interval)
	const count = hafasMock.departures.callCount

	s.removeListener('departure', onDep)
	clock.tick(5 * interval)
	t.equal(hafasMock.departures.callCount, count)

	clock.restore()
})
