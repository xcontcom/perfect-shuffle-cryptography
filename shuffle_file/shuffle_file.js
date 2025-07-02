const fs = require("fs");

function readFileAsBuffer(path) {
	return fs.promises.readFile(path);
}

function saveFile(data, path) {
	fs.writeFile(path, data, err => {
		if (err) console.error(err);
		else console.log(`Saved to ${path}`);
	});
}

function bufferToBinaryString(buffer) {
	let result = "";
	for (const byte of buffer) {
		result += byte.toString(2).padStart(8, "0");
	}
	return result;
}

function binaryStringToBuffer(binaryString) {
	const byteCount = binaryString.length / 8;
	const buffer = Buffer.alloc(byteCount);
	for (let i = 0; i < byteCount; i++) {
		buffer[i] = parseInt(binaryString.slice(i * 8, (i + 1) * 8), 2);
	}
	return buffer;
}

function shuffle(array, inShuffle=true){
	let half = Math.floor(array.length/2);
	let temparray = [];
	if(inShuffle){
		for(let i=0;i<half;i++){
			temparray[i*2]=array[i+half];
			temparray[i*2+1]=array[i];
		}
	}else{
		for(let i=0;i<half;i++){
			temparray[i*2+1]=array[i+half];
			temparray[i*2]=array[i];
		}
	}
	return temparray;
}

function unshuffle(array, inShuffle=true){
	let half = Math.floor(array.length/2);
	let temparray = [];
	if(inShuffle){
		for(let i=0;i<half;i++){
			temparray[i+half]=array[i*2];
			temparray[i]=array[i*2+1];
		}
	}else{
		for(let i=0;i<half;i++){
			temparray[i+half]=array[i*2+1];
			temparray[i]=array[i*2];
		}
	}
	return temparray;
}

(async () => {
	const mode = process.argv[2]; // "shuffle" or "unshuffle"
	const oldKeyPath="oldkey.txt";
	const newKeyPath="newkey.txt";
	const pngPath="reefer.png"; // Picture with your chonky cat Reefer.
	const dataPath="reefer.data";

	const oldKeyStr = await fs.promises.readFile(oldKeyPath, "utf8");
	const oldKeyBits = oldKeyStr.trim().split("").map(c => c==="1"?1:0);
	const keyLength = oldKeyBits.length;

	if (mode==="shuffle"){
		const fileBuffer = await readFileAsBuffer(pngPath);
		const fileBinary = bufferToBinaryString(fileBuffer);

		// Generate new key
		let newKeyBits = [];
		for (let i=0; i<keyLength; i++){
			newKeyBits.push(Math.round(Math.random()));
		}
		const newKeyStr = newKeyBits.join("");
		await fs.promises.writeFile(newKeyPath, newKeyStr);

		const binaryString = newKeyStr + fileBinary;
		let binaryArray = binaryString.split("");

		for(let i=0;i<keyLength;i++){
			binaryArray = shuffle(binaryArray, oldKeyBits[i]);
		}

		const data = binaryStringToBuffer(binaryArray.join(""));
		saveFile(data, dataPath);

	} else if (mode==="unshuffle"){
		const fileBuffer = await readFileAsBuffer(dataPath);
		const fileBinary = bufferToBinaryString(fileBuffer);
		let binaryArray = fileBinary.split("");

		// Unshuffle
		for(let i=0;i<keyLength;i++){
			binaryArray = unshuffle(binaryArray, oldKeyBits[keyLength - i -1]);
		}

		// Now split
		const unshuffledBinary = binaryArray.join("");
		const newKeyBitString = unshuffledBinary.slice(0, keyLength);
		const dataBits = unshuffledBinary.slice(keyLength);
		const dataBuffer = binaryStringToBuffer(dataBits);

		// Save PNG
		saveFile(dataBuffer, pngPath);

		// Save the recovered new key
		fs.writeFileSync(newKeyPath, newKeyBitString);
	} else {
		console.error("Mode must be 'shuffle' or 'unshuffle'");
	}
})();