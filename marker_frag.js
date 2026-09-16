window.marker_frag = `

precision mediump float;
// in
uniform vec3 cameraPos;
uniform vec3 color;
//uniform float tick;
uniform sampler2D sampler;
uniform vec3 fogColor;

varying vec3 worldPos;
varying vec3 worldNormal;
varying vec2 texCoord;

// functions
vec3 directionalLight(vec3 lightDir, vec3 viewDir, vec3 normal, float diffuseFactor, float specularFactor, float ambientFactor,
		vec3 surfaceColor, vec3 lightColor);
float modulo(float a, float b);
float rand(float num);
float rand(vec2 co);
float rand(vec3 co);
float noise(vec2 p, float freq );
float pNoise(vec2 p, int res);
vec3 lerp(vec3 vA, vec3 vB, float f);

void main(void) {
	//tick;
	
	vec3 normal = normalize(worldNormal);
	vec3 viewDir = normalize(worldPos - cameraPos);
	
	vec3 surfaceColor = color * vec3(texture2D(sampler, texCoord));
	
	vec3 lightDir = normalize(vec3(1., 1., -1.));
	float diffuseFactor = 0.8;
	float specularFactor = 0.8;
	float ambientFactor = 0.2;
	
	vec3 result;
	result = directionalLight(lightDir, viewDir, normal, diffuseFactor, specularFactor, ambientFactor,
		surfaceColor, vec3(1., 1., 1.));
	
	lightDir = normalize(vec3(-1., 0.5, -0.25));
	diffuseFactor *= 0.5;
	specularFactor *= 0.5;
	ambientFactor *= 0.5;
	
	result += directionalLight(lightDir, viewDir, normal, diffuseFactor, specularFactor, ambientFactor,
		surfaceColor, vec3(1., 1., 1.));
	
	lightDir = normalize(vec3(0., -1., 0.));
	diffuseFactor *= 0.5;
	specularFactor *= 0.5;
	ambientFactor *= 0.5;
	
	result += directionalLight(lightDir, viewDir, normal, diffuseFactor, specularFactor, ambientFactor,
		surfaceColor, vec3(1., 1., 1.));
	
	// fog
	float f = 1. - 1. / (1. + pow(length(worldPos - cameraPos) * 0.1, 1.5));
	result = lerp(result, fogColor, f);
	
	gl_FragColor = vec4(result, 1.);
	
	if(rand(worldNormal) > 0.3){
		discard;
	}
}
vec3 directionalLight(vec3 lightDir, vec3 viewDir, vec3 normal, float diffuseFactor, float specularFactor, float ambientFactor,
		vec3 surfaceColor, vec3 lightColor){
	// lightDir, viewDir and normal is of unit length. normal is the orientation of the plane.
	
	// diffuse shading
	float diff = max(dot(normal, -lightDir), 0.0);
	// specular shading
	vec3 reflectDir = reflect(lightDir, normal); // reflect(I, N) = I - 2.0 * dot(N, I) * N
	float spec = pow(max(dot(reflectDir, -viewDir), 0.0), 16.);
	
	// combine
	vec3 diffuse  = diffuseFactor * diff * surfaceColor * lightColor;
	vec3 specular  = specularFactor * spec * (surfaceColor.x + surfaceColor.y + surfaceColor.z + 1.) / 4. * lightColor;
	vec3 ambient = ambientFactor * surfaceColor * lightColor;
	
	vec3 result = diffuse + specular + ambient;
	return result;
}
float modulo(float a, float b){
	return a - (b * floor(a/b));
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
float noise(vec2 p, float freq ){
	float unit = 1536./freq;
	vec2 ij = floor(p/unit);
	vec2 xy = mod(p,unit)/unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
	xy = .5*(1.-cos(3.14159265358979323846*xy));
	float a = rand((ij+vec2(0.,0.)));
	float b = rand((ij+vec2(1.,0.)));
	float c = rand((ij+vec2(0.,1.)));
	float d = rand((ij+vec2(1.,1.)));
	float x1 = mix(a, b, xy.x);
	float x2 = mix(c, d, xy.x);
	return mix(x1, x2, xy.y);
}
float pNoise(vec2 p, int res){
	float persistance = .5;
	float n = 0.;
	float normK = 0.;
	float f = 4.;
	float amp = 1.;
	int iCount = 0;
	for (int i = 0; i<50; i++){
		n+=amp*noise(p, f);
		f*=2.;
		normK+=amp;
		amp*=persistance;
		if (iCount == res) break;
		iCount++;
	}
	float nf = n/normK;
	return nf*nf*nf*nf;
}
vec3 lerp(vec3 vA, vec3 vB, float f){
	return vA + (vB - vA) * f;
}

















`