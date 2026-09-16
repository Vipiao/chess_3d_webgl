
function Render(canvasId){
	this.canvas = document.getElementById(canvasId);
	if(this.canvas == null){
		Tool.printError("ERROR::Render: No canvas with id: \"" + canvasId + "\".", 1);
		return null;
	}
	this.gl = this.canvas.getContext("webgl");
	
	//
	this.backgroundColor = new Vec3(0.1, 0.3, 0.4);
	
	// standard settings
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.clearColor(this.backgroundColor.x, this.backgroundColor.y, this.backgroundColor.z, 1.0);
	this.gl.clearDepth(1.0);
	
	this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
}
Render.prototype.loadModelFromObjectFile = function(objectFile, vertexShader, fragmentShader, textureImage){
	var newModel = new Model(this.gl, vertexShader, fragmentShader);
	newModel.loadFromObjectFile(objectFile, textureImage);
	
	return newModel;
}
Render.prototype.clear = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}
Render.prototype.canvasCoordsToVectorRay = function(pos, camera){
	// "pos" is a Vec2 coordinates on the canvas given in pixels from the bottom left.
	// "camera" is a Camera object.
	// returns a  vector pointing from the cameras position
	
	// A plane is "a" distance in front of the viewpoint. The plane is the size of the canvas.
	// (w/2) / a = tan (fovX / 2)
	// a = w / (2 tan(fovX / 2))
	var a = this.canvas.width / (4 * Math.tan(camera.fov * 0.5)); // why 4 instead of 2????
	var ray = new Vec3(pos.x - this.canvas.width * 0.5, a, pos.y - this.canvas.height * 0.5); // In coordinates local to the camera. X right, Y forward, Z up.
	
	// change orientation of ray to the camera's orientation
	var camRight = Vec3.cross(camera.forward, camera.up);
	//ray = camRight.mul(ray.x).add(camera.forward).mul(ray.y).add(camera.up).mul(ray.z);
	ray = Vec3.addMany(
		Vec3.mul(camRight, ray.x),
		Vec3.mul(camera.forward, ray.y),
		Vec3.mul(camera.up, ray.z),
	);
	
	return ray;
}

















