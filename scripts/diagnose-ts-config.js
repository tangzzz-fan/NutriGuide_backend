#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 NutriGuide TypeScript Configuration Diagnostic Tool\n');

// Check current working directory
console.log('📁 Current Directory:', process.cwd());

// Check if we're in the right directory
const expectedFiles = ['package.json', 'tsconfig.json', 'nest-cli.json', 'src'];
const missingFiles = expectedFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
    console.log('❌ Missing required files/directories:', missingFiles.join(', '));
    console.log('💡 Make sure you\'re in the project root directory');
    process.exit(1);
}

console.log('✅ All required files found\n');

// Check tsconfig.json
try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    console.log('✅ tsconfig.json is valid JSON');
    console.log('📋 TypeScript target:', tsconfig.compilerOptions?.target || 'not specified');
    console.log('📋 Output directory:', tsconfig.compilerOptions?.outDir || 'not specified');
    console.log('📋 Base URL:', tsconfig.compilerOptions?.baseUrl || 'not specified');
} catch (error) {
    console.log('❌ tsconfig.json error:', error.message);
}

// Check tsconfig.build.json
if (fs.existsSync('tsconfig.build.json')) {
    try {
        const tsconfigBuild = JSON.parse(fs.readFileSync('tsconfig.build.json', 'utf8'));
        console.log('✅ tsconfig.build.json is valid JSON');
    } catch (error) {
        console.log('❌ tsconfig.build.json error:', error.message);
    }
} else {
    console.log('⚠️  tsconfig.build.json not found (optional but recommended)');
}

// Check nest-cli.json
try {
    const nestCli = JSON.parse(fs.readFileSync('nest-cli.json', 'utf8'));
    console.log('✅ nest-cli.json is valid JSON');
    console.log('📋 Source root:', nestCli.sourceRoot || 'not specified');
    console.log('📋 Compiler options:', nestCli.compilerOptions ? 'configured' : 'not configured');
} catch (error) {
    console.log('❌ nest-cli.json error:', error.message);
}

// Check package.json
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json is valid JSON');

    // Check important dependencies
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const requiredDeps = [
        '@nestjs/core',
        '@nestjs/common',
        'typescript',
        'reflect-metadata'
    ];

    console.log('\n📦 Checking dependencies:');
    requiredDeps.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`✅ ${dep}: ${dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep}: missing`);
        }
    });
} catch (error) {
    console.log('❌ package.json error:', error.message);
}

// Check node_modules
if (fs.existsSync('node_modules')) {
    console.log('\n✅ node_modules directory exists');

    // Check TypeScript installation
    const tsPath = path.join('node_modules', '.bin', 'tsc');
    if (fs.existsSync(tsPath) || fs.existsSync(tsPath + '.cmd')) {
        console.log('✅ TypeScript compiler found in node_modules');
    } else {
        console.log('❌ TypeScript compiler not found in node_modules');
    }

    // Check NestJS CLI
    const nestPath = path.join('node_modules', '.bin', 'nest');
    if (fs.existsSync(nestPath) || fs.existsSync(nestPath + '.cmd')) {
        console.log('✅ NestJS CLI found in node_modules');
    } else {
        console.log('❌ NestJS CLI not found in node_modules');
    }
} else {
    console.log('❌ node_modules directory not found - run "npm install"');
}

// Environment check
console.log('\n🌍 Environment Information:');
console.log('Node.js version:', process.version);
console.log('NPM version:', process.env.npm_version || 'unknown');
console.log('Platform:', process.platform);

console.log('\n🔧 Suggested Solutions:');
console.log('1. Make sure you\'re in the correct directory (project root)');
console.log('2. Run "npm install" to ensure all dependencies are installed');
console.log('3. Try "npm run build" to test compilation');
console.log('4. If using Docker, ensure the container has access to the files');
console.log('5. Check file permissions (especially on Unix systems)');

console.log('\n✨ Diagnostic complete!'); 