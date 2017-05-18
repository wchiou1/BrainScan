// Step-by-step implementation
class BoardNaive extends Board {
	constructor() {
		super()
		this.cells = new Set()
	}

	clear() {
		this.cells.clear()
		this.clearCanvas()
	}

	addCell(cell) {
		if (!this.cells.has(cell)) {
			this.population++
		}
		this.cells.add(cell)
		this.drawCell(unhash(cell), 0)
	}

	removeCell(cell) {
		if (this.cells.has(cell)) {
			this.population--
		}
		this.cells.delete(cell)
		this.drawCell(unhash(cell), 255)
	}

	// Returns count of neighboring live cells
	// Also optionally keeps track of surrounding dead cells
	checkCell(cell, deadCells) {
		let position = unhash(cell)
		let alive = 0
		for (let y = -1; y <= 1; ++y) {
			for (let x = -1; x <= 1; ++x) {
				// Skip current cell, only count neighbors
				if (x === 0 && y === 0) {
					continue
				}
				let key = hash(position.x + x, position.y + y)
				if (this.cells.has(key)) {
					++alive
				} else if (deadCells) {
					deadCells.add(key)
				}
			}
		}
		return alive
	}

	// Runs life simulation stepSize number of times
	simulate(stepSize = 1) {
		// console.log(window.performance.memory);
		// console.log(`Simulating ${stepSize} generation(s)...`)
		for (let i of range(0, stepSize)) {
			this.generation++

			let deadCells = new Set()
			let toAdd = []
			let toRemove = []

			// Simulate survival logic
			for (let cell of this.cells) {
				let count = this.checkCell(cell, deadCells)
				if (count === 2 || count === 3) {
					toAdd.push(cell)
				} else {
					toRemove.push(cell)
				}
			}

			// Simulate birth logic
			for (let cell of deadCells) {
				let count = this.checkCell(cell)
				if (count === 3) {
					toAdd.push(cell)
				} else {
					toRemove.push(cell)
				}
			}

			// Apply state changes
			for (let cell of toAdd) {
				this.addCell(cell)
			}
			for (let cell of toRemove) {
				this.removeCell(cell)
			}
		}
	}

	serialize() {
		return JSON.stringify(Array.from(this.cells))
	}
}
