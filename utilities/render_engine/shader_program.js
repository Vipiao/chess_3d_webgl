
function ShaderProgram(gl, vertexShaderCode, fragmentShaderCode){
	
	this.gl = gl;
	
	//
	var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
	this.gl.shaderSource(vertexShader, vertexShaderCode);
	this.gl.compileShader(vertexShader);
	if(!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)){
		Tool.printError("ERROR::ShaderProgram: Compile error in vertex shader: \n\n" + this.gl.getShaderInfoLog(vertexShader), 1);
		return null;
	}
	
	var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	this.gl.shaderSource(fragmentShader, fragmentShaderCode);
	this.gl.compileShader(fragmentShader);
	if(!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)){
		Tool.printError("ERROR::ShaderProgram: Compile error in fragment shader: \n\n" + this.gl.getShaderInfoLog(fragmentShader), 1);
		return null;
	}
	
	this.program = this.gl.createProgram();
	this.gl.attachShader(this.program, vertexShader);
	this.gl.attachShader(this.program, fragmentShader);
	this.gl.linkProgram(this.program);
	if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)){
		Tool.printError("ERROR::ShaderProgram: Could not linke shaders.", 1);
		return null;
	}
	
}
window.setAttributeIntWarnings = [];
ShaderProgram.prototype.setAttributeInt = function(name, integer){
	this.use();
	var loc = this.gl.getUniformLocation(this.program, name);
	if(loc == null){
		if(window.setAttributeIntWarnings.indexOf(name) == -1){
			console.warn("Vec3 attribute \"" + name + "\" was not found.");
			window.setAttributeIntWarnings.push(name);
		}
	}
	this.gl.uniform1i(loc, integer);
}
window.setAttributeVec3Warnings = [];
ShaderProgram.prototype.setAttributeVec3 = function(name, vec3){
	this.use();
	var loc = this.gl.getUniformLocation(this.program, name);
	if(loc == null){
		if(window.setAttributeVec3Warnings.indexOf(name) == -1){
			console.warn("Vec3 attribute \"" + name + "\" was not found.");
			window.setAttributeVec3Warnings.push(name);
		}
	}
	this.gl.uniform3fv(loc, [vec3.x, vec3.y, vec3.z]);
}
window.setAttributeMatrixWarnings = [];
ShaderProgram.prototype.setAttributeMatrix = function(name, matrix){
	this.use();
	var loc = this.gl.getUniformLocation(this.program, name);
	if(loc == null){
		if(window.setAttributeMatrixWarnings.indexOf(name) == -1){
			console.warn("Matrix attribute \"" + name + "\" was not found.");
			window.setAttributeMatrixWarnings.push(name);
		}
	}
	this.gl.uniformMatrix4fv(loc, false, matrix);
}
window.setAttributeFloatMatrixWarnings = [];
ShaderProgram.prototype.setAttributeFloat = function(name, value){
	this.use();
	var loc = this.gl.getUniformLocation(this.program, name);
	if(loc == null){
		if(window.setAttributeFloatMatrixWarnings.indexOf(name) == -1){
			console.warn("Float attribute \"" + name + "\" was not found.");
			window.setAttributeFloatMatrixWarnings.push(name);
		}
	}
	this.gl.uniform1fv(loc, [value]); // TODO: no v, works? not make list for vector
}
ShaderProgram.prototype.use = function(){
	this.gl.useProgram(this.program);
}
ShaderProgram.prototype.enableAndGetAttributeLocation = function(attributeName){
	// Connects an attribute with the shader program. OUTDATED COMMENT
	// "arrayBuffer": the buffer to link to the shader program
	// "attributeName": name used in the shader. "size": no. of types used per variable, for example vec3 is 3.
	// "type": datatype, for example this.gl.FLOAT. "stride": size in bytes of each datasegment. "offset": given in number of bytes.
	// omitting stride and offset or setting them to 0 will leave the data tightly packed in the arrayBuffer.
	
	var loc = this.gl.getAttribLocation(this.program, attributeName);
	if(loc == -1){
		Tool.printError("ERROR::ShaderProgram.enableAndGetAttributeLocation: Could not find attribute \"" +
			attributeName + "\" in vertex shader.", 1);
		return null;
	}
	this.gl.enableVertexAttribArray(loc);
	return loc;
}





















