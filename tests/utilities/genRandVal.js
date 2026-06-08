import randomstring from 'randomstring';
import randomItem from 'random-item';
import random from 'random';
import momentRandom from 'moment-random';
import ObjectID from 'bson-objectid';

const CONST_MIN = Number.MIN_SAFE_INTEGER;
const CONST_MAX = Number.MAX_SAFE_INTEGER;

const CONST_MIN_INT = Number(5);
const CONST_MAX_INT = Number(30);

class RandomVal {
  /**
   * @breif Generate a boolean value
   * @returns {Boolean}
   */
  GenRandomBoolean() {
    return random.boolean();
  }

  /**
   * @breif Generate a random valid Mongo Object ID
   */
  GenRandomValidID() {
    return ObjectID();
  }

  /**
   * @breif Generate a random integer from not above the maximum value
   * @param {Number} max -> Maximum integer to be generated
   * @returns {Number}
   */
  GenRandomInteger(max) {
    return random.integer(CONST_MIN, max);
  }

  /**
   *@breif Generate random integer in a range
   * @param {Number} min -> Minimum integer value
   * @param {Number} max -> Maximum integer value
   * @returns {Number}
   */
  GenRandomIntegerInRange(min, max) {
    return random.integer(min, max);
  }

  /**
   * @breif Generate a random valid string with alphabetic characters
   * @param {Number} len -> Maximum string lenght
   * @returns {String}
   */
  GenRandomValidString(len) {
    return randomstring.generate({
      length: len,
      charset: 'alphabetic',
      capitalization: 'lowercase',
    });
  }

  /**
   * @breif Generate random string in a range
   * @param {Number} min -> Minimum number of characters in string
   * @param {Number} max -> Maximum number of characters in string
   * @returns {String}
   */
  GenRandomValidStringInRange(min, max) {
    return randomstring.generate({
      length: this.GenRandomIntegerInRange(min, max),
      charset: 'alphabetic',
    });
  }

  /**
   * @breif Generate a random invalid string with alphanumeric characters
   * @param {Number} len -> Maximum string lenght
   * @returns {String}
   */
  GenRandomInValidString(len) {
    return randomstring.generate({
      length: len,
      charset: 'alphanumeric',
      capitalization: 'lowercase',
    });
  }

  /**
   * @breif Generate a random valid zip code
   * @param {Number} len Lenght of zip code
   * @returns {Number}
   */
  GenRandomValidZipCode(len) {
    return randomstring.generate({
      length: len,
      charset: 'numeric',
    });
  }

  /**
   * @breif Generate and random valid date string
   * @returns {String}
   */
  GenRandomValidDate() {
    return momentRandom();
  }

  /**
   * @breif Generate random date string from a beginning piont to and end point
   * @param {String} begin -> Begin point of date
   * @param {String} end -> End point of date
   * @returns {string}
   */
  GenRandomDateInRange(begin, end) {
    return momentRandom(begin, end);
  }

  /**
   * @breif Generate random valid text mixed with numbers and string
   * @param {Number} len -> Number of characters in text
   * @returns {String}
   */
  GenRandomValidText(len) {
    return randomstring.generate({
      length: len,
      charset: 'alphanumeric',
    });
  }

  /**
   * @breif Generate a random single item from an array
   * @param {Array} arr -> Array of items
   * @returns {Any}
   */
  GenRandomItem(arr) {
    return randomItem(arr);
  }

  /**
   * @breif Generate random number of items from a array
   * @param {Array} arr -> Array of items
   * @param {Number} len -> Number of items to be generated from array
   * @returns
   */
  GenRandomItems(arr, len) {
    return randomItem.multiple(arr, len);
  }

  /**
   * @breif Generate a random valid email
   * @returns {String}
   */
  GenRandomValidEmail() {
    const exts = ['.org', '.com', '.net']; // email extensions
    const types = ['@gmail', '@yahoo', '@hotmail', '@outlooks']; // email types
    const ext = this.GenRandomItem(exts);
    const type = this.GenRandomItem(types);
    const str = this.GenRandomValidString(
      this.GenRandomIntegerInRange(CONST_MIN_INT, CONST_MAX_INT)
    );
    return str.concat(type, ext);
  }

  /**
   * @breif Generate random invalid email
   * @returns {String}
   */
  GenRandomInValidEmail() {
    const str = this.GenRandomValidString(this.GenRandomInteger(CONST_MAX_INT));
    if (this.GenRandomBoolean()) {
      const types = ['@gmail', '@yahoo', '@hotmail'];
      const type = this.GenRandomItem(types);
      str.concat(type);
    } else {
      const exts = ['.org', '.com', '.net'];
      const ext = this.GenRandomItem(exts);
      str.concat(ext);
    }
    return str;
  }

  /**
   * @breif Generate a random valid telephone number,
   * NB: contact length is 9 to be valid
   * @returns {String}
   */
  GenRandomValidTelephone() {
    return randomstring.generate({
      length: 9,
      charset: 'numeric',
    });
  }

  /**
   * @breif Generate a random invalid telephone number
   * @returns {String}
   */
  GenRandomInValidTelephone() {
    const len = random.generate(CONST_MIN_INT, CONST_MAX_INT);
    const str = randomstring.generate({
      length: len,
      charset: 'numeric',
    });
    return str;
  }

  /**
   * @breif Generate random valid photo string
   * @returns {String}
   */
  GenRandomValidPhoto() {
    const extensions = ['.png', '.jpeg', '.jpg', '.gif']; // image extension
    const ext = this.GenRandomItem(extensions);
    const str = this.GenRandomValidStringInRange(CONST_MIN_INT, CONST_MAX_INT);
    return str.concat(ext);
  }
}

const GenRandomVal = new RandomVal();

export default GenRandomVal;
