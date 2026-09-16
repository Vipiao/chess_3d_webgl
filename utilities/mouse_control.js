
function MouseControl(canvasId){
	this.canvas = document.getElementById(canvasId);
	if(this.canvas == null){
		Tool.printError("ERROR::Render: No canvas with id: \"" + canvasId + "\".", 1);
		return null;
	}
	this.canvas.addEventListener("mousewheel", this.scroll.bind(this), false);
	this.canvas.addEventListener("mousemove", this.mouseMove.bind(this), false);
	this.canvas.addEventListener("mousedown", this.mouseDown.bind(this), false);
	this.canvas.addEventListener("mouseup", this.mouseUp.bind(this), false);
	this.canvas.addEventListener("mouseout", this.mouseUp.bind(this), false);
	
	this.deltaY = 0; // scroll vertical
	this.deltaX = 0; // scroll horizontal
	
	this.buttons = [];
	
	this.left = new MouseControl.button(0);
	this.buttons.push(this.left);
	
	this.middle = new MouseControl.button(1);
	this.buttons.push(this.middle);
	
	this.right = new MouseControl.button(2);
	this.buttons.push(this.right);
	
	this.pos = new Vec2();
	this.pos0 = new Vec2();
}
MouseControl.button = function(id){
	this.id = id;
	this.isDown = false;
	this.timeDown = 0;
	this.timeUp = 0;
}
MouseControl.button.prototype.clicked = function(){
	return this.isDown && this.timeDown == 1;
}
MouseControl.prototype.stateToString = function(){
	return "" +
		"  deltaY: " + this.deltaY + "\n" +
		"  deltaX: " + this.deltaX + "\n" +
		"  isDown: " + this.isDown + "\n" +
		"timeDown: " + this.timeDown + "\n" +
		"  timeUp: " + this.timeUp + "\n" +
		"     pos: [" + this.pos.x + ",\n           " + this.pos.y + ",\n" +
		"     pos: [" + this.pos0.x + ",\n           " + this.pos0.y + "]";
}
MouseControl.prototype.clicked = function(){
	return this.left.isDown && this.left.timeDown == 1;
}
MouseControl.prototype.clickedFor = function(time){
	return !this.left.isDown && this.left.timeUp == 1 && this.left.timeDown <= time;
}
MouseControl.prototype.scroll = function(event){
	this.deltaY = event.deltaY;
	this.deltaX = event.deltaX;
	
	event.preventDefault();
}
MouseControl.prototype.mouseMove = function(event){
	this.pos = new Vec2(
		event.pageX - event.target.offsetLeft,
		this.canvas.height - (event.pageY - event.target.offsetTop)
	);
	
	event.preventDefault();
}
MouseControl.prototype.mouseDown = function(event){
	var button;
	for(var i=0; i<this.buttons.length; i++){
		if(this.buttons[i].id == event.button){
			button = this.buttons[i];
		}
	}
	if(button == null){
		Tool.printError("ERROR::MouseControl.mouseDown: Did not recognize button with id \"" + event.button + "\".");
		return null;
	}
	
	if(button.isDown){
		return;
	}
	button.timeDown = 1;
	button.isDown = true;
	
	event.preventDefault();
}
MouseControl.prototype.mouseUp = function(event){
	var button;
	for(var i=0; i<this.buttons.length; i++){
		if(this.buttons[i].id == event.button){
			button = this.buttons[i];
		}
	}
	if(button == null){
		Tool.printError("ERROR::MouseControl.mouseUp: Did not recognize button with id \"" + event.button + "\".");
		return null;
	}
	
	if(!button.isDown){
		return;
	}
	button.timeUp = 1;
	button.isDown = false;
	
	event.preventDefault();
}
MouseControl.prototype.update = function(event){
	this.pos0.setVec(this.pos);
	
	for(var i=0; i<this.buttons.length; i++){
		var b = this.buttons[i];
		if(b.isDown){
			b.timeDown++;
		}else if(b.timeUp != 0){
			b.timeUp++;
		}
	}
	this.deltaY = 0;
	this.deltaX = 0;
}
















