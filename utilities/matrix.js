
/*
// let m be a 4 by 4 matrix,
m = [row0column0, row0column1, row0column2, row0column3, row1column0, ...]
// then
	m[4 * a + b]
// gives the a-th row and b-th column.

*/

function Matrix(m){

}
Matrix.toStringFormat = function(m){ // will be printed as row-major
	function format(number){
		var string = number.toFixed(2);
		var l = 10 - string.length;
		l < 0? l = 0: null;
		return " ".repeat(l) + string;
	}
	var s = "\n" +
			"|" + format(m[4 * 0 + 0]) + " " + format(m[4 * 0 + 1]) + " " + format(m[4 * 0 + 2]) + " " + format(m[4 * 0 + 3]) + "|\n" +
			"|" + format(m[4*1 + 0]) + " " + format(m[4*1 + 1]) + " " + format(m[4*1 + 2]) + " " + format(m[4*1 + 3]) + "|\n" +
			"|" + format(m[4*2 + 0]) + " " + format(m[4*2 + 1]) + " " + format(m[4*2 + 2]) + " " + format(m[4*2 + 3]) + "|\n" +
			"|" + format(m[4*3 + 0]) + " " + format(m[4*3 + 1]) + " " + format(m[4*3 + 2]) + " " + format(m[4*3 + 3]) + "|\n";
	return s;
}
Matrix.getIdentity = function(){
	return [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1,
	];
}
Matrix.copy = function(m){
	var newMatrix = [];
	for(var i=0; i<m.length; i++){
		newMatrix.push(m[i]);
	}

	return newMatrix;
}
Matrix.copyInto = function(intoMatrix, fromMatrix){
	for(var i=0; i<intoMatrix.length; i++){
		intoMatrix[i] = fromMatrix[i];
	}

	return intoMatrix;
}
Matrix.addMatrix = function(mA, mB){
	var newMatrix = [];
	for(var i=0; i<mA.length; i++){
		newMatrix.push(mA[i] + mB[i]);
	}

	return newMatrix;
}
Matrix.addValue = function(m, v){
	var newMatrix = [];
	for(var i=0; i<m.length; i++){
		newMatrix.push(m[i] + v);
	}

	return newMatrix;
}
Matrix.multiplyValue = function(m, v){
	var newMatrix = [];
	for(var i=0; i<m.length; i++){
		newMatrix.push(m[i] * v);
	}

	return newMatrix;
}
Matrix.multiplyMany = function(){
	var args = arguments;
	var product = args[0];
	for(var i=1; i<args.length;i++){
		product = Matrix.multiply(product, args[i]);
	}
	return product;
}
Matrix.multiply = function(mA, mB){
	newMatrix = [];
	for(var i=0; i<4; i++){
		for(var j=0; j<4; j++){
			newMatrix.push(mA[4*i + 0] * mB[4*0 + j] + mA[4*i + 1] * mB[4*1 + j] + mA[4*i + 2] * mB[4*2 + j] + mA[4*i + 3] * mB[4*3 + j]);
		}
	}

	return newMatrix;
}
Matrix.multiplyVector = function(mat, vec4){

	var newVec4 = new Vec4(
		mat[4*0 + 0] * vec4.x + mat[4*0 + 1] * vec4.y + mat[4*0 + 2] * vec4.z + mat[4*0 + 3] * vec4.w,
		mat[4*1 + 0] * vec4.x + mat[4*1 + 1] * vec4.y + mat[4*1 + 2] * vec4.z + mat[4*1 + 3] * vec4.w,
		mat[4*2 + 0] * vec4.x + mat[4*2 + 1] * vec4.y + mat[4*2 + 2] * vec4.z + mat[4*2 + 3] * vec4.w,
		mat[4*3 + 0] * vec4.x + mat[4*3 + 1] * vec4.y + mat[4*3 + 2] * vec4.z + mat[4*3 + 3] * vec4.w
	);

	return newVec4;
}
Matrix.transpose = function(mat){
	var transposed = new Array(16);
	for(var i=0; i<mat.length; i++){
		transposed[i] = mat[4 * (i % 4) + Math.floor(i / 4)];
	}

	return transposed;
}
// MATRIX FUNCTIONS
// // projection
Matrix.getProjection = function(horizontalFieldOfView, widthToHeightRatio, minDepth, maxDepth){
	var t = Math.tan(horizontalFieldOfView * 0.5);
	return [
		0.5 / t,                            0,                                                0,                                                0,
		      0, 0.5 * widthToHeightRatio / t,                                                0,                                                0,
		      0,                            0,   -(maxDepth + minDepth) / (maxDepth - minDepth), -2 * maxDepth * minDepth / (maxDepth - minDepth),
		      0,                            0,                                               -1,                                                0
	];
}
// // view
Matrix.lookAt = function(pos, target, up){
	// "target" and "pos" must not be the same point. "pos" - "target" must not be parallel with "up".
	var forward = Vec3.sub(target, pos);
	var right = Vec3.cross(forward, up);
	var newUp = Vec3.cross(right, forward);

	return Matrix.getView(pos, forward.unit(), newUp.unit());
}
Matrix.lookInDir = function(direction, up){
	// "target" and "pos" must not be the same point. "pos" - "target" must not be parallel with "up".
	var right = Vec3.cross(direction, up);
	var newUp = Vec3.cross(right, direction);

	return Matrix.getView(pos, Vec3.unit(direction), newUp.unit());
}
Matrix.getView = function(pos, forward, up){
	// "forward" and "up" must be orthogonal unitvectors.
	var right = Vec3.cross(forward, up);

	/*return [ // assumes pos = (0,0,0)
		   right.x,    right.y,    right.z, 0,
		      up.x,       up.y,       up.z, 0,
		-forward.x, -forward.y, -forward.z, 0,
		         0,          0,          0, 1
	];*/
	return [ // This matrix is the_matrix_above * Matrix.getTranslation(-pos)
		   right.x,    right.y,    right.z,  -Vec3.dot(right, pos),
		      up.x,       up.y,       up.z,     -Vec3.dot(up, pos),
		-forward.x, -forward.y, -forward.z, Vec3.dot(forward, pos), // this row is negative since positive z is towards us
		         0,          0,          0,                          1
	];

}
// // model
Matrix.getTranslation = function(moveVec){
	return [
		1, 0, 0, moveVec.x,
		0, 1, 0, moveVec.y,
		0, 0, 1, moveVec.z,
		0, 0, 0,         1,
	];
}
Matrix.getScale = function(factor){
	return [
		factor,      0,      0, 0,
		     0, factor,      0, 0,
		     0,      0, factor, 0,
		     0,      0,      0, 1
	];
}
Matrix.getRotationX = function(angle){
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	return [
		1,   0,    0, 0,
		0, cos, -sin, 0,
		0, sin,  cos, 0,
		0,   0,    0, 1,
	];
}
Matrix.getRotationY = function(angle){
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	return [
		 cos, 0, sin, 0,
		   0, 1,   0, 0,
		-sin, 0, cos, 0,
		   0, 0,   0, 1,
	];
}
Matrix.getRotationZ = function(angle){
	var cos = Math.cos(angle);
	var sin = Math.sin(angle);
	return [
		cos,-sin, 0, 0,
		sin, cos, 0, 0,
		  0,   0, 1, 0,
		  0,   0, 0, 1,
	];
}
/*
var a = [
	3,7,5,1,
	3,7,-3,4,
	2,1,-7,5,
	-3,-6,3,0
];
var b = [
	2,-5,-7,4,
	2,5,7,-3,
	2,2,2,-3,
	-7,2,0,-1
];
a * b =
	|     23.00      32.00      38.00     -25.00|
	|    -14.00      22.00      22.00      -4.00|
	|    -43.00      -9.00     -21.00      21.00|
	|    -12.00      -9.00     -15.00      -3.00|

var v = new Vec4(5,2,9,-1);

a * v =
	| 73|
	| -2|
	|-56|
	|  0|


*/
