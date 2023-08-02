(function () {
    'use strict';

    const isString = (value) => typeof value === 'string';

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

    const getIndexByPosition = (x, y, width) => y * width + x;
    const getPositionByIndex = (index, width) => [
        index % width,
        Math.floor(index / width)
    ];
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
    ALL_OFFSETS[0];
    ALL_OFFSETS[1];
    ALL_OFFSETS[2];
    ALL_OFFSETS[3];
    ALL_OFFSETS[4];
    ALL_OFFSETS[5];

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
    const getUnitVector = (angle) => fromPolar(1, angle);
    const createNoiseGenerator = (width, height, period, seed) => {
        const frequency = 1 / period;
        const horizontalCells = Math.ceil(width * frequency) + 1;
        const verticalCells = Math.ceil(height * frequency) + 1;
        const random = new SeedRandom(seed);
        const gradients = generateArray(horizontalCells * verticalCells, () => {
            const angle = random.nextFloat(0, PI2);
            return getUnitVector(angle);
        });
        const getGradient = (x, y) => {
            const index = getIndexByPosition(x, y, horizontalCells);
            return gradients[index];
        };
        return (x, y) => 0.5 + 0.5 * noise(x * frequency, y * frequency, getGradient);
    };

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

    const formatHex = (number, length) => {
        const hex = number.toString(16);
        const leadingZeros = length - hex.length;
        return '0'.repeat(leadingZeros) + hex;
    };

    const SEED_LENGTH = 8;
    const SEED_PATTERN = new RegExp(`^[0-f]{${SEED_LENGTH}}$`, 'i');
    const isSeedValid = (rawSeed) => SEED_PATTERN.test(rawSeed);
    const refresh = () => {
        location.hash = formatHex(SeedRandom.getDefaultSeed(), SEED_LENGTH);
    };
    const onStart = (onSeed) => {
        const start = () => {
            const rawSeed = getLocationHash();
            if (isSeedValid(rawSeed)) {
                const seed = parseInt(rawSeed, 16);
                onSeed(seed);
            }
            else {
                refresh();
            }
        };
        window.addEventListener('hashchange', start);
        start();
    };

    const width = 40;
    const height = 20;
    const x0 = (width - 1) / 2;
    const y0 = (height - 1) / 2;
    const tileSize = 32;
    const canvas = $('canvas', { width: width * tileSize, height: height * tileSize });
    const refreshButton = $('button', 'REFRESH', { onclick: refresh });
    const context = canvas.getContext('2d');
    const maxDistance = Math.sqrt(Math.pow(x0, 2) + 4 * Math.pow(y0, 2));
    onStart(seed => {
        const data = [];
        const getNoise = createNoiseGenerator(width, height, 7, seed);
        context.clearRect(0, 0, width * tileSize, height * tileSize);
        console.time('d');
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const n = getNoise(x, y);
                const d = 1 - Math.sqrt(Math.pow((x0 - x), 2) + 4 * Math.pow((y0 - y), 2)) / maxDistance;
                const value = n * d;
                data.push(value);
            }
        }
        const median = sort(data, (a, b) => a - b)[data.length / 2];
        const dryLandBitMap = data.map(h => h > median);
        // removeIslands(dryLandBitMap, width);
        // removeLakes(dryLandBitMap, width);
        console.timeEnd('d');
        let count = 0;
        for (let i = 0; i < dryLandBitMap.length; i++) {
            const value = dryLandBitMap[i];
            if (value) {
                count++;
                const [x, y] = getPositionByIndex(i, width);
                context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
        console.log(count);
    });
    document.body.append(canvas, $('div', [refreshButton]));

})();
//# sourceMappingURL=perlin-demo.js.map
