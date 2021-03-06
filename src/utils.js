"use strict";

export const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks if a value is undefined.
 * @param  {Any}  value
 * @return {Boolean}
 */
function _isUndefined(value) {
  return typeof value === "undefined";
}

/**
 * Sorts records in a list according to a given ordering.
 *
 * @param  {String} order The ordering, eg. `-last_modified`.
 * @param  {Array}  list  The collection to order.
 * @return {Array}
 */
export function sortObjects(order, list) {
  const hasDash = order[0] === "-";
  const field = hasDash ? order.slice(1) : order;
  const direction = hasDash ? -1 : 1;
  return list.slice().sort((a, b) => {
    if (a[field] && _isUndefined(b[field])) {
      return direction;
    }
    if (b[field] && _isUndefined(a[field])) {
      return -direction;
    }
    if (_isUndefined(a[field]) && _isUndefined(b[field])) {
      return 0;
    }
    return a[field] > b[field] ? direction : -direction;
  });
}

/**
 * Filters records in a list matching all given filters.
 *
 * @param  {String} filters  The filters object.
 * @param  {Array}  list     The collection to filter.
 * @return {Array}
 */
export function filterObjects(filters, list) {
  return list.filter(entry => {
    return Object.keys(filters).every(filter => {
      const value = filters[filter];
      if (Array.isArray(value)) {
        return value.some(candidate => candidate === entry[filter]);
      }
      return entry[filter] === value;
    });
  });
}

/**
 * Filter and sort list against provided filters and order.
 *
 * @param  {Object} filters  The filters to apply.
 * @param  {String} order    The order to apply.
 * @param  {Array}  list     The list to reduce.
 * @return {Array}
 */
export function reduceRecords(filters, order, list) {
  const filtered = filters ? filterObjects(filters, list) : list;
  return order ? sortObjects(order, filtered) : filtered;
}

/**
 * Checks if a string is an UUID.
 *
 * @param  {String} uuid The uuid to validate.
 * @return {Boolean}
 */
export function isUUID(uuid) {
  return RE_UUID.test(uuid);
}

/**
 * Resolves a list of functions sequentially, which can be sync or async; in
 * case of async, functions must return a promise.
 *
 * @param  {Array} fns  The list of functions.
 * @param  {Any}   init The initial value.
 * @return {Promise}
 */
export function waterfall(fns, init) {
  if (!fns.length) {
    return Promise.resolve(init);
  }
  return fns.reduce((promise, nextFn) => {
    return promise.then(nextFn);
  }, Promise.resolve(init));
}

/**
 * Ensure a callback is always executed at the end of the passed promise flow.
 *
 * @link   https://github.com/domenic/promises-unwrapping/issues/18
 * @param  {Promise}  promise  The promise.
 * @param  {Function} fn       The callback.
 * @return {Promise}
 */
export function pFinally(promise, fn) {
  return promise.then(
    value => Promise.resolve(fn()).then(() => value),
    reason => Promise.resolve(fn()).then(() => { throw reason; })
  );
}

/**
 * Simple deep object comparison function. This only supports comparison of
 * serializable JavaScript objects.
 *
 * @param  {Object} a The source object.
 * @param  {Object} b The compared object.
 * @return {Boolean}
 */
export function deepEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (typeof(a) !== typeof(b)) {
    return false;
  }
  if (!(a instanceof Object) || !(b instanceof Object)) {
    return false;
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for(let k in a) {
    if (!deepEqual(a[k], b[k])) {
      return false;
    }
  }
  return true;
}
