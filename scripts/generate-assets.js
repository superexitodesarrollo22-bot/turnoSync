const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ─── SVG FUENTE DEL ÍCONO ───────────────────────────────────────────────────
// Tijera de barbero estilizada, trazo dorado sobre fondo transparente
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="none" stroke="#C9A84C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- Hoja superior -->
    <path d="M30 20 Q50 45 50 50"/>
    <path d="M70 20 Q50 45 50 50"/>
    <!-- Aros de la tijera -->
    <circle cx="24" cy="14" r="10"/>
    <circle cx="76" cy="14" r="10"/>
    <!-- Hoja inferior -->
    <path d="M50 50 L25 85"/>
    <path d="M50 50 L75 85"/>
    <!-- Tornillo central -->
    <circle cx="50" cy="50" r="3" fill="#C9A84C" stroke="none"/>
  </g>
</svg>
`;

// ─── ÍCONO CON FONDO (para app icon) ───────────────────────────────────────
const ICON_WITH_BG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1A1A2E"/>
  <g fill="none" stroke="#C9A84C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 20 Q50 45 50 50"/>
    <path d="M70 20 Q50 45 50 50"/>
    <circle cx="24" cy="14" r="10"/>
    <circle cx="76" cy="14" r="10"/>
    <path d="M50 50 L25 85"/>
    <path d="M50 50 L75 85"/>
    <circle cx="50" cy="50" r="3" fill="#C9A84C" stroke="none"/>
  </g>
</svg>
`;

// ─── FUNCIÓN GENERADORA ────────────────────────────────────────────────────
async function generatePNG(svgContent, outputPath, size, bgColor = null) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let pipeline = sharp(Buffer.from(svgContent)).resize(size, size);
    if (bgColor) {
        pipeline = pipeline.flatten({ background: bgColor });
    }

    await pipeline.png().toFile(outputPath);
    console.log(`✅ ${outputPath} (${size}x${size})`);
}

