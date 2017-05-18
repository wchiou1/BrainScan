// Source: https://github.com/sbarski/jolly
// We used this implementation to aid us in writing ours

// The quad tree uses arrays, so these are for readability to determine the element quadrants
const nw = 0
const ne = 1
const sw = 2
const se = 3

// Max width of board
const maxSize = Math.pow(2, 28)

// A node of a quad tree, meant to be used by the hashlife implementation
class QuadTree {
	constructor(board, id = undefined, children = undefined) {
		// Back reference to board state
		this.board = board

		// Unique identifier for this node
		if (typeof id === "undefined") {
			this.id = board.nextId++
		} else {
			this.id = id
		}

		// These are more QuadTree instances, ordered as such: [nw, ne, sw, se]
		// If this is undefined, we are in a leaf node
		this.children = children

		// Depth in tree (0 means leaf node)
		this.level = 0

		// Number of live cells in this node
		this.count = this.id

		// For memoizing results
		this.cache = []

		// Not just an initial cell
		if (this.id > 1 && children) {
			// 1 more than any of its children
			this.level = this.nw.level + 1

			// Add up children counts
			this.count = this.nw.count + this.ne.count + this.sw.count + this.se.count
		}
	}

	// Getters for specific children
	get nw() {
		return this.children ? this.children[nw] : undefined
	}

	get ne() {
		return this.children ? this.children[ne] : undefined
	}

	get sw() {
		return this.children ? this.children[sw] : undefined
	}

	get se() {
		return this.children ? this.children[se] : undefined
	}

	// Returns the power of 2 of the current depth of the tree
	get width() {
		return Math.pow(2, this.level)
	}

	get gensteps() {
		return Math.pow(2, this.level - 2)
	}

	// Calculates the next state of a particular cell, based on number of live neighbors
	score(state, neighbors) {
		if ((state === 1 && neighbors === 2) || neighbors === 3) {
			return 1
		}
		return 0
	}

	// Get child index closest to position
	getChildIndex(x, y) {
		let halfSize = Math.floor(this.width / 2)
		return Math.floor(x / halfSize) + (Math.floor(y / halfSize) * 2)
	}

	// Get child closest to position
	getChild(x, y) {
		return this.children[this.getChildIndex(x, y)]
	}

	// Returns the state of the cell at this position
	get(x, y) {
		// Found the child containing the cell, so return its state
		if (this.level === 0) {
			return this.count
		}

		// Recurse down one level
		let halfSize = Math.floor(this.width / 2)
		return this.getChild(x, y).get(x % halfSize, y % halfSize)
	}

	// Sets the state of the cell at this position (may require some quadtree modifications)
	set(x, y, state) {
		// Reached the cell that needs to be set
		// Return an already allocated cell, either alive or dead based on state
		if (this.level === 0) {
			return this.board.baseCells[state]
		}

		let halfSize = Math.floor(this.width / 2)
		let index = this.getChildIndex(x, y)

		// Allocate more children to store new cell state
		let newChildren = extend(this.children)

		// Recurse down
		newChildren[index] = newChildren[index].set(x % halfSize, y % halfSize, state)

		// Use memoization if possible
		return this.board.getNode(...newChildren)
	}

	// Returns an array of IDs of current children
	// Contains: [nw.id, ne.id, sw.id, se.id]
	getIds() {
		if (this.children) {
			return this.children.map(child => child.id)
		}
	}

	// Note: Method should only be ran at level 2
	// Simulates a 2x2 area (each cell needs a count of live cells around it, in a 3x3 area)
	simulate() {
		// Get an array of arrays of child IDs
		let ids = this.children.map(child => child.getIds())

		// Alias IDs for readability
		let aa = ids[nw][nw], ab = ids[nw][ne], ba = ids[nw][sw], bb = ids[nw][se]
		let ac = ids[ne][nw], ad = ids[ne][ne], bc = ids[ne][sw], bd = ids[ne][se]
		let ca = ids[sw][nw], cb = ids[sw][ne], da = ids[sw][sw], db = ids[sw][se]
		let cc = ids[se][nw], cd = ids[se][ne], dc = ids[se][sw], dd = ids[se][se]

		// Score the cells in the center, with their surrounding neighbors
		let scores = [
			this.score(bb, aa + ab + ac + ba + bc + ca + cb + cc),
			this.score(bc, ab + ac + ad + bb + bd + cb + cc + cd),
			this.score(cb, ba + bb + bc + ca + cc + da + db + dc),
			this.score(cc, bb + bc + bd + cb + cd + db + dc + dd)
		]

		// Return the data in the hash table with the ID built from the scores array
		return this.board.memo[scores]
	}

