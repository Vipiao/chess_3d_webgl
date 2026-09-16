
ChessPiece.PAWN = "PAWN";
ChessPiece.KNIGHT = "KNIGHT";
ChessPiece.ROOK = "ROOK";
ChessPiece.BISHOP = "BISHOP";
ChessPiece.QUEEN = "QUEEN";
ChessPiece.KING = "KING";

ChessPiece.WAYPOINT_BOARD_POSITION = "WAYPOINT_BOARD_POSITION";
ChessPiece.WAYPOINT_DIE_0 = "WAYPOINT_DIE_0";
ChessPiece.WAYPOINT_DIE_1 = "WAYPOINT_DIE_1";
ChessPiece.WAYPOINT_DIE_2 = "WAYPOINT_DIE_2";
ChessPiece.WAYPOINT_MOVE_0 = "WAYPOINT_MOVE_0";
ChessPiece.WAYPOINT_MOVE_1 = "WAYPOINT_MOVE_1";
ChessPiece.WAYPOINT_MOVE_2 = "WAYPOINT_MOVE_2";
ChessPiece.WAYPOINT_MOVE_3 = "WAYPOINT_MOVE_3";

function ChessPiece(animator, orientation, type = ChessPiece.PAWN, model, color, boardPos, team, specularFactor){
	this.animator = animator;
	this.type = type;
	this.model = model;
	this.color = color.clone();
	this.specularFactor = specularFactor;
	this.targetPos = new Vec3();
	this.pos = new Vec3();
	this.vel = new Vec3();
	this.orientation = Tool.cloneArray(orientation); // describes the unit orientation scew/scale and position of the chess piece
	
	this.alive = true;
	this.killer; // whay piece killed this one
	this.waypoint = ChessPiece.WAYPOINT_BOARD_POSITION;
	this.boardPos = boardPos;
	this.team = team;
	
	this.isBlinking = false;
}
ChessPiece.prototype.calculateTargetPos = function(){
	switch(this.waypoint){
		case ChessPiece.WAYPOINT_BOARD_POSITION:
			this.targetPos.setCoords(this.boardPos.x * this.animator.squareDim, this.boardPos.y * this.animator.squareDim, this.targetPos.z);
			break;
		case ChessPiece.WAYPOINT_DIE_0:
			if(Vec2.sub(this.pos, this.killer.pos).mag() < 3 || !this.killer.alive){
				this.targetPos.z = 5;
				this.targetPos.x -= this.animator.squareDim;
				this.waypoint = ChessPiece.WAYPOINT_DIE_1;
			}else{
				this.targetPos.setCoords(this.boardPos.x * this.animator.squareDim, this.boardPos.y * this.animator.squareDim, 0);
			}
			break;
		case ChessPiece.WAYPOINT_DIE_1:
			if(Math.abs(this.pos.z - this.targetPos.z) < 1){
				if(this.team == GameLogic.WHITE){
					this.targetPos = new Vec3((-2 - this.animator.numDeadWhitePieces) * this.animator.squareDim, 6 * this.animator.squareDim, this.targetPos.z);
					this.animator.numDeadWhitePieces++;
				}else{ // this.team == GameLogic.BLACK
					this.targetPos = new Vec3((-2 - this.animator.numDeadBlackPieces) * this.animator.squareDim, 1 * this.animator.squareDim, this.targetPos.z);
					this.animator.numDeadBlackPieces++;
				}
				this.waypoint = ChessPiece.WAYPOINT_DIE_2;
			}
			
			break;
		case ChessPiece.WAYPOINT_DIE_2:
			if(Vec3.sub(this.pos, this.targetPos).mag() < 1){
				this.targetPos.z = 0;
			}
			
			break;
		case ChessPiece.WAYPOINT_MOVE_0:
			this.targetPos.z = 2;
			this.waypoint = ChessPiece.WAYPOINT_MOVE_1;
			break;
		case ChessPiece.WAYPOINT_MOVE_1:
			if(Math.abs(this.pos.z - this.targetPos.z) < 1){
				this.targetPos.setCoords(this.boardPos.x * this.animator.squareDim, this.boardPos.y * this.animator.squareDim, this.targetPos.z);
				this.waypoint = ChessPiece.WAYPOINT_MOVE_2;
			}
			
			break;
		case ChessPiece.WAYPOINT_MOVE_2:
			if(Vec3.sub(this.pos, this.targetPos).mag() < 1){
				this.targetPos.z = 0;
				this.waypoint = ChessPiece.WAYPOINT_BOARD_POSITION;
			}
			break;
		default:
			Tool.printError("ERROR:ChessPiece.calculateTargetPos: Did not recognize this.waypoint");
	}
	
	return this.targetPos;
}
ChessPiece.prototype.render = function(tick){
	this.model.setAttributeMatrix("model", Matrix.transpose(this.getModelMatrix()));
	/*if(tick % 60 == 0){
		this.isBlinking = !this.isBlinking;
	}*/
	var color;
	if(this.isBlinking){
		this.model.setAttributeVec3("color", Vec3.lerp(
			this.color,
			new Vec3(0.5, 0.35, 0),
			(1 + Math.sin(tick * 0.4)) * 0.5,
		));
	}else{
		this.model.setAttributeVec3("color", this.color);
	}
	this.model.setAttributeFloat("specularFactor", this.specularFactor);
	this.model.render();
}
ChessPiece.prototype.getModelMatrix = function(){
	var model = Matrix.multiply(
		Matrix.getTranslation(this.pos),
		this.orientation,
	);
	return model;
}



























