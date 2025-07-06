// save as shuffle_png_pixels.js
const fs = require("fs");
const { PNG } = require("pngjs");

function shuffle2D(array, inShuffle=true){
	var half=Math.floor(array.length/2);
	var temparray=[];
	
	if(inShuffle){
		for(var x=0;x<half;x++){
			temparray[x*2]=[];
			temparray[x*2+1]=[];
			for(var y=0;y<half;y++){
				temparray[x*2][y*2]=array[x+half][y+half];
				temparray[x*2+1][y*2]=array[x][y+half];
				temparray[x*2][y*2+1]=array[x+half][y];
				temparray[x*2+1][y*2+1]=array[x][y];
			}
		}
	}else{
		for(var x=0;x<half;x++){
			temparray[x*2]=[];
			temparray[x*2+1]=[];
			for(var y=0;y<half;y++){
				temparray[x*2+1][y*2+1]=array[x+half][y+half];
				temparray[x*2][y*2+1]=array[x][y+half];
				temparray[x*2+1][y*2]=array[x+half][y];
				temparray[x*2][y*2]=array[x][y];
			}
		}
	}
	return temparray;
}

function unshuffle2D(array, inShuffle=true){
	var half=Math.floor(array.length/2);
	var temparray=[];
	
	if(inShuffle){
		for(var x=0;x<half;x++){
			temparray[x]=[];
			temparray[x+half]=[];
			for(var y=0;y<half;y++){
				temparray[x+half][y+half]=array[x*2][y*2];
				temparray[x][y+half]=array[x*2+1][y*2];
				temparray[x+half][y]=array[x*2][y*2+1];
				temparray[x][y]=array[x*2+1][y*2+1];
			}
		}
	}else{
		for(var x=0;x<half;x++){
			temparray[x]=[];
			temparray[x+half]=[];
			for(var y=0;y<half;y++){
				temparray[x+half][y+half]=array[x*2+1][y*2+1];
				temparray[x][y+half]=array[x*2][y*2+1];
				temparray[x+half][y]=array[x*2+1][y*2];
				temparray[x][y]=array[x*2][y*2];
			}
		}
	}
	return temparray;
}


(async () => {
	const mode = process.argv[2]; // "shuffle" or "unshuffle"
	const keyPath = "key.txt";
	const pngPath = "reefer.png";
	const pngShuffledPath = "reefer_shuffled.png";

	// Read the PNG buffer
	const buffer = await fs.promises.readFile(
		mode === "shuffle" ? pngPath : pngShuffledPath
	);
	const png = PNG.sync.read(buffer);

	const { width, height } = png;

	if (width !== height || width % 2 !== 0) {
		console.error("Image must be square with even dimensions.");
		process.exit(1);
	}

	// Convert to grayscale 2D array
	let pixels = [];
	for (let y = 0; y < height; y++) {
		const row = new Uint8Array(width);
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			row[x] = Math.floor(
				(png.data[idx] + png.data[idx + 1] + png.data[idx + 2]) / 3
			);
		}
		pixels.push(row);
	}

	if (mode === "shuffle") {
		// Generate key
		const keyBits = [];
		for (let i = 0; i < 3; i++) keyBits.push(Math.round(Math.random()));
		await fs.promises.writeFile(keyPath, keyBits.join(""));

		// Shuffle multiple times
		for (let i = 0; i < keyBits.length; i++) {
			pixels = shuffle2D(pixels, keyBits[i]);
		}
	} else if (mode === "unshuffle") {
		const keyStr = await fs.promises.readFile(keyPath, "utf8");
		const keyBits = keyStr.trim().split("").map((c) => (c === "1" ? 1 : 0));

		// Unshuffle in reverse order
		for (let i = 0; i < keyBits.length; i++) {
			pixels = unshuffle2D(pixels, keyBits[keyBits.length - i - 1]);
		}
	} else {
		console.error("Mode must be 'shuffle' or 'unshuffle'");
		process.exit(1);
	}

	// Write back pixels
	const outPng = new PNG({ width, height });
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const v = pixels[y][x];
			outPng.data[idx] = v;
			outPng.data[idx + 1] = v;
			outPng.data[idx + 2] = v;
			outPng.data[idx + 3] = 255;
		}
	}

	const outputBuffer = PNG.sync.write(outPng);
	await fs.promises.writeFile(
		mode === "shuffle" ? pngShuffledPath : "reefer_unshuffled.png",
		outputBuffer
	);

	console.log("Done!");
})();
