const boardAlgorithms = {
	'step-by-step': BoardNaive,
	'hashlife': BoardHashlife
}

// Used to change instance of simulation algorithm used
// Preserves state when switching
class BoardSwitcher {
	constructor(element) {
		this.element = element
		this.setAlgorithm('step-by-step')
	}

	update() {
		// If user input changed, then change the algorithm
		let newInput = document.getElementById(this.element).value
		this.setAlgorithm(newInput)
	}

	setAlgorithm(name) {
		// Only change algorithm if different and valid
		if (this.current !== name && name in boardAlgorithms) {
			let newBoard = new boardAlgorithms[name]()

			// Serialize the old board, and transfer the data to the new board
			if (this.board) {
				newBoard.deserialize(this.board.serialize())
			}

			// Switch to new board
			this.board = newBoard
			this.current = name

			// Redraw
			this.board.draw()

			console.log('Set algorithm to: ' + name)
		}
	}
}