	// Split up sub problems
	subdivide(stepSize) {
		let halfSteps = Math.floor(this.gensteps / 2)

		let step1 = (stepSize <= halfSteps ? 0 : halfSteps)
		let step2 = stepSize - step1

		let sub = this.getSavedCenter(step1)
		let n00 = sub[0], n01 = sub[1], n02 = sub[2]
		let n10 = sub[3], n11 = sub[4], n12 = sub[5]
		let n20 = sub[6], n21 = sub[7], n22 = sub[8]

		return this.board.getNode(
			this.board.getNode(n00, n01, n10, n11).nextCenter(step2),
			this.board.getNode(n01, n02, n11, n12).nextCenter(step2),
			this.board.getNode(n10, n11, n20, n21).nextCenter(step2),
			this.board.getNode(n11, n12, n21, n22).nextCenter(step2)
		)
	}

	nextCenter(stepSize = 1) {
		if (stepSize === 0) {
			return this.center()
		}

		if (this.cache[stepSize]) {
			return this.cache[stepSize]
		}

		let result = undefined

		// Simulate or continue recursing
		if (this.level === 2) {
			result = this.simulate()
		} else {
			result = this.subdivide(stepSize)
		}

		this.cache[stepSize] = result

		return result
	}

	getSavedCenter(stepSize) {
		let result = []
		for (let i = 0; i < 9; ++i) {
			result[i] = this.subquad(i).nextCenter(stepSize)
		}
		return result
	}

	center() {
		if (typeof(this.cache[0]) != "undefined" && this.cache.length > 0) {
			return this.cache[0]
		}

		// Get center 2x2 area of nodes, within the 4x4 area
		let result = this.board.getNode(this.nw.se, this.ne.sw, this.sw.ne, this.se.nw)
		this.cache[0] = result
		if (typeof result === "undefined")
			console.log("An undefined center?! That's impossible!")
		return result
	}

	subquad(i) {
		if (i == 0) return this.nw
		if (i == 1) return this.board.getNode(this.nw.ne, this.ne.nw, this.nw.se, this.ne.sw)
		if (i == 2) return this.ne
		if (i == 3) return this.board.getNode(this.nw.sw, this.nw.se, this.sw.nw, this.sw.ne)
		if (i == 4) return this.center()
		if (i == 5) return this.board.getNode(this.ne.sw, this.ne.se, this.se.nw, this.se.ne)
		if (i == 6) return this.sw
		if (i == 7) return this.board.getNode(this.sw.ne, this.se.nw, this.sw.se, this.se.sw)
		if (i == 8) return this.se
	}

	getList(result, x, y, rect) {
		//Returns the coordinates of all the filled cells in the given rect
		if (this.count == 0) {
			return
		}

		if (rect) {
			//minx, miny, maxx, maxy = rect

			let minx = rect.x
			let miny = rect.y
			let maxx = rect.x + rect.width
			let maxy = rect.y + rect.height

			if (x >= maxx || x + this.width <= minx || y >= maxy || y + this.width <= miny) {
				return
			}
		}

		if (this.level == 0) {
			result.push([x, y])
		} else {
			let half = this.width / 2

			this.nw.getList(result, x, y, rect)
			this.ne.getList(result, x + half, y, rect)
			this.sw.getList(result, x, y + half, rect)
			this.se.getList(result, x + half, y + half, rect)
		}
	}
}

// Similar to LifeBoard
// Hashlife implementation
class BoardHashlife extends Board {
	constructor() {
		super()

		this.init()
	}

	init() {
		// Used for assigning new IDs
		this.nextId = 2

		// Setup base cells
		this.baseCells = [new QuadTree(this, 0), new QuadTree(this, 1)]

		// Set root node
		this.root = this.baseCells[0]

		// Set the origin coordinates
		this.originX = 0
		this.originY = 0

		// Hash table
		this.memo = []

		// All possible states of a 2x2 cell
		for (let i = 0; i < 16; ++i) {
			// Example: [1, 0, 1, 0]
			let index = this.getIndex(i)

			// Example: [Alive, Dead, Alive, Dead]
			let nodes = index.map(state => this.baseCells[state])

			// Store node for this 2x2 arrangement in the hash table
			this.memo[index] = new QuadTree(this, undefined, nodes)
		}

		this.resetEmpty()

		this.coreIds = this.nextId - 1
	}

	getIndex(i) {
		return [i & 1, (i & 2) / 2, (i & 4) / 4, (i & 8) / 8]
	}

	resetEmpty() {
		// Stores empty nodes
		this.empty = [this.baseCells[0], this.memo[[0, 0, 0, 0]]]
	}

