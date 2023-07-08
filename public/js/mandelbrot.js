const HEIGHT_CANVAS = 800
const WIDTH_CANVAS = 1200
const INIT_ITERATION_NUMBER = 1
const INIT_MIN = { x: -2.1, y: -1.1 }
const INIT_MAX = { x: 1.1, y: 1.1 }

let zoomF = 0.5;
let translationF = 0.1;
let min;
let max;
let canvas, GLSLCanvas;
let context;
let iterationNumber;

/*
TODOS
- use the canvas size instead of redefining HEIGHT_CANVAS and WIDTH_CANVAS
- unzoom
- find a way to have beautiful colors
*/


function getShaderCode() {
    return `#ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 u_resolution;
    uniform vec2 u_x;
    uniform vec2 u_y;
    uniform float u_max_iter;

    float x_coords(float x) {
        return(u_x[0] + (u_x[1] - u_x[0]) * x);
    }
    float y_coords(float y) {
        return(u_y[0] + (u_y[1] - u_y[0]) * y);
    }

    vec2 multiply_complex(vec2 z1, vec2 z2) {
        return vec2(
            z1[0] * z2[0] - z1[1] * z2[1],
            z1[0] * z2[1] + z1[1] * z2[0]
        );
    }
    
    vec2 add_complex(vec2 z1, vec2 z2) {
        return vec2(
            z1[0] + z2[0],
            z1[1] + z2[1]
        );
    }

    bool diverged(vec2 z) {
        return ((z[0] * z[0] + z[1] * z[1]) > 2.0);
    }

    vec2 z_from_pixel_coords(vec2 coords) {
        return(vec2(
            x_coords(coords[0]),
            y_coords(coords[1])
        ));
    }

    vec4 choose_color(float n) {
        return vec4(n / 255.0, n / 255.0, n / 255.0, 1.0);
    }

    void main() {
        vec2 c = z_from_pixel_coords(gl_FragCoord.xy/u_resolution.xy);
        vec2 z = vec2(.0,.0);
        
        for(float i = 0.0; i <= 10000.0; i += 1.0){
            z = add_complex(multiply_complex(z, z), c);
            if (diverged(z)) {
                gl_FragColor = choose_color(i);
                return;
            }
        }
        gl_FragColor = vec4(c[0],c[1],.0,1.0);
    }`;
}

document.addEventListener("DOMContentLoaded", () => {
    initGLSLCanvas();

    mandelbrotCanvas = document.querySelector("#mandelbrot-canvas");
    mandelbrotCanvas.addEventListener("click", zoomOnClick);

    document.addEventListener("mousemove", onMouseMove);
    document.querySelector("#reset").addEventListener("click", initialize);
    // document.querySelector("#increase-iteration-1").addEventListener("click", makeIncreaseIterationsBy(1));
    // document.querySelector("#increase-iteration-10").addEventListener("click", makeIncreaseIterationsBy(10));
    // document.querySelector("#increase-iteration-50").addEventListener("click", makeIncreaseIterationsBy(50));
    // document.querySelector("#increase-iteration-250").addEventListener("click", makeIncreaseIterationsBy(250));
    document.addEventListener("keydown", translateOnArrowPresses);
    initialize();
})

function initGLSLCanvas() {
    const newCanvas = document.createElement("canvas");
    newCanvas.height = HEIGHT_CANVAS;
    newCanvas.width = WIDTH_CANVAS;
    newCanvas.id = "mandelbrot-canvas";
    GLSLCanvas = new GlslCanvas(newCanvas);
    GLSLCanvas.load(getShaderCode());
    GLSLCanvas.height = HEIGHT_CANVAS;
    GLSLCanvas.width = WIDTH_CANVAS;

    const centralColumn = document.querySelector(".central-column");
    centralColumn.insertBefore(newCanvas, centralColumn.firstChild);
}

function sendUniforms() {
    GLSLCanvas.setUniform("u_x", min.x, max.x);
    GLSLCanvas.setUniform("u_y", min.y, max.y);
    GLSLCanvas.setUniform("u_max_iter", iterationNumber);
}

