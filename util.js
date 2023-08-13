/**
 * ================================================
 * Useful functions
 * @author Caleb Tham
 * ================================================
 */

/**
 * @param {number} length Length of the ID
 * @returns A random string of alphanumeric of the given length
 */
function makeid(length) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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
 * Removes a value from an array
 * @param {array} arr An array
 * @param {any} value The value to remove from the array
 * @returns The array with value removed
 */
function arrayRemoveItemOnce(arr, value) {
  let index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

/**
 * Given two numbers, returns the largest number
 * @param {number} a A number
 * @param {number} b Another number
 * @returns The largest number
 */
function max(a, b) {
  return a > b ? a : b;
}

/**
 * Given two numbers, returns the smallest number
 * @param {number} a A number
 * @param {number} b Another number
 * @returns The smallest number
 */
function min(a, b) {
  return a < b ? a : b;
}

module.exports = {
  makeid,
  arrayEqual,
  arrayRemoveItemOnce,
  max,
  min,
};
