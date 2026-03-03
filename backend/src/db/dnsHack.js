const dns = require('dns');

// If we are not on the primary Windows loopback and having trouble overriding, let's explicitly inject Google's reliable IPv4 namespace
dns.setServers(['8.8.8.8', '8.8.4.4']);

const originalLookup = dns.lookup;

// Monkey-patch Node's DNS lookups to use explicit resolve4 (which actually respects setServers) 
// instead of the OS's native getaddrinfo (which ignores setServers and caches aggressively on Windows).
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // Custom lookup strictly targeting A records (IPv4)
    dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
            // Fallback to original OS-level lookup if explicit DNS fails
            return originalLookup(hostname, options, callback);
        }

        // Format payload cleanly for raw Net sockets (what postgres.js relies on under the hood)
        if (options.all) {
            return callback(null, addresses.map(a => ({ address: a, family: 4 })));
        }

        callback(null, addresses[0], 4);
    });
};

module.exports = true;
