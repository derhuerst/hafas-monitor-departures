# hafas-monitor-departures 🔭

**Pass in a HAFAS client, fetch all departures at any set of stations.** (You may get blacklisted.)

If you want to monitor trips/departures in an area, use [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips). It polls HAFAS more efficiently.

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
	departures.stop() // stop querying
}, interval * 3)
```

`createMonitor` will call `hafas.departures()` and writes each of the returned departures into the stream. It expects `departures()` to be compatible with [the implementation from `hafas-client`](https://github.com/public-transport/hafas-client/blob/v2.5.0/docs/departures.md#departuresstation-opt).

*Note:* A stream created by calling `createMonitor(…)` does not stop calling the API if you `unpipe` it. You need to manually call `departures.stop()`.

To manually issue a *single* departures check at a station, use `departures.manual(id)`. The result will be emitted in a data event like all others.


## Related

- [`hafas-record-delays`](https://npmjs.com/package/hafas-record-delays) – Record delays from [`hafas-monitor-departures`](https://github.com/derhuerst/hafas-monitor-departures) into a [LevelDB](http://leveldb.org).
- [`record-vbb-delays`](https://npmjs.com/package/record-vbb-delays) – Record VBB departures from HAFAS.
- [`hafas-monitor-trips`](https://npmjs.com/package/hafas-monitor-trips) – Using a HAFAS endpoint, watch all trips in a bounding box.
- [`hafas-monitor-trips-server`](https://npmjs.com/package/hafas-monitor-trips-server) – A server that manages [`hafas-monitor-trips`](https://github.com/derhuerst/hafas-monitor-trips) instances.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/hafas-monitor-departures/issues).
