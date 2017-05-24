let main = undefined
var magic = undefined
var array = undefined
class Main {
	
	

	
	constructor() {//This is the same as onload
		var nifti = require('nifti-js')
		var ndarray = require('ndarray')
		var io = require('pex-io')
		io.loadBinary('data/JHU_MNI_SS_WMPM_TypeII_edited_flipy.nii', function (err, buffer) {
			var file = nifti.parse(buffer);
			array = ndarray(file.data, file.sizes.slice().reverse());
			//Setup the hashlife stuff we got in the lazy canvas
			magic = new MagicMain(array);
		})
		
	}

	toggleSimulate() {
		this.simulate = !this.simulate
		let text = this.simulate ? 'Stop' : 'Run'
		document.getElementById('run').value = text
	}

	clear() {
		this.boardSwitcher.board.clear()
	}
}


window.onload = () => {
	main = new Main()
}
