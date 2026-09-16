window.chess_pieces_vert = `

// in
attribute vec3 position;
attribute vec3 normal;
attribute vec2 textureCoord;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform float tick;

// out
varying vec3 worldPos;
varying vec3 worldNormal;
varying vec2 texCoord;

//
float rand(float num);
float rand(vec2 co);
float rand(vec3 co);

void main(void) {
	tick;
	// position
	worldPos = vec3(model * vec4(position, 1.));
	//worldPos += pow(1.01, tick) * 0.001 *
	//	sin(pow(1.001, tick) * tick * 0.1 + rand(position) * 100.) *
	//	vec3(rand(position), rand(position+2.), rand(position+1.));
	gl_Position = projection * view * vec4(worldPos, 1.);
	
	// normal
	worldNormal = mat3(model) * normal; // must use line below if model scales unevenly
	//worldNormal = mat3(transpose(inverse(model))) * normal;
	
	// texture
	texCoord = textureCoord;
}
float rand(float num){
	return fract(sin(num * 78.233) * 43758.5453);
}
float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float rand(vec3 co){
	return fract(sin(dot(co.xyz ,vec3(12.9898,78.233, 37.443))) * 43758.5453);
}

`