let pixels1 = null;
let pixels2 = null;
let width, height;

const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const keyInput = document.getElementById('keyInput');
const consoleLog=document.getElementById('console-log');

let modeArray=[0,0,0,0];

const modes = [
	"0 - None",
	"1 - Rotate 90°",
	"2 - Rotate 180°",
	"3 - Rotate 270°",
	"4 - Flip Horizontal",
	"5 - Flip Vertical",
	"6 - Flip H + Rotate 90°",
	"7 - Flip V + Rotate 90°"
];

for (let i=0; i<4; i++) {
	const sel = document.getElementById("q"+i);
	for (let j=0; j<modes.length; j++) {
		const opt = document.createElement("option");
		opt.value = j;
		opt.textContent = modes[j];
		sel.appendChild(opt);
	}
}

function updateKeyField(){
	const keyField = document.getElementById('keyInput');
	const autoKey = document.getElementById('autoKey').checked;
	keyField.readOnly = autoKey;
}

updateKeyField();

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

function process(){
	modeArray = [
		parseInt(document.getElementById("q0").value),
		parseInt(document.getElementById("q1").value),
		parseInt(document.getElementById("q2").value),
		parseInt(document.getElementById("q3").value)
	];
	const isShuffle = document.querySelector('input[name="mode"]:checked').value === "shuffle";
	if(isShuffle){
		shuffle();
	} else {
		unshuffle();
	}
}

function shuffle(){
	if(!pixels1) {
		//consoleLog.innerHTML ="Upload original image first."; 
		return;
	}else{
		consoleLog.innerHTML ="";
	}
	
	const autoKey = document.getElementById('autoKey').checked;

	let keyBits = [];
	if(autoKey){
		// Generate new key
		keyBits = [];
		for(let i=0;i<64;i++) keyBits.push(Math.round(Math.random()));
		keyInput.value = keyBits.join("");
	} else {
		// Use user-provided key
		const keyStr = keyInput.value.trim();
		if(!/^[01]+$/.test(keyStr)){
			consoleLog.innerHTML = "Invalid key format (must be binary)";
			return;
		}
		keyBits = keyStr.split("").map(c => c==="1"?1:0);
	}

	let pixels = JSON.parse(JSON.stringify(pixels1));
	for(let i=0;i<keyBits.length;i++){
		pixels = shuffle2D(pixels, keyBits[i], modeArray);
	}
	pixels2 = pixels;

	// Ensure canvas2 has correct size
	canvas2.width = width;
	canvas2.height = height;

	drawPixels(pixels2, canvas2);
}

function unshuffle(){
	if(!pixels2) {
		//consoleLog.innerHTML ="Upload shuffled image or shuffle first.";
		return;
	}else{
		consoleLog.innerHTML ="";
	}

	const keyStr = keyInput.value.trim();
	if(!/^[01]+$/.test(keyStr)){
		consoleLog.innerHTML ="Invalid key (must be binary)";
		return;
	}else{
		consoleLog.innerHTML ="";
	}

	const keyBits = keyStr.split("").map(c=>c==="1"?1:0);
	let pixels = JSON.parse(JSON.stringify(pixels2));
	for(let i=0;i<keyBits.length;i++){
		pixels = unshuffle2D(pixels, keyBits[keyBits.length-1 - i], modeArray);
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

function rotateQuadrant(quadrant, mode) {
	const size = quadrant.length;
	const rotated = new Array(size);
	for (let i = 0; i < size; i++) rotated[i] = new Array(size);

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let srcX = x;
			let srcY = y;

			// Apply transformations
			switch (mode) {
				case 0: // No rotation
					srcX = x;
					srcY = y;
					break;
				case 1: // Rotate 90°
					srcX = size - y - 1;
					srcY = x;
					break;
				case 2: // Rotate 180°
					srcX = size - x - 1;
					srcY = size - y - 1;
					break;
				case 3: // Rotate 270°
					srcX = y;
					srcY = size - x - 1;
					break;
				case 4: // Flip horizontally
					srcX = size - x - 1;
					srcY = y;
					break;
				case 5: // Flip vertically
					srcX = x;
					srcY = size - y - 1;
					break;
				case 6: // Flip horizontally + rotate 90°
					srcX = size - y - 1;
					srcY = size - x - 1;
					break;
				case 7: // Flip vertically + rotate 90°
					srcX = y;
					srcY = x;
					break;
			}

			rotated[y][x] = quadrant[srcY][srcX];
		}
	}
	return rotated;
}

