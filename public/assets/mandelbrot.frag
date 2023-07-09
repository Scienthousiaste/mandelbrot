#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_x;
uniform vec2 u_y;
uniform float u_max_iter;

float x_coords(float x){
    return(u_x[0]+(u_x[1]-u_x[0])*x);
}
float y_coords(float y){
    return(u_y[0]+(u_y[1]-u_y[0])*y);
}

vec2 multiply_complex(vec2 z1,vec2 z2){
    return vec2(
        z1[0]*z2[0]-z1[1]*z2[1],
        z1[0]*z2[1]+z1[1]*z2[0]
    );
}

vec2 add_complex(vec2 z1,vec2 z2){
    return vec2(
        z1[0]+z2[0],
        z1[1]+z2[1]
    );
}

bool diverged(vec2 z){
    return((z[0]*z[0]+z[1]*z[1])>2.);
}

vec2 z_from_pixel_coords(vec2 coords){
    return(vec2(
        x_coords(coords[0]),
        y_coords(coords[1])
    ));
}

vec4 choose_color(float n){
    return vec4(
        (255.-mod(n,250.))/255.,
        (255.-mod(n,250.))/255.,
        (255.-mod(n,250.))/255.,
    1.);
}
    
void main(){
    vec2 c=z_from_pixel_coords(gl_FragCoord.xy/u_resolution.xy);
    vec2 z=vec2(.0,.0);
    
    for(float i=0.;i<=1000.;i+=1.){
        z=add_complex(multiply_complex(z,z),c);
        if(diverged(z)){
            gl_FragColor=choose_color(i);
            return;
        }
    }
    gl_FragColor=vec4(.0,.0,.0,1.);
}