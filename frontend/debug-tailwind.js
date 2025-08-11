// Debug script to check Tailwind CSS processing
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Tailwind CSS Setup...\n');

// Check if files exist
const files = [
    'tailwind.config.ts',
    'postcss.config.js',
    'src/app/globals.css',
    'package.json'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Check package.json dependencies
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    console.log('\n📦 Tailwind-related dependencies:');
    ['tailwindcss', 'autoprefixer', '@tailwindcss/typography'].forEach(dep => {
        if (deps[dep]) {
            console.log(`✅ ${dep}: ${deps[dep]}`);
        } else {
            console.log(`❌ ${dep}: missing`);
        }
    });
} catch (e) {
    console.log('❌ Error reading package.json');
}

// Check globals.css
try {
    const css = fs.readFileSync('src/app/globals.css', 'utf8');
    if (css.includes('@tailwind base')) {
        console.log('✅ @tailwind directives found in globals.css');
    } else {
        console.log('❌ @tailwind directives missing in globals.css');
    }
} catch (e) {
    console.log('❌ Error reading globals.css');
}

console.log('\n🚀 Try running: npm run dev');
console.log('📍 Then visit: http://localhost:3000/test');
console.log('   If the test page is blue with a white card, Tailwind is working!');