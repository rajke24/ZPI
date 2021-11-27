import Compress from 'compress.js';

const hexToRGB = (hex) => {
    const m = hex.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
    return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16)
    };
}

export const reverseColor = (background) => {
    if (background) {
        const rgb = hexToRGB(background)
        let color
        const luminance = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) / 256;
        if (luminance <= 0.50) {
            color = '#fcfcfc'
        } else {
            color = '#444444'
        }
        return color
    }
}

export const compress = (targetFile, callback) => {
    const compress = new Compress();
    compress.compress([targetFile], {
        size: 4,
        quality: .50,
        maxWidth: 1920,
        maxHeight: 1920,
        resize: true,
    }).then((result) => {
        const compressed = result[0];
        const file = Compress.convertBase64ToFile(compressed.data, compressed.ext);
        file.name = targetFile.name;
        callback(file);
    });
};

export const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            blob.name = fileName;
            resolve(blob);
        }, 'image/jpeg', 1);
    });
}