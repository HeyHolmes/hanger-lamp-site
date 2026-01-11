const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/images/images_hires');
const OUTPUT_DIR = path.join(__dirname, '../public/images/productshots');

const MAX_WIDTH = 2800;
const QUALITY = 85;

async function optimizeImages() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  // Get all files in input directory
  const files = fs.readdirSync(INPUT_DIR);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg|PNG|JPG|JPEG)$/i.test(file)
  );

  console.log(`Found ${imageFiles.length} images to optimize\n`);

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputName = path.parse(file).name + '.webp';
    const outputPath = path.join(OUTPUT_DIR, outputName);

    try {
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      const originalSize = (originalStats.size / 1024 / 1024).toFixed(2);

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      
      // Calculate new dimensions (maintain aspect ratio)
      let resizeOptions = {};
      if (metadata.width > MAX_WIDTH) {
        resizeOptions = { width: MAX_WIDTH };
      }

      // Process image
      await sharp(inputPath)
        .resize(resizeOptions)
        .webp({ quality: QUALITY })
        .toFile(outputPath);

      // Get new file size
      const newStats = fs.statSync(outputPath);
      const newSize = (newStats.size / 1024 / 1024).toFixed(2);
      const savings = (((originalStats.size - newStats.size) / originalStats.size) * 100).toFixed(1);

      console.log(`✓ ${file}`);
      console.log(`  Original: ${originalSize}MB → Optimized: ${newSize}MB (${savings}% smaller)`);
      console.log(`  Dimensions: ${metadata.width}x${metadata.height} → ${resizeOptions.width || metadata.width}px width`);
      console.log('');
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error.message);
    }
  }

  console.log('Done! Optimized images saved to:', OUTPUT_DIR);
}

optimizeImages();
