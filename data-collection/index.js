let io = require('socket.io').listen(3000)
let fs = require('fs')
let csvWriter = require('csv-write-stream')

class Recorder {
	constructor() {
		this.writer = csvWriter()

		// To detect changes in client data, which will trigger the creation of new csv files
		this.lastFilename = ''
		this.lastAlgorithm = ''
	}

	open(data) {
		this.end()

		// Open a new csv file
		let newFilename = `${data.filename}_${new Date().getTime()}.csv`
		console.log(`Recording to ${newFilename}...`)
		this.writer.pipe(fs.createWriteStream(newFilename))

		this.lastFilename = data.filename
		this.lastAlgorithm = data.algorithm
	}

	write(data) {
		// If the filename changed, then create another csv
		if (data.filename !== this.lastFilename || data.algorithm !== this.lastAlgorithm) {
			this.open(data)
		}

		// Write data to csv
		this.writer.write(data)
	}

	end() {
		if (this.lastFilename !== '') {
			this.writer.end()
			this.writer = csvWriter()
		}
		this.lastFilename = ''
		this.lastAlgorithm = ''
	}
}

let recorder = new Recorder()

io.on('connection', function(socket) {
	console.log('Client connected')

	socket.on('data', data => {
		recorder.write(data)
	})

	socket.on('disconnect', () => {
		recorder.end()
		console.log('Client disconnected')
	})
})
