

self.importScripts("game_logic.js", "chess_piece.js", "artificial_intelligence.js");

self.ai = new ArtificialIntelligence();

// constructor
self.addEventListener('message', function(e) {
	var intelligence;
	if(e.data.intelligence != null){
		intelligence = e.data.intelligence;
	}else{
		if(e.data.myColor == GameLogic.WHITE){
			intelligence = 3;
		}else{
			intelligence = 3;
		}
	}
	
	if(e.data.dynamicIntelligence){
		var nrPossibleMoves = 
			ArtificialIntelligence.getPossibleMoves(e.data.board, GameLogic.WHITE).length +
			ArtificialIntelligence.getPossibleMoves(e.data.board, GameLogic.BLACK).length;
		// maxComp = n^i
		// i = log(maxComp) / log(n)
		intelligence = Math.floor(14 / Math.log(nrPossibleMoves + 1));
		console.log(intelligence);
		console.log(14 / Math.log(nrPossibleMoves + 1));
	}
	
	var bestMoves = self.ai.getBestMove(e.data.board, intelligence, e.data.myColor, e.data.opponentColor, false);
	
	self.postMessage(bestMoves);
}, false);







