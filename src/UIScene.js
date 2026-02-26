import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config.js';
import { ROLES, HIRABLE_ROLES } from './RoleData.js';

const NAMES = [
    'Alex Kim', 'Jordan Lee', 'Sam Chen', 'Riley Park', 'Morgan Wu',
    'Casey Liu', 'Drew Patel', 'Quinn Jones', 'Avery Diaz', 'Blake Torres',
    'Charlie Huang', 'Devon Nakamura', 'Emery Singh', 'Frankie Gupta', 'Harper Tanaka',
    'Indigo Muller', 'Jamie Okafor', 'Kai Bergstrom', 'Logan Petrov', 'Noel Sato',
];

const UI_BG = 0x1e1e30;
const UI_BORDER = 0x3a3a5c;
const UI_ACCENT = 0x5588cc;
const UI_TEXT = '#e0e0f0';
const UI_TEXT_DIM = '#8888aa';
const UI_GOLD = '#ffdd44';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.dialoguePanel = null;
        this.hirePanel = null;
        this.buildPanel = null;
        this.selectedEmp = null;
    }

    create() {
        this.officeScene = this.scene.get('OfficeScene');

        // Bottom bar background
        this.bottomBar = this.add.rectangle(GAME_W / 2, GAME_H - 25, GAME_W, 50, UI_BG, 0.9);
        this.bottomBar.setDepth(100);

        // Money display
        this.moneyText = this.add.text(20, GAME_H - 38, `$${this.officeScene.money}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: UI_GOLD,
            stroke: '#000',
            strokeThickness: 2,
        }).setDepth(101);

        this.moneyLabel = this.add.text(20, GAME_H - 18, 'BUDGET', {
            fontSize: '9px',
            fontFamily: 'monospace',
            color: UI_TEXT_DIM,
        }).setDepth(101);

        // Employee count
        this.empCountText = this.add.text(140, GAME_H - 38, `${this.officeScene.employees.length}`, {
            fontSize: '18px',
            fontFamily: 'monospace',
            color: UI_TEXT,
            stroke: '#000',
            strokeThickness: 2,
        }).setDepth(101);

        this.empCountLabel = this.add.text(140, GAME_H - 18, 'STAFF', {
            fontSize: '9px',
            fontFamily: 'monospace',
            color: UI_TEXT_DIM,
        }).setDepth(101);

        // Buttons
        this.createButton(GAME_W - 280, GAME_H - 35, 'HIRE', UI_ACCENT, () => this.toggleHirePanel());
        this.createButton(GAME_W - 170, GAME_H - 35, 'BUILD', 0x55aa55, () => this.toggleBuildMode());
        this.buildModeIndicator = this.add.text(GAME_W - 170, GAME_H - 12, '', {
            fontSize: '8px', fontFamily: 'monospace', color: '#55ff55',
        }).setDepth(101).setOrigin(0.5, 0);

        // Title
        this.add.text(GAME_W / 2, 15, 'PIXELHQ', {
            fontSize: '20px',
            fontFamily: 'monospace',
            color: UI_GOLD,
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5, 0).setDepth(101);

        // Controls hint
        this.add.text(GAME_W / 2, 40, 'Arrow keys/WASD to pan | Scroll to zoom | Right-drag to pan | Click employees to chat', {
            fontSize: '9px',
            fontFamily: 'monospace',
            color: UI_TEXT_DIM,
        }).setOrigin(0.5, 0).setDepth(101);

        // Listen for events
        this.officeScene.events.on('employee-selected', (emp) => this.showDialogue(emp));
        this.officeScene.events.on('employee-deselected', () => this.hideDialogue());
        this.officeScene.events.on('build-mode-changed', (active) => this.onBuildModeChanged(active));
        this.officeScene.events.on('money-changed', (amount) => this.updateMoney(amount));
    }

    createButton(x, y, text, color, callback) {
        const btn = this.add.rectangle(x, y, 100, 30, color, 0.9)
            .setInteractive({ useHandCursor: true })
            .setDepth(101);

        const label = this.add.text(x, y, text, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 1,
        }).setOrigin(0.5, 0.5).setDepth(102);

        btn.on('pointerover', () => btn.setFillStyle(color, 1));
        btn.on('pointerout', () => btn.setFillStyle(color, 0.9));
        btn.on('pointerdown', callback);

        return { btn, label };
    }

    showDialogue(emp) {
        this.hideDialogue();
        this.hideHirePanel();
        this.selectedEmp = emp;

        const panelW = 350;
        const panelH = 200;
        const panelX = GAME_W - panelW - 20;
        const panelY = 60;

        this.dialoguePanel = this.add.container(panelX, panelY).setDepth(200);

        // Background
        const bg = this.add.rectangle(0, 0, panelW, panelH, UI_BG, 0.95)
            .setOrigin(0, 0);
        const border = this.add.rectangle(0, 0, panelW, panelH)
            .setOrigin(0, 0)
            .setStrokeStyle(2, UI_BORDER);

        // Header bar
        const header = this.add.rectangle(0, 0, panelW, 35, UI_ACCENT, 0.8)
            .setOrigin(0, 0);

        // Name and role
        const nameText = this.add.text(10, 8, emp.name, {
            fontSize: '14px', fontFamily: 'monospace', color: '#ffffff',
            fontStyle: 'bold',
        });

        const roleText = this.add.text(panelW - 10, 8, emp.roleData.fullTitle, {
            fontSize: '10px', fontFamily: 'monospace', color: UI_GOLD,
        }).setOrigin(1, 0);

        // Dialogue bubble
        const dialogue = emp.getDialogue();
        const bubbleBg = this.add.rectangle(15, 50, panelW - 30, 90, 0x2a2a44, 0.8)
            .setOrigin(0, 0);

        const dialogueText = this.add.text(25, 58, `"${dialogue}"`, {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: UI_TEXT,
            wordWrap: { width: panelW - 60 },
            lineSpacing: 4,
        });

        // Close button
        const closeBtn = this.add.text(panelW - 25, 45, 'X', {
            fontSize: '14px', fontFamily: 'monospace', color: '#ff6666',
        }).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.officeScene.deselectEmployee();
            });

        // "Talk again" button
        const talkBtn = this.add.rectangle(panelW / 2, panelH - 30, 120, 28, UI_ACCENT, 0.8)
            .setInteractive({ useHandCursor: true });
        const talkLabel = this.add.text(panelW / 2, panelH - 30, 'Talk Again', {
            fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
        }).setOrigin(0.5);

        talkBtn.on('pointerdown', () => {
            const newDialogue = emp.getDialogue();
            dialogueText.setText(`"${newDialogue}"`);
        });

        this.dialoguePanel.add([bg, border, header, nameText, roleText, bubbleBg, dialogueText, closeBtn, talkBtn, talkLabel]);
    }

    hideDialogue() {
        if (this.dialoguePanel) {
            this.dialoguePanel.destroy();
            this.dialoguePanel = null;
        }
        this.selectedEmp = null;
    }

    toggleHirePanel() {
        if (this.hirePanel) {
            this.hideHirePanel();
        } else {
            this.showHirePanel();
        }
    }

    showHirePanel() {
        this.hideHirePanel();
        this.hideDialogue();
        if (this.officeScene.buildMode) {
            this.officeScene.toggleBuildMode();
        }

        const panelW = 300;
        const panelH = 320;
        const panelX = (GAME_W - panelW) / 2;
        const panelY = (GAME_H - panelH) / 2 - 30;

        this.hirePanel = this.add.container(panelX, panelY).setDepth(300);

        // Dim background
        const dimBg = this.add.rectangle(-panelX, -panelY, GAME_W, GAME_H, 0x000000, 0.4)
            .setOrigin(0, 0)
            .setInteractive();

        const bg = this.add.rectangle(0, 0, panelW, panelH, UI_BG, 0.98)
            .setOrigin(0, 0);
        const border = this.add.rectangle(0, 0, panelW, panelH)
            .setOrigin(0, 0)
            .setStrokeStyle(2, UI_BORDER);

        const header = this.add.rectangle(0, 0, panelW, 35, UI_ACCENT, 0.8)
            .setOrigin(0, 0);
        const title = this.add.text(panelW / 2, 8, 'HIRE NEW STAFF', {
            fontSize: '14px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5, 0);

        const closeBtn = this.add.text(panelW - 25, 8, 'X', {
            fontSize: '14px', fontFamily: 'monospace', color: '#ff6666',
        }).setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.hideHirePanel());

        this.hirePanel.add([dimBg, bg, border, header, title, closeBtn]);

        let yOffset = 50;
        HIRABLE_ROLES.forEach(roleKey => {
            const role = ROLES[roleKey];
            const rowBg = this.add.rectangle(10, yOffset, panelW - 20, 45, 0x2a2a44, 0.6)
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true });

            const roleName = this.add.text(20, yOffset + 6, role.fullTitle, {
                fontSize: '12px', fontFamily: 'monospace', color: UI_TEXT,
            });
            const roleDesc = this.add.text(20, yOffset + 22, role.description, {
                fontSize: '9px', fontFamily: 'monospace', color: UI_TEXT_DIM,
            });
            const cost = this.add.text(panelW - 20, yOffset + 12, `$${role.hireCost}`, {
                fontSize: '13px', fontFamily: 'monospace', color: UI_GOLD,
            }).setOrigin(1, 0);

            rowBg.on('pointerover', () => rowBg.setFillStyle(0x3a3a5c, 0.8));
            rowBg.on('pointerout', () => rowBg.setFillStyle(0x2a2a44, 0.6));
            rowBg.on('pointerdown', () => {
                const name = NAMES[Math.floor(Math.random() * NAMES.length)];
                const hired = this.officeScene.hireEmployee(roleKey, name);
                if (hired) {
                    this.updateMoney(this.officeScene.money);
                    this.updateEmployeeCount();
                    this.hideHirePanel();
                    this.showToast(`Hired ${name} as ${role.title}!`);
                } else {
                    if (this.officeScene.money < role.hireCost) {
                        this.showToast('Not enough budget!');
                    } else {
                        this.showToast('No empty desk available! Build more desks first.');
                    }
                }
            });

            this.hirePanel.add([rowBg, roleName, roleDesc, cost]);
            yOffset += 52;
        });
    }

    hideHirePanel() {
        if (this.hirePanel) {
            this.hirePanel.destroy();
            this.hirePanel = null;
        }
    }

    toggleBuildMode() {
        this.officeScene.toggleBuildMode();
    }

    onBuildModeChanged(active) {
        this.buildModeIndicator.setText(active ? 'ACTIVE' : '');
        if (active) {
            this.hideDialogue();
            this.hideHirePanel();
            this.showBuildPanel();
        } else {
            this.hideBuildPanel();
        }
    }

    showBuildPanel() {
        this.hideBuildPanel();

        const panelW = 140;
        const tools = [
            { key: 'floor', label: 'Floor', cost: 50 },
            { key: 'wall', label: 'Wall', cost: 75 },
            { key: 'door', label: 'Door', cost: 100 },
            { key: 'desk', label: 'Desk', cost: 150 },
            { key: 'chair', label: 'Chair', cost: 50 },
            { key: 'plant', label: 'Plant', cost: 30 },
            { key: 'cooler', label: 'Cooler', cost: 100 },
            { key: 'coffee', label: 'Coffee', cost: 120 },
            { key: 'whiteboard', label: 'Board', cost: 80 },
            { key: 'bookshelf', label: 'Shelf', cost: 60 },
            { key: 'couch', label: 'Couch', cost: 100 },
            { key: 'filing', label: 'Filing', cost: 40 },
        ];

        const panelH = tools.length * 30 + 45;
        this.buildPanel = this.add.container(10, 60).setDepth(200);

        const bg = this.add.rectangle(0, 0, panelW, panelH, UI_BG, 0.95)
            .setOrigin(0, 0);
        const border = this.add.rectangle(0, 0, panelW, panelH)
            .setOrigin(0, 0)
            .setStrokeStyle(2, UI_BORDER);

        const header = this.add.rectangle(0, 0, panelW, 30, 0x55aa55, 0.8)
            .setOrigin(0, 0);
        const title = this.add.text(panelW / 2, 6, 'BUILD', {
            fontSize: '12px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5, 0);

        this.buildPanel.add([bg, border, header, title]);

        let yOffset = 38;
        const btns = [];
        tools.forEach(tool => {
            const toolBg = this.add.rectangle(5, yOffset, panelW - 10, 26, 0x2a2a44, 0.6)
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(10, yOffset + 5, tool.label, {
                fontSize: '10px', fontFamily: 'monospace', color: UI_TEXT,
            });
            const cost = this.add.text(panelW - 10, yOffset + 5, `$${tool.cost}`, {
                fontSize: '10px', fontFamily: 'monospace', color: UI_GOLD,
            }).setOrigin(1, 0);

            toolBg.on('pointerover', () => toolBg.setFillStyle(0x3a3a5c, 0.8));
            toolBg.on('pointerout', () => {
                const isActive = this.officeScene.buildTool === tool.key;
                toolBg.setFillStyle(isActive ? 0x446644 : 0x2a2a44, isActive ? 0.8 : 0.6);
            });
            toolBg.on('pointerdown', () => {
                this.officeScene.setBuildTool(tool.key);
                btns.forEach(b => b.bg.setFillStyle(0x2a2a44, 0.6));
                toolBg.setFillStyle(0x446644, 0.8);
            });

            btns.push({ bg: toolBg, key: tool.key });
            this.buildPanel.add([toolBg, label, cost]);
            yOffset += 30;
        });

        // Highlight default tool
        btns[0].bg.setFillStyle(0x446644, 0.8);
    }

    hideBuildPanel() {
        if (this.buildPanel) {
            this.buildPanel.destroy();
            this.buildPanel = null;
        }
    }

    updateMoney(amount) {
        this.moneyText.setText(`$${amount}`);
    }

    updateEmployeeCount() {
        this.empCountText.setText(`${this.officeScene.employees.length}`);
    }

    showToast(message) {
        const toast = this.add.text(GAME_W / 2, GAME_H - 80, message, {
            fontSize: '13px',
            fontFamily: 'monospace',
            color: '#ffffff',
            backgroundColor: '#333355',
            padding: { x: 12, y: 6 },
            stroke: '#000',
            strokeThickness: 1,
        }).setOrigin(0.5).setDepth(500);

        this.tweens.add({
            targets: toast,
            alpha: 0,
            y: GAME_H - 120,
            duration: 2000,
            delay: 1000,
            onComplete: () => toast.destroy(),
        });
    }

    update() {
        // Keep money display updated
        if (this.officeScene) {
            this.moneyText.setText(`$${this.officeScene.money}`);
            this.empCountText.setText(`${this.officeScene.employees.length}`);
        }
    }
}
