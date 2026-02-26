import {
    CHAR_FRAME_W, CHAR_FRAME_H, CHAR_ANIM_FRAMES,
    SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS, SHOE_COLORS,
} from './config.js';

let charIdCounter = 0;

export function generateCharacterTraits() {
    return {
        skinTone: pick(SKIN_TONES),
        hairColor: pick(HAIR_COLORS),
        hairStyle: pick(['short', 'tall', 'flat', 'mohawk']),
        shirtColor: pick(SHIRT_COLORS),
        pantsColor: pick(PANTS_COLORS),
        shoeColor: pick(SHOE_COLORS),
        hasGlasses: Math.random() < 0.3,
    };
}

export function createCharacterTexture(scene, traits) {
    const key = `char_${charIdCounter++}`;
    const fw = CHAR_FRAME_W;
    const fh = CHAR_FRAME_H;
    const numFrames = CHAR_ANIM_FRAMES;

    const canvas = document.createElement('canvas');
    canvas.width = fw * numFrames;
    canvas.height = fh;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    // Frame 0: standing idle
    drawFrame(ctx, 0, 0, fw, fh, traits, 'idle');
    // Frame 1: walk left foot forward
    drawFrame(ctx, fw, 0, fw, fh, traits, 'walk1');
    // Frame 2: walk right foot forward
    drawFrame(ctx, fw * 2, 0, fw, fh, traits, 'walk2');
    // Frame 3: working/typing frame 1
    drawFrame(ctx, fw * 3, 0, fw, fh, traits, 'work1');
    // Frame 4: working/typing frame 2
    drawFrame(ctx, fw * 4, 0, fw, fh, traits, 'work2');
    // Frame 5: talking/gesturing
    drawFrame(ctx, fw * 5, 0, fw, fh, traits, 'talk');

    const tex = scene.textures.addSpriteSheet(key, canvas, {
        frameWidth: fw,
        frameHeight: fh,
    });

    return key;
}

function drawFrame(ctx, ox, oy, fw, fh, traits, pose) {
    const skin = hexToRgb(traits.skinTone);
    const hair = hexToRgb(traits.hairColor);
    const shirt = hexToRgb(traits.shirtColor);
    const pants = hexToRgb(traits.pantsColor);
    const shoes = hexToRgb(traits.shoeColor);
    const eyeColor = { r: 20, g: 20, b: 30 };
    const glassesColor = { r: 60, g: 60, b: 80 };

    // Character is drawn centered in the frame
    // Using pixel coordinates relative to (ox, oy)
    const px = (x, y, color) => {
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctx.fillRect(ox + x, oy + y, 1, 1);
    };
    const rect = (x, y, w, h, color) => {
        ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        ctx.fillRect(ox + x, oy + y, w, h);
    };

    // Character dimensions (centered in 16x24 frame)
    // Head: 6x5 at (5, 3)
    // Body: 8x6 at (4, 9)
    // Legs: 3x5 each at (5, 15) and (8, 15)
    // Feet: 3x2 each at (5, 20) and (8, 20)

    const headX = 5, headY = 4, headW = 6, headH = 5;
    const bodyX = 4, bodyY = 9, bodyW = 8, bodyH = 6;
    const legLX = 5, legRX = 8, legY = 15, legW = 3, legH = 5;
    const feetY = 20;

    let leftArmOffset = 0;
    let rightArmOffset = 0;
    let leftLegOffset = 0;
    let rightLegOffset = 0;

    switch (pose) {
        case 'walk1':
            leftLegOffset = -1;
            rightLegOffset = 1;
            leftArmOffset = 1;
            rightArmOffset = -1;
            break;
        case 'walk2':
            leftLegOffset = 1;
            rightLegOffset = -1;
            leftArmOffset = -1;
            rightArmOffset = 1;
            break;
        case 'work1':
            leftArmOffset = -2;
            rightArmOffset = -2;
            break;
        case 'work2':
            leftArmOffset = -1;
            rightArmOffset = -3;
            break;
        case 'talk':
            rightArmOffset = -3;
            break;
    }

    // Shadow (subtle)
    rect(4, 22, 8, 2, { r: 0, g: 0, b: 0 });
    ctx.globalAlpha = 0.15;
    ctx.fillRect(ox + 4, oy + 22, 8, 2);
    ctx.globalAlpha = 1.0;

    // Hair (behind head for some styles)
    if (traits.hairStyle === 'tall') {
        rect(headX, headY - 3, headW, 3, hair);
    }

    // Head
    rect(headX, headY, headW, headH, skin);

    // Hair (on top)
    switch (traits.hairStyle) {
        case 'short':
            rect(headX, headY - 1, headW, 2, hair);
            rect(headX, headY, headW, 1, hair);
            break;
        case 'tall':
            rect(headX, headY - 3, headW, 4, hair);
            break;
        case 'flat':
            rect(headX - 1, headY - 1, headW + 2, 2, hair);
            break;
        case 'mohawk':
            rect(headX + 2, headY - 3, 2, 4, hair);
            break;
    }

    // Eyes
    px(headX + 1, headY + 2, eyeColor);
    px(headX + 4, headY + 2, eyeColor);

    // Mouth
    if (pose === 'talk') {
        px(headX + 2, headY + 4, eyeColor);
        px(headX + 3, headY + 4, eyeColor);
    } else {
        px(headX + 2, headY + 3, darken(skin, 0.3));
        px(headX + 3, headY + 3, darken(skin, 0.3));
    }

    // Glasses
    if (traits.hasGlasses) {
        px(headX, headY + 2, glassesColor);
        px(headX + 1, headY + 1, glassesColor);
        px(headX + 2, headY + 2, glassesColor);
        px(headX + 3, headY + 2, glassesColor);
        px(headX + 4, headY + 1, glassesColor);
        px(headX + 5, headY + 2, glassesColor);
    }

    // Neck
    rect(headX + 2, headY + headH, 2, 1, skin);

    // Body / Torso
    rect(bodyX, bodyY, bodyW, bodyH, shirt);

    // Shirt detail (darker stripe)
    rect(bodyX + 3, bodyY, 2, bodyH, darken(shirt, 0.1));

    // Arms
    // Left arm
    rect(bodyX - 1, bodyY + leftArmOffset, 1, 4, shirt);
    rect(bodyX - 1, bodyY + 4 + leftArmOffset, 1, 2, skin); // hand

    // Right arm
    rect(bodyX + bodyW, bodyY + rightArmOffset, 1, 4, shirt);
    rect(bodyX + bodyW, bodyY + 4 + rightArmOffset, 1, 2, skin); // hand

    // Legs
    // Left leg
    rect(legLX, legY + leftLegOffset, legW, legH, pants);
    // Right leg
    rect(legRX, legY + rightLegOffset, legW, legH, pants);

    // Shoes
    rect(legLX, feetY + leftLegOffset, legW, 2, shoes);
    rect(legRX, feetY + rightLegOffset, legW, 2, shoes);
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function hexToRgb(hex) {
    return {
        r: (hex >> 16) & 0xff,
        g: (hex >> 8) & 0xff,
        b: hex & 0xff,
    };
}

function darken(color, amount) {
    return {
        r: Math.max(0, Math.floor(color.r * (1 - amount))),
        g: Math.max(0, Math.floor(color.g * (1 - amount))),
        b: Math.max(0, Math.floor(color.b * (1 - amount))),
    };
}
