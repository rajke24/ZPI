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