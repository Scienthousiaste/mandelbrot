const HEIGHT_CANVAS = 800
const WIDTH_CANVAS = 1200
const MAX_ITERATION = 255

let min = {x: -2.1, y: -1.1}
let max = {x: 1.1, y: 1.1}

let zoomF = 0.5;
let canvas;
let context;

/*
TODOS
- use shader to compute the pixel color
- UI: reset button, directional moves, add max_iter, unzoom
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

    const clicked = {
        x: mathsCoord(min.x, max.x, e.offsetX, WIDTH_CANVAS),
        y: mathsCoord(min.y, max.y, e.offsetY, HEIGHT_CANVAS)
    }
    const proportion = {
        x: ((clicked.x - min.x) / (max.x - min.x)).toFixed(5),
        y: ((clicked.y - min.y) / (max.y - min.y)).toFixed(5),
    }
    displayCoords(mouseInfo, "Mandelbrot space", {x: clicked.x.toFixed(5), y: clicked.x.toFixed(5)});
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
    const newWidth = (max.x - min.x) * zoomF;
    const newHeight = (max.y - min.y) * zoomF;

    const clicked = {
        x: mathsCoord(min.x, max.x, e.offsetX, WIDTH_CANVAS),
        y: mathsCoord(min.y, max.y, e.offsetY, HEIGHT_CANVAS)
    }
    const proportion = {
        x: (clicked.x - min.x) / (max.x - min.x),
        y: (clicked.y - min.y) / (max.y - min.y),
    }

    min = {
        x: clicked.x - (proportion.x * newWidth),
        y: clicked.y - (proportion.y * newHeight)
    }
    max = {
        x: clicked.x + ((1 - proportion.x) * newWidth),
        y: clicked.y + ((1 - proportion.y) * newHeight)
    }
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
                re: mathsCoord(min.x, max.x, x, WIDTH_CANVAS),
                im: mathsCoord(min.y, max.y, y, HEIGHT_CANVAS)
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
