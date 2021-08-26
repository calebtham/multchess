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

/**
 * Convert seconds to minutes:seconds (mm:ss)
 * @param {number} seconds
 * @returns Formatted time string
 */
 function formatTimeFromSeconds(seconds) {
    let mm;
    let ss;
    let fraction = (seconds < 60) ? 2 : 0;

    mm = Math.floor(seconds / 60);
    ss = seconds - (mm * 60);
    
    mm = mm.toLocaleString('en-UK', {minimumIntegerDigits: 2, maximumFractionDigits: 0, useGrouping:false});
    ss = ss.toLocaleString('en-UK', {minimumIntegerDigits: 2, maximumFractionDigits: fraction, minimumFractionDigits: fraction, useGrouping:false});
    if (ss == "60") {
        ss = "59";
    }
    
    return mm + ":" + ss;
}

/**
 * Return whether the device is touchscreen
 * @returns True iff the device is touchscreen
 */
function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
  }
  