function inverseRotateQuadrant(quadrant, mode) {
	const inverse = {
		0:0, // no rotation
		1:3, // 90 -> 270
		2:2, // 180
		3:1, // 270 -> 90
		4:4, // flip horizontal
		5:5, // flip vertical
		6:6, // flip h + rot 90
		7:7	// flip v + rot 90
	};
	return rotateQuadrant(quadrant, inverse[mode]);
}

function shuffle2D(array, inShuffle=true, modeArray=[0,0,0,0]){
	const size = array.length;
	const half = Math.floor(size/2);
	const temp = new Array(size);
	for(let i=0;i<size;i++) temp[i]=new Array(size);

	// Split quadrants
	const TL=[], TR=[], BL=[], BR=[];
	for(let y=0;y<half;y++){
		TL[y]=array[y].slice(0,half);
		TR[y]=array[y].slice(half);
		BL[y]=array[y+half].slice(0,half);
		BR[y]=array[y+half].slice(half);
	}

	// Rotate quadrants
	const TLr=rotateQuadrant(TL, modeArray[0]);
	const TRr=rotateQuadrant(TR, modeArray[1]);
	const BLr=rotateQuadrant(BL, modeArray[2]);
	const BRr=rotateQuadrant(BR, modeArray[3]);

	// Reassemble
	if(inShuffle){
		// Fill temp according to inShuffle mapping
		for(let y=0;y<half;y++){
			for(let x=0;x<half;x++){
				temp[x*2+1][y*2+1]=TLr[y][x];
				temp[x*2][y*2+1]=TRr[y][x];
				temp[x*2+1][y*2]=BLr[y][x];
				temp[x*2][y*2]=BRr[y][x];
			}
		}
	} else {
		// OutShuffle mapping
		for(let y=0;y<half;y++){
			for(let x=0;x<half;x++){
				temp[x*2][y*2]=TLr[y][x];
				temp[x*2+1][y*2]=TRr[y][x];
				temp[x*2][y*2+1]=BLr[y][x];
				temp[x*2+1][y*2+1]=BRr[y][x];
			}
		}
	}

	return temp;
}

function unshuffle2D(array, inShuffle=true, modeArray=[0,0,0,0]){
	const size = array.length;
	const half = Math.floor(size/2);
	const temp = new Array(size);
	for(let i=0;i<size;i++) temp[i]=new Array(size);

	// Initialize quadrants
	const TL=[], TR=[], BL=[], BR=[];
	for(let y=0;y<half;y++){
		TL[y]=new Array(half);
		TR[y]=new Array(half);
		BL[y]=new Array(half);
		BR[y]=new Array(half);
	}

	// Extract and reverse map positions
	if(inShuffle){
		// InShuffle mapping
		for(let y=0;y<half;y++){
			for(let x=0;x<half;x++){
				TL[y][x]=array[x*2+1][y*2+1];
				TR[y][x]=array[x*2][y*2+1];
				BL[y][x]=array[x*2+1][y*2];
				BR[y][x]=array[x*2][y*2];
			}
		}
	} else {
		// OutShuffle mapping
		for(let y=0;y<half;y++){
			for(let x=0;x<half;x++){
				TL[y][x]=array[x*2][y*2];
				TR[y][x]=array[x*2+1][y*2];
				BL[y][x]=array[x*2][y*2+1];
				BR[y][x]=array[x*2+1][y*2+1];
			}
		}
	}

	// Reverse rotate quadrants
	const TLr=inverseRotateQuadrant(TL, modeArray[0]);
	const TRr=inverseRotateQuadrant(TR, modeArray[1]);
	const BLr=inverseRotateQuadrant(BL, modeArray[2]);
	const BRr=inverseRotateQuadrant(BR, modeArray[3]);

	// Reassemble quadrants into output
	for(let y=0;y<half;y++){
		for(let x=0;x<half;x++){
			temp[y][x]=TLr[y][x];
			temp[y][x+half]=TRr[y][x];
			temp[y+half][x]=BLr[y][x];
			temp[y+half][x+half]=BRr[y][x];
		}
	}

	return temp;
}