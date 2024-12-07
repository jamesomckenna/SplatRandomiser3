const fs = require("fs");
const path = require("path");
const Terser = require("terser");
const CleanCSS = require("clean-css");
const sharp = require("sharp");

// Function to recursively get all files from a directory
function getFilesFromDir(dir, exts) {
    let files = [];
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            files = files.concat(getFilesFromDir(fullPath, exts));
        } else if (exts.includes(path.extname(file).toLowerCase()) || !exts.length) {
            files.push(fullPath);
        }
    });
    return files;
}

// Function to minify JavaScript
async function minifyJS(inputPath, outputPath) {
    const jsCode = fs.readFileSync(inputPath, "utf-8");
    const minified = await Terser.minify(jsCode);
    fs.writeFileSync(outputPath, minified.code, "utf-8");
    console.log(`Minified JS: ${inputPath} → ${outputPath}`);
}

// Function to minify CSS
function minifyCSS(inputPath, outputPath) {
    const cssCode = fs.readFileSync(inputPath, "utf-8");
    const minified = new CleanCSS().minify(cssCode);
    fs.writeFileSync(outputPath, minified.styles, "utf-8");
    console.log(`Minified CSS: ${inputPath} → ${outputPath}`);
}

// Function to minify JSON
function minifyJSON(inputPath, outputPath) {
    const jsonCode = fs.readFileSync(inputPath, "utf-8");
    const minified = JSON.stringify(JSON.parse(jsonCode));
    fs.writeFileSync(outputPath, minified, "utf-8");
    console.log(`Minified JSON: ${inputPath} → ${outputPath}`);
}

// Function to optimize images and save as WebP
async function optimizeImage(inputPath, outputPath, imageSizes = [{}]) {
    await imageSizes.forEach((imageSize) => {
        let outputPathCustom = outputPath;
        if (imageSize.hasOwnProperty("suffix")) {
            const fileName = path.basename(outputPath, path.extname(outputPath));
            outputPathCustom = outputPathCustom.replace(fileName, fileName + imageSize.suffix);
        }
        sharp(inputPath)
            .resize(imageSize)
            .toFormat("webp", { quality: 80 }) // Convert to WebP with 80% quality
            .toFile(outputPathCustom);
        console.log(`Optimized Image: ${inputPath} → ${outputPathCustom}`);
    })
}


// Build process
function build() {
    const inputDirs = {
        js: path.join(__dirname, "src", "scripts"),
        css: path.join(__dirname, "src", "styles"),
        json: path.join(__dirname, "src", "json"),
        images: path.join(__dirname, "src", "images"),
        root: path.join(__dirname, "src"),
    };
    const outputDirs = {
        js: path.join(__dirname, "dist", "scripts"),
        css: path.join(__dirname, "dist", "styles"),
        json: path.join(__dirname, "dist", "json"),
        images: path.join(__dirname, "dist", "images"),
        root: path.join(__dirname, "dist"),
    };

    // Ensure output directories exist
    Object.values(outputDirs).forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Process JavaScript files
    const jsFiles = getFilesFromDir(inputDirs.js, [".js"]);
    jsFiles.forEach((file) => {
        const relativePath = path.relative(inputDirs.js, file);
        const outputPath = path.join(outputDirs.js, relativePath);
        minifyJS(file, outputPath);
    });

    // Process CSS files
    const cssFiles = getFilesFromDir(inputDirs.css, [".css"]);
    cssFiles.forEach((file) => {
        const relativePath = path.relative(inputDirs.css, file);
        const outputPath = path.join(outputDirs.css, relativePath);
        minifyCSS(file, outputPath);
    });

    // Process JSON files
    const jsonFiles = getFilesFromDir(inputDirs.json, [".json"]);
    jsonFiles.forEach((file) => {
        const relativePath = path.relative(inputDirs.json, file);
        const outputPath = path.join(outputDirs.json, relativePath);
        minifyJSON(file, outputPath);
    });

    // Process image files
    const imageFiles = getFilesFromDir(inputDirs.images, [".jpg", ".jpeg", ".png", ".webp"]);
    imageFiles.forEach((file) => {
        const relativePath = path.relative(inputDirs.images, file); // Get relative path of the file
        const outputPath = path.join(outputDirs.images, relativePath.replace(path.extname(relativePath), ".webp")); // Replace extension
        const outputDir = path.dirname(outputPath); // Get the directory for the output file

        // Ensure the subdirectory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const imageDir = path.dirname(relativePath);

        const imageSizes = {
            class: [
                {
                    width: 90
                }
            ],
            special: [
                {
                    width: 71
                }
            ],
            sub: [
                {
                    width: 71
                }
            ],
            weapons: [
                {
                    suffix: "-small",
                    width: 90
                },
                {
                    width: 205
                }
            ],
        };

        let imageSize = [{}];
        if (imageSizes.hasOwnProperty(imageDir)) {
            imageSize = imageSizes[imageDir];
        }

        // Optimize and save the image
        optimizeImage(file, outputPath, imageSize);
    });

    const files = getFilesFromDir(inputDirs.root, []); // Get all files, no specific extensions
    files.forEach((file) => {
        const excludedDirs = [ 'scripts', 'styles', 'json', 'images' ];
        const relativePath = path.relative(inputDirs.root, file);
        const subDir = relativePath.split(path.sep)[0];

        // Skip files in excluded directories
        if (excludedDirs.includes(subDir)) return;

        const outputPath = path.join(outputDirs.root, relativePath);

        // Ensure the subdirectory exists
        const outputFileDir = path.dirname(outputPath);
        if (!fs.existsSync(outputFileDir)) {
            fs.mkdirSync(outputFileDir, { recursive: true });
        }

        // Copy the file
        fs.copyFileSync(file, outputPath);
        console.log(`Copied: ${file} → ${outputPath}`);
    });

    console.log("Build completed!");
}

build();
