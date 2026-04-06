import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { removeBackground } from '@imgly/background-removal-node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_DIR = path.join(__dirname, '../public/products');

async function processImages() {
    try {
        if (!fs.existsSync(PRODUCTS_DIR)) {
            console.error('Directory not found:', PRODUCTS_DIR);
            return;
        }

        const files = fs.readdirSync(PRODUCTS_DIR);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f) && !f.includes('-transparent'));

        console.log(`Found ${imageFiles.length} images to process in ${PRODUCTS_DIR}`);

        for (const file of imageFiles) {
            const inputPath = path.join(PRODUCTS_DIR, file);
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const outputFileName = `${baseName}-transparent.png`;
            const outputPath = path.join(PRODUCTS_DIR, outputFileName);
            
            // Skip if already processed
            if (fs.existsSync(outputPath)) {
                 console.log(`Skipping ${file}, transparent version already exists.`);
                 continue;
            }

            console.log(`Processing: ${file}...`);
            
            try {
                // @imgly returns a Blob
                const blob = await removeBackground(inputPath);
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                fs.writeFileSync(outputPath, buffer);
                console.log(`Saved transparent image: ${outputFileName}`);
            } catch (err) {
                console.error(`Failed to process ${file}:`, err);
            }
        }
        console.log('Background removal processing complete!');
    } catch (error) {
        console.error('Error in batch script:', error);
    }
}

processImages();
