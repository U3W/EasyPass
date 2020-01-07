import * as wasm from './wasm_bg.wasm';

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}
function __wbg_elem_binding0(arg0, arg1, arg2) {
    wasm.__wbg_function_table.get(62)(arg0, arg1, addHeapObject(arg2));
}
function __wbg_elem_binding1(arg0, arg1, arg2, arg3) {
    wasm.__wbg_function_table.get(81)(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function passStringToWasm(arg) {

    let len = arg.length;
    let ptr = wasm.__wbindgen_malloc(len);

    const mem = getUint8Memory();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = wasm.__wbindgen_realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

function handleError(e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
}
/**
*/
export class Worker {

    static __wrap(ptr) {
        const obj = Object.create(Worker.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_worker_free(ptr);
    }
    /**
    * @returns {Worker}
    */
    constructor() {
        const ret = wasm.worker_new();
        return Worker.__wrap(ret);
    }
    /**
    * @param {string} db
    * @param {any} data
    * @returns {any}
    */
    save(db, data) {
        const ret = wasm.worker_save(this.ptr, passStringToWasm(db), WASM_VECTOR_LEN, addHeapObject(data));
        return takeObject(ret);
    }
    /**
    * @param {string} db
    * @param {any} data
    * @returns {any}
    */
    find(db, data) {
        const ret = wasm.worker_find(this.ptr, passStringToWasm(db), WASM_VECTOR_LEN, addHeapObject(data));
        return takeObject(ret);
    }
    /**
    * @param {string} command
    * @returns {any}
    */
    process(command) {
        const ret = wasm.worker_process(this.ptr, passStringToWasm(command), WASM_VECTOR_LEN);
        return takeObject(ret);
    }
}

export const __wbg_new_ffe7476389b1ed72 = function(arg0, arg1, arg2) {
    const ret = new PouchDB(getStringFromWasm(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
};

export const __wbg_adapter_c0acaec9722554ed = function(arg0, arg1) {
    const ret = getObject(arg1).adapter;
    const ret0 = passStringToWasm(ret);
    const ret1 = WASM_VECTOR_LEN;
    getInt32Memory()[arg0 / 4 + 0] = ret0;
    getInt32Memory()[arg0 / 4 + 1] = ret1;
};

export const __wbg_info_57305a7401345d82 = function(arg0) {
    const ret = getObject(arg0).info();
    return addHeapObject(ret);
};

export const __wbg_post_7212116226020da7 = function(arg0, arg1) {
    const ret = getObject(arg0).post(getObject(arg1));
    return addHeapObject(ret);
};

export const __wbg_find_84e9a176a27c113f = function(arg0, arg1) {
    const ret = getObject(arg0).find(getObject(arg1));
    return addHeapObject(ret);
};

export const __wbindgen_json_parse = function(arg0, arg1) {
    const ret = JSON.parse(getStringFromWasm(arg0, arg1));
    return addHeapObject(ret);
};

export const __wbindgen_json_serialize = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = JSON.stringify(obj === undefined ? null : obj);
    const ret0 = passStringToWasm(ret);
    const ret1 = WASM_VECTOR_LEN;
    getInt32Memory()[arg0 / 4 + 0] = ret0;
    getInt32Memory()[arg0 / 4 + 1] = ret1;
};

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbg_new_59cb74e423758ede = function() {
    const ret = new Error();
    return addHeapObject(ret);
};

export const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ret0 = passStringToWasm(ret);
    const ret1 = WASM_VECTOR_LEN;
    getInt32Memory()[arg0 / 4 + 0] = ret0;
    getInt32Memory()[arg0 / 4 + 1] = ret1;
};

export const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    const v0 = getStringFromWasm(arg0, arg1).slice();
    wasm.__wbindgen_free(arg0, arg1 * 1);
    console.error(v0);
};

export const __wbindgen_cb_drop = function(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export const __wbg_call_34f87007c5d2a397 = function(arg0, arg1, arg2) {
    try {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    } catch (e) {
        handleError(e)
    }
};

export const __wbg_new_5e8d465c199e6ff3 = function(arg0, arg1) {
    const state0 = {a: arg0, b: arg1};
    const cb0 = (arg0, arg1) => {
        const a = state0.a;
        state0.a = 0;
        try {
            return __wbg_elem_binding1(a, state0.b, arg0, arg1);
        } finally {
            state0.a = a;
        }
    };
    try {
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export const __wbg_resolve_04ca3cb0d333a4f0 = function(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export const __wbg_then_1fa2e92ee4bdbc93 = function(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export const __wbg_then_486e2e2b1fb1bbf4 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
};

export const __wbindgen_closure_wrapper188 = function(arg0, arg1, arg2) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (arg0) => {
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return __wbg_elem_binding0(a, state.b, arg0);
        } finally {
            if (--state.cnt === 0) wasm.__wbg_function_table.get(63)(a, state.b);
            else state.a = a;
        }
    }
    ;
    real.original = state;
    const ret = real;
    return addHeapObject(ret);
};

