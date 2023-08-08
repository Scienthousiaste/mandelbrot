export function complexNumber(re, im) {
    return {
        re: re,
        im: im
    };
}

export function multiplyComplex(z1, z2) {
    return {
        re: z1.re * z2.re - z1.im * z2.im,
        im: z1.re * z2.im + z1.im * z2.re
    };
}

export function addComplex(z1, z2) {
    return {
        re: z1.re + z2.re,
        im: z1.im + z2.im
    };
}

export function isDiverging(z) {
    return norm(z) > 2;
}

export function norm(z) {
    return (z.re * z.re + z.im * z.im);
}