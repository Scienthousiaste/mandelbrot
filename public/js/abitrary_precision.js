// number of int values in an array representing a single number
const VALS_IN_NUMBER = 20;
// the threshold to which a single value must be cut is 10 ^ VAL_SIZE
const VAL_SIZE = 4;
// index of where the comma is
const COMMA_POSITION = 1;

// DIVISION : https://stackoverflow.com/questions/56211354/arbitrary-precision-integer-division-how-to-deal-with-32-bit-remainders

function multiplyArbComplex(z1, z2) {
    return {
        re: arbAdd(arbMul(z1.re, z2.re), arbNegate(arbMul(z1.im, z2.im))),
        im: arbAdd(arbMul(z1.re, z2.im), arbMul(z1.im, z2.re))
    };
}

function addArbComplex(z1, z2) {
    return {
        re: arbAdd(z1.re, z2.re),
        im: arbAdd(z1.im, z2.im)
    };
}

function arbComplexNorm(z) {
    return arbAdd(arbMul(z.re, z.re), arbMul(z.im, z.im));
}

export function testArbNumber() {
    const a = 4215921441;
    const b = 7385193221;

    const arb_a = arbNumber(a);
    const arb_b = arbNumber(b);
    
    console.assert(
        toNumber(arbAdd(arb_a, arb_b)) == a + b
    );

    if (VAL_SIZE == 4 && VALS_IN_NUMBER == 8 && COMMA_POSITION >= 8) {
        const arb_c = [2411, 3871, 3613, 3886, 9001, 0, 29, 421];
        const arb_d = [99, 1, 9211, 0, 4124, 9919, 252, 1539];
        
        console.log("test addition");
        console.assert(
            areArbEqual(arbAdd(arb_c, arb_d), [2510, 3873, 2824, 3887, 3125, 9919, 281, 1960])
        )
    }

}

export function areArbEqual(a, b) {
    for (let i = 0; i < VALS_IN_NUMBER; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

export function toNumber(arbNumber) {
    let result = 0;

    for (let i = 0; i < VALS_IN_NUMBER; i++) {
        if (arbNumber[i] != 0) {
            result += arbNumber[i] * Math.pow(Math.pow(10, VAL_SIZE), COMMA_POSITION - i - 1);
        }
    }
    return result;
}

export function arbNumber(number) {
    const res = arbNumberZero();

    let intPart = Math.floor(number);
    let decimalPart = number - intPart;
    let p = Math.pow(10, VAL_SIZE);

    // The integer part
    for (let i = COMMA_POSITION - 1; i >= 0 ; i--) {
        res[i] = intPart % p;
        intPart = Math.floor(intPart / p);
    }

    // The decimal part
    for (let i = COMMA_POSITION; i < VALS_IN_NUMBER ; i++) {
        decimalPart = decimalPart * p;
        res[i] = Math.floor(decimalPart);
        decimalPart = decimalPart - res[i];
    }

    return res;
}

export function arbNumberZero() {
    return Array(VALS_IN_NUMBER).fill(0);
}

export function arbAdd(n1, n2) {
    let answer = arbNumberZero();

    for (let i = VALS_IN_NUMBER - 1; i >= 0; i--) {
        let res = n1[i] + n2[i];

        if (res > Math.pow(10, VAL_SIZE)) {
            answer[i] += (res % Math.pow(10, VAL_SIZE));
            answer[i - 1] = (res - (res % Math.pow(10, VAL_SIZE))) / Math.pow(10, VAL_SIZE);
        }
        else {
            answer[i] += res;
        }
    }
    return answer;
}


function arbMul(n1, n2) {
    for (let i = 0; i < VALS_IN_NUMBER; i++) {

    }
}

function arbNegate(number) {
    return number;
}

function mathsArbCoord(min, max, n, nPixel) {
    return min + (((max - min) / nPixel) * n);
}

function arbComplexNumber(re, im) {
    return {
        re: re,
        im: im
    };
}
