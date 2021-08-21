/**
 * Useful functions
 * @author Caleb Tham
 */

/**
 * Given two numeric arrays, returns whether the arrays contain the equal data at equal indices
 * @param {array} a An array
 * @param {array} b Another array
 * @returns True iff the two arrays have the equal data at all indices
 */
function arrayEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Given two numbers, returns the largest number
 * @param {number} a A number
 * @param {number} b Another number
 * @returns The largest number
 */
function max(a, b) {
    return (a > b) ? a : b;
}

/**
 * Given two numbers, returns the smallest number
 * @param {number} a A number
 * @param {number} b Another number
 * @returns The smallest number
 */
function min(a,b) {
    return (a < b) ? a : b;
}