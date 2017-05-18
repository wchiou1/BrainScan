// Base class for conway's game of life boards
class Board {
	constructor() {
		// Canvas/drawing
		this.canvas = document.getElementById('board')
		this.ctx = this.canvas.getContext('2d')
		this.ctx.imageSmoothingEnabled = false
		this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

		// Shared properties
		this.population = 0
		this.generation = 0
	}

	clearCanvas() {
		this.population = 0
		this.generation = 0
		this.clearImage()
		this.draw()
	}

	clearImage() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
	}

	// TODO: Update to use modulus to support zooming out
	drawCell(position, value) {
		// TODO: Use correct bounds when zooming
		if (within(position, 0, 0, this.canvas.width, this.canvas.height)) {
			let element = (position.y * 4) * this.canvas.width + (position.x * 4)

			// Red, green, blue, alpha
			this.imageData.data[element] = value
			this.imageData.data[element + 1] = value
			this.imageData.data[element + 2] = value
			this.imageData.data[element + 3] = 255
		}
	}

	// Renders data to canvas, updates interface
	draw() {
		this.ctx.putImageData(this.imageData, 0, 0)

		document.getElementById('population').innerHTML = this.population
		document.getElementById('generation').innerHTML = this.generation
	}

	importPattern(lines) {
		//Lets get the file dimensions
		var startParts = lines[0].split(',');
		var fileX=parseInt(startParts[0].split("= ")[1]);
		var fileY=parseInt(startParts[1].split("= ")[1]);

		let offsetX = Math.round((this.canvas.width - fileX) / 2)
		let offsetY = Math.round((this.canvas.height - fileY) / 2)

		var x=0;
		var y=0;
		//First line contains the dimensions of the pattern
		//The file comes in lines
		var debug="";
		for(var i=1;i<lines.length;i++){

			//First decode the line
			var string = decode(lines[i]);
			for(var j=0;j<string.length;j++){
				if(string[j]=='o'){
					debug+="1";
					this.addCell(hash(x + offsetX, y + offsetY));
					x=x+1;
				}
				else if(string[j]=='b'){
					debug+="0";
					x=x+1;
				}
			}
			x=0;
			y=y+1;
			debug+="\n";

		}

		function decode (str) {
			return str.replace(/(\d+)(\w)/g,
				function(m,n,c){
					return new Array( parseInt(n,10)+1 ).join(c);
				}
			);
		}
	}

	serialize() {
		return '[]'
	}

	deserialize(data) {
		// Array of cell hashes
		let cells = JSON.parse(data)
		for (let cell of cells) {
			this.addCell(cell)
		}
	}
}
