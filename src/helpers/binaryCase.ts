/**
 *  @license
 *    Copyright 2016 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

/**
 * Toggle the case of a string based on the number value passed in.
 * @param {string} str
 * @param {number} num
 * @param {object} [options={allowOverflow: true}]
 * @returns {string|boolean}
 */
export const binaryCase = (str: string, num: number, options?: {
  allowOverflow?: boolean;
  startIndex?: number;
}) => {
  if (!options || typeof options !== 'object') options = {}
  if (!options.hasOwnProperty('allowOverflow')) options.allowOverflow = true

  if (num > binaryCase.maxNumber(str) && !options.allowOverflow) return false

  return getBinaryCase(str, num)
}

binaryCase.iterator = (str: string, options?: {
  allowOverflow?: boolean;
  startIndex?: number;
}) => {
  const max = binaryCase.maxNumber(str)

  if (!options || typeof options !== 'object') options = {}
  if (!options.hasOwnProperty('startIndex')) options.startIndex = 0
  if (typeof options.startIndex !== 'number' || !Number.isInteger(options.startIndex) || options.startIndex < 0) throw Error('Option startIndex must be a non-negative integer.')

  let index = options.startIndex
  return {
    next: () => {
      return index > max
        ? { done: true }
        : { done: false, value: getBinaryCase(str, index++) }
    },
  }
}

/**
 * Get the maximum number that can be used before causing overflow.
 * @param {string} str
 * @returns {number}
 */
binaryCase.maxNumber = (str: string) => {
  const matcher = str.match(/[a-z]/ig)
  if (matcher) {
    const pow = matcher.length
    return Math.pow(2, pow) - 1
  } else {
    return -1
  }
}

/**
 * Get an array of all possible variations.
 * @param {string} str
 * @returns {string[]}
 */
binaryCase.variations = (str: string) => {
  const results = []
  const max = binaryCase.maxNumber(str)
  for (let i = 0; i <= max; i++) {
    results.push(binaryCase(str, i))
  }
  return results
}


const getBinaryCase = (str: string, num: number) => {
  // tslint:disable-next-line:no-bitwise
  const binary = (num >>> 0).toString(2)

  let bin
  let ch
  let i
  let j = binary.length - 1
  let offset
  let result = ''
  for (i = 0; i < str.length; i++) {
    ch = str.charAt(i)
    if (/[a-z]/ig.test(ch)) {
      bin = binary.charAt(j--)

      if (bin === '1') {
        offset = ch >= 'a' && ch <= 'z' ? -32 : 32
        result += String.fromCharCode(ch.charCodeAt(0) + offset)
      } else {
        result += ch
      }

      if (j < 0) {
        result += str.substr(i + 1)
        break
      }
    } else {
      result += ch
    }
  }
  return result
}
