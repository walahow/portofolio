import fs from 'fs';
import path from 'path';

/**
 * Recursively scan the public directory for assets.
 * @returns Array of relative paths (starting with /) for all found assets.
 */
export function getPublicAssets(): string[] {
    const publicDir = path.join(process.cwd(), 'public');
    const assets: string[] = [];

    // Supported extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    const videoExtensions = ['.mp4', '.webm'];
    const validExtensions = new Set([...imageExtensions, ...videoExtensions]);

    function scanDirectory(dir: string) {
        if (!fs.existsSync(dir)) return;

        const items = fs.readdirSync(dir);

        items.forEach(item => {
            const absolutePath = path.join(dir, item);
            const stat = fs.statSync(absolutePath);

            if (stat.isDirectory()) {
                scanDirectory(absolutePath);
            } else {
                const ext = path.extname(item).toLowerCase();
                if (validExtensions.has(ext)) {
                    // Create relative path from public root
                    // e.g. /img/foo.png
                    const relativePath = absolutePath
                        .replace(publicDir, '')
                        .replace(/\\/g, '/'); // Ensure forward slashes for URL

                    assets.push(relativePath);
                }
            }
        });
    }

    scanDirectory(publicDir);
    return assets;
}
