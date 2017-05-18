let main = undefined

class Main {
	constructor() {
		var nifti = require('nifti-js')
		var ndarray = require('ndarray')
		var io = require('pex-io')
		io.loadBinary('data/Glx_digitSC_PC.nii', function (err, buffer) {
			var file = nifti.parse(buffer);
			var array = ndarray(file.data, file.sizes.slice().reverse());
			console.log(array);
		})
		this.simulate = false
		this.stepSize = 1

		this.boardSwitcher = new BoardSwitcher('algorithm')

		// Setup file drag and drop handler for the canvas
		this.fileDrop = new FileDrop('board', (data, name) => {
			// Clear the board, import the pattern, and draw it
			this.boardSwitcher.board.clear()

			// Record initial memory usage and filename
			this.record(0, name)

			this.boardSwitcher.board.importPattern(data)
			this.boardSwitcher.board.draw()
		})

		this.setupKeyboardInput()

		// Try to connect to socket.io server
		this.socket = io.connect('http://localhost:3000', {
			reconnection: false
		})
		this.socket.on('connect', () => {
			console.log('Connected to server successfully!')
		})
		this.socket.on('disconnect', () => {
			console.log('Disconnected from server?')
		})

		// Start loop
		requestAnimationFrame(() => {this.loop()})
	}

	// Record data by sending it to the socket.io server
	record(time = 0, name = undefined) {
		if (name) {
			this.lastName = name
		}
		if (this.socket && this.socket.connected) {
			// Time is in milliseconds (time for the last step)
			// Memory is in bytes (current total heap memory used)
			this.socket.emit('data', {
				filename: this.lastName,
				algorithm: this.boardSwitcher.current,
				generation: this.boardSwitcher.board.generation,
				population: this.boardSwitcher.board.population,
				stepSize: this.stepSize,
				time: time,
				memory: this.getMemoryUsage()
			})
		}
	}

	setupKeyboardInput() {
		this.listener = new window.keypress.Listener()

		// Press enter to go forward once by the step size
		this.listener.simple_combo('enter', () => {
			this.runSimulation()
		})

		// Press space to toggle simulation
		this.listener.simple_combo('space', () => {
			this.toggleSimulate()
		})

		// Press r to clear the board
		this.listener.simple_combo('r', () => {
			this.boardSwitcher.board.clear()
		})
	}

	timedSimulation() {
		let start = performance.now()
		this.boardSwitcher.board.simulate(this.stepSize)
		let end = performance.now()
		return (end - start)
	}

	runSimulation() {
		let time = this.timedSimulation()

		// Record timing and memory data for the current algorithm
		this.record(time)

		this.boardSwitcher.board.draw()
	}

	loop() {
		// Check if user changed algorithm
		this.boardSwitcher.update()

		// Continue simulation if currently running
		if (this.simulate) {
			this.runSimulation()
		}

		requestAnimationFrame(() => {this.loop()})
	}

	// Handles changing the step size input by only a power of 2
	handleLog2Input() {
		let num = parseInt(document.getElementById("step-size").value)
		let result = 0
		if (num < this.stepSize) {
			result = Math.pow(2, Math.floor(Math.log2(num)))
		} else {
			result = Math.pow(2, Math.ceil(Math.log2(num)))
		}
		if (isNaN(result)) {
			result = 1
		}
		this.stepSize = result
		document.getElementById("step-size").value = result
	}

	toggleSimulate() {
		this.simulate = !this.simulate
		let text = this.simulate ? 'Stop' : 'Run'
		document.getElementById('run').value = text
	}

	clear() {
		this.boardSwitcher.board.clear()
	}

	// Returns current memory usage in bytes, or 0 on error
	getMemoryUsage() {
		if (performance && performance.memory) {
			return performance.memory.usedJSHeapSize
		}
		return 0
	}
}

window.onload = () => {
	main = new Main()
}
