# vbb-monitor 🔭

**Fetch all departures at any set of VBB stations.** (You may get blacklisted.)

[![npm version](https://img.shields.io/npm/v/vbb-monitor.svg)](https://www.npmjs.com/package/vbb-monitor)
[![build status](https://img.shields.io/travis/derhuerst/vbb-monitor.svg)](https://travis-ci.org/derhuerst/vbb-monitor)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-monitor.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install vbb-monitor
```


## Usage

```js
const monitor = require('vbb-monitor')

const stations = ['900000100003'] // array of station ids
const interval = 2 * 60 * 1000 // every two minutes

const departures = monitor(stations, interval)
.on('error', console.error)
.on('data', console.log)

setTimeout(() => {
	departures.stop() // stop querying
}, interval * 3)
```

The stream will emit [*Friendly Public Transport Format* `1.0.1`](https://github.com/public-transport/friendly-public-transport-format/blob/1.0.1/spec/readme.md) [departures](https://github.com/derhuerst/hafas-client/blob/master/docs/departures.md#response), looking like this:

```js
{
	journeyId: '1|26644|13|86|16012018',
	station: {
		type: 'station',
		id: '900000100005',
		name: 'U Alexanderplatz [Tram]',
		location: {
			type: 'location',
			latitude: 52.522389,
			longitude: 13.414495
		},
		products: {
			suburban: false,
			subway: false,
			tram: true,
			bus: false,
			ferry: false,
			express: false,
			regional: false
		}
	},
	when: '2018-01-16T14:22:00.000+01:00',
	direction: 'S+U Hauptbahnhof',
	line: {
		type: 'line',
		id: '4250',
		name: 'M5',
		public: true,
		product: 'tram',
		mode: 'train',
		symbol: null,
		nr: null,
		metro: false,
		express: false,
		night: false,
		operator: {
			type: 'operator',
			id: 'berliner-verkehrsbetriebe',
			name: 'Berliner Verkehrsbetriebe'
		},
		productCode: 2,
		class: 4
	},
	trip: 26644,
	delay: 1080
}
```

*Note:* A stream created by calling `monitor(…)` does not stop calling the API if you `unpipe` it. You need to manually call `departures.stop()`.

To manually issue a *single* departures check at a station, use `departures.manual(id)`. The result will be emitted in a data event like all others.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-monitor/issues).
