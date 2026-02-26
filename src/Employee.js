import { CHAR_SCALE, CHAR_FRAME_H, TILE_FLOOR, TILE_DOOR } from './config.js';
import { gridToScreen, getDepth } from './IsoUtils.js';
import { findPath } from './AStar.js';
import { POI } from './OfficeLayout.js';
import { ROLES } from './RoleData.js';

const STATE_IDLE = 'idle';
const STATE_WORKING = 'working';
const STATE_WALKING = 'walking';
const STATE_SOCIALIZING = 'socializing';
const STATE_TALKING = 'talking';

const CHAR_DISPLAY_H = CHAR_FRAME_H * CHAR_SCALE; // 24 * 2.5 = 60

export class Employee {
    constructor(scene, config) {
        this.scene = scene;
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.name = config.name;
        this.role = config.role;
        this.roleData = ROLES[config.role];
        this.textureKey = config.textureKey;

        this.gridCol = config.col;
        this.gridRow = config.row;
        this.deskCol = config.deskCol;
        this.deskRow = config.deskRow;

        this.state = STATE_IDLE;
        this.path = null;
        this.pathIndex = 0;
        this.moveTimer = 0;
        this.stateTimer = 0;
        this.stateDuration = 0;

        // Place character with feet at center of tile
        const pos = gridToScreen(this.gridCol, this.gridRow);
        this.sprite = scene.add.sprite(pos.x, pos.y, this.textureKey, 0);
        this.sprite.setScale(CHAR_SCALE);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setDepth(getDepth(this.gridCol, this.gridRow, 5));
        this.sprite.setInteractive({ useHandCursor: true });

        // Name label above character head
        this.nameLabel = scene.add.text(pos.x, pos.y - CHAR_DISPLAY_H - 6, this.name, {
            fontSize: '10px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
        });
        this.nameLabel.setOrigin(0.5, 1);
        this.nameLabel.setDepth(getDepth(this.gridCol, this.gridRow, 9));

        // Role badge below name
        this.roleBadge = scene.add.text(pos.x, pos.y - CHAR_DISPLAY_H + 6, this.roleData.title, {
            fontSize: '8px',
            fontFamily: 'monospace',
            color: '#ffdd44',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
        });
        this.roleBadge.setOrigin(0.5, 1);
        this.roleBadge.setDepth(getDepth(this.gridCol, this.gridRow, 9));

        this.createAnimations();
        this.startWorking();
    }

    createAnimations() {
        const key = this.textureKey;

        if (!this.scene.anims.exists(`${key}_idle`)) {
            this.scene.anims.create({
                key: `${key}_idle`,
                frames: [{ key, frame: 0 }],
                frameRate: 1,
                repeat: -1,
            });
            this.scene.anims.create({
                key: `${key}_walk`,
                frames: [{ key, frame: 1 }, { key, frame: 0 }, { key, frame: 2 }, { key, frame: 0 }],
                frameRate: 6,
                repeat: -1,
            });
            this.scene.anims.create({
                key: `${key}_work`,
                frames: [{ key, frame: 3 }, { key, frame: 4 }],
                frameRate: 3,
                repeat: -1,
            });
            this.scene.anims.create({
                key: `${key}_talk`,
                frames: [{ key, frame: 5 }, { key, frame: 0 }, { key, frame: 5 }],
                frameRate: 2,
                repeat: -1,
            });
        }
    }

    startWorking() {
        this.state = STATE_WORKING;
        this.sprite.play(`${this.textureKey}_work`);
        this.stateDuration = 5000 + Math.random() * 10000;
        this.stateTimer = 0;
    }

    startIdle() {
        this.state = STATE_IDLE;
        this.sprite.play(`${this.textureKey}_idle`);
        this.stateDuration = 2000 + Math.random() * 3000;
        this.stateTimer = 0;
    }

    startSocializing() {
        this.state = STATE_SOCIALIZING;
        this.sprite.play(`${this.textureKey}_idle`);
        this.stateDuration = 3000 + Math.random() * 5000;
        this.stateTimer = 0;
    }