	clear() {
		this.init()
		this.clearCanvas()
	}

	draw() {
		this.clearImage()

		// Iterate through quadtree and draw data in leaf nodes
		// An easier solution would be to get the area as a list, then just go through that and draw those as pixels
		let result = []
		this.root.getList(result, this.originX, this.originY)
		for (let pos of result) {
			this.drawCell({x: pos[0], y: pos[1]}, 0)
		}


		// Draw canvas data, and update population display
		super.draw()
	}

	addCell(cell) {
		let pos = unhash(cell)

		this.set(pos.x, pos.y, 1)
	}

	simulate(stepSize = 1) {
		this.generation += stepSize

		// Step forward using hashlife algorithm
		this.step(stepSize)

		this.population = this.root.count
	}

	serialize() {
		// Serialize quadtree data back into an array of live cell positions
		return '[]'
	}

	emptyNode(level) {
		if (level < this.empty.length) {
			return this.empty[level]
		}

		let node = this.emptyNode(level - 1)

		let result = this.getNode(node, node, node, node)

		this.empty.push(result)

		return result
	}

	// Returns a node with the same IDs, or creates a new one
	getNode(nw, ne, sw, se) {
		if (typeof nw === "undefined" || typeof ne === "undefined" || typeof sw === "undefined" || typeof se === "undefined")
			console.log("An undefined child! How did that happen?!")
		let index = [nw.id, ne.id, sw.id, se.id]

		// Node already exists with same pattern
		if (this.memo[index]) {
			return this.memo[index]
		}

		// Create new node with specified children
		let result = new QuadTree(this, undefined, [nw, ne, sw, se])
		this.memo[index] = result
		return result
	}

	set(x, y, state) {

		// Only set if state changed
		if (this.root.get(x - this.originX, y - this.originY) !== state) {
			let width = this.root.width

			while (x < this.originX || y < this.originY || x >= this.originX + width || y >= this.originY + width) {
				this.getDouble()
				width = this.root.width
			}

			this.root = this.root.set(x - this.originX, y - this.originY, state)
		}
	}

	getDouble() {
		if (this.root.level == 0) {
			let index = [this.root.id, 0, 0, 0]
			this.root = this.memo[index]
			return
		}

		this.originX -= this.root.width / 2
		this.originY -= this.root.width / 2

		let e = this.emptyNode(this.root.level - 1)

		let nwNode = this.getNode(e, e, e, this.root.nw)
		let neNode = this.getNode(e, e, this.root.ne, e)
		let swNode = this.getNode(e, this.root.sw, e, e)
		let seNode = this.getNode(this.root.se, e, e, e)

		this.root = this.getNode(nwNode, neNode, swNode, seNode)
	}

	trim() {
		while (true) {
			if (this.root.count === 0) {
				this.root = this.baseCells[0]
			}

			if (this.root.level <= 1) {
				return
			}

			let sub = null
			for (let index = 0; index < 9; index++) {
				sub = this.root.subquad(index)

				if (sub.count == this.root.count) {
					this.originX += Math.floor(sub.width / 2) * Math.floor(index % 3)
					this.originY += Math.floor(sub.width / 2) * Math.floor(index / 3)
					this.root = sub
					break
				}
				sub = null
			}

			if (sub === null)
				return
		}
	}

	canonicalize(node, trans) {
		if (node.id < 18) {
			return node
		}

		if (typeof(trans[node.id]) == "undefined") {
			trans[node.id] = this.getNode(
				this.canonicalize(node.nw, trans),
				this.canonicalize(node.ne, trans),
				this.canonicalize(node.sw, trans),
				this.canonicalize(node.se, trans))
		}

		return trans[node.id]
	}

	collect() {
		this.trim()

		this.resetEmpty()

		let old = this.memo
		this.memo = []

		// Copy only initial 16 2x2 patterns
		for (let i = 0; i < 16; ++i) {
			let index = this.getIndex(i)
			this.memo[index] = old[index]
		}

		let trans = []
		this.root = this.canonicalize(this.root, trans)
	}

	step(steps) {
		if (steps <= 0) {
			return
		}

		if (this.root.width > maxSize) {
			this.collect()
		}

		this.getDouble()
		this.getDouble()

		while (steps > this.root.gensteps) {
			steps -= this.root.gensteps
			this.root = this.root.nextCenter(this.root.gensteps)

			this.getDouble()
			this.getDouble()
		}

		this.root = this.root.nextCenter(steps)

		this.originX = this.originX + this.root.width / 2
		this.originY = this.originY + this.root.width / 2

		this.draw()
	}

}
