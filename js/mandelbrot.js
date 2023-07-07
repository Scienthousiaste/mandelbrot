const HEIGHT_CANVAS = 800
const WIDTH_CANVAS = 1200
const MAX_ITERATION = 255

let minX = -2.1;
let minY = -1.1;
let maxX = 1.1;
let maxY = 1.1;

let zoomF = 0.5;
let canvas;
let context;

/*
TODOS
- better code
- use shader to compute the pixel color
- find a way to have beautiful colors
*/

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("#mandelbrot");
    context = canvas.getContext("2d");

    canvas.addEventListener("click", zoomOnClick);
    document.addEventListener("mousemove", onMouseMove);
    displayMandelbrot();
})

function onMouseMove(e) {
    /*
     e.clientX, e.clientY; // same as e.x, e.y - The X coordinate of the mouse pointer in local (DOM content) coordinates.
    layerX - Returns the horizontal coordinate of the event relative to the current layer. !!!non standard!!!
    screenX - The X coordinate of the mouse pointer in global (screen) coordinates.
    offsetX - The X coordinate of the mouse pointer relative to the position of the padding edge of the target node.
    movementX - The X coordinate of the mouse pointer relative to the position of the last mousemove event.
    pageX - The X coordinate of the mouse pointer relative to the whole document.
     */

    const mouseInfo = document.querySelector(".mouse-info");
    mouseInfo.replaceChildren();

    displayCoords(mouseInfo, "Layer", {x: e.layerX, y: e.layerY});
    displayCoords(mouseInfo, "Screen", {x: e.screenX, y: e.screenY});
    displayCoords(mouseInfo, "Offset", {x: e.offsetX, y: e.offsetY});
    displayCoords(mouseInfo, "Page", {x: e.pageX, y: e.pageY});


    const xClicked = mathsCoord(minX, maxX, e.offsetX, WIDTH_CANVAS);
    const yClicked = mathsCoord(minY, maxY, e.offsetY, HEIGHT_CANVAS);
    const proportion = {
        x: ((xClicked - minX) / (maxX - minX)).toFixed(5),
        y: ((yClicked - minY) / (maxY - minY)).toFixed(5),
    }
    displayCoords(mouseInfo, "Mandelbrot space", {x: xClicked.toFixed(5), y: yClicked.toFixed(5)});
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

function zoomOnClick(e) {
    const newWidth = (maxX - minX) * zoomF;
    const newHeight = (maxY - minY) * zoomF;

    const xClicked = mathsCoord(minX, maxX, e.offsetX, WIDTH_CANVAS);
    const yClicked = mathsCoord(minY, maxY, e.offsetY, HEIGHT_CANVAS);
    const proportion = {
        x: (xClicked - minX) / (maxX - minX),
        y: (yClicked - minY) / (maxY - minY),
    }

    minX = xClicked - (proportion.x * newWidth);
    maxX = xClicked + ((1 - proportion.x) * newWidth);
    minY = yClicked - (proportion.y * newHeight);
    maxY = yClicked + ((1 - proportion.y) * newHeight);
    displayMandelbrot();
}

function mathsCoord(min, max, n, nPixel) {
    return min + (((max - min) / nPixel) * n);
}

function isDiverging(z) {
    return norm(z) > 2;
}

function norm(z) {
    return (z.re * z.re + z.im * z.im);
}

function chooseColor(n) {
    return [255 - n, 255 - (n % 255), 255 - (n % 255)]
}

function putPixel(x, y, color) {
    context.fillStyle = `rgb(${color[0]},${color[1]}, ${color[2]})`;
    context.fillRect(x, y, 1, 1);
}

function displayMandelbrot() {
    for (let x = 0; x < WIDTH_CANVAS; x++) {
        for (let y = 0; y < HEIGHT_CANVAS; y++) {
            const c = {
                re: mathsCoord(minX, maxX, x, WIDTH_CANVAS),
                im: mathsCoord(minY, maxY, y, HEIGHT_CANVAS)
            }

            let z = c;

            for (let i = 0; i < MAX_ITERATION; i++) {
                z = addComplex(multiplyComplex(z, z), c);
                if (isDiverging(z)) {
                    putPixel(x, y, chooseColor(i));
                    break;
                }

                if (i === MAX_ITERATION - 1) {
                    putPixel(x, y, [1, 1, 1])
                }
            }
        }
    }
}

function complex(re, im) {
    return {
        re: re,
        im: im
    };
}

function multiplyComplex(z1, z2) {
    return {
        re: z1.re * z2.re - z1.im * z2.im,
        im: z1.re * z2.im + z1.im * z2.re
    };
}

function addComplex(z1, z2) {
    return {
        re: z1.re + z2.re,
        im: z1.im + z2.im
    };
}
