

window.onload = function(){
	window.fps = 30;
	window.loop = setInterval("renderLoop()",1000/fps);
	window.tick = 0;
	
	window.gameLogic = new GameLogic("canvas");
	
	window.mouseControl = new MouseControl("canvas");
	window.keyboardControl = new KeyboardControl();
	
	window.headerElement = document.getElementById("heading");
	window.lastState;
	window.lastTurn;
}
function renderLoop(){
	window.tick++;
	
	// animate
	window.gameLogic.run(window.tick);
	
	if(window.lastState != window.gameLogic.gameState ||
			window.lastTurn != window.gameLogic.currentPlayerColor){
		window.lastState = window.gameLogic.gameState;
		window.lastTurn = window.gameLogic.currentPlayerColor;
		
		if(window.gameLogic.gameState == GameLogic.PLAY){
			if(window.gameLogic.currentPlayerColor == GameLogic.WHITE){
				window.headerElement.innerHTML = "White's turn.";
			}else{ // window.gameLogic.currentPlayerColor == GameLogic.BLACK
				window.headerElement.innerHTML = "Black's turn.";
			}
		}else if(window.gameLogic.gameState == GameLogic.WHITE_WON){
			window.headerElement.innerHTML = "White won!";
		}else if(window.gameLogic.gameState == GameLogic.BLACK_WON){
			window.headerElement.innerHTML = "Black won!";
		}else if(window.gameLogic.gameState == GameLogic.DRAW){
			window.headerElement.innerHTML = "The game was a draw due to " + window.gameLogic.gameEndMessage + ".";
		}
	}
	
	// end stuff
	window.mouseControl.update();
	window.keyboardControl.update();
}






















