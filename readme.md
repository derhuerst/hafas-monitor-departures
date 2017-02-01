# vbb-monitor 🔭

**Fetch all departures of all lines at all stations of VBB.** (You may get blacklisted.)

[![npm version](https://img.shields.io/npm/v/vbb-monitor.svg)](https://www.npmjs.com/package/vbb-monitor)
[![build status](https://img.shields.io/travis/derhuerst/vbb-monitor.svg)](https://travis-ci.org/derhuerst/vbb-monitor)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-monitor.svg)](https://david-dm.org/derhuerst/vbb-monitor)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-monitor.svg)](https://david-dm.org/derhuerst/vbb-monitor#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-monitor.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


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

The stream will emit data like this:

```js
{
	when: 2016-08-02T18:46:00.000Z,
	delay: 240000,
	station: '900000100030',
	line: 'M6',
	trip: 25157,
	direction: 'S Hackescher Markt'
}
// …
{
	when: 2016-08-02T18:49:00.000Z,
	delay: 120000,
	station: '900000100031',
	line: '100',
	trip: 3078,
	direction: 'S+U Zoologischer Garten'
}
```

*Note:* A stream created by calling `monitor(…)` does not stop calling the API if you `unpipe` it. You need to manually call `departures.stop()`.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-monitor/issues).
