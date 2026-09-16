
function Animator(canvasId){
	this.renderer = new Render(canvasId);
	
	this.boardCenter = new Vec3(3.5*1.8, 3.5*1.8, 0);
	
	this.camera = new Camera("canvas");
	this.camera.pos = new Vec3(-2, 3.5 * 1.8, 10);
	this.camera.lookAt(this.boardCenter, new Vec3(0,0,1));
	
	var chessBoardTexture = document.getElementById("texture_board");
	var woodTextureBlack = document.getElementById("texture_wood");
	var woodTextureWhite = document.getElementById("texture_wood_white");
	
	this.models = [];
	
	this.pawnModelBlack = this.renderer.loadModelFromObjectFile(window.chess_pawn, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureBlack);
	this.models.push(this.pawnModelBlack);
	
	this.pawnModelWhite = this.renderer.loadModelFromObjectFile(window.chess_pawn, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureWhite);
	this.models.push(this.pawnModelWhite);
	
	this.knightModelBlack = this.renderer.loadModelFromObjectFile(window.chess_knight, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureBlack);
	this.models.push(this.knightModelBlack);
	
	this.knightModelWhite = this.renderer.loadModelFromObjectFile(window.chess_knight, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureWhite);
	this.models.push(this.knightModelWhite);
	
	this.rookModelBlack = this.renderer.loadModelFromObjectFile(window.chess_rook, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureBlack);
	this.models.push(this.rookModelBlack);
	
	this.rookModelWhite = this.renderer.loadModelFromObjectFile(window.chess_rook, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureWhite);
	this.models.push(this.rookModelWhite);
	
	this.bishopModelBlack = this.renderer.loadModelFromObjectFile(window.chess_bishop, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureBlack);
	this.models.push(this.bishopModelBlack);
	
	this.bishopModelWhite = this.renderer.loadModelFromObjectFile(window.chess_bishop, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureWhite);
	this.models.push(this.bishopModelWhite);
	
	this.queenModelBlack = this.renderer.loadModelFromObjectFile(window.chess_queen, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureBlack);
	this.models.push(this.queenModelBlack);
	
	this.queenModelWhite = this.renderer.loadModelFromObjectFile(window.chess_queen, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureWhite);
	this.models.push(this.queenModelWhite);
	
	this.kingModelBlack = this.renderer.loadModelFromObjectFile(window.chess_king, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureBlack);
	this.models.push(this.kingModelBlack);
	
	this.kingModelWhite = this.renderer.loadModelFromObjectFile(window.chess_king, window.chess_pieces_vert, window.chess_pieces_frag, woodTextureWhite);
	this.models.push(this.kingModelWhite);
	
	this.boardModel = this.renderer.loadModelFromObjectFile(window.chess_board, window.chess_pieces_vert, window.chess_pieces_frag, chessBoardTexture);
	this.models.push(this.boardModel);
	
	this.textureTest = this.renderer.loadModelFromObjectFile(window.texture_test, window.chess_pieces_vert, window.chess_pieces_frag, chessBoardTexture);
	this.models.push(this.textureTest);
	
	this.textureTest2 = this.renderer.loadModelFromObjectFile(window.texture_test_02, window.chess_pieces_vert, window.chess_pieces_frag, chessBoardTexture);
	this.models.push(this.textureTest2);
	
	this.torus = this.renderer.loadModelFromObjectFile(window.torus, window.chess_pieces_vert, window.marker_frag);
	this.models.push(this.torus);
	
	this.pieces = [];
	this.markers = [];
	
	this.squareDim = 1.8;
	
	this.numDeadWhitePieces = 0;
	this.numDeadBlackPieces = 0;
}
Animator.prototype.canvasCoordsToRay = function(pos){
	// takes canvas coords, return vector array in the clicked direction
	return this.renderer.canvasCoordsToVectorRay(pos, this.camera);
}
Animator.prototype.createPiece = function(orientation, type, color, boardPos, team){
	var model;
	switch(type){
		case ChessPiece.PAWN:
			model = (team == GameLogic.WHITE? this.pawnModelWhite : this.pawnModelBlack);
			break;
		case ChessPiece.KNIGHT:
			model = (team == GameLogic.WHITE? this.knightModelWhite : this.knightModelBlack);
			break;
		case ChessPiece.ROOK:
			model = (team == GameLogic.WHITE? this.rookModelWhite : this.rookModelBlack);
			break;
		case ChessPiece.BISHOP:
			model = (team == GameLogic.WHITE? this.bishopModelWhite : this.bishopModelBlack);
			break;
		case ChessPiece.QUEEN:
			model = (team == GameLogic.WHITE? this.queenModelWhite : this.queenModelBlack);
			break;
		case ChessPiece.KING:
			model = (team == GameLogic.WHITE? this.kingModelWhite : this.kingModelBlack);
			break;
		default:
			Tool.printError("ERROR::Animator.createPiece: Did not recognize type \"" + type + "\".", 1);
			return null;
	}
	var specularFactor;
	if(team == GameLogic.WHITE){
		specularFactor = 0.3;
	}else{ // team == GameLogic.BLACK
		specularFactor = 3;
	}
	
	var newPiece = new ChessPiece(this, orientation, type, model, color, boardPos, team, specularFactor);
	newPiece.calculateTargetPos();
	newPiece.pos.setVec(newPiece.targetPos);
	
	this.pieces.push(newPiece);
	
	return newPiece;
}
Animator.prototype.createMarker = function(position, color){
	var newMarker = new Marker(position, this.torus, color);
	this.markers.push(newMarker);
	return newMarker;
}
Animator.prototype.deleteMarker = function(marker){
	this.markers.splice(this.markers.indexOf(marker), 1);
}
Animator.prototype.deleteMarkerByIndex = function(index){
	if(index < 0 || index > this.markers.length - 1){
		Tool.printError("ERROR::Animator.deleteMarkerByIndex: index out of range. Expected 0 <= index < " + this.markers.length + ".");
		return null;
	}
	this.markers.splice(index, 1);
}
Animator.prototype.deleteAllMarkers = function(){
	this.markers.splice(0);
}
Animator.prototype.getPieceFromBoardPos = function(boardPos){
	for(var i=0; i<this.pieces.length; i++){
		var p = this.pieces[i];
		if(p.alive && p.boardPos.equals(boardPos, 0.1)){
			return p;
		}
	}
	return null;
}
Animator.prototype.animate = function(tick){
	// control camera
	this.cameraControls();
	
	// calucate target positions
	for(var i=0; i<this.pieces.length; i++){
		var p = this.pieces[i];
		p.calculateTargetPos();
	}
	
	// calculate velocities
	this.calculateAcceleration();
	
	// collision
	this.calculateCollision();
	
	// move
	for(var i=0; i<this.pieces.length; i++){
		var p = this.pieces[i];
		this.pieces[i].pos.add(p.vel);
		//p.pos.setVec(p.targetPos);
	}
	// render
	this.render(tick);
}
Animator.prototype.calculateCollision = function(){ // disabled
	
	// ground
	for(var i=0; i<this.pieces.length; i++){
		var p = this.pieces[i];
		if(p.pos.z < 0){
			p.pos.z = 0;
			p.vel.z = Math.abs(p.vel.z) * 0.9;
			p.vel.x *= 0.5;
			p.vel.y *= 0.5;
		}
	}
	
	// each other
	var radius = 1;
	for(var i=0; i<this.pieces.length; i++){
		for(var j=i; j<this.pieces.length; j++){
			var pI = this.pieces[i];
			var pJ = this.pieces[j];
			
			if(radius > Vec2.sub(pI.pos, pJ.pos).mag()){
				var diff = Vec3.sub(pI.pos, pJ.pos);
				var force;
				if(diff.mag() == 0){
					force = new Vec3();
				}else{
					force = Vec3.resize(diff, 0.025);
				}
				force.z = 0;
				//force.add(new Vec3(Math.random() - 2,Math.random() - 2,0).mul(0.01)); // prevent getting stuck
				//pI.vel.add(force);
				//pJ.vel.add(Vec3.neg(force));
			}
			
		}
	}
}
Animator.prototype.calculateAcceleration = function(){
	for(var i=0; i<this.pieces.length; i++){
		var acceleration = 0.02 * 4;
		
		var p = this.pieces[i];
		var difference = Vec3.sub(p.targetPos, p.pos);
		var nextDifference = Vec3.sub(difference, p.vel); // compensates for numerical integration error.
		
		var idealVelocity;
		if(nextDifference.mag() == 0){
			idealVelocity = new Vec3();
		}else{
			// v_1^2 - v_0^2 = 2*a*s
			// velocity = sqrt(2 * acceleration * distance)
			var carefulFactor = 0.75; // 1 for not careful.
			var v = Math.sqrt(2 * acceleration * nextDifference.mag()) * carefulFactor;
			idealVelocity = Vec3.resize(nextDifference, v);
		}
		var deltaVel = Vec3.sub(idealVelocity, p.vel);
		
		// if close and slow moving, set velocity to target position.
		if(Vec3.sub(difference, p.vel).mag() <= acceleration && // slow
				difference.mag() < acceleration){ // close
			deltaVel = Vec3.sub(difference, p.vel);
		}
		// clamp deltaVel to acceleration
		if(deltaVel.mag() > acceleration){
			deltaVel.resize(acceleration);
		}
		
		// apply
		p.vel.add(deltaVel);
	}
	
}
Animator.prototype.cameraControls = function(){
	var c = this.camera;
	var speed = 0.4;
	var f = c.forward;
	var u = c.up;
	var r = Vec3.cross(f, u);
	// translation
	var k = window.keyboardControl;
	if(k.w.isDown || k.up.isDown){
		c.pos.add(Vec3.mul(u, speed));
	}
	if(k.a.isDown || k.left.isDown){
		c.pos.add(Vec3.mul(Vec3.neg(r), speed));
	}
	if(k.s.isDown || k.down.isDown){
		c.pos.add(Vec3.mul(Vec3.neg(u), speed));
	}
	if(k.d.isDown || k.right.isDown){
		c.pos.add(Vec3.mul(r, speed));
	}
	// // restrict distance
	c.pos = Vec3.sub(c.pos, this.boardCenter).resize(15).add(this.boardCenter);
	// rotation
	c.lookAt(this.boardCenter, new Vec3(0, 0, 1));
	// zoom
	var m = window.mouseControl;
	var scrollSensitivity = 0.001;
	var arrowZoomSensitivity = 0.03;
	var newFOV = c.fov * (1 + m.deltaY * scrollSensitivity + (k.numMinus.isDown - k.numPlus.isDown) * arrowZoomSensitivity);
	newFOV = Tool.clamp(newFOV, Tool.degToRad(5), Tool.degToRad(120));
	c.setFOV(newFOV);
}
Animator.prototype.cameraControlsFreelook = function(){
	var c = this.camera;
	var speed = 0.1;
	var f = c.forward;
	var u = c.up;
	var r = Vec3.cross(f, u);
	// translation
	var k = window.keyboardControl;
	if(k.w.isDown){
		c.pos.add(Vec3.mul(f, speed));
	}
	if(k.a.isDown){
		c.pos.add(Vec3.mul(Vec3.neg(r), speed));
	}
	if(k.s.isDown){
		c.pos.add(Vec3.mul(Vec3.neg(f), speed));
	}
	if(k.d.isDown){
		c.pos.add(Vec3.mul(r, speed));
	}
	if(k.space.isDown){
		c.pos.add(Vec3.mul(new Vec3(0,0,1), speed));
	}
	if(k.shift.isDown){
		c.pos.add(Vec3.mul(new Vec3(0,0,-1), speed));
	}
	// rotation
	var m = window.mouseControl;
	// // mouse
	var sensitivityMouse = 2 * c.fov / this.renderer.canvas.width;
	if(m.left.isDown){
		var newDir = Vec3.addMany(
			c.forward,
			Vec3.mul(r, (m.pos.x - m.pos0.x) * sensitivityMouse),
			Vec3.mul(u, (m.pos.y - m.pos0.y) * sensitivityMouse)
		);
		c.lookInDir(newDir, new Vec3(0,0,1));
	}
	// // arrows
	var sensitivityArrows = 25 * c.fov / this.renderer.canvas.width;
	if(k.up.isDown || k.down.isDown || k.right.isDown || k.left.isDown){
		var newDir = Vec3.addMany(
			c.forward,
			Vec3.mul(r, (k.right.isDown - k.left.isDown) * sensitivityArrows),
			Vec3.mul(u, (k.up.isDown - k.down.isDown) * sensitivityArrows)
		);
		c.lookInDir(newDir, new Vec3(0,0,1));
	}
	// zoom
	var scrollSensitivity = 0.001;
	var arrowZoomSensitivity = 0.03;
	c.setFOV(c.fov * (1 + m.deltaY * scrollSensitivity + (k.numMinus.isDown - k.numPlus.isDown) * arrowZoomSensitivity));
}
Animator.prototype.render = function(tick){
	// set global uniforms
	for(var i=0; i<this.models.length; i++){
		var m = this.models[i];
		m.setAttributeVec3("cameraPos", this.camera.pos);
		m.setAttributeMatrix("projection", Matrix.transpose(this.camera.projection));
		m.setAttributeMatrix("view", Matrix.transpose(this.camera.calculateView()));
		m.setAttributeVec3("fogColor", this.renderer.backgroundColor);
		m.setAttributeFloat("tick", tick);
	}
	
	// clear
	this.renderer.clear();
	
	// render
	// // pieces
	for(var i=0; i<this.pieces.length; i++){
		this.pieces[i].render(tick);
	}
	// // board
	this.boardModel.setAttributeMatrix("model", Matrix.transpose(Matrix.multiply(
		Matrix.getTranslation(new Vec3(this.squareDim * 3.5, this.squareDim * 3.5, 0)),
		Matrix.getRotationX(Tool.degToRad(90)),
		)));
	this.boardModel.setAttributeVec3("color", new Vec3(1, 1, 1));//new Vec3(0.7,0.5,0.3));
	this.boardModel.setAttributeFloat("specularFactor", 1);
	this.boardModel.render();
	// // markers
	for(var i=0; i<this.markers.length; i++){
		this.markers[i].render(tick);
	}
}
Animator.prototype.worldCoordsToBoard = function(pos){
	var z;
	if(pos.z == null){
		z = 0;
	}else{
		z = pos.z;
	}
	return new Vec3(pos.x / this.squareDim, pos.y / this.squareDim, z);
}
Animator.prototype.boardCoordsToWorld = function(pos){
	var z;
	if(pos.z == null){
		z = 0;
	}else{
		z = pos.z;
	}
	return new Vec3(pos.x * this.squareDim, pos.y * this.squareDim, pos.z);
}






























