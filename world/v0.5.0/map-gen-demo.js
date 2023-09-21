(function () {
    'use strict';

    const getFalse = () => false;
    const isString = (value) => typeof value === 'string';

    // forIn(properties.dataset, (value, key) => {
    //   element.dataset[key] = value;
    // });
    function assignProperties(element, properties) {
        for (const propertyName in properties) {
            if (propertyName === 'style') {
                Object.assign(element.style, properties.style);
            }
            else if (propertyName in element) {
                element[propertyName] = properties[propertyName];
            }
            else {
                element.setAttribute(propertyName, properties[propertyName]);
            }
        }
    }
    const updateDomNode = (element, ...settings) => {
        for (const setting of settings) {
            if (Array.isArray(setting)) {
                element.append(...setting);
            }
            else if (isString(setting)) {
                element.innerText = setting;
            }
            else {
                assignProperties(element, setting);
            }
        }
    };
    const createElementDomNode = (tagName, ...settings) => {
        const element = document.createElement(tagName);
        updateDomNode(element, ...settings);
        return element;
    };
    const createFragmentDomNode = (children) => {
        const fragment = document.createDocumentFragment();
        fragment.append(...children);
        return fragment;
    };
    const createDomNode = (...settings) => {
        const [arg0, ...rest] = settings;
        if (isString(arg0)) {
            return createElementDomNode(arg0, ...rest);
        }
        return createFragmentDomNode(settings);
    };
    const $ = createDomNode;

    // https://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-url-with-javascript-without-page-r
    const getLocationHash = () => location.hash.slice(1);

    const directions = {
        NORTH: [0, -1],
        NORTH_EAST: [1, -1],
        EAST: [1, 0],
        SOUTH_EAST: [1, 1],
        SOUTH: [0, 1],
        SOUTH_WEST: [-1, 1],
        WEST: [-1, 0],
        NORTH_WEST: [-1, -1]
    };
    class Direction {
        static $(name) {
            const [dx, dy] = directions[name];
            return new Direction(name, dx, dy);
        }
        constructor(name, dx, dy) {
            this.name = name;
            this.dx = dx;
            this.dy = dy;
            this.isAxial = dx === 0 || dy === 0;
            this.offset = [dx, dy];
            const directions = this.isAxial ? Direction.axial : Direction.diagonal;
            directions.push(this);
            Direction.members.push(this);
        }
    }
    Direction.members = [];
    Direction.axial = [];
    Direction.diagonal = [];
    Direction.NORTH = Direction.$('NORTH');
    Direction.NORTH_EAST = Direction.$('NORTH_EAST');
    Direction.EAST = Direction.$('EAST');
    Direction.SOUTH_EAST = Direction.$('SOUTH_EAST');
    Direction.SOUTH = Direction.$('SOUTH');
    Direction.SOUTH_WEST = Direction.$('SOUTH_WEST');
    Direction.WEST = Direction.$('WEST');
    Direction.NORTH_WEST = Direction.$('NORTH_WEST');
    Direction.fromCoordinates = (x1, y1, x2, y2) => Direction.fromOffsets(x2 - x1, y2 - y1);
    Direction.fromOffsets = (dx, dy) => Direction.members.find(direction => direction.dx === dx && direction.dy === dy) || null;

    const getIndexByPosition = (x, y, width) => y * width + x;
    function getCyclicCoordinate(coordinate, side) {
        let cyclicCoordinate = coordinate % side;
        if (cyclicCoordinate < 0) {
            cyclicCoordinate += side;
        }
        // avoid negative zero
        return ~~cyclicCoordinate;
    }
    const getCyclicPosition = (x, y, width, height) => [
        getCyclicCoordinate(x, width),
        getCyclicCoordinate(y, height)
    ];
    const getPositionByIndex = (index, width) => [
        index % width,
        Math.floor(index / width)
    ];
    function getOffset(start, end, side) {
        const offset = end - start;
        const maxOffset = side / 2;
        if (Math.abs(offset) <= maxOffset) {
            return offset;
        }
        if (offset > 0) {
            return offset - side;
        }
        return side + offset;
    }
    function getAllRelativeOffsets(maxOctileRadius) {
        const maxOffset = Math.floor(maxOctileRadius / octileDistance.AXIAL_MOVE_COST);
        const allOffsets = [];
        const maxIndex = maxOctileRadius - 2;
        for (let y = -maxOffset; y <= maxOffset; y++) {
            for (let x = -maxOffset; x <= maxOffset; x++) {
                if (x === 0 && y === 0) {
                    continue;
                }
                const distance = octileDistance(0, 0, x, y);
                const position = [x, y];
                for (let i = distance - 2; i <= maxIndex; i++) {
                    const radiusOffsets = allOffsets[i];
                    if (radiusOffsets) {
                        radiusOffsets.push(position);
                    }
                    else {
                        allOffsets[i] = [position];
                    }
                }
            }
        }
        return allOffsets;
    }
    octileDistance.DIAGONAL_MOVE_COST = 3;
    octileDistance.AXIAL_MOVE_COST = 2;
    const octileDistanceByOffsets = (dx, dy) => octileDistance.DIAGONAL_MOVE_COST * Math.min(dx, dy) +
        octileDistance.AXIAL_MOVE_COST * Math.abs(dx - dy);
    function octileDistance(x1, y1, x2, y2) {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return octileDistanceByOffsets(dx, dy);
    }
    const ALL_OFFSETS = getAllRelativeOffsets(7);
    ALL_OFFSETS[5];

    function generateArray(length, createItem) {
        const array = [];
        for (let i = 0; i < length; i++) {
            const item = createItem(i);
            array.push(item);
        }
        return array;
    }
    // immutable sorting
    const sort = (array, compare) => array.slice().sort(compare);
    const removeByIndex = (array, index) => {
        array.splice(index, 1);
    };

    /**
     *
     * @param min
     * @param max
     * @param value [0,1)
     */
    const normalizeToInt = (min, max, value) => Math.floor((min + (max - min + 1) * value));
    const randomInt = (min, max) => normalizeToInt(min, max, Math.random());
    const PI2 = 2 * Math.PI;

    // https://en.wikipedia.org/wiki/Linear_congruential_generator
    const m = Math.pow(2, 32);
    const a = 1664525;
    const c = 1013904223;
    class SeedRandom {
        constructor(seed = SeedRandom.getDefaultSeed()) {
            this.seed = seed;
        }
        next() {
            this.seed = (a * this.seed + c) % m;
            return this.seed / m;
        }
        // TODO: reuse normalization logic (?)
        nextFloat(min, max) {
            const next = this.next();
            return min + (max - min) * next;
        }
        nextInt(a, b) {
            if (arguments.length === 1) {
                return this.nextInt(0, a);
            }
            const next = this.next();
            return normalizeToInt(a, b, next);
        }
        nextBoolean(threshold = 0.5) {
            return this.next() < threshold;
        }
    }
    SeedRandom.getDefaultSeed = () => randomInt(0, m);

    const dotProduct = ([x1, y1], [x2, y2]) => x1 * x2 + y1 * y2;
    const ease = (x) => (6 * Math.pow(x, 2) - 15 * x + 10) * Math.pow(x, 3);
    const interpolate = (a, b, t) => a + ease(t) * (b - a);
    const fromPolar = (length, angle) => [
        length * Math.cos(angle),
        length * Math.sin(angle)
    ];
    const getUnitVector = (angle) => fromPolar(1, angle);

    // return -1 < n < 1
    // including bounds or not?
    const noise = (x, y, getGradient) => {
        // cell coordinates
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);
        // relative coordinates inside cell (0, 0) < (x, y) < (1, 1)
        const ux = x - x0;
        const uy = y - y0;
        const dotTopLeft = dotProduct([ux, uy], getGradient(x0, y0));
        const dotTopRight = dotProduct([ux - 1, uy], getGradient(x0 + 1, y0));
        const dotBottomRight = dotProduct([ux - 1, uy - 1], getGradient(x0 + 1, y0 + 1));
        const dotBottomLeft = dotProduct([ux, uy - 1], getGradient(x0, y0 + 1));
        const x1 = interpolate(dotTopLeft, dotTopRight, ux);
        const x2 = interpolate(dotBottomLeft, dotBottomRight, ux);
        return interpolate(x1, x2, uy);
    };
    const createNoiseGenerator = (width, height, period, seed) => {
        const horizontalCells = Math.ceil(width / period) + 1;
        const verticalCells = Math.ceil(height / period) + 1;
        const random = new SeedRandom(seed);
        const gradients = generateArray(horizontalCells * verticalCells, () => {
            const angle = random.nextFloat(0, PI2);
            return getUnitVector(angle);
        });
        const getGradient = (x, y) => {
            const index = getIndexByPosition(x, y, horizontalCells);
            return gradients[index];
        };
        return (x, y) => 0.5 + 0.5 * noise(x / period, y / period, getGradient);
    };

    const formatHex = (number, length) => {
        const hex = number.toString(16);
        const leadingZeros = length - hex.length;
        return '0'.repeat(leadingZeros) + hex;
    };

    class GeometryGrid {
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        getPosition(x, y) {
            return getCyclicPosition(x, y, this.width, this.height);
        }
        getPositionByIndex(index) {
            return getPositionByIndex(index, this.width);
        }
        getIndexesByPositions(positions) {
            return positions.map(([x, y]) => this.getIndexByPosition(x, y));
        }
        getIndexByPosition(x, y) {
            return getIndexByPosition(x, y, this.width);
        }
        getOffsets(from, to) {
            const [fromX, fromY] = from;
            const [toX, toY] = to;
            return [
                getOffset(fromX, toX, this.width),
                getOffset(fromY, toY, this.height)
            ];
        }
        getCirclePositions(x0, y0, octileRadius) {
            const maxOffset = Math.floor(octileRadius / octileDistance.AXIAL_MOVE_COST);
            const positions = [];
            for (let dy = -maxOffset; dy <= maxOffset; dy++) {
                for (let dx = -maxOffset; dx <= maxOffset; dx++) {
                    const position = this.getPosition(x0 + dx, y0 + dy);
                    const [x, y] = position;
                    const distance = this.getOctileDistance(x, y, x0, y0);
                    if (distance <= octileRadius) {
                        positions.push(position);
                    }
                }
            }
            const p0 = [x0, y0];
            return positions.sort((pa, pb) => this.comparePositions(p0, pa, pb));
        }
        /*
         * Part of https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
         * implement more general algorithm
         */
        getNextLinePosition(from, to) {
            const [dx, dy] = this.getOffsets(from, to);
            const sx = Math.sign(dx);
            const sy = Math.sign(dy);
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            let err = absDx - absDy;
            let [nextX, nextY] = from;
            const e2 = 2 * err;
            if (e2 > -absDy) {
                err -= absDy;
                nextX += sx;
            }
            if (e2 < absDx) {
                err += absDx;
                nextY += sy;
            }
            return [nextX, nextY];
        }
        comparePositions(p0, pa, pb) {
            const [dxa, dya] = this.getOffsets(p0, pa);
            const [dxb, dyb] = this.getOffsets(p0, pb);
            const da = octileDistanceByOffsets(Math.abs(dxa), Math.abs(dya));
            const db = octileDistanceByOffsets(Math.abs(dxb), Math.abs(dyb));
            // position less distant from p0 should goes first
            if (da !== db) {
                return da - db;
            }
            // position with greater dy should goes fist (if distances are equal)
            if (dya !== dyb) {
                return dya - dyb;
            }
            // position with less dx should goes fist (if distances and dy are equal)
            return dxa - dxb;
        }
        sortPositions(p0, positions) {
            return sort(positions, (pa, pb) => (this.comparePositions(p0, pa, pb)));
        }
        isAdjacentPositionsIndexes(p1Index, p2Index) {
            const p1 = this.getPositionByIndex(p1Index);
            const p2 = this.getPositionByIndex(p2Index);
            return this.isAdjacentPositions(p1, p2);
        }
        isAdjacentPositions(p1, p2) {
            const [dx, dy] = this.getOffsets(p1, p2);
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);
            return ((adx === 1 && ady === 1) ||
                (adx === 0 && ady === 1) ||
                (adx === 1 && ady === 0));
        }
        getOctileDistance(x1, y1, x2, y2) {
            const [dx, dy] = this.getOffsets([x1, y1], [x2, y2]);
            return octileDistanceByOffsets(Math.abs(dx), Math.abs(dy));
        }
    }

    const SEED_LENGTH = 8;
    const SEED_PATTERN = new RegExp(`^[0-f]{${SEED_LENGTH}}$`, 'i');
    const isSeedValid = (rawSeed) => SEED_PATTERN.test(rawSeed);
    const parseSeed = (rawSeed) => isSeedValid(rawSeed) ? parseInt(rawSeed, 16) : null;
    const verticalPadding = 2;
    const horizontalPadding = 3;
    const generateMap = (width, height, period, seed) => {
        const data = [];
        const x0 = (width - 1) / 2;
        const y0 = (height - 1) / 2;
        const getNoise = createNoiseGenerator(width, height, period, seed);
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let indexMin;
        let indexMax;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x < horizontalPadding ||
                    x > width - horizontalPadding ||
                    y < verticalPadding ||
                    y > height - verticalPadding) {
                    data.push(0);
                    continue;
                }
                const n = getNoise(x, y);
                const d = 1 - Math.sqrt(Math.pow(((x0 - x) / x0), 2) + Math.pow(((y0 - y) / y0), 2)) / Math.SQRT2;
                const v = n * d;
                if (v < min) {
                    min = v;
                    indexMin = getIndexByPosition(x, y, width);
                }
                if (v > max) {
                    max = v;
                    indexMax = getIndexByPosition(x, y, width);
                }
                data.push(v);
            }
        }
        return divideSeaAndLand(data, width, indexMin, indexMax);
    };
    const divideSeaAndLand = (heightsMap, width, indexMin, indexMax) => {
        const dryLandBitMap = heightsMap.map(getFalse);
        const grid = new GeometryGrid(width, heightsMap.length / width);
        const seaQueue = [indexMin];
        const landQueue = [indexMax];
        const visited = new Set([indexMin, indexMax]);
        while (seaQueue.length > 0 || landQueue.length > 0) {
            if (seaQueue.length > 0) {
                const seaIndex = popMin(seaQueue, heightsMap);
                const [seaX, seaY] = grid.getPositionByIndex(seaIndex);
                for (const { dx, dy } of Direction.axial) {
                    const [nextX, nextY] = grid.getPosition(seaX + dx, seaY + dy);
                    const nextIndex = grid.getIndexByPosition(nextX, nextY);
                    if (!visited.has(nextIndex)) {
                        seaQueue.push(nextIndex);
                        visited.add(nextIndex);
                    }
                }
            }
            if (landQueue.length > 0) {
                const landIndex = popMax(landQueue, heightsMap);
                const [landX, landY] = grid.getPositionByIndex(landIndex);
                dryLandBitMap[landIndex] = true;
                for (const { dx, dy } of Direction.axial) {
                    const [nextX, nextY] = grid.getPosition(landX + dx, landY + dy);
                    const nextIndex = grid.getIndexByPosition(nextX, nextY);
                    if (!visited.has(nextIndex)) {
                        landQueue.push(nextIndex);
                        visited.add(nextIndex);
                    }
                }
            }
        }
        return dryLandBitMap;
    };
    const popMax = (queue, heightsMap) => {
        let positionIndex = queue[0];
        let index = 0;
        for (let i = 1; i < queue.length; i++) {
            if (heightsMap[queue[i]] > heightsMap[positionIndex]) {
                positionIndex = queue[i];
                index = i;
            }
        }
        removeByIndex(queue, index);
        return positionIndex;
    };
    const popMin = (queue, heightsMap) => {
        let positionIndex = queue[0];
        let index = 0;
        for (let i = 1; i < queue.length; i++) {
            if (heightsMap[queue[i]] < heightsMap[positionIndex]) {
                positionIndex = queue[i];
                index = i;
            }
        }
        removeByIndex(queue, index);
        return positionIndex;
    };

    const refresh = () => {
        location.hash = formatHex(SeedRandom.getDefaultSeed(), SEED_LENGTH);
    };
    const onStart = (onSeed) => {
        const start = () => {
            const rawSeed = getLocationHash();
            const seed = parseSeed(rawSeed);
            if (seed === null) {
                refresh();
            }
            else {
                onSeed(seed);
            }
        };
        window.addEventListener('hashchange', start);
        start();
    };

    const fillSquare = (context, x, y, side) => {
        context.fillRect(x, y, side, side);
    };
    const drawTiles = (context, data, width, tileSize, getTileColor
    // eslint-disable-next-line max-params
    ) => {
        const height = data.length / width;
        for (let y = 0; y < height; y++) {
            const ty = y * tileSize;
            for (let x = 0; x < width; x++) {
                const index = getIndexByPosition(x, y, width);
                const color = getTileColor(data[index]);
                const tx = x * tileSize;
                context.fillStyle = color;
                fillSquare(context, tx, ty, tileSize);
            }
        }
    };

    const width = 40;
    const height = 20;
    const tileSize = 32;
    const canvasWidth = width * tileSize;
    const canvasHeight = height * tileSize;
    const canvas = $('canvas', { width: canvasWidth, height: canvasHeight });
    const refreshButton = $('button', 'REFRESH', { onclick: refresh });
    const context = canvas.getContext('2d');
    onStart(seed => {
        const map = generateMap(width, height, 6, seed);
        drawTiles(context, map, width, tileSize, i => i ? 'black' : 'white');
    });
    document.body.append(canvas, $('div', [refreshButton]));

})();
//# sourceMappingURL=map-gen-demo.js.map
