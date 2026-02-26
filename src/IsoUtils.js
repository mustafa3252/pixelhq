import { TILE_W, TILE_H, ORIGIN_X, ORIGIN_Y } from './config.js';

export function gridToScreen(col, row) {
    return {
        x: (col - row) * (TILE_W / 2) + ORIGIN_X,
        y: (col + row) * (TILE_H / 2) + ORIGIN_Y
    };
}

export function screenToGrid(screenX, screenY) {
    const sx = screenX - ORIGIN_X;
    const sy = screenY - ORIGIN_Y;
    const col = Math.floor((sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2);
    const row = Math.floor((sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2);
    return { col, row };
}

export function getDepth(col, row, offset = 0) {
    return (col + row) * 10 + offset;
}
