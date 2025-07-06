let pixels1 = null;
let pixels2 = null;
let width, height;

const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const keyInput = document.getElementById('keyInput');

function loadImage(file, targetCanvas, callback) {
	const img = new Image();
	img.onload = () => {
		width = img.width;
		height = img.height;
		// Force to square
		if (width > height) width = height;
		else height = width;
		// Force even dimensions
		if (width % 2 !== 0) width--;
		if (height % 2 !== 0) height--;
		targetCanvas.width = width;
		targetCanvas.height = height;
		const ctx = targetCanvas.getContext('2d');
		ctx.drawImage(img,0,0);
		const imageData = ctx.getImageData(0,0,width,height);
		const pixels = [];
		for(let y=0;y<height;y++){
			const row = [];
			for(let x=0;x<width;x++){
				const i = (y*width + x)*4;
				row.push([
					imageData.data[i],
					imageData.data[i+1],
					imageData.data[i+2]
				]);
			}
			pixels.push(row);
		}
		callback(pixels);
	};
	img.src = URL.createObjectURL(file);
}

document.getElementById('fileInput1').addEventListener('change', e => {
	const file = e.target.files[0];
	if (file) {
		loadImage(file, canvas1, (pix) => { pixels1 = pix; pixels2 = null; });
	}
});

document.getElementById('fileInput2').addEventListener('change', e => {
	const file = e.target.files[0];
	if (file) {
		loadImage(file, canvas2, (pix) => { pixels2 = pix; });
	}
});

function shuffle(){
	if(!pixels1) { alert("Upload original image first."); return; }

	// Generate random key
	const keyBits = [];
	for(let i=0;i<64;i++) keyBits.push(Math.round(Math.random()));
	keyInput.value = keyBits.join("");

	let pixels = JSON.parse(JSON.stringify(pixels1));
	for(let i=0;i<keyBits.length;i++){
		pixels = shuffle2D(pixels, keyBits[i]);
	}
	pixels2 = pixels;

	// Ensure canvas2 has correct size
	canvas2.width = width;
	canvas2.height = height;

	drawPixels(pixels2, canvas2);
}

function unshuffle(){
	if(!pixels2) { alert("Upload shuffled image or shuffle first."); return; }

	const keyStr = keyInput.value.trim();
	if(!/^[01]+$/.test(keyStr)){
		alert("Invalid key (must be binary)");
		return;
	}

	const keyBits = keyStr.split("").map(c=>c==="1"?1:0);
	let pixels = JSON.parse(JSON.stringify(pixels2));
	for(let i=0;i<keyBits.length;i++){
		pixels = unshuffle2D(pixels, keyBits[keyBits.length-1 - i]);
	}
	pixels1 = pixels;

	// Ensure canvas1 has correct size
	canvas1.width = width;
	canvas1.height = height;

	drawPixels(pixels1, canvas1);
}

function drawPixels(pixels, canvas){
	const ctx = canvas.getContext('2d');
	const imageData = ctx.createImageData(width, height);
	for(let y=0;y<height;y++){
		for(let x=0;x<width;x++){
			const i = (y*width + x)*4;
			const [r,g,b] = pixels[y][x];
			imageData.data[i]=r;
			imageData.data[i+1]=g;
			imageData.data[i+2]=b;
			imageData.data[i+3]=255;
		}
	}
	ctx.putImageData(imageData,0,0);
}

function shuffle2D(array, inShuffle=true){
	const arraySize = array.length;
	const half = Math.floor(arraySize/2);
	const temparray = new Array(arraySize);
	for(let i=0;i<arraySize;i++) temparray[i]=new Array(arraySize);
	if(inShuffle){
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				temparray[x*2][y*2]=array[arraySize-x-1][arraySize-y-1];
				temparray[x*2+1][y*2]=array[x][y+half];
				temparray[x*2][y*2+1]=array[x+half][y];
				temparray[x*2+1][y*2+1]=array[x][y];
			}
		}
	} else {
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				temparray[x*2+1][y*2+1]=array[y][x];
				temparray[x*2][y*2+1]=array[x][y+half];
				temparray[x*2+1][y*2]=array[x+half][y];
				temparray[x*2][y*2]=array[x+half][y+half];
			}
		}
	}
	return temparray;
}

function unshuffle2D(array, inShuffle=true){
	const arraySize = array.length;
	const half = Math.floor(arraySize/2);
	const temparray = new Array(arraySize);
	for(let i=0;i<arraySize;i++) temparray[i]=new Array(arraySize);
	if(inShuffle){
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				temparray[arraySize-x-1][arraySize-y-1]=array[x*2][y*2];
				temparray[x][y+half]=array[x*2+1][y*2];
				temparray[x+half][y]=array[x*2][y*2+1];
				temparray[x][y]=array[x*2+1][y*2+1];
			}
		}
	} else {
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				temparray[y][x]=array[x*2+1][y*2+1];
				temparray[x][y+half]=array[x*2][y*2+1];
				temparray[x+half][y]=array[x*2+1][y*2];
				temparray[x+half][y+half]=array[x*2][y*2];
			}
		}
	}
	return temparray;
}