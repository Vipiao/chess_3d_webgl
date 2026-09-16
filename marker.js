
function Marker(pos, model, color){
	this.pos = pos;
	this.model = model;
	this.color = color;
	this.waveSize = 0;
}
Marker.prototype.render = function(tick){
	var modelMatrix = Matrix.multiplyMany(
		Matrix.getTranslation(Vec3.add(this.pos, new Vec3(0, 0, Math.sin(tick * 0.5) * this.waveSize))),
		Matrix.getRotationZ(tick * 0.3),
		Matrix.getRotationX(Tool.degToRad(90)),
		Matrix.getScale(0.7),
	);
	this.model.setAttributeMatrix("model", Matrix.transpose(modelMatrix));
	this.model.setAttributeVec3("color", this.color);
	this.model.render();
}

