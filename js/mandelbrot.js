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

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.querySelector("#mandelbrot");
    context = canvas.getContext("2d");

    canvas.addEventListener("click", zoomOnClick);
    displayMandelbrot();
})

function zoomOnClick(e) {
    const newWidth = (maxX - minX) * zoomF;
    const newHeight = (maxY - minY) * zoomF;

    const xClicked = mathsCoord(minX, maxX, e.x, WIDTH_CANVAS);
    const yClicked = mathsCoord(minY, maxY, e.y, HEIGHT_CANVAS);

    console.log(`Clicked on (x: ${e.x}, y: ${e.y}), (${xClicked}, ${yClicked}), newWidth ${newWidth}, newHeight ${newHeight}`)
    minX = xClicked - (newWidth / 2);
    maxX = xClicked + (newWidth / 2);
    minY = yClicked - (newHeight / 2);
    maxY = yClicked + (newHeight / 2);
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
    // TODO: make it so that n is a proportion of 255
    return [255 - n, 255 - n, 255 - n]
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
