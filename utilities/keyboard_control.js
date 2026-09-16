/*
	This manages keyboard inputs from the user.
	By calling the function update() the controls may be synced with some interval.
*/

function KeyboardControl(){
	this.keys = [];
	
	this.keyCodeLog = [];
	
	document.addEventListener("keydown", this.keyDown.bind(this));
	document.addEventListener("keyup", this.keyUp.bind(this));
	
	this.keyDownCallBacks = [];
	this.keyUpCallBacks = [];
	
	this.n1 = new Key(49);
	this.keys.push(this.n1);
	this.n2 = new Key(50);
	this.keys.push(this.n2);
	this.n3 = new Key(51);
	this.keys.push(this.n3);
	this.n4 = new Key(52);
	this.keys.push(this.n4);
	this.n5 = new Key(53);
	this.keys.push(this.n5);
	this.n6 = new Key(54);
	this.keys.push(this.n6);
	this.n7 = new Key(55);
	this.keys.push(this.n7);
	this.n8 = new Key(56);
	this.keys.push(this.n8);
	this.n9 = new Key(57);
	this.keys.push(this.n9);
	this.n0 = new Key(48);
	this.keys.push(this.n0);
	this.q = new Key(81);
	this.keys.push(this.q);
	this.w = new Key(87);
	this.keys.push(this.w);
	this.e = new Key(69);
	this.keys.push(this.e);
	this.r = new Key(82);
	this.keys.push(this.r);
	this.t = new Key(84);
	this.keys.push(this.t);
	this.y = new Key(89);
	this.keys.push(this.y);
	this.u = new Key(85);
	this.keys.push(this.u);
	this.i = new Key(73);
	this.keys.push(this.i);
	this.o = new Key(79);
	this.keys.push(this.o);
	this.p = new Key(80);
	this.keys.push(this.p);
	this.a = new Key(65);
	this.keys.push(this.a);
	this.s = new Key(83);
	this.keys.push(this.s);
	this.d = new Key(68);
	this.keys.push(this.d);
	this.f = new Key(70);
	this.keys.push(this.f);
	this.g = new Key(71);
	this.keys.push(this.g);
	this.h = new Key(72);
	this.keys.push(this.h);
	this.j = new Key(74);
	this.keys.push(this.j);
	this.k = new Key(75);
	this.keys.push(this.k);
	this.l = new Key(76);
	this.keys.push(this.l);
	this.z = new Key(90);
	this.keys.push(this.z);
	this.x = new Key(88);
	this.keys.push(this.x);
	this.c = new Key(67);
	this.keys.push(this.c);
	this.v = new Key(86);
	this.keys.push(this.v);
	this.b = new Key(66);
	this.keys.push(this.b);
	this.n = new Key(78);
	this.keys.push(this.n);
	this.m = new Key(77);
	this.keys.push(this.m);
	this.ctrl = new Key(17);
	this.keys.push(this.ctrl);
	this.shift = new Key(16);
	this.keys.push(this.shift);
	this.space = new Key(32);
	this.keys.push(this.space);
	this.up = new Key(38);
	this.keys.push(this.up);
	this.down = new Key(40);
	this.keys.push(this.down);
	this.right = new Key(39);
	this.keys.push(this.right);
	this.left = new Key(37);
	this.keys.push(this.left);
	this.numPlus = new Key(107);
	this.keys.push(this.numPlus);
	this.numMinus = new Key(109);
	this.keys.push(this.numMinus);
	this.esc = new Key(27);
	this.keys.push(this.esc);
}
function Key(keyCode){
	this.isDown = false;
	this.timeDown = 0;
	this.timeUp = 0;
	this.keyCode = keyCode;
}
KeyboardControl.prototype.addKeyDownEventListener = function(callback){
	this.keyDownCallBacks.push(callback);
}
KeyboardControl.prototype.addKeyUpEventListener = function(callback){
	this.keyUpCallBacks.push(callback);
}
KeyboardControl.prototype.keyDown = function(event){
	
	var found = false;
	for(var i=0; i<this.keys.length; i++){
		if(this.keys[i].keyCode == event.keyCode){
			this.keys[i].isDown = true;
			this.keys[i].timeDown = 1;
			found = true;
			break;
		}
	}
	this.keyCodeLog.push(event.keyCode);
	for(var i=0; i<this.keyDownCallBacks.length; i++){
		this.keyDownCallBacks[i]();
	}
	
	if(found){
		event.preventDefault();
	}
}
KeyboardControl.prototype.keyUp = function(event){
	
	var found = false;
	for(var i=0; i<this.keys.length; i++){
		if(this.keys[i].keyCode == event.keyCode){
			this.keys[i].isDown = false;
			this.keys[i].timeUp = 1;
			found = true;
			break;
		}
	}
	for(var i=0; i<this.keyUpCallBacks.length; i++){
		this.keyUpCallBacks[i]();
	}
	
	if(found){
		event.preventDefault();
	}
}
KeyboardControl.prototype.reset = function(){
	for(var i=0; i<this.keys.length; i++){
		this.keys[i].isDown = false;
		this.keys[i].timeUp = 0;
		this.keys[i].timeDown = 0;
	}
}
KeyboardControl.prototype.update = function(){
	// This function can be used to time for how long a key has been held down or released.
	
	for(var i=0; i<this.keys.length; i++){
		if(this.keys[i].isDown){
			this.keys[i].timeDown++;
		}else{
			this.keys[i].timeUp++;
		}
	}
}
KeyboardControl.prototype.getKeyNames = function(){
	// usage: Press keys in order. Then call this function, and code for copy paste in constructor will be generated.
	
	var names = prompt("give key names. Example \"tab,q,w,e,r,t,y,u,i,o,p,enter,caps,a,s\"");
	names = names.split(",");
	
	var result = "";
	for(var i=0; i<Math.min(names.length, this.keyCodeLog.length); i++){
		result += "\tthis." + names[i] + " = new Key(" + this.keyCodeLog[i] + ");\n\tthis.keys.push(this." + names[i] + ");\n"
	}
	
	console.log(result);
}




