'use strict'

const fs = require('fs')
const ndjson = require('ndjson')
const map = require('through2-map')



const data = () =>
	fs.createReadStream('data.ndjson')
	.pipe(ndjson.parse())
	.pipe(map.obj((d) =>
		({when: d.w, delay: d.d, station: d.s, line: d.l, direction: d.dr})))

module.exports = data
