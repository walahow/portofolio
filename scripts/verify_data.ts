
import { PROJECTS } from '../data/projects';
import fs from 'fs';
import path from 'path';

console.log('Verifying PROJECTS data...');
const publicDir = path.join(process.cwd(), 'public');

PROJECTS.forEach(p => {
    console.log(`Project: ${p.title} (${p.id})`);

    // Check Thumbnail
    if (!p.thumbnail) {
        console.error(`  ERROR: Thumbnail is null or empty`);
    } else {
        const thumbPath = path.join(publicDir, p.thumbnail);
        if (fs.existsSync(thumbPath)) {
            console.log(`  Thumbnail OK: ${p.thumbnail}`);
        } else {
            console.error(`  ERROR: Thumbnail file not found: ${thumbPath}`);
        }
    }

    // Check Gallery
    p.gallery.forEach((img, i) => {
        const imgPath = path.join(publicDir, img);
        if (fs.existsSync(imgPath)) {
            console.log(`  Gallery [${i}] OK: ${img}`);
        } else {
            console.error(`  ERROR: Gallery image [${i}] not found: ${imgPath}`);
        }
    });
});
console.log('Done.');
