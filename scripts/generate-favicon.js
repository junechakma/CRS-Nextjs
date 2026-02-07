const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '../app/logo.png');
  const faviconPath = path.join(__dirname, '../app/favicon.ico');

  try {
    // Read the logo
    const logoBuffer = fs.readFileSync(logoPath);

    // Generate multiple sizes for ICO format
    const sizes = [16, 32, 48];
    const pngBuffers = await Promise.all(
      sizes.map(size =>
        sharp(logoBuffer)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer()
      )
    );

    // For simplicity, just use the 32x32 PNG as favicon.ico
    // Modern browsers support PNG in .ico files
    const favicon32 = await sharp(logoBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    fs.writeFileSync(faviconPath, favicon32);
    console.log('Favicon generated successfully!');

    // Also generate apple-touch-icon
    const appleTouchIcon = await sharp(logoBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(__dirname, '../app/apple-touch-icon.png'), appleTouchIcon);
    console.log('Apple touch icon generated successfully!');

  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
