export function handleConnection() {
    if (navigator.onLine) {
        isReachable("www.google.at").then(function(online) {
            if (online) {
                return true;
            } else {
                return false;
            }
        });
    } else {
        return false;
    }
}

function isReachable(url) {
    /**
     * Note: fetch() still "succeeds" for 404s on subdirectories,
     * which is ok when only testing for domain reachability.
     *
     * Example:
     *   https://google.com/noexist does not throw
     *   https://noexist.com/noexist does throw
     */
    return fetch(url, { method: 'HEAD', mode: 'no-cors' })
        .then(function(resp) {
            return resp && (resp.ok || resp.type === 'opaque');
        })
        .catch(function(err) {
            console.warn('[conn test failure]:', err);
        });
}
