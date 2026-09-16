
/*
	How to use:
		1. Make a new FPS_display object.
			var fpsDisplay = new FPS_display("some_cavas_id", 100, 100);
		2. run render() to render timeline
			fpsDisplay.render(frame); // frame is the current frame number. It is expected to increment.
		The before the first average is calculated, the framerate will be displayed as ?/fps. Where fps
		is the attributt set in the constructor.
	Example:
		In index.html:
			<canvas id="mycanvas" width="500" height="450"></canvas>
			<script src="frames_per_second_display.js"></script>
			<script src="test.js"></script>
		In test.js
			var fps = 30;
			
			// Refresh rate is every 50 / fps = 50 / 30 = 1.67 seconds. Format example: "frame number: 1131 fps: 29/30"
			var fpsDisplay = new FPS_display("mycanvas", 50, 30);
			
			var loop = setInterval("renderLoop()",1000/fps);
			var frame = 0;
			function renderLoop(){
				frame++;
				fpsDisplay.render(frame);
			}
*/

function FPS_display (canvasId, refresh_rate, fps) {
	//	cavas_Id: id of the canvas html element to add the display to.
	// refresh_rate: over how many frames should the fps average over.
	// fps: How many frames per second is to be displayed as the maximum.
	
	// constructor
	this.canvas = document.getElementById(canvasId);
	if(this.canvas == null){
		Tool.printError("ERROR::FPS_display: No canvas with id: \"" + canvasId + "\".", 1);
	}
	this.pen = this.canvas.getContext("2d");
	this.refresh_rate = refresh_rate;
	this.isFirstIteration = true;
	this.fps = fps;
	this.real_fps = fps;
	this.time_object = new Date();
	this.current_time = this.time_object.getTime();
	this.last_time = this.current_time;
	this.aia = new Array(); // additional information array
}
FPS_display.prototype.render = function (frame) {
	var ais; // additional information string
	ais = this.aia.join(", ")
	this.pen.beginPath();
	this.pen.rect(5,5,160,15);
	this.pen.fillStyle="yellow";
	this.pen.fill();
	if (!(frame % this.refresh_rate)) {
		this.isFirstIteration = false;
		this.time_object = new Date();
		this.current_time = this.time_object.getTime();
		this.real_fps = Math.floor(1000*this.refresh_rate/(this.current_time-this.last_time));
		this.pen.fillStyle = "blue";
		this.pen.fillText("frame number: "+frame+" fps: "+this.real_fps+"/"+this.fps+" "+ais,10,15);
		this.last_time = this.current_time;
	} else {
		this.pen.fillStyle = "blue";
		var real_fps;
		if(this.isFirstIteration){
			real_fps = "?";
		}else{
			real_fps = this.real_fps;
		}
		this.pen.fillText("frame number: "+frame+" fps: "+real_fps+"/"+this.fps+" "+ais,10,15);
	}
}













