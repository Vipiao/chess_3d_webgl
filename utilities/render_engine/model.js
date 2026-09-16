
function Model(gl, vertexShader, fragmentShader){
	this.gl = gl;
	this.numberOfIndices;
	this.indexBuffer;
	this.shaderProgram = new ShaderProgram(this.gl, vertexShader, fragmentShader);
	this.arrayBuffers = [];
	this.texture;
}
Model.prototype.setAttributeInt = function(name, integer){
	this.shaderProgram.setAttributeInt(name, integer);
}
Model.prototype.setAttributeVec3 = function(name, vec3){
	this.shaderProgram.setAttributeVec3(name, vec3);
}
Model.prototype.setAttributeMatrix = function(name, matrix){
	this.shaderProgram.setAttributeMatrix(name, matrix);
}
Model.prototype.setAttributeFloat = function(name, value){
	this.shaderProgram.setAttributeFloat(name, value);
}
Model.prototype.render = function(){
	
	// buffers
	// // databuffers
	for(var i=0; i<this.arrayBuffers.length; i++){
		var a = this.arrayBuffers[i];
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, a.buffer);
		this.gl.vertexAttribPointer(a.loc, a.size, a.type, false, a.stride, a.offset);
	}
	// // element buffer
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	// textures
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	this.setAttributeInt("sampler", 0);
	// render
	this.gl.drawElements(this.gl.TRIANGLES, this.numberOfIndices, this.gl.UNSIGNED_SHORT, 0);
}
Model.prototype.loadFromObjectFile = function(objectFile, textureImage){
	// For example blenders .obj file. Must be triangularized.
	// "textureImage" is an HTML image element.
	
	// get data
	// // placeholder
	/*var vertices = [
		 1, 1, 1,
		 1, 1,-1,
		 1,-1, 1,
		 1,-1,-1,
		-1, 1, 1,
		-1, 1,-1,
		-1,-1, 1,
		-1,-1,-1
	];
	var indices = [
		0,2,1, 1,2,3, 4,5,6, 5,7,6,
		0,1,5, 0,5,4, 2,7,3, 2,6,7,
		0,4,6, 0,6,2, 1,3,7, 1,7,5
	];*/
	
	var num = "-*[0-9]+\.?[0-9]*"; // Positive or negative with decimal number.
	
	// // vertexData
	var s = new RegExp("\nv " + num + " " + num + " " + num, "g");
	var vertexData = objectFile.match(s).join("").match(new RegExp(num, "g"));
	for(var i=0; i<vertexData.length; i++){
		vertexData[i] = parseFloat(vertexData[i]);
	}
	
	// normalData
	var s = new RegExp("\nvn " + num + " " + num + " " + num, "g");
	var normalData = objectFile.match(s).join("").match(new RegExp(num, "g"));
	for(var i=0; i<normalData.length; i++){
		normalData[i] = parseFloat(normalData[i]);
	}
	
	// textureData
	var s = new RegExp("\nvt " + num + " " + num, "g");
	var lines = objectFile.match(s);
	var textureData;
	var hasTextures = false;
	if(lines != null){
		hasTextures = true;
		textureData = lines.join("").match(new RegExp(num, "g"));
		for(var i=0; i<textureData.length; i++){
			textureData[i] = parseFloat(textureData[i]);
			if(i % 2 == 1){
				textureData[i] = 1 - textureData[i]; // is negative because the texture image is reflected in the y direction.
			}
		}
	}
	
	// load texture pixel data
	// How to do textures. More proper that this.
	//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
	var texture = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
	var level = 0;
	var internalFormat = this.gl.RGBA;
	var srcFormat = this.gl.RGBA;
	var srcType = this.gl.UNSIGNED_BYTE;
	if(hasTextures){
		// load texture
		this.gl.texImage2D(this.gl.TEXTURE_2D, level,
			internalFormat, srcFormat, srcType, textureImage);
		if(isPowerOf2(textureImage.width) &&
				isPowerOf2(textureImage.height)){
			this.gl.generateMipmap(this.gl.TEXTURE_2D);
		}else{
			// no mipmap );
			this.gl.texParameteri(this.gl.TEXTURE_2D,
				this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D,
				this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(this.gl.TEXTURE_2D,
				this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		}
	}else{
		// single white pixel
		var width = 1;
		var height = 1;
		var pixel = new Uint8Array([255, 255, 255, 255]);  // white
		this.gl.texImage2D(this.gl.TEXTURE_2D, level, internalFormat,
			width, height, 0, srcFormat, srcType, pixel);
	}
	this.texture = texture;
	
	function isPowerOf2(v){
		return (v & (v-1)) == 0;
	}
	
	// indicesFaceAndNormals
	// "indicesFaceAndNormals" consists 6 and six numbers making up the faces. Every second (3 per face) starting at the first refer to a vertex.
	// Every second (3 per face) starting at the second refer to a normal.
	// Example:          (v  n   v  n    v  n) <- face
	// indicesFa... = [...1, 3, 98, 2, 278, 4...]
	//var s = new RegExp("\nf [0-9]+//[0-9]+ [0-9]+//[0-9]+ [0-9]+//[0-9]+", "g");
	var s = new RegExp("\nf [0-9 /]+", "g");
	var indicesFaceAndNormals = objectFile.match(s).join("").match(/\d+/g);
	for(var i=0; i<indicesFaceAndNormals.length; i++){
		indicesFaceAndNormals[i] = parseInt(indicesFaceAndNormals[i]) - 1; // subtract 1 since index start at 1 not 0!
	}
	
	// vertices, indices and normals
	var vertices = [];
	var normals = [];
	var textureCoords = [];
	var indices = [];
	var index = 0;
	var prevVertexIndices = [];
	var prevNormalIndices = [];
	var prevTextureCoords = [];
	var prevIndices = [];
	var debugSaveIndex = 0;
	var debugFull = 0;
	var increment;
	if(hasTextures){
		increment = 3;
	}else{
		increment = 2;
	}
	for(var i=0; i<indicesFaceAndNormals.length; i+=increment){
		var vertexIndex = indicesFaceAndNormals[i];
		if(hasTextures){
			var textureIndex = indicesFaceAndNormals[i+1];
			var normalIndex = indicesFaceAndNormals[i+2];
		}else{
			var normalIndex = indicesFaceAndNormals[i+1];
		}
		
		var vertIndex = prevVertexIndices.indexOf(vertexIndex);
		var normIndex = prevNormalIndices.indexOf(normalIndex);
		if(hasTextures){
			var textIndex = prevTextureCoords.indexOf(textureIndex);
		}
		if(vertIndex != -1 &&
				vertIndex == normIndex && (!hasTextures || normIndex == textIndex)){
			indices.push(vertIndex);
			debugSaveIndex++;
			continue;
		}
		debugFull++;
		prevVertexIndices.push(vertexIndex);
		prevNormalIndices.push(normalIndex);
		if(hasTextures){
			prevTextureCoords.push(textureIndex);
		}
		prevIndices.push(index);
		
		var vX = vertexData[vertexIndex * 3];
		var vY = vertexData[vertexIndex * 3 + 1];
		var vZ = vertexData[vertexIndex * 3 + 2];
		var nX = normalData[normalIndex * 3];
		var nY = normalData[normalIndex * 3 + 1];
		var nZ = normalData[normalIndex * 3 + 2];
		if(hasTextures){
			var tX = textureData[textureIndex * 2];
			var tY = textureData[textureIndex * 2 + 1];
		}else{
			var tX = 0;
			var tY = 0;
		}
		
		vertices.push(vX);
		vertices.push(vY);
		vertices.push(vZ);
		normals.push(nX);
		normals.push(nY);
		normals.push(nZ);
		textureCoords.push(tX);
		textureCoords.push(tY);
		indices.push(index);
		index++;
	}
	var fileName = objectFile.match(/OBJ File: \'[^\.]+\.blend\'/);
	fileName = fileName[0].slice(11,-7)
	console.log("Model \"" + fileName + "\" loaded, " + (100 * debugSaveIndex / (debugSaveIndex + debugFull)).toFixed(2) + "% vertex and normal buffer space saved.");
	
	// vertices
	var vertexBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
	var loc = this.shaderProgram.enableAndGetAttributeLocation("position");
	this.arrayBuffers.push({
		"buffer": vertexBuffer,
		"loc": loc,
		"size": 3,
		"type": this.gl.FLOAT,
		"stride": 0,
		"offset": 0,
	});
	
	// normals
	var normalBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
	var loc = this.shaderProgram.enableAndGetAttributeLocation("normal");
	this.arrayBuffers.push({
		"buffer": normalBuffer,
		"loc": loc,
		"size": 3,
		"type": this.gl.FLOAT,
		"stride": 0,
		"offset": 0,
	});
	
	// textures
	var textureBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
	var loc = this.shaderProgram.enableAndGetAttributeLocation("textureCoord");
	this.arrayBuffers.push({
		"buffer": textureBuffer,
		"loc": loc,
		"size": 2,
		"type": this.gl.FLOAT,
		"stride": 0,
		"offset": 0,
	});
	
	// indices
	this.indexBuffer = this.gl.createBuffer ();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
	
	this.numberOfIndices = indices.length;
}








