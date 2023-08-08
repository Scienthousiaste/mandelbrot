import { complexNumber, multiplyComplex, addComplex, isDiverging } from "./complex_numbers.js"

function mathsCoord(min, max, n, nPixel) {
    return min + (((max - min) / nPixel) * n);
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
            const c = complexNumber(
                mathsCoord(min.x, max.x, x, WIDTH_CANVAS),
                mathsCoord(min.y, max.y, y, HEIGHT_CANVAS)
            )

            let z = c;

            for (let i = 0; i < iterationNumber; i++) {
                z = addComplex(multiplyComplex(z, z), c);
                if (isDiverging(z)) {
                    putPixel(x, y, chooseColor(i));
                    break;
                }

                if (i === iterationNumber - 1) {
                    putPixel(x, y, [1, 1, 1])
                }
            }
        }
    }
}
