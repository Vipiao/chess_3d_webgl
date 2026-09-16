
function Camera(canvasId){
	this.canvas = document.getElementById(canvasId);
	if(this.canvas == null){
		Tool.printError("ERROR::Render: No canvas with id: \"" + canvasId + "\".", 1);
		return null;
	}
	
	this.fov;
	this.projection;
	this.setFOV(Tool.degToRad(60));
	this.pos = new Vec3(0,0,0);
	this.forward = new Vec3(0,1,0);
	this.up = new Vec3(0,0,1);
	//
	this.view;
}
Camera.prototype.globalCoordsToLocal = function(globalCoords){
	var relativeGlobalCoords = Vec.sub(globalCoords, this.pos);
	var right = Vec3.cross(this.forward, this.up);
	return new Vec3(
		relativeGlobalCoords.dot(right),
		relativeGlobalCoords.dot(this.forward),
		relativeGlobalCoords.dot(up),
	);
}
Camera.prototype.localCoordsToGlobal = function(localCoords){
	var right = Vec3.cross(this.forward, this.up);
	return Vec3.addMany(
		Vec3.mul(right, localCoords.x),
		Vec3.mul(this.forward, localCoords.y),
		Vec3.mul(this.up, localCoords.z),
	);
}
Camera.prototype.calculateView = function(){
	this.view = Matrix.getView(this.pos, this.forward, this.up);
	return this.view;
}
Camera.prototype.setFOV = function(fov){ // set the horizontal field of view
	this.fov = fov;
	this.projection = Matrix.getProjection(fov, this.canvas.width / this.canvas.height, 0.01, 100);
}
Camera.prototype.lookInDir = function(direction, up){
	// "target" and "pos" must not be the same point. "pos" - "target" must not be parallel with "up".
	var right = Vec3.cross(direction, up);
	var newUp = Vec3.cross(right, direction);
	
	this.forward = Vec3.unit(direction);
	this.up = newUp.unit();
}
Camera.prototype.lookAt = function(target, up){
	// "target" and "this.pos" must not be the same point. "pos" - "target" must not be parallel with "up".
	var forward = Vec3.sub(target, this.pos);
	var right = Vec3.cross(forward, up);
	var newUp = Vec3.cross(right, forward);
	
	this.forward = forward.unit();
	this.up = newUp.unit();
}














