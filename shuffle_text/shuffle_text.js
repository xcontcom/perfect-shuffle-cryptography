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

function process(){
	let mode = document.querySelector('input[name="mode"]:checked').value;
	let inputText = document.getElementById('original').value.trim();
	let keyField = document.getElementById('key');
	
	// Convert string to array of chars
	let a = inputText.split("");
	
	// Ensure even length
	if (a.length % 2 !==0) {
		a.push(" ");
	}
	
	let key = [];
	let keyLength = 20;

	if (mode === "shuffle"){
		// Generate random key
		for(let i=0;i<keyLength;i++){
			key[i]=Math.round(Math.random());
		}
		// Display key
		keyField.value = key.join("");
	} else {
		// Read user-provided key
		let keyText = keyField.value.trim();
		if (!/^[01]+$/.test(keyText)) {
			alert("Key must be a sequence of 0s and 1s.");
			return;
		}
		key = keyText.split("").map(c => c === "1" ? 1 : 0);
		keyLength = key.length;
	}
	
	let b = a.slice(); // working array

	if (mode === "shuffle"){
		// Apply shuffles
		for(let i=0;i<keyLength;i++){
			b = shuffle(b, key[i]);
		}
		document.getElementById('shuffled').value = b.join("");
		// Confirm: apply unshuffles to recover
		for(let i=0;i<keyLength;i++){
			b = unshuffle(b, key[keyLength - i -1]);
		}
		document.getElementById('unshuffled').value = b.join("");
	} else {
		// Apply unshuffles
		for(let i=0;i<keyLength;i++){
			b = unshuffle(b, key[keyLength - i -1]);
		}
		document.getElementById('shuffled').value = b.join("");
		// Confirm: re-shuffle
		for(let i=0;i<keyLength;i++){
			b = shuffle(b, key[i]);
		}
		document.getElementById('unshuffled').value = b.join("");
	}
}