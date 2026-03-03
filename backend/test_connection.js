const { neon } = require('@neondatabase/serverless');

async function test(url) {
    try {
        const sql = neon(url);
        const res = await sql`SELECT 1 as val`;
        console.log('SUCCESS:', url, res[0].val);
    } catch (e) {
        console.log('FAIL:', url, e.message);
    }
}

const url1 = 'postgresql://neondb_owner:npg_t9hNGxS8PHdn@ep-square-forest-a18pg9j8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const url2 = 'postgresql://neondb_owner:npg_t9hNGxS8PHdn@ep-square-forest-a18pg9j8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

test(url1).then(() => test(url2));
