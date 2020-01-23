/**
 * This small library contains functions, that are used by the Web Worker of the App.
 * To build the library use “npm run buildLib”.
 */


/**
 * Simple sleep function.
 */
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Checks if host is reachable.
 */
const isReachable = async (url) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchPromise = fetch(url, {signal});
    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    fetchPromise.then(() => {
        return true;
    }).catch(() => {
        return false;
    });
};

/**
 * Functions for setInterval with asynchronous functions.
 * Source: https://dev.to/jsmccrumb/asynchronous-setinterval-4j69
 */
const asyncIntervals = [];

const runAsyncInterval = async (cb, interval, intervalIndex) => {
    await cb();
    if (asyncIntervals[intervalIndex]) {
        setTimeout(() => runAsyncInterval(cb, interval, intervalIndex), interval);
    }
};

const setAsyncInterval = (cb, interval) => {
    if (cb && typeof cb === "function") {
        const intervalIndex = asyncIntervals.length;
        asyncIntervals.push(true);
        runAsyncInterval(cb, interval, intervalIndex);
        return intervalIndex;
    } else {
        throw new Error('Callback must be a function');
    }
};

const clearAsyncInterval = (intervalIndex) => {
    if (asyncIntervals[intervalIndex]) {
        asyncIntervals[intervalIndex] = false;
    }
};