import Phaser from 'phaser';
import {
    TILE_W, TILE_H, WALL_H,
    TILE_EMPTY, TILE_FLOOR, TILE_WALL, TILE_DOOR,
    GRID_COLS, GRID_ROWS,
} from './config.js';
import { gridToScreen, screenToGrid, getDepth } from './IsoUtils.js';
import { generateTileTextures } from './TileRenderer.js';
import { generateCharacterTraits, createCharacterTexture } from './CharacterGen.js';
import { Employee } from './Employee.js';
import { DEFAULT_GRID, DEFAULT_FURNITURE, DEFAULT_EMPLOYEES, ROOMS } from './OfficeLayout.js';
import { ROLES } from './RoleData.js';

const DOOR_H = Math.floor(WALL_H * 0.45);

const FURNITURE_BOX_H = {
    desk: 10, chair: 8, cooler: 28, whiteboard: 30,
    coffee: 20, bookshelf: 28, couch: 12, filing: 22,
    plant: 16,
};

export class OfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OfficeScene' });
        this.employees = [];
        this.tileSprites = [];
        this.furnitureSprites = [];
        this.grid = [];
        this.furnitureGrid = [];
        this.buildMode = false;
        this.buildTool = 'floor';
        this.highlightSprite = null;
        this.money = 5000;
        this.selectedEmployee = null;
    }

    create() {
        // Deep copy grid
        this.grid = DEFAULT_GRID.map(row => [...row]);

        // Furniture occupancy grid
        this.furnitureGrid = Array.from({ length: GRID_ROWS }, () =>
            Array.from({ length: GRID_COLS }, () => null)
        );

        // Generate all textures
        generateTileTextures(this);

        // Render world
        this.renderGrid();
        this.placeFurniture();
        this.spawnDefaultEmployees();

        // Camera setup
        this.cameras.main.setBackgroundColor(0x1a1a2e);

        // Camera panning with keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Camera panning with mouse drag
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && pointer.button === 2) {
                this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x);
                this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y);
            }
        });

        // Right click context
        this.input.mouse.disableContextMenu();

        // Mouse wheel zoom
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            const cam = this.cameras.main;
            const newZoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, 0.5, 2.0);
            cam.setZoom(newZoom);
        });

        // Click handling
        this.input.on('pointerdown', (pointer) => {
            if (pointer.button !== 0) return;
            if (this.buildMode) {
                this.handleBuildClick(pointer);
            }
        });

        // Hover for build mode
        this.highlightSprite = this.add.sprite(0, 0, 'highlight');
        this.highlightSprite.setOrigin(0.5, 0.5);
        this.highlightSprite.setVisible(false);
        this.highlightSprite.setDepth(9999);

        this.input.on('pointermove', (pointer) => {
            if (!this.buildMode) {
                this.highlightSprite.setVisible(false);
                return;
            }
            const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
            const gridPos = screenToGrid(worldPoint.x, worldPoint.y);
            if (this.isValidBuildPosition(gridPos.col, gridPos.row)) {
                const screenPos = gridToScreen(gridPos.col, gridPos.row);
                this.highlightSprite.setPosition(screenPos.x, screenPos.y);
                this.highlightSprite.setTexture('highlight');
                this.highlightSprite.setVisible(true);
            } else if (gridPos.col >= 0 && gridPos.col < GRID_COLS && gridPos.row >= 0 && gridPos.row < GRID_ROWS) {
                const screenPos = gridToScreen(gridPos.col, gridPos.row);
                this.highlightSprite.setPosition(screenPos.x, screenPos.y);
                this.highlightSprite.setTexture('highlight_red');
                this.highlightSprite.setVisible(true);
            } else {
                this.highlightSprite.setVisible(false);
            }
        });

        // Launch UI scene
        this.scene.launch('UIScene');
    }

    renderGrid() {
        // Clear existing
        this.tileSprites.forEach(s => s.destroy());
        this.tileSprites = [];

        for (let row = 0; row < this.grid.length; row++) {
            for (let col = 0; col < this.grid[row].length; col++) {
                const tile = this.grid[row][col];
                if (tile === TILE_EMPTY) continue;

                const pos = gridToScreen(col, row);

                if (tile === TILE_FLOOR || tile === TILE_DOOR) {
                    const floorKey = (col + row) % 2 === 0 ? 'floor1' : 'floor2';
                    const floorSprite = this.add.sprite(pos.x, pos.y, floorKey);
                    floorSprite.setOrigin(0.5, 0.5);
                    floorSprite.setDepth(getDepth(col, row, 0));
                    this.tileSprites.push(floorSprite);
                }

                if (tile === TILE_WALL) {
                    // Floor under wall
                    const floorSprite = this.add.sprite(pos.x, pos.y, 'floor1');
                    floorSprite.setOrigin(0.5, 0.5);
                    floorSprite.setDepth(getDepth(col, row, 0));
                    this.tileSprites.push(floorSprite);

                    // Wall block
                    const wallSprite = this.add.sprite(pos.x, pos.y - WALL_H / 2, 'wall');
                    wallSprite.setOrigin(0.5, 0.5);
                    wallSprite.setDepth(getDepth(col, row, 3));
                    this.tileSprites.push(wallSprite);
                }

                if (tile === TILE_DOOR) {
                    const doorSprite = this.add.sprite(pos.x, pos.y - DOOR_H / 2, 'door');
                    doorSprite.setOrigin(0.5, 0.5);
                    doorSprite.setDepth(getDepth(col, row, 2));
                    this.tileSprites.push(doorSprite);
                }
            }
        }
    }

    placeFurniture() {
        this.furnitureSprites.forEach(s => s.destroy());
        this.furnitureSprites = [];

        DEFAULT_FURNITURE.forEach(f => {
            this.addFurniture(f.type, f.col, f.row);
        });
    }

    addFurniture(type, col, row) {
        const pos = gridToScreen(col, row);
        const boxH = FURNITURE_BOX_H[type] || 10;
        const sprite = this.add.sprite(pos.x, pos.y - boxH / 2, type);
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(getDepth(col, row, 4));
        this.furnitureSprites.push(sprite);
        this.furnitureGrid[row][col] = type;
        return sprite;
    }

    spawnDefaultEmployees() {
        DEFAULT_EMPLOYEES.forEach(empData => {
            const traits = generateCharacterTraits();
            const texKey = createCharacterTexture(this, traits);
            const emp = new Employee(this, {
                ...empData,
                textureKey: texKey,
            });
            this.employees.push(emp);

            // Click handler
            emp.sprite.on('pointerdown', (pointer) => {
                if (pointer.button !== 0) return;
                if (this.buildMode) return;
                this.selectEmployee(emp);
            });
        });
    }

    hireEmployee(role, name) {
        const roleData = ROLES[role];
        if (!roleData) return null;
        if (this.money < roleData.hireCost) return null;

        this.money -= roleData.hireCost;

        // Find an empty desk
        const deskSpot = this.findEmptyDesk();
        if (!deskSpot) return null;

        const traits = generateCharacterTraits();
        const texKey = createCharacterTexture(this, traits);
        const emp = new Employee(this, {
            name,
            role,
            textureKey: texKey,
            col: deskSpot.col,
            row: deskSpot.row,
            deskCol: deskSpot.col,
            deskRow: deskSpot.row,
        });
        this.employees.push(emp);

        emp.sprite.on('pointerdown', (pointer) => {
            if (pointer.button !== 0) return;
            if (this.buildMode) return;
            this.selectEmployee(emp);
        });

        return emp;
    }

    findEmptyDesk() {
        // Find desk furniture tiles that don't have an employee
        for (let row = 0; row < this.furnitureGrid.length; row++) {
            for (let col = 0; col < this.furnitureGrid[row].length; col++) {
                if (this.furnitureGrid[row][col] === 'desk') {
                    // Check if any employee has this as their desk
                    const occupied = this.employees.some(e => e.deskCol === col && e.deskRow === row);
                    if (!occupied) {
                        // Find adjacent walkable tile
                        const adjacent = [
                            { col: col + 1, row },
                            { col: col - 1, row },
                            { col, row: row + 1 },
                            { col, row: row - 1 },
                        ];
                        for (const adj of adjacent) {
                            if (adj.row >= 0 && adj.row < this.grid.length &&
                                adj.col >= 0 && adj.col < this.grid[0].length) {
                                const tile = this.grid[adj.row][adj.col];
                                if (tile === TILE_FLOOR || tile === TILE_DOOR) {
                                    return { col: adj.col, row: adj.row, deskCol: col, deskRow: row };
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    selectEmployee(emp) {
        if (this.selectedEmployee) {
            this.selectedEmployee.stopTalking();
        }
        this.selectedEmployee = emp;
        emp.startTalkingToPlayer();
        this.events.emit('employee-selected', emp);
    }

    deselectEmployee() {
        if (this.selectedEmployee) {
            this.selectedEmployee.stopTalking();
            this.selectedEmployee = null;
        }
        this.events.emit('employee-deselected');
    }

    toggleBuildMode() {
        this.buildMode = !this.buildMode;
        if (!this.buildMode) {
            this.highlightSprite.setVisible(false);
        }
        if (this.selectedEmployee) {
            this.deselectEmployee();
        }
        this.events.emit('build-mode-changed', this.buildMode);
    }

    setBuildTool(tool) {
        this.buildTool = tool;
    }

    isValidBuildPosition(col, row) {
        if (row < 0 || row >= this.grid.length || col < 0 || col >= this.grid[0].length) return false;

        if (this.buildTool === 'floor' || this.buildTool === 'door') {
            if (this.grid[row][col] !== TILE_EMPTY) return false;
            // Must be adjacent to existing non-empty tile
            const neighbors = [
                [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
            ];
            return neighbors.some(([r, c]) => {
                if (r < 0 || r >= this.grid.length || c < 0 || c >= this.grid[0].length) return false;
                return this.grid[r][c] !== TILE_EMPTY;
            });
        }

        if (this.buildTool === 'wall') {
            if (this.grid[row][col] !== TILE_EMPTY) return false;
            const neighbors = [
                [row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]
            ];
            return neighbors.some(([r, c]) => {
                if (r < 0 || r >= this.grid.length || c < 0 || c >= this.grid[0].length) return false;
                return this.grid[r][c] !== TILE_EMPTY;
            });
        }

        // Furniture: must be on floor tile
        if (this.grid[row][col] === TILE_FLOOR && !this.furnitureGrid[row][col]) {
            return true;
        }

        return false;
    }

    handleBuildClick(pointer) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const gridPos = screenToGrid(worldPoint.x, worldPoint.y);
        const { col, row } = gridPos;

        if (!this.isValidBuildPosition(col, row)) return;

        const cost = this.getBuildCost(this.buildTool);
        if (this.money < cost) return;

        this.money -= cost;

        if (this.buildTool === 'floor') {
            this.grid[row][col] = TILE_FLOOR;
        } else if (this.buildTool === 'wall') {
            this.grid[row][col] = TILE_WALL;
        } else if (this.buildTool === 'door') {
            this.grid[row][col] = TILE_DOOR;
        } else {
            // Furniture
            this.addFurniture(this.buildTool, col, row);
        }

        this.renderGrid();
        this.events.emit('money-changed', this.money);
    }

    getBuildCost(tool) {
        const costs = {
            floor: 50,
            wall: 75,
            door: 100,
            desk: 150,
            chair: 50,
            plant: 30,
            cooler: 100,
            whiteboard: 80,
            coffee: 120,
            bookshelf: 60,
            couch: 100,
            filing: 40,
        };
        return costs[tool] || 50;
    }

    update(time, delta) {
        // Camera movement
        const camSpeed = 5;
        if (this.cursors.left.isDown || this.wasd.a.isDown) {
            this.cameras.main.scrollX -= camSpeed;
        }
        if (this.cursors.right.isDown || this.wasd.d.isDown) {
            this.cameras.main.scrollX += camSpeed;
        }
        if (this.cursors.up.isDown || this.wasd.w.isDown) {
            this.cameras.main.scrollY -= camSpeed;
        }
        if (this.cursors.down.isDown || this.wasd.s.isDown) {
            this.cameras.main.scrollY += camSpeed;
        }

        // Update employees
        this.employees.forEach(emp => emp.update(time, delta));
    }
}
