import {
    TILE_EMPTY as _, TILE_FLOOR as F, TILE_WALL as W, TILE_DOOR as D,
    FURN_DESK, FURN_CHAIR, FURN_PLANT, FURN_COOLER,
    FURN_WHITEBOARD, FURN_COFFEE, FURN_BOOKSHELF, FURN_COUCH, FURN_FILING,
} from './config.js';

// 20 columns x 16 rows
export const DEFAULT_GRID = [
    //0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 0
    [_, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, _, _], // 1
    [_, W, F, F, F, F, W, F, F, F, F, W, F, F, F, F, F, W, _, _], // 2
    [_, W, F, F, F, F, W, F, F, F, F, W, F, F, F, F, F, W, _, _], // 3
    [_, W, F, F, F, F, W, F, F, F, F, W, F, F, F, F, F, W, _, _], // 4
    [_, W, F, F, F, F, W, F, F, F, F, W, F, F, F, F, F, W, _, _], // 5
    [_, W, W, D, W, W, W, W, D, W, W, W, W, D, W, W, W, W, _, _], // 6
    [_, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, _, _], // 7
    [_, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, _, _], // 8
    [_, W, F, F, F, F, F, F, F, F, F, F, F, F, F, F, F, W, _, _], // 9
    [_, W, W, D, W, W, W, W, W, W, W, W, W, W, W, W, W, W, _, _], // 10
    [_, W, F, F, F, F, F, F, W, _, _, _, _, _, _, _, _, _, _, _], // 11
    [_, W, F, F, F, F, F, F, W, _, _, _, _, _, _, _, _, _, _, _], // 12
    [_, W, F, F, F, F, F, F, W, _, _, _, _, _, _, _, _, _, _, _], // 13
    [_, W, W, W, W, W, W, W, W, _, _, _, _, _, _, _, _, _, _, _], // 14
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 15
];

export const ROOMS = [
    { id: 'ceo_office', name: "CEO's Office", minCol: 2, minRow: 2, maxCol: 5, maxRow: 5 },
    { id: 'cmo_office', name: "CMO's Office", minCol: 7, minRow: 2, maxCol: 10, maxRow: 5 },
    { id: 'reception', name: "Reception", minCol: 12, minRow: 2, maxCol: 16, maxRow: 5 },
    { id: 'common', name: "Common Area", minCol: 2, minRow: 7, maxCol: 16, maxRow: 9 },
    { id: 'coo_office', name: "COO's Office", minCol: 2, minRow: 11, maxCol: 7, maxRow: 13 },
];

export const DEFAULT_FURNITURE = [
    // CEO's Office
    { type: FURN_DESK, col: 3, row: 3 },
    { type: FURN_CHAIR, col: 4, row: 3 },
    { type: FURN_BOOKSHELF, col: 2, row: 2 },
    { type: FURN_PLANT, col: 5, row: 2 },

    // CMO's Office
    { type: FURN_DESK, col: 8, row: 3 },
    { type: FURN_CHAIR, col: 9, row: 3 },
    { type: FURN_WHITEBOARD, col: 7, row: 2 },
    { type: FURN_PLANT, col: 10, row: 5 },

    // Reception
    { type: FURN_DESK, col: 14, row: 3 },
    { type: FURN_CHAIR, col: 14, row: 4 },
    { type: FURN_COUCH, col: 12, row: 5 },
    { type: FURN_PLANT, col: 16, row: 2 },

    // Common Area
    { type: FURN_COOLER, col: 16, row: 7 },
    { type: FURN_COFFEE, col: 2, row: 7 },
    { type: FURN_COUCH, col: 6, row: 8 },
    { type: FURN_COUCH, col: 10, row: 8 },
    { type: FURN_PLANT, col: 8, row: 7 },
    { type: FURN_PLANT, col: 13, row: 9 },

    // COO's Office
    { type: FURN_DESK, col: 4, row: 12 },
    { type: FURN_CHAIR, col: 5, row: 12 },
    { type: FURN_FILING, col: 2, row: 11 },
    { type: FURN_BOOKSHELF, col: 7, row: 11 },
    { type: FURN_PLANT, col: 2, row: 13 },
];

export const DEFAULT_EMPLOYEES = [
    { role: 'ceo', name: 'Alexandra Chen', col: 4, row: 4, deskCol: 3, deskRow: 3 },
    { role: 'cmo', name: 'Marcus Rivera', col: 9, row: 4, deskCol: 8, deskRow: 3 },
    { role: 'coo', name: 'Priya Sharma', col: 5, row: 11, deskCol: 4, deskRow: 12 },
];

// Points of interest for idle behaviors
export const POI = [
    { type: 'cooler', col: 15, row: 7 },
    { type: 'coffee', col: 3, row: 7 },
    { type: 'couch', col: 6, row: 9 },
    { type: 'couch', col: 10, row: 9 },
    { type: 'hallway', col: 9, row: 8 },
    { type: 'hallway', col: 5, row: 9 },
    { type: 'hallway', col: 14, row: 7 },
];
