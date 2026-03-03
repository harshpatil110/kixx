const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_t9hNGxS8PHdn@ep-square-forest-a18pg9j8-pooler.ap-southeast-1.aws.neon.tech/neondb');

sql`SELECT 1`.catch(e => {
    console.log('Outer:', e.message);
    if (e.cause) console.log('Cause:', e.cause);
    if (e.cause && e.cause.cause) console.log('Inner Cause:', e.cause.cause);
});
