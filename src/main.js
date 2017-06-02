let main = undefined
var magic = undefined
var array = undefined
var regions = undefined
class Main {
	constructor() {//This is the same as onload
		var nifti = require('nifti-js')
		var ndarray = require('ndarray')
		var io = require('pex-io')
		regions = ndarray(new Array(39277),[217,181]);
		io.loadBinary('data/JHU_MNI_SS_WMPM_TypeII_edited_flipy.nii', function (err, buffer) {
			var file = nifti.parse(buffer);
			console.log(file.sizes.slice().reverse());
			array = ndarray(file.data, file.sizes.slice().reverse());
			//Setup the hashlife stuff we got in the lazy canvas
			magic = new MagicMain(array,regions);
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
	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
	main = new Main()
}