// ─── CATEGORÍA 1 — ÍCONOS DE LA APP ─────────────────────────────────────────
async function generateIcons() {
    console.log('\n🎨 Generando iconos de TurnoSync (Categoría 1)...\n');

    // EXPO BASE
    await generatePNG(ICON_WITH_BG_SVG, 'assets/icon.png', 1024);
    await generatePNG(ICON_SVG, 'assets/adaptive-icon.png', 1024);
    await generatePNG(ICON_WITH_BG_SVG, 'assets/favicon.png', 48);

    // ANDROID MIPMAP - ic_launcher (con fondo)
    const mipmapSizes = {
        'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192
    };
    for (const [dpi, size] of Object.entries(mipmapSizes)) {
        await generatePNG(ICON_WITH_BG_SVG, `android/app/src/main/res/mipmap-${dpi}/ic_launcher.png`, size);
        await generatePNG(ICON_WITH_BG_SVG, `android/app/src/main/res/mipmap-${dpi}/ic_launcher_round.png`, size);
    }

    // ANDROID ADAPTIVE FOREGROUND (fondo transparente)
    const adaptiveSizes = { 'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432 };
    for (const [dpi, size] of Object.entries(adaptiveSizes)) {
        await generatePNG(ICON_SVG, `android/app/src/main/res/mipmap-${dpi}/ic_launcher_foreground.png`, size);
    }

    // iOS APP ICON
    const iosSizes = [
        { name: 'Icon-20.png', size: 20 },
        { name: 'Icon-20@2x.png', size: 40 },
        { name: 'Icon-20@3x.png', size: 60 },
        { name: 'Icon-29.png', size: 29 },
        { name: 'Icon-29@2x.png', size: 58 },
        { name: 'Icon-29@3x.png', size: 87 },
        { name: 'Icon-40.png', size: 40 },
        { name: 'Icon-40@2x.png', size: 80 },
        { name: 'Icon-40@3x.png', size: 120 },
        { name: 'Icon-60@2x.png', size: 120 },
        { name: 'Icon-60@3x.png', size: 180 },
        { name: 'Icon-76.png', size: 76 },
        { name: 'Icon-76@2x.png', size: 152 },
        { name: 'Icon-83.5@2x.png', size: 167 },
        { name: 'Icon-1024.png', size: 1024 },
    ];

    const iosPath = 'ios/TurnoSync/Images.xcassets/AppIcon.appiconset';
    for (const item of iosSizes) {
        await generatePNG(ICON_WITH_BG_SVG, `${iosPath}/${item.name}`, item.size, { r: 26, g: 26, b: 46 });
    }

    // Contents.json for iOS
    const contents = {
        "images": [
            { "idiom": "iphone", "scale": "2x", "size": "20x20", "filename": "Icon-20@2x.png" },
            { "idiom": "iphone", "scale": "3x", "size": "20x20", "filename": "Icon-20@3x.png" },
            { "idiom": "iphone", "scale": "2x", "size": "29x29", "filename": "Icon-29@2x.png" },
            { "idiom": "iphone", "scale": "3x", "size": "29x29", "filename": "Icon-29@3x.png" },
            { "idiom": "iphone", "scale": "2x", "size": "40x40", "filename": "Icon-40@2x.png" },
            { "idiom": "iphone", "scale": "3x", "size": "40x40", "filename": "Icon-40@3x.png" },
            { "idiom": "iphone", "scale": "2x", "size": "60x60", "filename": "Icon-60@2x.png" },
            { "idiom": "iphone", "scale": "3x", "size": "60x60", "filename": "Icon-60@3x.png" },
            { "idiom": "ipad", "scale": "1x", "size": "20x20", "filename": "Icon-20.png" },
            { "idiom": "ipad", "scale": "2x", "size": "20x20", "filename": "Icon-20@2x.png" },
            { "idiom": "ipad", "scale": "1x", "size": "29x29", "filename": "Icon-29.png" },
            { "idiom": "ipad", "scale": "2x", "size": "29x29", "filename": "Icon-29@2x.png" },
            { "idiom": "ipad", "scale": "1x", "size": "40x40", "filename": "Icon-40.png" },
            { "idiom": "ipad", "scale": "2x", "size": "40x40", "filename": "Icon-40@2x.png" },
            { "idiom": "ipad", "scale": "1x", "size": "76x76", "filename": "Icon-76.png" },
            { "idiom": "ipad", "scale": "2x", "size": "76x76", "filename": "Icon-76@2x.png" },
            { "idiom": "ipad", "scale": "2x", "size": "83.5x83.5", "filename": "Icon-83.5@2x.png" },
            { "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024", "filename": "Icon-1024.png" }
        ],
        "info": { "author": "xcode", "version": 1 }
    };
    fs.writeFileSync(`${iosPath}/Contents.json`, JSON.stringify(contents, null, 2));
    console.log(`✅ ${iosPath}/Contents.json`);
}

// ─── CATEGORÍA 2 — SPLASH SCREEN ──────────────────────────────────────────
async function generateSplash() {
    console.log('\n🎨 Generando splash screens (Categoría 2)...\n');

    const width = 1284;
    const height = 2778;

    // SVG de Texto/Logo para Splash
    const getSplashOverlay = (textColor, taglineColor) => `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        .title { fill: ${textColor}; font-family: sans-serif; font-size: 100px; font-weight: bold; }
        .tagline { fill: ${taglineColor}; font-family: sans-serif; font-size: 45px; }
      </style>
      <text x="50%" y="55%" text-anchor="middle" class="title">TurnoSync</text>
      <text x="50%" y="60%" text-anchor="middle" class="tagline">Tu turno, a tiempo</text>
    </svg>
  `;

    // — DARK —
    const darkIcon = await sharp(Buffer.from(ICON_SVG)).resize(400, 400).toBuffer();
    await sharp({
        create: { width, height, channels: 4, background: '#0D0D1A' }
    })
        .composite([
            { input: darkIcon, top: 900, left: (width - 400) / 2 },
            { input: Buffer.from(getSplashOverlay('#FFFFFF', '#A0A0B0')) }
        ])
        .png()
        .toFile('assets/splash.png');
    console.log('✅ assets/splash.png (1284x2778) [Dark]');

    // — LIGHT —
    const lightIcon = await sharp(Buffer.from(ICON_SVG)).resize(400, 400).toBuffer();
    await sharp({
        create: { width, height, channels: 4, background: '#F4F4F8' }
    })
        .composite([
            { input: lightIcon, top: 900, left: (width - 400) / 2 },
            { input: Buffer.from(getSplashOverlay('#0D0D1A', '#6B6B80')) }
        ])
        .png()
        .toFile('assets/splash-light.png');
    console.log('✅ assets/splash-light.png (1284x2778) [Light]');
}

// ─── CATEGORÍA 3 — ÍCONOS DE NOTIFICACIÓN ───────────────────────────────────
async function generateNotifications() {
    console.log('\n🎨 Generando iconos de notificación (Categoría 3)...\n');

    // Ícono blanco puro
    const NOTIF_SVG = ICON_SVG.replace(/#C9A84C/g, '#FFFFFF');
    const notifSizes = { 'mdpi': 24, 'hdpi': 36, 'xhdpi': 48, 'xxhdpi': 72, 'xxxhdpi': 96 };

    for (const [dpi, size] of Object.entries(notifSizes)) {
        await generatePNG(NOTIF_SVG, `android/app/src/main/res/drawable-${dpi}/notification_icon.png`, size);
    }
    await generatePNG(NOTIF_SVG, 'assets/notification-icon.png', 96);
}

// ─── CATEGORÍA 4 — GOOGLE PLAY STORE ────────────────────────────────────────
async function generateStoreAssets() {
    console.log('\n🎨 Generando assets para tiendas (Categoría 4/5)...\n');

    // High-res icon
    await generatePNG(ICON_WITH_BG_SVG, 'store-assets/android/hi-res-icon.png', 512);

    // Feature Graphic
    const fw = 1024, fh = 500;
    const featureGraphicBase = `
    <svg width="${fw}" height="${fh}" viewBox="0 0 ${fw} ${fh}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0D0D1A" />
          <stop offset="100%" stop-color="#16213E" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <style>
        .title { fill: #FFFFFF; font-family: sans-serif; font-size: 80px; font-weight: bold; }
        .tagline { fill: #C9A84C; font-family: sans-serif; font-size: 36px; }
        .sub { fill: #A0A0B0; font-family: sans-serif; font-size: 24px; }
      </style>
      <text x="60" y="220" class="title">TurnoSync</text>
      <line x1="60" y1="250" x2="460" y2="250" stroke="#C9A84C" stroke-width="3" />
      <text x="60" y="300" class="tagline">Reserva tu turno en segundos</text>
      <text x="60" y="350" class="sub">La app de barberías más completa</text>
    </svg>
  `;

    // Background icon (large transparent) - Fixed size to fit
    const bgIcon = await sharp(Buffer.from(ICON_SVG))
        .resize(450, 450)
        .modulate({ opacity: 0.1 })
        .toBuffer();

    const dir = 'store-assets/android';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await sharp(Buffer.from(featureGraphicBase))
        .composite([{ input: bgIcon, top: 25, left: 600 }])
        .png()
        .toFile(`${dir}/feature-graphic.png`);

    console.log(`✅ ${dir}/feature-graphic.png (1024x500)`);
}

// ─── CATEGORÍA 6 — ASSETS INTERNOS ──────────────────────────────────────────
async function generateInternalAssets() {
    console.log('\n🎨 Generando assets internos (Categoría 6)...\n');

    // Logo con texto horizontal
    const getLogoSVG = (color) => `
    <svg width="512" height="150" viewBox="0 0 512 150" xmlns="http://www.w3.org/2000/svg">
      <style>.t { fill: ${color}; font-family: sans-serif; font-size: 60px; font-weight: 800; }</style>
      <text x="120" y="95" class="t">TurnoSync</text>
    </svg>
  `;

    const miniIcon = await sharp(Buffer.from(ICON_SVG)).resize(100, 100).toBuffer();

    const generateLogo = async (textColor, filename) => {
        await sharp(Buffer.from(getLogoSVG(textColor)))
            .composite([{ input: miniIcon, left: 10, top: 25 }])
            .png()
            .toFile(`assets/${filename}`);
        console.log(`✅ assets/${filename}`);
    };

    await generateLogo('#FFFFFF', 'logo-dark.png');
    await generateLogo('#0D0D1A', 'logo-light.png');
    await generatePNG(ICON_SVG, 'assets/logo-icon-only.png', 256);

    // Placeholders
    const placeholderSVG = (text, bg) => `
    <svg width="800" height="600" viewBox="0 0 800 600">
      <rect width="100%" height="100%" fill="${bg}" />
      <style>.t { fill: #A0A0B0; font-family: sans-serif; font-size: 40px; text-anchor: middle; }</style>
      <text x="400" y="520" class="t">${text}</text>
    </svg>
  `;

    const largeIcon = await sharp(Buffer.from(ICON_SVG)).resize(300, 300).modulate({ opacity: 0.2 }).toBuffer();

    await sharp(Buffer.from(placeholderSVG('Sin imagen disponible', '#1A1A2E')))
        .composite([{ input: largeIcon, top: 100, left: 250 }])
        .png().toFile('assets/placeholder-business.png');
    console.log('✅ assets/placeholder-business.png');

    // Simple Avatar placeholder
    const avatarSVG = `
    <svg width="256" height="256" viewBox="0 0 256 256">
      <circle cx="128" cy="128" r="128" fill="#2A2A3E" />
      <circle cx="128" cy="90" r="45" fill="#5A5A70" />
      <path d="M40 210 Q128 140 216 210" stroke="#5A5A70" stroke-width="20" fill="none" stroke-linecap="round" />
    </svg>
  `;
    await sharp(Buffer.from(avatarSVG)).png().toFile('assets/placeholder-avatar.png');
    console.log('✅ assets/placeholder-avatar.png');

    // Empty State
    const emptySVG = `
    <svg width="400" height="300" viewBox="0 0 400 300">
      <style>.t { fill: #6B6B80; font-family: sans-serif; font-size: 18px; text-anchor: middle; }</style>
      <text x="200" y="240" class="t">No hay nada por aquí todavía</text>
    </svg>
  `;
    const medIcon = await sharp(Buffer.from(ICON_SVG)).resize(120, 120).toBuffer();
    await sharp(Buffer.from(emptySVG))
        .composite([{ input: medIcon, top: 60, left: 140 }])
        .png().toFile('assets/empty-state.png');
    console.log('✅ assets/empty-state.png');
}

async function run() {
    try {
        await generateIcons();
        await generateSplash();
        await generateNotifications();
        await generateStoreAssets();
        await generateInternalAssets();
        console.log('\n🚀 ¡Todos los assets básicos e internos generados con éxito!\n');
    } catch (err) {
        console.error('❌ Error fatal:', err);
    }
}

run();
