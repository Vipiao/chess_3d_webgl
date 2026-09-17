

// moves
ArtificialIntelligence.knightMoves = [
	1, 2,
	1, -2,
	-1, -2,
	-1, 2,
	2, 1,
	2, -1,
	-2, -1,
	-2, 1,
];
ArtificialIntelligence.rookMoves = [
	1, 0,
	-1, 0,
	0, 1,
	0, -1,
];
ArtificialIntelligence.bishopMoves = [
	1, 1,
	1, -1,
	-1, -1,
	-1, 1,
];
ArtificialIntelligence.queenMoves = [
	1, 0,
	1, 1,
	0, 1,
	-1, 1,
	-1, 0,
	-1, -1,
	0, -1,
	1, -1,
];
ArtificialIntelligence.kingMoves = [
	1, 0,
	1, 1,
	0, 1,
	-1, 1,
	-1, 0,
	-1, -1,
	0, -1,
	1, -1,
];

function ArtificialIntelligence(){
	// Board is a 2-dimentional list that is 8x8. Its content is {"team": someTeam, "content": someContent}.
	// The board is column major. If no piece is in a square, "team" and "content" will be null.
	// Otherwise, team is GameLogic.WHITE / .BLACK and content is ChessPiece.PAWN / .KNIGHT / .ROOK / .BISHOP / .QUEEN / .KING.
	// whitePieces and blackPieces is lists of x an y coordinates, x,y in [0-7], that describe the coordinates of the pieces;
	// The length of theese lists are 2x8 = 16.
	
	this.board;
	
	this.topLevel;
	
	this.bestMoves;
}
ArtificialIntelligence.convertBoardFormat = function(board){
	// convert board
	var whitePieces = [];
	var blackPieces = [];
	
	var formattedBoard = [];
	for(var i=0; i<board.length; i++){
		formattedBoard.push([]);
		for(var j=0; j<board[i].length; j++){
			var team = board[i][j].team;
			var pieceIndex;
			if(team == GameLogic.WHITE){
				pieceIndex = whitePieces.length;
				whitePieces.push(i);
				whitePieces.push(j);
			}else if(team == GameLogic.BLACK){
				pieceIndex = blackPieces.length;
				blackPieces.push(i);
				blackPieces.push(j);
			}
			formattedBoard[i].push({
				"team": team,
				"content": board[i][j].content,
				"pieceIndex": pieceIndex,
			});
			pieceIndex = null;
		}
	}
	return {"whitePieces": whitePieces, "blackPieces": blackPieces, "board": formattedBoard};
}
ArtificialIntelligence.prototype.getBestMove = function(board, difficulty, myColor, opponentColor, allowKingToDie){
	if(allowKingToDie == null){
		debugger;
		return null;
	}
	// difficulty is in [0-infinity]
	// return {"score": number, "fromX": integer, "fromY": integer, "toX": integer, "toY": integer}
	
	this.topLevel = difficulty;
	this.bestMoves = [];
	
	// calculate board
	var data = ArtificialIntelligence.convertBoardFormat(board);
	this.board = data.board;
	
	//
	var myPieces;
	var opponentPieces;
	if(myColor == GameLogic.WHITE){
		myPieces = data.whitePieces;
		opponentPieces = data.blackPieces;
	}else{ // myColor == GameLogic.BLACK
		myPieces = data.blackPieces;
		opponentPieces = data.whitePieces;
	}
	
	this.getBestMoveAtLevel(difficulty, myColor, opponentColor, myPieces, opponentPieces,);
	
	if(!allowKingToDie){ // remove moves where king would die
		for(var i=0; i<this.bestMoves.length; i++){
			var m = this.bestMoves[i];
			if(ArtificialIntelligence.kingWouldDie(this.board, m.fromX, m.fromY, m.toX, m.toY)){
				this.bestMoves.splice(i, 1);
				i--;
			}
		}
	}
	
	this.bestMoves.sort(function(mA, mB){
		return mB.score - mA.score;
	});
	
	return this.bestMoves;
	
}
ArtificialIntelligence.prototype.getBestMoveAtLevel = function(level, myColor, opponentColor, myPieces, opponentPieces){
	// return {"score": number, "fromX": integer, "fromY": integer, "toX": integer, "toY": integer}
	
	var bestFromX;
	var bestFromY;
	var bestToX;
	var bestToY;
	var bestScore = -Infinity;
	var numberOfPossibleMoves = 0;
	
	for(var i=0; i<myPieces.length; i += 2){
		if(level == this.topLevel){
			//console.log((100 * i / myPieces.length).toFixed(0) + "% done.");
		}
		var thisX = myPieces[i];
		var thisY = myPieces[i+1];
		if(thisX == null){ // and thisY == null
			continue;
		}
		var thisSquare = this.board[thisX][thisY];
		if(thisSquare.team != myColor){
			Tool.printError("WRONG COLOR STUFF!!!!!");
		}
		switch(thisSquare.content){
			case ChessPiece.PAWN:
				if(myColor == GameLogic.WHITE){
					// one step forward
					var oneStepPossible = tryMovePawn.call(this, 0, 1, function(nextSquare){
						return nextSquare.team == null;
					});
					// two steps forward
					if(oneStepPossible && thisY == 1){
						tryMovePawn.call(this, 0, 2, function(nextSquare){
							return nextSquare.team == null;
						});
					}
					// diagonal kill
					// // right
					tryMovePawn.call(this, 1, 1, function(nextSquare){
						return nextSquare.team == opponentColor;
					});
					// // left
					tryMovePawn.call(this, -1, 1, function(nextSquare){
						return nextSquare.team == opponentColor;
					});
				}else{ // myColor == GameLogic.BLACK
					// one step forward
					var oneStepPossible = tryMovePawn.call(this, 0, -1, function(nextSquare){
						return nextSquare.team == null;
					});
					// two steps forward
					if(oneStepPossible && thisY == 6){
						tryMovePawn.call(this, 0, -2, function(nextSquare){
							return nextSquare.team == null;
						});
					}
					// diagonal kill
					// // right
					tryMovePawn.call(this, 1, -1, function(nextSquare){
						return nextSquare.team == opponentColor;
					});
					// // left
					tryMovePawn.call(this, -1, -1, function(nextSquare){
						return nextSquare.team == opponentColor;
					});
				}
				break;
			case ChessPiece.KNIGHT:
				for(var j=0; j<ArtificialIntelligence.knightMoves.length; j+=2){
					var xDir = ArtificialIntelligence.knightMoves[j];
					var yDir = ArtificialIntelligence.knightMoves[j+1];
					tryMove.call(this, xDir, yDir);
				}
				break;
			case ChessPiece.ROOK:
				for(var j=0; j<ArtificialIntelligence.rookMoves.length; j+=2){
					var xDir = ArtificialIntelligence.rookMoves[j];
					var yDir = ArtificialIntelligence.rookMoves[j+1];
					var travelLength = 1;
					while(tryMove.call(this, xDir * travelLength, yDir * travelLength)){
						travelLength++;
					}
				}
				break;
			case ChessPiece.BISHOP:
				for(var j=0; j<ArtificialIntelligence.bishopMoves.length; j+=2){
					var xDir = ArtificialIntelligence.bishopMoves[j];
					var yDir = ArtificialIntelligence.bishopMoves[j+1];
					var travelLength = 1;
					while(tryMove.call(this, xDir * travelLength, yDir * travelLength)){
						travelLength++;
					}
				}
				break;
			case ChessPiece.QUEEN:
				for(var j=0; j<ArtificialIntelligence.queenMoves.length; j+=2){
					var xDir = ArtificialIntelligence.queenMoves[j];
					var yDir = ArtificialIntelligence.queenMoves[j+1];
					var travelLength = 1;
					while(tryMove.call(this, xDir * travelLength, yDir * travelLength)){
						travelLength++;
					}
				}
				break;
			case ChessPiece.KING:
				for(var j=0; j<ArtificialIntelligence.kingMoves.length; j+=2){
					var xDir = ArtificialIntelligence.kingMoves[j];
					var yDir = ArtificialIntelligence.kingMoves[j+1];
					tryMove.call(this, xDir, yDir);
				}
				break;
		}
	}
	var canMove = true;
	if(bestScore == -Infinity){ // If nothing can be done, evaluate as neutral.
		bestScore = 0;
		canMove = false;
	}
	bestScore += numberOfPossibleMoves * 0.001;
	return {"score": bestScore, "fromX": bestFromX, "fromY": bestFromY, "toX": bestToX, "toY": bestToY, "canMove": canMove};
	
	function tryMovePawn(diffX, diffY, f){
		// return true or false if the move position is empty or not. Also return false if the position is outside the board.
		// The score of the move will also be updated if better.
		var nextX = thisX + diffX;
		var nextY = thisY + diffY;
		if(nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8){
			var nextSquare = this.board[nextX][nextY];
			if(f.call(this, nextSquare)){
				numberOfPossibleMoves++;
				var score = this.testMove(thisSquare, nextSquare, thisX, thisY, nextX, nextY, myPieces, opponentPieces, myColor, opponentColor, level);
				if(this.topLevel == level){
					this.bestMoves.push({
						"fromX": thisX,
						"fromY": thisY,
						"toX": nextX,
						"toY": nextY,
						"score": score,
					});
				}
				if(score > bestScore){
					bestFromX = thisX;
					bestFromY = thisY;
					bestToX = nextX;
					bestToY = nextY;
					bestScore = score;
				}
				return true;
			}
			if(nextSquare.content == null){
				return true;
			}else{
				return false;
			}
		}
		return false;
	}
	function tryMove(diffX, diffY){
		// return true or false if the move position is empty or not. Also return false if the position is outside the board.
		// The score of the move will also be updated if better.
		var nextX = thisX + diffX;
		var nextY = thisY + diffY;
		if(nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8){
			var nextSquare = this.board[nextX][nextY];
			if(nextSquare.team != myColor){
				numberOfPossibleMoves++;
				var score = this.testMove(thisSquare, nextSquare, thisX, thisY, nextX, nextY, myPieces, opponentPieces, myColor, opponentColor, level);
				if(this.topLevel == level){
					this.bestMoves.push({
						"fromX": thisX,
						"fromY": thisY,
						"toX": nextX,
						"toY": nextY,
						"score": score,
					});
				}
				if(score > bestScore){
					bestFromX = thisX;
					bestFromY = thisY;
					bestToX = nextX;
					bestToY = nextY;
					bestScore = score;
				}
			}
			if(nextSquare.content == null){
				return true;
			}else{
				return false;
			}
		}
		return false;
	}
}
ArtificialIntelligence.prototype.testMove = function(oldSquare, newSquare, fromX, fromY, toX, toY,
		myPieces, opponentPieces, myColor, opponentColor, level){ // TODO: remove some arguments? remember cascade
	
	// return a score for how good this move is. Higher is better;
	
	var factor = 0.99; // how important are moves close in time to far in the future
	
	var score = 0;
	
	// store old information
	var restoreList = new Array(20); // TODO:specify size // will contain information needed to restore this.board to its original state
	var restoreListLength = 0;
	
	score += movePiece.call(this, restoreList, fromX, fromY, toX, toY, oldSquare, newSquare, myPieces, opponentPieces);
	
	if(level == 0){
		restore.call(this); // restore old state
		return  score;
	}
	
	// assume opponent move
	// {"score": number, "fromX": integer, "fromY": integer, "toX": integer, "toY": integer}
	var opponentMove = this.getBestMoveAtLevel(level - 1, opponentColor, myColor, opponentPieces, myPieces); // swap team
	if(opponentMove.canMove){
		score -= movePiece.call(this, restoreList, opponentMove.fromX, opponentMove.fromY, opponentMove.toX, opponentMove.toY,
			this.board[opponentMove.fromX][opponentMove.fromY], this.board[opponentMove.toX][opponentMove.toY], opponentPieces, myPieces) * factor;
	}
	
	if(level == 1){
		restore.call(this, 20); // restore old state
		return  score;
	}
	
	// calculate your next move
	score += this.getBestMoveAtLevel(level - 2, myColor, opponentColor, myPieces, opponentPieces).score * factor * factor; // factor makes early victories preferable
	
	// restore old state
	restore.call(this);
	
	return score;
	
	function restore(){
		for(var i = restoreListLength-5; i>=0; i -= 5){ // restore board backwards
			var x = restoreList[i];
			var y = restoreList[i+1];
			var team = restoreList[i+2];
			var content = restoreList[i+3];
			var pieceIndex = restoreList[i+4];
			
			var square = this.board[x][y];
			square.team = team;
			square.content = content;
			square.pieceIndex = pieceIndex;
			if(team == myColor){
				myPieces[pieceIndex] = x;
				myPieces[pieceIndex + 1] = y;
			}else if(team == opponentColor){
				opponentPieces[pieceIndex] = x;
				opponentPieces[pieceIndex + 1] = y;
			}
		}
	}
	
	function movePiece(restoreList, fromX, fromY, toX, toY, oldSquare, newSquare, myPieces, opponentPieces){
		var score = 0;
		
		restoreList[0 + restoreListLength] = fromX;
		restoreList[1 + restoreListLength] = fromY;
		restoreList[2 + restoreListLength] = oldSquare.team;
		restoreList[3 + restoreListLength] = oldSquare.content;
		restoreList[4 + restoreListLength] = oldSquare.pieceIndex;
		
		restoreList[5 + restoreListLength] = toX;
		restoreList[6 + restoreListLength] = toY;
		restoreList[7 + restoreListLength] = newSquare.team;
		restoreList[8 + restoreListLength] = newSquare.content;
		restoreList[9 + restoreListLength] = newSquare.pieceIndex;
		
		restoreListLength += 10;
		
		// update piece lists
		myPieces[oldSquare.pieceIndex] = toX;
		myPieces[oldSquare.pieceIndex + 1] = toY;
		
		// // kill potential oponent
		if(newSquare.team != null){ // must be opponent piece
			opponentPieces[newSquare.pieceIndex] = null;
			opponentPieces[newSquare.pieceIndex + 1] = null;
			switch(newSquare.content){
				case ChessPiece.PAWN:
					score += 1;
					break;
				case ChessPiece.KNIGHT:
					score += 3;
					break;
				case ChessPiece.ROOK:
					score += 4;
					break;
				case ChessPiece.BISHOP:
					score += 5;
					break;
				case ChessPiece.QUEEN:
					score += 7;
					break;
				case ChessPiece.KING:
					// don't ever accept loosing the king
					score += 2 * 16 * 7 * 999999999;
					//score += Infinity;
					break;
			}
		}
		
		// pawn reached other side?
		if(oldSquare.content == ChessPiece.PAWN){
			if(toY == 7 || toY == 0){
				oldSquare.content = ChessPiece.QUEEN;
				score += 6; // queen - pawn
			}else{
				score += 0.01; // points for moving at all
			}
		}
		
		// move
		newSquare.team = oldSquare.team;
		newSquare.content = oldSquare.content;
		newSquare.pieceIndex = oldSquare.pieceIndex;
		
		oldSquare.team = null;
		oldSquare.content = null;
		oldSquare.pieceIndex = null;
		
		return score;
	}
}
ArtificialIntelligence.isMoveLegal = function(boardUnformatted, fromX, fromY, toX, toY){
	var possibleMoves = ArtificialIntelligence.getPossibleMovesOfPiece(boardUnformatted, fromX, fromY);
	
	for(var i=0; i<possibleMoves.length; i++){
		var p = possibleMoves[i];
		if(p.posX == toX && p.posY == toY){
			return true;
		}
	}
	return false;
}
ArtificialIntelligence.getPossibleMovesAsync = function(boardUnformatted, team, callback){
	var worker = new Worker("web_worker.js");
	worker.addEventListener('message', (function(callback, worker, e) {
		callback(e.data);
		worker.terminate();
	}).bind(null, callback, worker));
	
	var myColor = team;
	var opponentColor;
	if(myColor == GameLogic.WHITE){
		opponentColor = GameLogic.BLACK;
	}else{ // myColor == GameLogic.BLACK
		opponentColor = GameLogic.WHITE;
	}
	
	worker.postMessage({"board": boardUnformatted,
		"myColor": myColor, "opponentColor": opponentColor, "intelligence": 0,
	});
}
ArtificialIntelligence.getPossibleMoves = function(boardUnformatted, team){
	
	var ai = new ArtificialIntelligence();
	var myColor = team;
	var opponentColor;
	if(myColor == GameLogic.WHITE){
		opponentColor = GameLogic.BLACK;
	}else{ // myColor == GameLogic.BLACK
		opponentColor = GameLogic.WHITE;
	}
	var moves = ai.getBestMove(boardUnformatted, 0, myColor, opponentColor, false);
	
	return moves;
	/*var moves = [];
	
	var boardData = this.convertBoardFormat(boardUnformatted);
	var pieces;
	if(team == GameLogic.WHITE){
		pieces = boardData.whitePieces;
	}else{
		pieces = boardData.blackPieces;
	}
	for(var i=0; i<pieces.length; i+=2){
		var posX = pieces[i];
		var posY = pieces[i+1];
		
		var pieceMoves = ArtificialIntelligence.getPossibleMovesOfPiece(boardUnformatted, posX, posY);
		for(var j=0; j<pieceMoves.length; j++){
			var p = pieceMoves[j];
			moves.push({
				"fromX": posX,
				"fromY": posY,
				"toX": p.posX,
				"toY": p.posY,
				"kill": p.kill,
			});
		}
	}
	
	return moves;*/
	
}
ArtificialIntelligence.getPossibleMovesOfPiece = function(boardUnformatted, posX, posY){
	var data = this.convertBoardFormat(boardUnformatted);
	var square = data.board[posX][posY];
	
	var moves = [];
	switch(square.content){
		case ChessPiece.PAWN:
			if(square.team == GameLogic.WHITE){
				// one step forward
				var firstStepEmpty;
				firstStepEmpty = isEmpty.call(this, 0, 1) && tryMove.call(this, 0, 1);
				// second step
				if(posY == 1 && firstStepEmpty && isEmpty.call(this, 0, 2)){
					tryMove.call(this, 0, 2);
				}
				// diagonal right
				if(hasOpponent.call(this, 1, 1)){
					tryMove.call(this, 1, 1);
				}
				// diagonal left
				if(hasOpponent.call(this, -1, 1)){
					tryMove.call(this, -1, 1);
				}
			}else{ // square.team == GameLogic.BLACK
				// one step forward
				var firstStepEmpty;
				firstStepEmpty = isEmpty.call(this, 0, -1) && tryMove.call(this, 0, -1);
				// second step
				if(posY == 6 && firstStepEmpty && isEmpty.call(this, 0, -2)){
					tryMove.call(this, 0, -2);
				}
				// diagonal right
				if(hasOpponent.call(this, 1, -1)){
					tryMove.call(this, 1, -1);
				}
				// diagonal left
				if(hasOpponent.call(this, -1, -1)){
					tryMove.call(this, -1, -1);
				}
			}
			break;
		case ChessPiece.KNIGHT:
			for(var j=0; j < ArtificialIntelligence.knightMoves.length; j+=2){
				var xDir = ArtificialIntelligence.knightMoves[j];
				var yDir = ArtificialIntelligence.knightMoves[j+1];
				tryMove.call(this, xDir, yDir);
			}
			break;
		case ChessPiece.ROOK:
			for(var j=0; j < ArtificialIntelligence.rookMoves.length; j+=2){
				var xDir = ArtificialIntelligence.rookMoves[j];
				var yDir = ArtificialIntelligence.rookMoves[j+1];
				var travelLength = 1;
				while(tryMove.call(this, xDir * travelLength, yDir * travelLength)){ // will continue if square is empty
					travelLength++;
				}
			}
			break;
		case ChessPiece.BISHOP:
			for(var j=0; j<ArtificialIntelligence.bishopMoves.length; j+=2){
				var xDir = ArtificialIntelligence.bishopMoves[j];
				var yDir = ArtificialIntelligence.bishopMoves[j+1];
				var travelLength = 1;
				while(tryMove.call(this, xDir * travelLength, yDir * travelLength)){
					travelLength++;
				}
			}
			break;
		case ChessPiece.QUEEN:
			for(var j=0; j<ArtificialIntelligence.queenMoves.length; j+=2){
				var xDir = ArtificialIntelligence.queenMoves[j];
				var yDir = ArtificialIntelligence.queenMoves[j+1];
				var travelLength = 1;
				while(tryMove.call(this, xDir * travelLength, yDir * travelLength)){
					travelLength++;
				}
			}
			break;
		case ChessPiece.KING:
			for(var j=0; j<ArtificialIntelligence.kingMoves.length; j+=2){
				var xDir = ArtificialIntelligence.kingMoves[j];
				var yDir = ArtificialIntelligence.kingMoves[j+1];
				tryMove.call(this, xDir, yDir);
			}
			break;
	}
	
	// test if king could die
	for(var i=0; i<moves.length; i++){
		var m = moves[i];
		if(this.kingWouldDie(boardUnformatted, posX, posY, m.posX, m.posY)){
			moves.splice(i, 1);
			i--;
		}
	}
	
	return moves;
	
	// helper functions
	function hasOpponent(diffX, diffY){
		var nextX = posX + diffX;
		var nextY = posY + diffY;
		if(nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8){
			var nextSquare = data.board[nextX][nextY];
			if(nextSquare.content != null && nextSquare.team != square.team){
				return true;
			}
		}
		return false;
	}
	function isEmpty(diffX, diffY){
		var nextX = posX + diffX;
		var nextY = posY + diffY;
		if(nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8){
			var nextSquare = data.board[nextX][nextY];
			if(nextSquare.content == null){
				return true;
			}
		}
		return false;
	}
	function tryMove(diffX, diffY){
		// If empty return true, else return false
		// If possible to move here, add coordinates to coords.
		var nextX = posX + diffX;
		var nextY = posY + diffY;
		var other;
		if(nextX >= 0 && nextX < 8 && nextY >= 0 && nextY < 8){
			var nextSquare = data.board[nextX][nextY];
			if(nextSquare.content == null || nextSquare.team != square.team){
				var newMove = {
					"posX": nextX,
					"posY": nextY,
					"kill": null,
				}
				moves.push(newMove);
				if(nextSquare.content == null){
					newMove.kill = false;
				}else{
					newMove.kill = true;
				}
			}
			if(nextSquare.content == null){
				return true;
			}else{
				return false;
			}
		}
		return false;
	}
}
ArtificialIntelligence.kingWouldDie = function(boardUnformatted, posX, posY, toX, toY){
	var boardCopy = this.convertBoardFormat(boardUnformatted).board;
	
	var squareFrom = boardCopy[posX][posY];
	var squareTo = boardCopy[toX][toY];
	
	squareTo.team = squareFrom.team;
	squareTo.content = squareFrom.content;
	squareFrom.team = null;
	squareFrom.content = null;
	
	var myColor = squareTo.team;
	var opponentColor;
	if(myColor == GameLogic.WHITE){
		opponentColor = GameLogic.BLACK;
	}else{ // myColor == ChessPiece.BLACK
		opponentColor = GameLogic.WHITE;
	}
	
	var ai = new ArtificialIntelligence();
	var opponentMoves = ai.getBestMove(boardCopy, 0, opponentColor, myColor, true);
	if(opponentMoves.length == 0){
		return false;
	}
	var opponentTargetSquare = boardCopy[opponentMoves[0].toX][opponentMoves[0].toY];
	if(opponentTargetSquare.content == ChessPiece.KING){
		return true;
	}
	return false;
}
ArtificialIntelligence.kingCanDie = function(boardUnformatted, team){
	var myColor = team;
	var opponentColor;
	if(myColor == GameLogic.WHITE){
		opponentColor = GameLogic.BLACK;
	}else{ // myColor == ChessPiece.BLACK
		opponentColor = GameLogic.WHITE;
	}
	
	var ai = new ArtificialIntelligence();
	var opponentMoves = ai.getBestMove(boardUnformatted, 0, opponentColor, myColor, true);
	if(opponentMoves.length == 0){
		return false;
	}
	var opponentTargetSquare = boardUnformatted[opponentMoves[0].toX][opponentMoves[0].toY];
	if(opponentTargetSquare.content == ChessPiece.KING){
		return true;
	}
	return false;
}




















