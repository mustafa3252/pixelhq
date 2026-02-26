export function findPath(grid, startCol, startRow, endCol, endRow, walkableFn) {
    const cols = grid[0].length;
    const rows = grid.length;

    if (!inBounds(endCol, endRow, cols, rows) || !walkableFn(endCol, endRow)) {
        return null;
    }

    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const key = (c, r) => `${c},${r}`;
    const start = key(startCol, startRow);
    const end = key(endCol, endRow);

    gScore.set(start, 0);
    fScore.set(start, heuristic(startCol, startRow, endCol, endRow));
    openSet.push({ col: startCol, row: startRow, f: fScore.get(start) });

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const currentKey = key(current.col, current.row);

        if (currentKey === end) {
            return reconstructPath(cameFrom, current.col, current.row, startCol, startRow);
        }

        closedSet.add(currentKey);

        const neighbors = [
            { col: current.col + 1, row: current.row },
            { col: current.col - 1, row: current.row },
            { col: current.col, row: current.row + 1 },
            { col: current.col, row: current.row - 1 },
        ];

        for (const neighbor of neighbors) {
            const nKey = key(neighbor.col, neighbor.row);
            if (closedSet.has(nKey)) continue;
            if (!inBounds(neighbor.col, neighbor.row, cols, rows)) continue;
            if (!walkableFn(neighbor.col, neighbor.row)) continue;

            const tentativeG = gScore.get(currentKey) + 1;
            if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
                cameFrom.set(nKey, { col: current.col, row: current.row });
                gScore.set(nKey, tentativeG);
                const f = tentativeG + heuristic(neighbor.col, neighbor.row, endCol, endRow);
                fScore.set(nKey, f);
                if (!openSet.find(n => key(n.col, n.row) === nKey)) {
                    openSet.push({ col: neighbor.col, row: neighbor.row, f });
                }
            }
        }
    }

    return null;
}

function heuristic(c1, r1, c2, r2) {
    return Math.abs(c1 - c2) + Math.abs(r1 - r2);
}

function inBounds(col, row, cols, rows) {
    return col >= 0 && col < cols && row >= 0 && row < rows;
}

function reconstructPath(cameFrom, endCol, endRow, startCol, startRow) {
    const path = [{ col: endCol, row: endRow }];
    let current = `${endCol},${endRow}`;
    const startKey = `${startCol},${startRow}`;

    while (current !== startKey && cameFrom.has(current)) {
        const prev = cameFrom.get(current);
        path.unshift(prev);
        current = `${prev.col},${prev.row}`;
    }

    return path;
}
