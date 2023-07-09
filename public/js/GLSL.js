import {HEIGHT_CANVAS, WIDTH_CANVAS} from "./constants.js"

async function getShaderCode() {
    const response = await fetch('../assets/mandelbrot.frag');
    return await response.text();
}

export async function initGLSLCanvas() {
    const newCanvas = document.createElement("canvas");
    newCanvas.height = HEIGHT_CANVAS;
    newCanvas.width = WIDTH_CANVAS;
    newCanvas.id = "mandelbrot-canvas";
    const GLSLCanvas = new GlslCanvas(newCanvas);
    GLSLCanvas.load(await getShaderCode());
    GLSLCanvas.height = HEIGHT_CANVAS;
    GLSLCanvas.width = WIDTH_CANVAS;

    const centralColumn = document.querySelector(".central-column");
    centralColumn.insertBefore(newCanvas, centralColumn.firstChild);
    return GLSLCanvas;
}