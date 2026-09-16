
function Tool(){
	
}
Tool.printError = function(message, level = 0){
	// level >= 0
	// Prints out an error with stack trace. The level is how many functions up the stack will start.
	// Standard is the layer where the function is called
	console.error(message + "\n" + Tool.getStackTrace(level + 1));
}
Tool.getStackTrace = function(level = 0){
	var error = Error().stack.split("\n");
	error.splice(1, level + 1);
	return error.join("\n");
}
Tool.clamp = function(v, min, max){
	if(v > max){
		return max;
	}else if(v < min){
		return min;
	}else{
		return v
	}
}
Tool.degToRad = function(deg){
	return deg * Math.PI / 180;
}
Tool.radToDeg = function(rad){
	return rad * 180 / Math.PI;
}
Tool.cloneArray = function(arrayToClone){
	if(!(arrayToClone instanceof Array)){
		if(arrayToClone == null){
			Tool.printError("ERROR::Tool.cloneArray: Argument in null.", 1);
			return null;
		}
		Tool.printError("ERROR::Tool.cloneArray: Wrong argument type. Expected arraylist, got \"" + typeof arrayToClone + "\".", 1);
		return null;
	}
	var newArray = new Array(arrayToClone.length);
	for(var i=0; i<arrayToClone.length;i++){
		newArray[i] = arrayToClone[i];
	}
	return newArray;
}
Tool.ajaxGet = function(address, callback, callbackFail){
	// "address" is the address the http requst is requesting. "Callback" will recieve the response from the server.
	// "CallbackFail" is called if an error occurs.
	
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function(){
		if(this.readyState == 4){
			if(this.status == 200){
				callback(this.responseText);
			}else{
				if(callbackFail){
					callbackFail();
				}
			}
		}
	};
	xhttp.open("GET", address, true);
	xhttp.send();
}
Tool.imgToPixelData = function(img){
	// copy img to canvas
	var canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
	// get pixelData
	var pixelData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
	
	return pixelData;
}
Tool.objectsEqual = function(a, b){
	var aAttr = Object.keys(a);
	var bAttr = Object.keys(b);
	
	if(aAttr.length != bAttr.length){
		return false;
	}
	for(var i=0; i<aAttr.length; i++){
		if(a[aAttr[i]] != b[bAttr[i]]){
			return false;
		}
	}
	return true;
}















