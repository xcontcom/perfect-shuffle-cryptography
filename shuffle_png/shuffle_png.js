const fs = require("fs");
const { PNG } = require("pngjs");

function shuffle2D(array, inShuffle=true){
	let arraySize=array.length;
	let half=Math.floor(arraySize/2);
	let temparray=[];
	
	// Initialize all rows
	for (let i = 0; i < arraySize; i++) {
		temparray[i] = [];
	}
	
	if(inShuffle){
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				/*
				temparray[x*2][y*2]=array[x+half][y+half];
				temparray[x*2+1][y*2]=array[x][y+half];
				temparray[x*2][y*2+1]=array[x+half][y];
				temparray[x*2+1][y*2+1]=array[x][y];
				*/
				temparray[x*2][y*2]=array[arraySize-x-1][arraySize-y-1];
				temparray[x*2+1][y*2]=array[x][y+half];
				temparray[x*2][y*2+1]=array[x+half][y];
				temparray[x*2+1][y*2+1]=array[x][y];
			}
		}
	}else{
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				/*
				temparray[x*2+1][y*2+1]=array[x+half][y+half];
				temparray[x*2][y*2+1]=array[x][y+half];
				temparray[x*2+1][y*2]=array[x+half][y];
				temparray[x*2][y*2]=array[x][y];
				*/
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
	let arraySize=array.length;
	let half=Math.floor(arraySize/2);
	let temparray=[];
	
	// Initialize all rows
	for (let i = 0; i < arraySize; i++) {
		temparray[i] = [];
	}
	
	if(inShuffle){
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				/*
				temparray[x+half][y+half]=array[x*2][y*2];
				temparray[x][y+half]=array[x*2+1][y*2];
				temparray[x+half][y]=array[x*2][y*2+1];
				temparray[x][y]=array[x*2+1][y*2+1];
				*/
				temparray[arraySize-x-1][arraySize-y-1]=array[x*2][y*2];
				temparray[x][y+half]=array[x*2+1][y*2];
				temparray[x+half][y]=array[x*2][y*2+1];
				temparray[x][y]=array[x*2+1][y*2+1];
			}
		}
	}else{
		for(let x=0;x<half;x++){
			for(let y=0;y<half;y++){
				/*
				temparray[x+half][y+half]=array[x*2+1][y*2+1];
				temparray[x][y+half]=array[x*2][y*2+1];
				temparray[x+half][y]=array[x*2+1][y*2];
				temparray[x][y]=array[x*2][y*2];
				*/
				temparray[y][x]=array[x*2+1][y*2+1];
				temparray[x][y+half]=array[x*2][y*2+1];
				temparray[x+half][y]=array[x*2+1][y*2];
				temparray[x+half][y+half]=array[x*2][y*2];
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

	const buffer = await fs.promises.readFile(
		mode === "shuffle" ? pngPath : pngShuffledPath
	);
	const png = PNG.sync.read(buffer);

	const { width, height } = png;

	if (width !== height || width % 2 !== 0) {
		console.error("Image must be square with even dimensions.");
		process.exit(1);
	}

	// Build 2D array of [R,G,B]
	let pixels = [];
	for (let y = 0; y < height; y++) {
		const row = new Array(width);
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			row[x] = [
				png.data[idx],
				png.data[idx + 1],
				png.data[idx + 2]
			];
		}
		pixels.push(row);
	}

	if (mode === "shuffle") {
		// Generate key
		const keyBits = [];
		for (let i = 0; i < 64; i++) keyBits.push(Math.round(Math.random()));
		await fs.promises.writeFile(keyPath, keyBits.join(""));

		// Shuffle multiple times
		for (let i = 0; i < keyBits.length; i++) {
			pixels = shuffle2D(pixels, keyBits[i]);
		}
	} else if (mode === "unshuffle") {
		const keyStr = await fs.promises.readFile(keyPath, "utf8");
		const keyBits = keyStr.trim().split("").map(c => (c === "1" ? 1 : 0));

		for (let i = 0; i < keyBits.length; i++) {
			pixels = unshuffle2D(pixels, keyBits[keyBits.length - i - 1]);
		}
	} else {
		console.error("Mode must be 'shuffle' or 'unshuffle'");
		process.exit(1);
	}

	// Write back
	const outPng = new PNG({ width, height });
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const [r, g, b] = pixels[y][x];
			outPng.data[idx] = r;
			outPng.data[idx + 1] = g;
			outPng.data[idx + 2] = b;
			outPng.data[idx + 3] = 255; // fully opaque
		}
	}

	const outputBuffer = PNG.sync.write(outPng);
	await fs.promises.writeFile(
		mode === "shuffle" ? pngShuffledPath : "reefer_unshuffled.png",
		outputBuffer
	);

	console.log("Done!");
})();
