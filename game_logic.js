
// game states
GameLogic.PLAY = "PLAY";
GameLogic.WHITE_WON = "WHITE_WON";
GameLogic.BLACK_WON = "BLACK_WON";
GameLogic.DRAW = "DRAW";
// results
GameLogic.STALEMATE = "STALEMATE";
// player states
GameLogic.PLAYER_CHOOSE_PIECE = "PLAYER_CHOOSE_PIECE";
GameLogic.PLAYER_CHOOSE_MOVE = "PLAYER_CHOOSE_MOVE";
GameLogic.THREEFOLD_REPETITION = "THREEFOLD_REPETITION";
GameLogic.FIFTY_MOVE_RULE = "FIFTY_MOVE_RULE";
GameLogic.IMPOSSIBILITY_OF_CHECKMATE = "IMPOSSIBILITY_OF_CHECKMATE";
// team
GameLogic.WHITE = "WHITE";
GameLogic.BLACK = "BLACK";
// rokade
GameLogic.WHITE_RIGHT = "WHITE_RIGHT";
GameLogic.WHITE_LEFT = "WHITE_LEFT";
GameLogic.BLACK_RIGHT = "BLACK_RIGHT";
GameLogic.BLACK_LEFT = "BLACK_LEFT";

function GameLogic(canvasId){
	this.animator = new Animator(canvasId);
	
	// state
	this.currentPlayerColor = GameLogic.WHITE;
	this.playerColor = GameLogic.WHITE;
	this.gameState = GameLogic.PLAY;
	this.playerState = GameLogic.PLAYER_CHOOSE_PIECE;
	this.gameEndMessage;
	
	this.waitForCheckMateCheck = 0;
	
	// // board
	this.board = [];
	this.buildBoard();
	
	//
	this.markers = [];
	
	// AI
	this.artificialIntelligenceWorker = new Worker("web_worker.js");
	this.aiDone = false;
	this.aiInProgress = false;
	this.aiResult;
	this.aiMoveNr = 0;
	this.artificialIntelligenceWorker.addEventListener('message', (function(e) {
		var bestMoves = e.data;
		
		//bestMoves.reverse();
		
		// 30 * 100 * 16 = 48000
		outer:
		for(var nrSkipBestMoves = 0; nrSkipBestMoves<bestMoves.length; nrSkipBestMoves++){
			var move = bestMoves[nrSkipBestMoves];
			
			var boardCopy = this.duplicateBoard(this.board);
			var fromSquare = boardCopy[move.fromX][move.fromY];
			var toSquare = boardCopy[move.toX][move.toY];
			
			
			toSquare.team = fromSquare.team;
			toSquare.content = fromSquare.content;
			
			fromSquare.team = null;
			fromSquare.content = null;
			
			for(var i=0; i<this.boardStateHistory.length; i++){
				var previousState = this.boardStateHistory[i];
				if(this.boardsAreEqual(previousState.board, boardCopy) &&
						previousState.timesOccuredBefore == 1){ // 2 is the third time
					continue outer;
				}
			}
			break;
		}
		
		
		
		this.aiResult = bestMoves[Math.min(
			//Math.floor(nrSkipBestMoves / 2), // cannot do the same move more that 2 times
			Math.floor(nrSkipBestMoves), // cannot do the same move more that 2 times
			bestMoves.length-1
		)];
		this.aiInProgress = false;
		this.aiDone = true;
	}).bind(this), false);
	
	//
	this.selectedCoordinates;
	this.selectedPiece;
	
	//
	this.boardStateHistory = [];
	
	//
	this.nrMovesSinceCaptureOrPawnMoved = 0;
	
	//
	this.autopilot = [
		/*1,0,0,2,2,1,2,3,4,1,4,2,6,1,6,2,0,2,1,4,3,1,3,3,3,3,2,4,4,0,3,0,0,1,0,3,5,0
		,
		2,3,7,1,7,3,5,1,5,3,6,0,5,2,5,2,4,4,3,0,4,0,4,4,5,6,5,6,7,7,2,0,3,1,4,0,3,1,
		7,7,6,5,3,1,2,1,0,0,6,0,2,1,1,2,1,2,2,2,2,2,2,3,6,0,6,4,6,4,7,4,2,3,3,3,3,3,
		4,4,7,4,6,4,7,3,7,4,7,4,7,5,4,4,5,5,0,3,1,4,7,5,7,6,7,6,7,7,7,7,6,7,6,5,7,3,
		6,7,7,6,6,4,6,2,7,6,4,6,4,6,1,3,1,3,0,3,5,5,6,4,6,4,5,3,5,3,5,2,5,2,6,2,6,2,
		5,3,0,3,1,2,1,2,1,3,1,1,1,2,1,3,1,4,5,3,5,4,1,2,1,3,5,4,5,5,1,4,1,5,1,3,1,4,
		1,5,2,5,*/
		//1,4,1,5,2,5,2,7,1,5,1,6,1,6,1,7,2,7,2,4,1,7,1,3,2,4,2,2,1,3,1,1,2,2,
		//2,0
	];
	this.recording = Tool.cloneArray(this.autopilot);
}
GameLogic.prototype.run = function(tick){
	// game state
	this.calculateGameState();
	
	// run animation
	this.animator.animate(tick);
}
GameLogic.prototype.calculateGameState = function(orientation, type, team, boardPos){
	if(this.gameState == GameLogic.PLAY){
		if(this.waitForCheckMateCheck == 0){
			if(this.currentPlayerColor == GameLogic.BLACK){ // ai logic
				this.aiMakesMove(GameLogic.BLACK, GameLogic.WHITE);
			}else{ // player logic
				this.playerMakesMove();
				//this.aiMakesMove(GameLogic.WHITE, GameLogic.BLACK); // uncomment this and comment the above to make the ai play against itself
			}
		}
	}else if(this.gameState == GameLogic.BLACK_WON || this.gameState == GameLogic.WHITE_WON || this.gameState == GameLogic.DRAW){
		/*if(this.gameState == GameLogic.BLACK_WON){
			console.log("Black won the game.");
		}else if(this.gameState == GameLogic.WHITE_WON){
			console.log("White won the game.");
		}else if(this.gameState == GameLogic.DRAW){
			console.log("The game ended with a draw.");
		}*/
	}
}
GameLogic.prototype.aiMakesMove = function(myColor, opponentColor){
	if(this.aiDone){
		this.aiDone = false;
		
		var pieceToMove = this.animator.getPieceFromBoardPos(new Vec2(this.aiResult.fromX, this.aiResult.fromY));
		if(pieceToMove == null){
			dftgyhuj = 2;
		}
		this.movePiece(pieceToMove, new Vec2(this.aiResult.toX, this.aiResult.toY));
		
		this.endTurn();
		
		this.aiMoveNr++;
	}else{
		if(!this.aiInProgress){
			this.aiInProgress = true;
			this.artificialIntelligenceWorker.postMessage({"board": this.board,
				"myColor": myColor, "opponentColor": opponentColor, "dynamicIntelligence": false,
			});
		}
	}
}
GameLogic.prototype.playerMakesMove = function(){
	if(this.autopilot.length > 0 && (true || window.tick % 60 == 0)){
		var fromPos = new Vec2(this.autopilot.shift(), this.autopilot.shift());
		var toPos = new Vec2(this.autopilot.shift(), this.autopilot.shift());
		this.movePiece(this.animator.getPieceFromBoardPos(fromPos), toPos);
		this.endTurn();
		return;
	}
	if(this.playerState == GameLogic.PLAYER_CHOOSE_PIECE){
		if(window.mouseControl.clicked()){
			
			var boardClickPos = this.getBoardCoordinateOfMouse();
			
			if(boardClickPos == null){ // outside of board
				return;
			}
			var square = this.board[boardClickPos.x][boardClickPos.y];
			if(square.content == null){ // no piece
				return;
			}
			if(square.team != this.currentPlayerColor){
				return;
			}
			
			this.selectedCoordinates = boardClickPos;
			this.selectedPiece = this.animator.getPieceFromBoardPos(boardClickPos);
			this.selectedPiece.isBlinking = true;
			
			// markers
			var possibleMoves = ArtificialIntelligence.getPossibleMovesOfPiece(this.board, boardClickPos.x, boardClickPos.y);
			for(var i=0; i<possibleMoves.length; i ++){
				var p = possibleMoves[i];
				var newMarker = this.animator.createMarker(
					this.animator.boardCoordsToWorld(new Vec3(p.posX, p.posY, 0.2)),
					(p.kill? new Vec3(1,0,0): new Vec3(0,1,0)),
				);
				if(p.kill){
					newMarker.waveSize = 0.7;
					newMarker.pos.z = 1;
				}
				this.markers.push(newMarker);
			}
			// // rokade
			if(this.selectedPiece.type == ChessPiece.KING){
				if(this.currentPlayerColor == GameLogic.WHITE){
					if(this.canDoRokade(GameLogic.WHITE_RIGHT)){
						var newMarker = this.animator.createMarker(
								this.animator.boardCoordsToWorld(new Vec3(6, 0, 0.2)), new Vec3(0,0,1));
							this.markers.push(newMarker);
					}
					if(this.canDoRokade(GameLogic.WHITE_LEFT)){
						var newMarker = this.animator.createMarker(
								this.animator.boardCoordsToWorld(new Vec3(2, 0, 0.2)), new Vec3(0,0,1));
							this.markers.push(newMarker);
					}
				}else{ // this.currentPlayerColor == GameLogic.BLACK
					if(this.canDoRokade(GameLogic.BLACK_RIGHT)){
						var newMarker = this.animator.createMarker(
								this.animator.boardCoordsToWorld(new Vec3(6, 7, 0.2)), new Vec3(0,0,1));
							this.markers.push(newMarker);
					}
					if(this.canDoRokade(GameLogic.BLACK_LEFT)){
						var newMarker = this.animator.createMarker(
								this.animator.boardCoordsToWorld(new Vec3(2, 7, 0.2)), new Vec3(0,0,1));
							this.markers.push(newMarker);
					}
				}
			}
			
			//
			this.playerState = GameLogic.PLAYER_CHOOSE_MOVE;
		}
	}else if(this.playerState == GameLogic.PLAYER_CHOOSE_MOVE){
		// cancel?
		if(window.mouseControl.middle.clicked() || window.keyboardControl.esc.isDown){
			this.selectedPiece.isBlinking = false;
			this.playerState = GameLogic.PLAYER_CHOOSE_PIECE;
			this.animator.deleteAllMarkers();
			return;
		}
		//
		if(window.mouseControl.clicked()){
			var boardClickPos = this.getBoardCoordinateOfMouse();
			
			var rokadeDirection;
			if(boardClickPos != null && this.selectedPiece.type == ChessPiece.KING){
				if(this.currentPlayerColor == GameLogic.WHITE){
					if(boardClickPos.y == 0){
						if(boardClickPos.x == 6){
							rokadeDirection = GameLogic.WHITE_RIGHT;
						}else if(boardClickPos.x == 2){
							rokadeDirection = GameLogic.WHITE_LEFT;
						}
					}
				}else{ // this.currentPlayerColor == GameLogic.BLACK
					if(boardClickPos.y == 7){
						if(boardClickPos.x == 6){
							rokadeDirection = GameLogic.BLACK_RIGHT;
						}else if(boardClickPos.x == 2){
							rokadeDirection = GameLogic.BLACK_LEFT;
						}
					}
				}
			}
			var legalRokade = rokadeDirection != null && this.canDoRokade(rokadeDirection);
			
			if(boardClickPos != null &&  // outside of board
					(
						false || ArtificialIntelligence.isMoveLegal(this.board, this.selectedCoordinates.x, this.selectedCoordinates.y, boardClickPos.x, boardClickPos.y) ||
						legalRokade
					)){
				//
				var rookFrom;
				var rookTo;
				if(legalRokade){
					switch(rokadeDirection){
						case GameLogic.WHITE_RIGHT:
							rookFrom = new Vec2(7, 0);
							rookTo = new Vec2(5, 0);
							break;
						case GameLogic.WHITE_LEFT:
							rookFrom = new Vec2(0, 0);
							rookTo = new Vec2(3, 0);
							break;
						case GameLogic.BLACK_RIGHT:
							rookFrom = new Vec2(7, 7);
							rookTo = new Vec2(5, 7);
							break;
						case GameLogic.BLACK_LEFT:
							rookFrom = new Vec2(0, 7);
							rookTo = new Vec2(3, 7);
							break;
					}
					this.movePiece(this.animator.getPieceFromBoardPos(rookFrom), rookTo, false);
				}
				this.movePiece(this.selectedPiece, boardClickPos);
				
				this.recording.push(this.selectedCoordinates.x);
				this.recording.push(this.selectedCoordinates.y);
				this.recording.push(boardClickPos.x);
				this.recording.push(boardClickPos.y);
				this.endTurn();
			}
			this.selectedPiece.isBlinking = false;
			this.animator.deleteAllMarkers();
			this.playerState = GameLogic.PLAYER_CHOOSE_PIECE;
		}
	}else{
		Tool.printError("ERROR::GameLogic.calculateGameState: Did not recognize this.gameState. Got \"" + this.gameState + "\".");
		return null;
	}
}
GameLogic.prototype.endTurn = function(){
	this.currentPlayerColor = this.currentPlayerColor == GameLogic.WHITE? GameLogic.BLACK: GameLogic.WHITE;
	this.playerState = GameLogic.PLAYER_CHOOSE_PIECE;
}
GameLogic.prototype.movePiece = function(piece, toPos, doWinTest = true){
	
	var opponentKilled = false;
	var toSquare = this.board[toPos.x][toPos.y];
	if(toSquare.content != null){
		if(toSquare.team == this.currentPlayerColor){ // already occupied by team piece
			return;
		}else{
			opponentKilled = true;
			var opponentChessPiece = this.animator.getPieceFromBoardPos(toPos);
			opponentChessPiece.alive = false;
			opponentChessPiece.killer = piece;
			opponentChessPiece.waypoint = ChessPiece.WAYPOINT_DIE_0;
		}
	}
	
	var fromSquare = this.board[piece.boardPos.x][piece.boardPos.y];
	fromSquare.hasMoved = true;
	
	piece.waypoint = ChessPiece.WAYPOINT_MOVE_0;
	
	// move piece
	toSquare.team = fromSquare.team;
	toSquare.content = fromSquare.content;
	toSquare.hasMoved = fromSquare.hasMoved;
	fromSquare.team = fromSquare.content = fromSquare.hasMoved = null;
	
	piece.boardPos = toPos.clone();
	
	// pawn reached other side?
	if(toSquare.content == ChessPiece.PAWN && (toPos.y == 0 || toPos.y == 7)){
		toSquare.content = ChessPiece.QUEEN;
		if(piece.team == GameLogic.WHITE){
			piece.model = this.animator.queenModelWhite;
		}else{ // piece.team == GameLogic.BLACK
			piece.model = this.animator.queenModelBlack;
		}
		piece.type = ChessPiece.QUEEN;
	}
	
	// someone won?
	if(doWinTest){
		this.winTest(opponentKilled, toSquare.content);
	}
}
GameLogic.prototype.winTest = function(opponentKilled, typeMoved){
	
	// fifty move rule
	if(opponentKilled != null && typeMoved != null &&
			!opponentKilled && typeMoved != ChessPiece.PAWN){
		this.nrMovesSinceCaptureOrPawnMoved++;
		if(this.nrMovesSinceCaptureOrPawnMoved == 50){
			this.gameState = GameLogic.DRAW;
			this.gameEndMessage = GameLogic.FIFTY_MOVE_RULE;
		}
	}else{
		this.nrMovesSinceCaptureOrPawnMoved = 0;
	}
	
	// impossibility of checkmate
	var onlyKings = true;
	var onlyWhiteSquareBishops = true;
	var onlyBlackSquareBishops = true;
	var onlyKnights = true;
	var nrOfKnights = 0;
	for(var i=0; i<this.animator.pieces.length; i++){
		var p = this.animator.pieces[i];
		if(!p.alive){
			continue;
		}
		if(p.type != ChessPiece.KING){
			// // king versus king
			onlyKings = false;
			// // king and knight
			if(p.type == ChessPiece.KNIGHT){
				nrOfKnights++;
			}else{
				onlyKnights = false;
			}
			// only bishops on one color
			if(p.type == ChessPiece.BISHOP){
				if((p.boardPos.x + p.boardPos.y) % 2 == 0){ // Is on black square.
					onlyWhiteSquareBishops = false;
				}else{ // Is on white square.
					onlyBlackSquareBishops = false;
				}
			}else{
				onlyWhiteSquareBishops = onlyBlackSquareBishops = false;
			}
		}
		// // bishops of one color
		
	}
	if(onlyKings || onlyBlackSquareBishops || onlyWhiteSquareBishops || (onlyKnights && nrOfKnights == 1)){
		this.gameState = GameLogic.DRAW;
		this.gameEndMessage = GameLogic.IMPOSSIBILITY_OF_CHECKMATE;
	}
	
	
	// Draw due to same moves
	var foundStateInHistory = false;
	for(var i=0; i<this.boardStateHistory.length; i++){
		var previousState = this.boardStateHistory[i];
		if(this.boardsAreEqual(previousState.board, this.board)){
			foundStateInHistory = true;
			previousState.timesOccuredBefore++;
			if(previousState.timesOccuredBefore == 2){ // third time
				this.gameState = GameLogic.DRAW;
				this.gameEndMessage = GameLogic.THREEFOLD_REPETITION;
			}
			break;
		}
	}
	if(!foundStateInHistory){
		this.boardStateHistory.push({
			"board": this.duplicateBoard(this.board),
			"timesOccuredBefore": 0,
		});
	}
	
	// King dies, or cannot move.
	checkIfPlayerLost.call(this, GameLogic.WHITE, GameLogic.BLACK_WON);
	checkIfPlayerLost.call(this, GameLogic.BLACK, GameLogic.WHITE_WON);
	
	function checkIfPlayerLost(myColor, opponentVictory){
		if(this.currentPlayerColor != myColor){
			this.waitForCheckMateCheck++;
			ArtificialIntelligence.getPossibleMovesAsync(this.board, myColor, (function(moves){
				if(moves.length == 0){
					if(ArtificialIntelligence.kingCanDie(this.board, myColor)){
						this.gameState = opponentVictory;
					}else{
						this.gameState = GameLogic.DRAW;
						this.gameEndMessage = GameLogic.STALEMATE;
					}
				}
				this.waitForCheckMateCheck--;
			}).bind(this));
		}
	}
}
GameLogic.prototype.doRokade = function(board, direction){
	var posY;
	var rookPosX;
	switch(direction){
		case GameLogic.WHITE_RIGHT:
			posY = 0;
			rookPosX = 7;
			break;
		case GameLogic.WHITE_LEFT:
			posY = 0;
			rookPosX = 0;
			break;
		case GameLogic.BLACK_RIGHT:
			posY = 7;
			rookPosX = 7;
			break;
		case GameLogic.BLACK_LEFT:
			posY = 7;
			rookPosX = 0;
			break;
	}
	if(direction == GameLogic.WHITE_LEFT || direction == GameLogic.BLACK_LEFT){
		var fromSquareRook = board[0][posY];
		var toSquareRook = board[3][posY];
		
		var fromSquareKing = board[4][posY];
		var toSquareKing = board[2][posY];
	}else{ // direction == WHITE_RIGHT || direction == BLACK_RIGHT
		var fromSquareRook = board[7][posY];
		var toSquareRook = board[5][posY];
		
		var fromSquareKing = board[4][posY];
		var toSquareKing = board[6][posY];
	}
	
	
	toSquareRook.team = fromSquareRook.team;
	toSquareRook.content = fromSquareRook.content;
	toSquareRook.hasMoved = fromSquareRook.hasMoved;
	fromSquareRook.team = fromSquareRook.content = fromSquareRook.hasMoved = null;
	
	toSquareKing.team = fromSquareKing.team;
	toSquareKing.content = fromSquareKing.content;
	toSquareKing.hasMoved = fromSquareKing.hasMoved;
	fromSquareKing.team = fromSquareKing.content = fromSquareKing.hasMoved = null;
}
GameLogic.prototype.canDoRokade = function(direction){
	var posY;
	var rookPosX;
	switch(direction){
		case GameLogic.WHITE_RIGHT:
			posY = 0;
			rookPosX = 7;
			break;
		case GameLogic.WHITE_LEFT:
			posY = 0;
			rookPosX = 0;
			break;
		case GameLogic.BLACK_RIGHT:
			posY = 7;
			rookPosX = 7;
			break;
		case GameLogic.BLACK_LEFT:
			posY = 7;
			rookPosX = 0;
			break;
	}
	// In check?
	var myColor;
	if(direction == GameLogic.WHITE_RIGHT || direction == GameLogic.WHITE_LEFT){
		myColor = GameLogic.WHITE;
	}else{ // direction == GameLogic.BLACK_RIGHT || direction == GameLogic.BLACK_LEFT
		myColor = GameLogic.BLACK;
	}
	if(ArtificialIntelligence.kingCanDie(this.board, myColor)){
		return false;
	}
	// Would be in check?
	var boardCopy = this.duplicateBoard(this.board);
	this.doRokade(boardCopy, direction);
	if(ArtificialIntelligence.kingCanDie(boardCopy, myColor)){
		return false;
	}
	// noPiecesInBetween
	if(direction == GameLogic.WHITE_RIGHT || direction == GameLogic.BLACK_RIGHT){
		if(this.board[5][posY].content != null || this.board[6][posY].content != null){
			return false;
		}
	}else{ // direction == GameLogic.WHITE_LEFT || direction == GameLogic.BLACK_LEFT
		if(this.board[1][posY].content != null || this.board[2][posY].content != null || this.board[3][posY].content != null){
			return false;
		}
	}
	var king = this.board[4][posY];
	if(king.content == ChessPiece.KING && king.hasMoved == false){
		var rook = this.board[rookPosX][posY];
		if(rook.content == ChessPiece.ROOK && rook.hasMoved == false){
				return true;
		}
	}
	return false;
}
GameLogic.prototype.getBoardCoordinateOfMouse = function(){
	// // ray in direction on the screen where mouse clicked
	var ray = this.animator.canvasCoordsToRay(window.mouseControl.pos);
	// // this.animator.camera.pos.z + ray.z * t = 0 
	var t = - this.animator.camera.pos.z / ray.z;
	// // What square was clicked in board coordinate system?
	var boardClickPos = Vec2.add(this.animator.camera.pos, Vec2.mul(ray, t)); // Conversion from Vec3 to Vec2
	boardClickPos.div(this.animator.squareDim);
	boardClickPos.x = Math.floor(boardClickPos.x + 0.5);
	boardClickPos.y = Math.floor(boardClickPos.y + 0.5);
	
	if(boardClickPos.x < 0 || boardClickPos.x >= this.board.length ||
			boardClickPos.y < 0 || boardClickPos.y >= this.board[0].length){
		return null;
	}
	
	return boardClickPos;
}
GameLogic.prototype.createPiece = function(orientation, type, team, boardPos){
	var color = new Vec3();
	if(team == GameLogic.WHITE){
		color = new Vec3(1,1,1);
	}else if(team == GameLogic.BLACK){
		color = new Vec3(1,1,1);
	}else{
		Tool.printError("ERROR::GameLogic.createPiece: Did not recognize team. Expected WHITE or BLACK, got \"" + team + "\".", 1);
		return null;
	}
	this.animator.createPiece(orientation, type, color, boardPos, team);
	
	this.board[boardPos.x][boardPos.y].team = team;
	this.board[boardPos.x][boardPos.y].content = type;
	this.board[boardPos.x][boardPos.y].hasMoved = false;
}
GameLogic.prototype.boardsAreEqual = function(boardA, boardB){
	for(var i=0; i<boardA.length; i++){
		for(var j=0; j<boardA[i].length; j++){
			if(boardA[i][j].team != boardB[i][j].team ||
					boardA[i][j].content != boardB[i][j].content){
				return false;
			}
		}
	}
	return true;
}
GameLogic.prototype.duplicateBoard = function(toBeCopied){
	var newBoard = [];
	for(var i=0; i<toBeCopied.length; i++){
		newBoard.push([]);
		for(var j=0; j<toBeCopied[i].length; j++){
			var square = toBeCopied[i][j];
			newBoard[i].push({
				"team": square.team,
				"content": square.content,
				"hasMoved": square.hasMoved,
			});
		}
	}
	return newBoard;
}
GameLogic.prototype.buildBoard = function(){
	
	//
	for(var i=0; i<8; i++){
		this.board.push([]);
		for(var j=0; j<8; j++){
			this.board[i].push({
				"team": null,
				"content": null,
				"hasMoved": null,
			});
		}
	}
	
	// pieces
	var orientation1 = Matrix.getRotationX(Tool.degToRad(90));
	var orientation2 = Matrix.multiply(
		Matrix.getRotationZ(Tool.degToRad(90)),
		orientation1,
	);
	var orientation3 = Matrix.multiply(
		Matrix.getRotationZ(Tool.degToRad(90)),
		orientation2,
	);
	var orientation4 = Matrix.multiply(
		Matrix.getRotationZ(Tool.degToRad(90)),
		orientation3,
	);
	
	var boardPos;
	// white
	// // pawns
	for(var i=0; i<8; i++){
		this.createPiece(Matrix.multiply(Matrix.getRotationZ(Math.random() * Math.PI * 2), orientation1), ChessPiece.PAWN, GameLogic.WHITE, new Vec2(i, 1));
	}
	// // knights
	this.createPiece(orientation2, ChessPiece.KNIGHT, GameLogic.WHITE, new Vec2(1, 0));
	this.createPiece(orientation2, ChessPiece.KNIGHT, GameLogic.WHITE, new Vec2(6, 0));
	// // rooks
	this.createPiece(orientation1, ChessPiece.ROOK, GameLogic.WHITE, new Vec2(0, 0));
	this.createPiece(orientation1, ChessPiece.ROOK, GameLogic.WHITE, new Vec2(7, 0));
	// // bishops
	this.createPiece(orientation4, ChessPiece.BISHOP, GameLogic.WHITE, new Vec2(2, 0));
	
	this.createPiece(orientation4, ChessPiece.BISHOP, GameLogic.WHITE, new Vec2(5, 0));
	////this.createPiece(orientation4, ChessPiece.BISHOP, GameLogic.WHITE, new Vec2(7, 4));
	
	// // queen
	this.createPiece(orientation1, ChessPiece.QUEEN, GameLogic.WHITE, new Vec2(3, 0));
	// // king
	this.createPiece(orientation1, ChessPiece.KING, GameLogic.WHITE, new Vec2(4, 0));
	// black
	// // pawns
	for(var i=0; i<8; i++){
		this.createPiece(Matrix.multiply(Matrix.getRotationZ(Math.random() * Math.PI * 2), orientation3), ChessPiece.PAWN, GameLogic.BLACK, new Vec2(i, 6));
	}
	// // knights
	this.createPiece(orientation4, ChessPiece.KNIGHT, GameLogic.BLACK, new Vec2(1, 7));
	
	this.createPiece(orientation4, ChessPiece.KNIGHT, GameLogic.BLACK, new Vec2(6, 7));
	////this.createPiece(orientation4, ChessPiece.KNIGHT, GameLogic.BLACK, new Vec2(7, 5));
	
	// // rooks
	this.createPiece(orientation3, ChessPiece.ROOK, GameLogic.BLACK, new Vec2(0, 7));
	this.createPiece(orientation3, ChessPiece.ROOK, GameLogic.BLACK, new Vec2(7, 7));
	// // bishops
	this.createPiece(orientation2, ChessPiece.BISHOP, GameLogic.BLACK, new Vec2(2, 7));
	this.createPiece(orientation2, ChessPiece.BISHOP, GameLogic.BLACK, new Vec2(5, 7));
	// // queen
	this.createPiece(orientation3, ChessPiece.QUEEN, GameLogic.BLACK, new Vec2(3, 7));
	// // king
	this.createPiece(orientation3, ChessPiece.KING, GameLogic.BLACK, new Vec2(4, 7));
}



