    startTalkingToPlayer() {
        this.state = STATE_TALKING;
        this.sprite.play(`${this.textureKey}_talk`);
        this.path = null;
    }

    stopTalking() {
        this.startIdle();
    }

    walkTo(targetCol, targetRow) {
        const grid = this.scene.grid;
        const walkable = (c, r) => {
            if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
            const tile = grid[r][c];
            return tile === TILE_FLOOR || tile === TILE_DOOR;
        };

        const path = findPath(grid, this.gridCol, this.gridRow, targetCol, targetRow, walkable);
        if (path && path.length > 1) {
            this.state = STATE_WALKING;
            this.path = path;
            this.pathIndex = 1;
            this.moveTimer = 0;
            this.sprite.play(`${this.textureKey}_walk`);
            return true;
        }
        return false;
    }

    walkToRandomPOI() {
        const poi = POI[Math.floor(Math.random() * POI.length)];
        return this.walkTo(poi.col, poi.row);
    }

    walkToDesk() {
        if (this.deskCol !== undefined && this.deskRow !== undefined) {
            return this.walkTo(this.deskCol, this.deskRow);
        }
        return false;
    }

    update(time, delta) {
        if (this.state === STATE_TALKING) return;

        this.stateTimer += delta;

        if (this.state === STATE_WALKING) {
            this.updateWalking(delta);
        } else if (this.stateTimer >= this.stateDuration) {
            this.transitionState();
        }
    }

    updateWalking(delta) {
        this.moveTimer += delta;
        const moveSpeed = 150;

        if (this.moveTimer >= moveSpeed && this.path && this.pathIndex < this.path.length) {
            const next = this.path[this.pathIndex];
            this.gridCol = next.col;
            this.gridRow = next.row;
            this.pathIndex++;
            this.moveTimer = 0;

            const pos = gridToScreen(this.gridCol, this.gridRow);
            this.scene.tweens.add({
                targets: this.sprite,
                x: pos.x,
                y: pos.y,
                duration: moveSpeed * 0.9,
                ease: 'Linear',
            });
            this.scene.tweens.add({
                targets: this.nameLabel,
                x: pos.x,
                y: pos.y - CHAR_DISPLAY_H - 6,
                duration: moveSpeed * 0.9,
                ease: 'Linear',
            });
            this.scene.tweens.add({
                targets: this.roleBadge,
                x: pos.x,
                y: pos.y - CHAR_DISPLAY_H + 6,
                duration: moveSpeed * 0.9,
                ease: 'Linear',
            });
            this.sprite.setDepth(getDepth(this.gridCol, this.gridRow, 5));
            this.nameLabel.setDepth(getDepth(this.gridCol, this.gridRow, 9));
            this.roleBadge.setDepth(getDepth(this.gridCol, this.gridRow, 9));
        }

        if (this.pathIndex >= (this.path ? this.path.length : 0)) {
            this.path = null;
            if (this.gridCol === this.deskCol && this.gridRow === this.deskRow) {
                this.startWorking();
            } else {
                this.startSocializing();
            }
        }
    }

    transitionState() {
        switch (this.state) {
            case STATE_WORKING:
                if (Math.random() < 0.6) {
                    if (!this.walkToRandomPOI()) {
                        this.startIdle();
                    }
                } else {
                    this.startIdle();
                }
                break;
            case STATE_IDLE:
                if (Math.random() < 0.5) {
                    this.startWorking();
                } else if (Math.random() < 0.5) {
                    if (!this.walkToRandomPOI()) {
                        this.startWorking();
                    }
                } else {
                    if (!this.walkToDesk()) {
                        this.startWorking();
                    }
                }
                break;
            case STATE_SOCIALIZING:
                if (!this.walkToDesk()) {
                    this.startWorking();
                }
                break;
            default:
                this.startIdle();
        }
    }

    getDialogue() {
        const dialogues = this.roleData.dialogues;
        return dialogues[Math.floor(Math.random() * dialogues.length)];
    }

    destroy() {
        this.sprite.destroy();
        this.nameLabel.destroy();
        this.roleBadge.destroy();
    }
}
