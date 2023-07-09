const HEIGHT_CANVAS = 800
const WIDTH_CANVAS = 1200
const INIT_MIN = { x: -2.1, y: -1.1 }
const INIT_MAX = { x: 1.1, y: 1.1 }

let zoomF = 0.975;
let translationF = 0.1;
let min;
let max;
let canvas, GLSLCanvas;
let context;

/*
TODOS
- find a way to use arbitrary precision, or at least double https://github.com/alexozer/glsl-arb-prec
- unzoom, continuous translations, show FPS
- make it beautiful
- is there a way to change maxIterations dynamically?
*/

async function getShaderCode() {
    const response = await fetch('../assets/mandelbrot.frag');
    return await response.text();
}

document.addEventListener("DOMContentLoaded", async () => {
    await initGLSLCanvas();
    mandelbrotCanvas = document.querySelector("#mandelbrot-canvas");
    mandelbrotCanvas.addEventListener("mousedown", continuousZoomOnMouseDown);
    mandelbrotCanvas.addEventListener("mouseup", stopContinuousZoomOnMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    document.querySelector("#reset").addEventListener("click", initialize);
    document.addEventListener("keydown", translateOnArrowPresses);
    initialize();
})

async function initGLSLCanvas() {
    const newCanvas = document.createElement("canvas");
    newCanvas.height = HEIGHT_CANVAS;
    newCanvas.width = WIDTH_CANVAS;
    newCanvas.id = "mandelbrot-canvas";
    GLSLCanvas = new GlslCanvas(newCanvas);
    GLSLCanvas.load(await getShaderCode());
    GLSLCanvas.height = HEIGHT_CANVAS;
    GLSLCanvas.width = WIDTH_CANVAS;

    const centralColumn = document.querySelector(".central-column");
    centralColumn.insertBefore(newCanvas, centralColumn.firstChild);
}

function sendUniforms() {
    GLSLCanvas.setUniform("u_x", min.x, max.x);
    GLSLCanvas.setUniform("u_y", min.y, max.y);
}

function translateOnArrowPresses(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        switch (e.key) {
            case "ArrowDown":
                min.y -= translationF * displayedHeight();
                max.y -= translationF * displayedHeight();
                break;
            case "ArrowUp":
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


function displayedWidth() {
    return (max.x - min.x);
}

function displayedHeight() {
    return (max.y - min.y);
}

function mathsCoord(min, max, n, nPixel) {
    return min + (((max - min) / nPixel) * n);
}


let lastEventTimestamp;
let continuousZoomInterval;
function stopContinuousZoomOnMouseUp(e) {
    if (continuousZoomInterval) {
        window.clearInterval(continuousZoomInterval);
        continuousZoomInterval = undefined;
    }
}

function continuousZoomOnMouseDown(e) {
    const now = Date.now();
    continuousZoomInterval = window.setInterval(zoomOnClick.bind({x: e.offsetX, y: e.offsetY}), 50);
}

function zoomOnClick() {
    const newWidth = displayedWidth() * zoomF;
    const newHeight = displayedHeight() * zoomF;

    const clicked = {
        x: mathsCoord(min.x, max.x, this.x, WIDTH_CANVAS),
        y: mathsCoord(min.y, max.y, HEIGHT_CANVAS - this.y, HEIGHT_CANVAS)
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
