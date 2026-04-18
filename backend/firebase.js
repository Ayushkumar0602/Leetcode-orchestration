/**
 * Firebase Config - Proxy to the Admin SDK Shim
 * 
 * We have migrated the backend away from the standard Client SDK to the Admin SDK
 * to allow it to bypass restrictive database security rules. 
 * This file proxies to the compatibility shim.
 */

const shim = require('./firebase-shim');

module.exports = shim;