function translateOnArrowPresses(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        switch (e.key) {
            case "ArrowUp":
                min.y -= translationF * displayedHeight();
                max.y -= translationF * displayedHeight();
                break;
            case "ArrowDown":
                min.y += translationF * displayedHeight();
                max.y += translationF * displayedHeight();
                break;
            case "ArrowLeft":
                min.x -= translationF * displayedHeight();
                max.x -= translationF * displayedHeight();
                break;
            case "ArrowRight":
                min.x += translationF * displayedHeight();
                max.x += translationF * displayedHeight();
                break;
        }
        sendUniforms();
    }
}

function makeIncreaseIterationsBy(n) {
    return function () {
        iterationNumber += n;
        sendUniforms();
    }
}

function initialize() {
    min = { ...INIT_MIN };
    max = { ...INIT_MAX };
    iterationNumber = INIT_ITERATION_NUMBER;
    sendUniforms();
}

function onMouseMove(e) {
    const mouseInfo = document.querySelector(".mouse-info");
    mouseInfo.replaceChildren();

    displayCoords(mouseInfo, "Layer", { x: e.layerX, y: e.layerY });
    displayCoords(mouseInfo, "Screen", { x: e.screenX, y: e.screenY });
    displayCoords(mouseInfo, "Offset", { x: e.offsetX, y: e.offsetY });
    displayCoords(mouseInfo, "Page", { x: e.pageX, y: e.pageY });

    const clicked = {
        x: mathsCoord(min.x, max.x, e.offsetX, WIDTH_CANVAS),
        y: mathsCoord(min.y, max.y, e.offsetY, HEIGHT_CANVAS)
    }
    const proportion = {
        x: ((clicked.x - min.x) / displayedWidth()).toFixed(5),
        y: ((clicked.y - min.y) / displayedHeight()).toFixed(5),
    }
    displayCoords(mouseInfo, "Mandelbrot space", { x: clicked.x.toFixed(5), y: clicked.x.toFixed(5) });
    displayCoords(mouseInfo, "Proportion", proportion);
    displayNumberIterations(mouseInfo);
}

function newDomElement(tag, content, classes) {
    const elem = document.createElement(tag);
    const node = document.createTextNode(content);
    elem.appendChild(node);
    if (classes) {
        elem.classList = classes;
    }
    return elem;
}

function displayCoords(domElem, title, coords) {
    const container = newDomElement("div", "");
    container.appendChild(newDomElement("div", title, "title-coords"));
    const coordsContainer = newDomElement("div", "", "coords");
    coordsContainer.appendChild(newDomElement("div", `x: ${coords.x}, y: ${coords.y}`));
    container.appendChild(coordsContainer);

    domElem.appendChild(container);
}

function displayNumberIterations(domElem) {
    domElem.appendChild(newDomElement("div", `Number of iterations = ${iterationNumber}`));
}

function displayedWidth() {
    return (max.x - min.x);
}

function displayedHeight() {
    return (max.y - min.y);
}

function mathsCoord(min, max, n, nPixel) {
    return min + (((max - min) / nPixel) * n);
}

function zoomOnClick(e) {
    const newWidth = displayedWidth() * zoomF;
    const newHeight = displayedHeight() * zoomF;

    const clicked = {
        x: mathsCoord(min.x, max.x, e.offsetX, WIDTH_CANVAS),
        y: mathsCoord(min.y, max.y, e.offsetY, HEIGHT_CANVAS)
    }
    const proportion = {
        x: (clicked.x - min.x) / displayedWidth(),
        y: (clicked.y - min.y) / displayedHeight(),
    }

    min = {
        x: clicked.x - (proportion.x * newWidth),
        y: clicked.y - (proportion.y * newHeight)
    }
    max = {
        x: clicked.x + ((1 - proportion.x) * newWidth),
        y: clicked.y + ((1 - proportion.y) * newHeight)
    }
    sendUniforms();
}
