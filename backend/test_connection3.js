const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // Custom lookup using dns.resolve4 which respects dns.setServers
    dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
            // Fallback to original lookup
            return originalLookup(hostname, options, callback);
        }
        // Return first address (IPv4)
        if (options.all) {
            return callback(null, addresses.map(a => ({ address: a, family: 4 })));
        }
        callback(null, addresses[0], 4);
    });
};

const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_t9hNGxS8PHdn@ep-square-forest-a18pg9j8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

sql`SELECT 1 as val`
    .then(res => console.log('✅ Connection Success!', res))
    .catch(e => console.error('❌ Connection Failed!', e));
