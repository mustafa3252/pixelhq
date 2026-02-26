import { TILE_W, TILE_H, WALL_H, COLORS } from './config.js';

export function generateTileTextures(scene) {
    generateFloorTexture(scene, 'floor1', COLORS.FLOOR_1.top);
    generateFloorTexture(scene, 'floor2', COLORS.FLOOR_2.top);
    generateWallTexture(scene);
    generateDoorTexture(scene);
    generateFurnitureTextures(scene);
}

function generateFloorTexture(scene, key, color) {
    const g = scene.add.graphics();
    const w = TILE_W;
    const h = TILE_H;
    const cx = w / 2;
    const cy = h / 2;

    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(cx, 0);
    g.lineTo(w, cy);
    g.lineTo(cx, h);
    g.lineTo(0, cy);
    g.closePath();
    g.fillPath();

    g.lineStyle(1, 0x000000, 0.08);
    g.beginPath();
    g.moveTo(cx, 0);
    g.lineTo(w, cy);
    g.lineTo(cx, h);
    g.lineTo(0, cy);
    g.closePath();
    g.strokePath();

    g.generateTexture(key, w, h);
    g.destroy();
}

function generateWallTexture(scene) {
    const g = scene.add.graphics();
    const texW = TILE_W;
    const texH = TILE_H + WALL_H;
    const hw = TILE_W / 2;  // 32
    const hh = TILE_H / 2;  // 16

    // Top diamond vertices (at the top of the cube)
    const tTop =  { x: hw,       y: 0 };
    const tRight = { x: TILE_W,  y: hh };
    const tBot =  { x: hw,       y: TILE_H };
    const tLeft = { x: 0,        y: hh };

    // Base vertices (shifted down by WALL_H)
    const bRight = { x: TILE_W, y: hh + WALL_H };
    const bBot =   { x: hw,     y: TILE_H + WALL_H };
    const bLeft =  { x: 0,      y: hh + WALL_H };

    // Right face (south-east, darker)
    g.fillStyle(COLORS.WALL.right, 1);
    g.beginPath();
    g.moveTo(tBot.x, tBot.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(bRight.x, bRight.y);
    g.lineTo(bBot.x, bBot.y);
    g.closePath();
    g.fillPath();

    // Left face (south-west, medium)
    g.fillStyle(COLORS.WALL.left, 1);
    g.beginPath();
    g.moveTo(tLeft.x, tLeft.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(bBot.x, bBot.y);
    g.lineTo(bLeft.x, bLeft.y);
    g.closePath();
    g.fillPath();

    // Top face (lightest)
    g.fillStyle(COLORS.WALL.top, 1);
    g.beginPath();
    g.moveTo(tTop.x, tTop.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(tLeft.x, tLeft.y);
    g.closePath();
    g.fillPath();

    // Edges
    g.lineStyle(1, 0x000000, 0.12);
    g.beginPath();
    g.moveTo(tTop.x, tTop.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(tLeft.x, tLeft.y);
    g.closePath();
    g.strokePath();
    g.beginPath();
    g.moveTo(tLeft.x, tLeft.y); g.lineTo(bLeft.x, bLeft.y);
    g.moveTo(tRight.x, tRight.y); g.lineTo(bRight.x, bRight.y);
    g.moveTo(tBot.x, tBot.y); g.lineTo(bBot.x, bBot.y);
    g.strokePath();
    g.beginPath();
    g.moveTo(bLeft.x, bLeft.y); g.lineTo(bBot.x, bBot.y); g.lineTo(bRight.x, bRight.y);
    g.strokePath();

    g.generateTexture('wall', texW, texH);
    g.destroy();
}

function generateDoorTexture(scene) {
    const doorH = Math.floor(WALL_H * 0.45);
    const g = scene.add.graphics();
    const texW = TILE_W;
    const texH = TILE_H + doorH;
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;

    // Top diamond vertices
    const tTop =  { x: hw,      y: 0 };
    const tRight = { x: TILE_W, y: hh };
    const tBot =  { x: hw,      y: TILE_H };
    const tLeft = { x: 0,       y: hh };

    // Base vertices
    const bRight = { x: TILE_W, y: hh + doorH };
    const bBot =   { x: hw,     y: TILE_H + doorH };
    const bLeft =  { x: 0,      y: hh + doorH };

    // Right face
    g.fillStyle(COLORS.DOOR.right, 1);
    g.beginPath();
    g.moveTo(tBot.x, tBot.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(bRight.x, bRight.y);
    g.lineTo(bBot.x, bBot.y);
    g.closePath();
    g.fillPath();

    // Left face
    g.fillStyle(COLORS.DOOR.left, 1);
    g.beginPath();
    g.moveTo(tLeft.x, tLeft.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(bBot.x, bBot.y);
    g.lineTo(bLeft.x, bLeft.y);
    g.closePath();
    g.fillPath();

    // Top face
    g.fillStyle(COLORS.DOOR.top, 1);
    g.beginPath();
    g.moveTo(tTop.x, tTop.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(tLeft.x, tLeft.y);
    g.closePath();
    g.fillPath();

    // Edges
    g.lineStyle(1, 0x000000, 0.1);
    g.beginPath();
    g.moveTo(tLeft.x, tLeft.y); g.lineTo(bLeft.x, bLeft.y);
    g.moveTo(tRight.x, tRight.y); g.lineTo(bRight.x, bRight.y);
    g.moveTo(tBot.x, tBot.y); g.lineTo(bBot.x, bBot.y);
    g.strokePath();

    g.generateTexture('door', texW, texH);
    g.destroy();
}

function generateFurnitureTextures(scene) {
    generateIsoBox(scene, 'desk', TILE_W * 0.75, 10, 0xb8862e, 0xa07820, 0x886818);
    generateIsoBox(scene, 'chair', TILE_W * 0.35, 8, 0x505060, 0x404050, 0x353545);
    generatePlant(scene);
    generateIsoBox(scene, 'cooler', TILE_W * 0.3, 28, 0xc0dde8, 0xa0bdc8, 0x90adb8);
    generateIsoBox(scene, 'whiteboard', TILE_W * 0.65, 30, 0xf0f0f0, 0xd0d0d0, 0xc0c0c0);
    generateIsoBox(scene, 'coffee', TILE_W * 0.3, 20, 0x4a3020, 0x3a2418, 0x2e1c12);
    generateIsoBox(scene, 'bookshelf', TILE_W * 0.55, 28, 0x8b6914, 0x7a5a10, 0x685008);
    generateIsoBox(scene, 'couch', TILE_W * 0.65, 12, 0x6a4e8a, 0x5a3e7a, 0x4a2e6a);
    generateIsoBox(scene, 'filing', TILE_W * 0.35, 22, 0x808890, 0x707880, 0x606870);
    generateHighlight(scene);
}

function generateIsoBox(scene, key, baseW, boxH, topColor, leftColor, rightColor) {
    const g = scene.add.graphics();
    const baseH = baseW * (TILE_H / TILE_W); // isometric ratio
    const pad = 2;
    const texW = Math.ceil(baseW + pad);
    const texH = Math.ceil(baseH + boxH + pad);
    const cx = texW / 2;
    const hw = baseW / 2;
    const hh = baseH / 2;
    const oy = 1; // top offset

    // Top diamond
    const tTop =  { x: cx,      y: oy };
    const tRight = { x: cx + hw, y: oy + hh };
    const tBot =  { x: cx,      y: oy + baseH };
    const tLeft = { x: cx - hw,  y: oy + hh };

    // Base vertices (shifted down)
    const bRight = { x: cx + hw, y: oy + hh + boxH };
    const bBot =   { x: cx,      y: oy + baseH + boxH };
    const bLeft =  { x: cx - hw,  y: oy + hh + boxH };

    // Right face
    g.fillStyle(rightColor, 1);
    g.beginPath();
    g.moveTo(tBot.x, tBot.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(bRight.x, bRight.y);
    g.lineTo(bBot.x, bBot.y);
    g.closePath();
    g.fillPath();

    // Left face
    g.fillStyle(leftColor, 1);
    g.beginPath();
    g.moveTo(tLeft.x, tLeft.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(bBot.x, bBot.y);
    g.lineTo(bLeft.x, bLeft.y);
    g.closePath();
    g.fillPath();

    // Top face
    g.fillStyle(topColor, 1);
    g.beginPath();
    g.moveTo(tTop.x, tTop.y);
    g.lineTo(tRight.x, tRight.y);
    g.lineTo(tBot.x, tBot.y);
    g.lineTo(tLeft.x, tLeft.y);
    g.closePath();
    g.fillPath();

    g.generateTexture(key, texW, texH);
    g.destroy();
}

function generatePlant(scene) {
    const g = scene.add.graphics();
    const w = 32;
    const h = 40;

    // Pot (isometric-ish)
    g.fillStyle(0x8b4513, 1);
    g.fillRect(10, 24, 12, 14);
    g.fillStyle(0x7a3a10, 1);
    g.fillRect(8, 22, 16, 4);

    // Leaves
    g.fillStyle(0x228b22, 1);
    g.fillCircle(16, 14, 10);
    g.fillStyle(0x2ca02c, 1);
    g.fillCircle(12, 12, 6);
    g.fillCircle(20, 10, 6);
    g.fillStyle(0x32b032, 1);
    g.fillCircle(16, 6, 5);

    g.generateTexture('plant', w, h);
    g.destroy();
}

function generateHighlight(scene) {
    const w = TILE_W;
    const h = TILE_H;
    const cx = w / 2;
    const cy = h / 2;

    // Green (valid)
    const g = scene.add.graphics();
    g.fillStyle(0x44ff44, 0.3);
    g.beginPath();
    g.moveTo(cx, 0); g.lineTo(w, cy); g.lineTo(cx, h); g.lineTo(0, cy);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0x44ff44, 0.7);
    g.beginPath();
    g.moveTo(cx, 0); g.lineTo(w, cy); g.lineTo(cx, h); g.lineTo(0, cy);
    g.closePath();
    g.strokePath();
    g.generateTexture('highlight', w, h);
    g.destroy();

    // Red (invalid)
    const g2 = scene.add.graphics();
    g2.fillStyle(0xff4444, 0.25);
    g2.beginPath();
    g2.moveTo(cx, 0); g2.lineTo(w, cy); g2.lineTo(cx, h); g2.lineTo(0, cy);
    g2.closePath();
    g2.fillPath();
    g2.lineStyle(2, 0xff4444, 0.6);
    g2.beginPath();
    g2.moveTo(cx, 0); g2.lineTo(w, cy); g2.lineTo(cx, h); g2.lineTo(0, cy);
    g2.closePath();
    g2.strokePath();
    g2.generateTexture('highlight_red', w, h);
    g2.destroy();
}
