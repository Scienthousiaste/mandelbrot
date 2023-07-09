import { HEIGHT_CANVAS, WIDTH_CANVAS, INIT_MIN, INIT_MAX, ZOOM_SCALE, TRANSLATION_SCALE } from "./constants.js"
import { initGLSLCanvas } from "./GLSL.js";
import { displayCoords } from "./utils.js"

let min;
let max;
let GLSLCanvas;

/*
TODOS
- find a way to use arbitrary precision, or at least double precision https://github.com/alexozer/glsl-arb-prec
- unzoom, continuous translations, show FPS
- make it beautiful
- is there a way to change maxIterations dynamically?
*/

document.addEventListener("DOMContentLoaded", async () => {
    GLSLCanvas = await initGLSLCanvas();
    const mandelbrotCanvas = document.querySelector("#mandelbrot-canvas");
    mandelbrotCanvas.addEventListener("mousedown", continuousZoomOnMouseDown);
    document.addEventListener("mouseup", stopContinuousZoomOnMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    document.querySelector("#reset").addEventListener("click", initialize);
    document.addEventListener("keydown", translateOnArrowPresses);
    initialize();
})

function sendUniforms() {
    GLSLCanvas.setUniform("u_x", min.x, max.x);
    GLSLCanvas.setUniform("u_y", min.y, max.y);
}

function translateOnArrowPresses(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        switch (e.key) {
            case "ArrowDown":
                min.y -= TRANSLATION_SCALE * displayedHeight();
                max.y -= TRANSLATION_SCALE * displayedHeight();
                break;
            case "ArrowUp":
                min.y += TRANSLATION_SCALE * displayedHeight();
                max.y += TRANSLATION_SCALE * displayedHeight();
                break;
            case "ArrowLeft":
                min.x -= TRANSLATION_SCALE * displayedHeight();
                max.x -= TRANSLATION_SCALE * displayedHeight();
                break;
            case "ArrowRight":
                min.x += TRANSLATION_SCALE * displayedHeight();
                max.x += TRANSLATION_SCALE * displayedHeight();
                break;
        }
        sendUniforms();
    }
}

function initialize() {
    min = { ...INIT_MIN };
    max = { ...INIT_MAX };
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
        y: mathsCoord(min.y, max.y, HEIGHT_CANVAS - e.offsetY, HEIGHT_CANVAS)
    }
    const proportion = {
        x: ((clicked.x - min.x) / displayedWidth()).toFixed(5),
        y: ((clicked.y - min.y) / displayedHeight()).toFixed(5),
    }
    displayCoords(mouseInfo, "Mandelbrot space", { x: clicked.x.toFixed(5), y: clicked.x.toFixed(5) });
    displayCoords(mouseInfo, "Proportion", proportion);
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

let continuousZoomInterval;
function stopContinuousZoomOnMouseUp(e) {
    if (continuousZoomInterval) {
        window.clearInterval(continuousZoomInterval);
        continuousZoomInterval = undefined;
    }
}

function continuousZoomOnMouseDown(e) {
    const now = Date.now();
    continuousZoomInterval = window.setInterval(zoomOnClick.bind({
        clicked: {
            x: mathsCoord(min.x, max.x, e.offsetX, WIDTH_CANVAS),
            y: mathsCoord(min.y, max.y, HEIGHT_CANVAS - e.offsetY, HEIGHT_CANVAS)
        },
    }), 50);
}

function zoomOnClick() {
    const newWidth = displayedWidth() * ZOOM_SCALE;
    const newHeight = displayedHeight() * ZOOM_SCALE;

    const proportion = {
        x: (this.clicked.x - min.x) / displayedWidth(),
        y: (this.clicked.y - min.y) / displayedHeight(),
    }

    min = {
        x: this.clicked.x - (proportion.x * newWidth),
        y: this.clicked.y - (proportion.y * newHeight)
    }
    max = {
        x: this.clicked.x + ((1 - proportion.x) * newWidth),
        y: this.clicked.y + ((1 - proportion.y) * newHeight)
    }
    sendUniforms();
}
