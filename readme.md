# vbb-monitor 🔭

**Fetch all departures of all lines at all stations of VBB.** (You may get blacklisted.)

[![npm version](https://img.shields.io/npm/v/vbb-monitor.svg)](https://www.npmjs.com/package/vbb-monitor)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-monitor.svg)](https://david-dm.org/derhuerst/vbb-monitor)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-monitor.svg)


## Installing

```shell
git clone https://github.com/derhuerst/vbb-monitor.git
cd vbb-monitor
npm install --production
npm start
```

*Note*: [*forever*](https://github.com/foreverjs/forever#readme) actually isn't  required to run `vbb-monitor`, but listed as a [peer dependency](https://docs.npmjs.com/files/package.json#peerdependencies). The `npm start` script calls *forever* for production usage, so to run `npm start`, you need to `npm install [-g] forever` before.


## Usage

```shell
node index.js
```

The data will be in `db.ndjson`.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-monitor/issues).
