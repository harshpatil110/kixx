const fs = require('fs');
const https = require('https');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                return download(response.headers.location, dest).then(resolve).catch(reject);
            }

            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function main() {
    await download('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc4OWY2NmZlODUzMTRlOTJiMDRhODBjMmRiNDkxODAwEgsSBxDY8ZuO6QwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDA5MzkyOTgzNjg3NjIzNTk4Mw&filename=&opi=89354086', 'c:\\Users\\harsh\\Desktop\\Coding\\project\\kixx\\frontend\\public\\stitch-assets\\catalog.html');
    await download('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzU1OTcyNDJlYjhjNzQzZjVhNjhmMDg1MWQ0NTg5NzQ0EgsSBxDY8ZuO6QwYAZIBJAoKcHJvamVjdF9pZBIWQhQxNDA5MzkyOTgzNjg3NjIzNTk4Mw&filename=&opi=89354086', 'c:\\Users\\harsh\\Desktop\\Coding\\project\\kixx\\frontend\\public\\stitch-assets\\cart.html');
    console.log('done');
}
main();
