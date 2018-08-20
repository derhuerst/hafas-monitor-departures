# hafas-monitor-departures 🔭

**Pass in a HAFAS client, fetch all departures at any set of stations.** (You may get blacklisted.)

[![npm version](https://img.shields.io/npm/v/hafas-monitor-departures.svg)](https://www.npmjs.com/package/hafas-monitor-departures)
[![build status](https://img.shields.io/travis/derhuerst/hafas-monitor-departures.svg)](https://travis-ci.org/derhuerst/hafas-monitor-departures)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-monitor-departures.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install hafas-monitor-departures
```


## Usage

As an exampe, we're going to use [`vbb-hafas`, the HAFAS client for Berlin](https://www.npmjs.com/package/vbb-hafas).

```js
const createMonitor = require('hafas-monitor-departures')
const createHafas = require('vbb-hafas')

const stations = ['900000100003'] // array of station ids
const interval = 2 * 60 * 1000 // every two minutes

const hafas = createHafas('my-awesome-program')
const departures = createMonitor(hafas, stations, interval)
.on('error', console.error)
.on('data', console.log)

setTimeout(() => {
	departures.destroy() // stop querying
}, interval * 3)
```

`createMonitor` will call `hafas.departures()` and writes each of the returned departures into the stream. It expects `departures()` to be compatible with [the implementation from `hafas-client`](https://github.com/public-transport/hafas-client/blob/v2.5.0/docs/departures.md#departuresstation-opt).

*Note:* To stop a `hafas-monitor-departures` stream, call `stream.destroy()`.

To manually issue a *single* departures check at a station, use `departures.manual(id)`. The result will be emitted in a data event like all others.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/hafas-monitor-departures/issues).
