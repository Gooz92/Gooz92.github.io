(function () {
    'use strict';

    const noop = () => { };
    const getFalse = () => false;
    const isString = (value) => typeof value === 'string';

    // forIn(properties.dataset, (value, key) => {
    //   element.dataset[key] = value;
    // });
    const assignProperties = (element, properties) => {
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
    };
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
        equals(dx, dy) {
            return this.dx === dx && this.dy === dy;
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
    Direction.fromOffsets = (dx, dy) => Direction.members.find(direction => direction.equals(dx, dy)) || null;

    const getIndexByPosition = (x, y, width) => y * width + x;
    const getCyclicCoordinate = (coordinate, side) => {
        let cyclicCoordinate = coordinate % side;
        if (cyclicCoordinate < 0) {
            cyclicCoordinate += side;
        }
        // avoid negative zero
        return ~~cyclicCoordinate;
    };
    const getCyclicPosition = (x, y, width, height) => [
        getCyclicCoordinate(x, width),
        getCyclicCoordinate(y, height)
    ];
    const getPositionByIndex = (index, width) => [
        index % width,
        Math.floor(index / width)
    ];
    const getOffset = (start, end, side) => {
        const offset = end - start;
        const maxOffset = side / 2;
        if (Math.abs(offset) <= maxOffset) {
            return offset;
        }
        if (offset > 0) {
            return offset - side;
        }
        return side + offset;
    };
    const getAllRelativeOffsets = (maxOctileRadius) => {
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
    };
    const octileDistance = (x1, y1, x2, y2) => {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        return octileDistanceByOffsets(dx, dy);
    };
    octileDistance.DIAGONAL_MOVE_COST = 3;
    octileDistance.AXIAL_MOVE_COST = 2;
    const octileDistanceByOffsets = (dx, dy) => octileDistance.DIAGONAL_MOVE_COST * Math.min(dx, dy) +
        octileDistance.AXIAL_MOVE_COST * Math.abs(dx - dy);
    const ALL_OFFSETS = getAllRelativeOffsets(7);
    ALL_OFFSETS[5];

    const generateArray = (length, createItem) => {
        const array = [];
        for (let i = 0; i < length; i++) {
            const item = createItem(i);
            array.push(item);
        }
        return array;
    };
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

    var _a;
    // https://en.wikipedia.org/wiki/Linear_congruential_generator
    const a = 1664525;
    const c = 1013904223;
    class SeedRandom {
        constructor(seed = _a.getDefaultSeed()) {
            this.seed = seed;
        }
        next() {
            this.seed = (a * this.seed + c) % _a.PERIOD;
            return this.seed / _a.PERIOD;
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
    _a = SeedRandom;
    SeedRandom.getDefaultSeed = () => randomInt(0, _a.PERIOD);
    SeedRandom.PERIOD = 2 ** 32;

    const dotProduct = ([x1, y1], [x2, y2]) => x1 * x2 + y1 * y2;
    const ease = (x) => (6 * x ** 2 - 15 * x + 10) * x ** 3;
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

    const TERRAINS = [
        { id: 1, name: 'grassland', dryLand: true },
        { id: 2, name: 'steppe', dryLand: true },
        { id: 3, name: 'sea', dryLand: false }
    ];
    const [GRASSLAND, STEPPE, SEA] = TERRAINS;

    const verticalPadding = 2;
    const horizontalPadding = 3;
    const generateSteppe = (map, width, seed) => {
        const height = map.length / width;
        const getNoise = createNoiseGenerator(width, height, 3, seed);
        const x0 = (width - 1) / 2;
        const y0 = (height - 1) / 2;
        const steppe = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = getIndexByPosition(x, y, width);
                const n = getNoise(x, y);
                const d = 1 - Math.sqrt(0.3 * ((x0 - x) / x0) ** 2 +
                    0.7 * ((y0 - y) / y0) ** 2) / Math.SQRT2;
                steppe.push(map[index] && (n * d) ** 2 > .2);
            }
        }
        return steppe;
    };
    const generateLandMap = (width, height, period, seed) => {
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
                const d = 1 - Math.sqrt(((x0 - x) / x0) ** 2 + ((y0 - y) / y0) ** 2) / Math.SQRT2;
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
    const PERIOD = 7;
    const generateMap = (width, height, seed) => {
        const dryLandBitMap = generateLandMap(width, height, PERIOD, seed);
        const steppeBitMap = generateSteppe(dryLandBitMap, width, seed);
        return dryLandBitMap.map((dryLand, index) => {
            if (dryLand) {
                return steppeBitMap[index] ? STEPPE : GRASSLAND;
            }
            return SEA;
        });
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
                const color = getTileColor(data[index], index);
                const tx = x * tileSize;
                context.fillStyle = color;
                fillSquare(context, tx, ty, tileSize);
            }
        }
    };

    const ZERO_STRING = '0';
    const formatHex = (number, length) => {
        const hex = number.toString(16);
        return hex.padStart(length, ZERO_STRING);
    };

    const HEX_SEED_LENGTH = 8;
    const HEX_SEED_PATTERN = new RegExp(`^[\\da-f]{${HEX_SEED_LENGTH}}$`);
    const isHexSeedValid = (rawSeed) => HEX_SEED_PATTERN.test(rawSeed);
    const parseHexSeed = (rawSeed) => isHexSeedValid(rawSeed) ? parseInt(rawSeed, 16) : null;
    const seedToHex = (seed) => formatHex(seed, HEX_SEED_LENGTH);

    const SEPARATOR = 'x';
    // two positive integers without leading zeros separated by SEPARATOR
    const SIZE_PATTERN = new RegExp(`^([1-9]\\d*)${SEPARATOR}([1-9]\\d*)$`);
    const parseSize = (size) => {
        const match = SIZE_PATTERN.exec(size);
        return match ? [+match[1], +match[2]] : null;
    };
    const SIDE_NAMES = ['Width', 'Height'];
    const validateSize = (size, minSide, maxSide) => {
        const errors = [];
        size.forEach((side, index) => {
            if (side < minSide) {
                const sideName = SIDE_NAMES[index];
                errors.push(`${sideName} must be >= ${minSide}`);
            }
            else if (side > maxSide) {
                const sideName = SIDE_NAMES[index];
                errors.push(`World ${sideName} must be <= ${maxSide}`);
            }
        });
        return errors;
    };
    const parseAndValidate = (input, minSide, maxSide, onError) => {
        const size = parseSize(input);
        if (size === null) {
            onError(`Invalid world size: '${input}'`);
            return null;
        }
        const errors = validateSize(size, minSide, maxSide);
        if (errors.length > 0) {
            onError(errors.join('\n'));
            return null;
        }
        return size;
    };
    const stringifySize = (size) => size.join(SEPARATOR);

    const MIN_SIDE = 10;
    const MAX_SIDE = 60;
    const paramsConfig = {
        size: {
            defaultValue: [40, 20],
            parse: value => {
                return parseAndValidate(value, MIN_SIDE, MAX_SIDE, error => {
                    throw new Error(error);
                });
            },
            stringify: stringifySize
        },
        seed: {
            defaultValue: SeedRandom.getDefaultSeed(),
            parse: value => {
                const seed = parseHexSeed(value);
                if (seed === null) {
                    throw new Error('Invalid seed');
                }
                return seed;
            },
            stringify: seedToHex
        }
    };

    class Component {
        constructor(props) {
            this.props = props;
        }
    }

    class NumberInput extends Component {
        constructor(props) {
            super(props);
            const { value, min, max, onChange } = this.props;
            this.input = $('input', {
                value,
                min, max,
                step: 1,
                required: true,
                onchange: () => {
                    onChange(this.value);
                },
                type: 'number'
            });
        }
        render() {
            return this.input;
        }
        get isValid() {
            return this.input.validity.valid;
        }
        get value() {
            return +this.input.value;
        }
        set value(value) {
            this.input.value = String(value);
        }
    }

    const getErrorMessage = (min, max) => `Map side should be an integer between ${min} and ${max}`;
    const createSizeInputs = (props) => {
        const { min, max, onChange, onError } = props;
        const errorContainer = $('span', getErrorMessage(min, max), { className: 'error-container' });
        const _onChange = (size, valid) => {
            if (valid) {
                onChange(size);
                errorContainer.style.display = 'none';
            }
            else {
                onError();
                errorContainer.style.display = 'inline';
            }
        };
        const widthInput = new NumberInput({
            min, max,
            onChange: width => {
                _onChange([
                    width,
                    heightInput.value
                ], widthInput.isValid);
            }
        });
        const heightInput = new NumberInput({
            min, max,
            onChange: height => {
                _onChange([
                    widthInput.value,
                    height
                ], heightInput.isValid);
            }
        });
        const element = $('div', [
            widthInput.render(),
            $('span', 'x', { className: 'size-separator' }),
            heightInput.render(),
            errorContainer
        ]); // TODO
        element.update = ([width, height]) => {
            widthInput.value = width;
            heightInput.value = height;
        };
        return element;
    };

    const PAIRS_SEPARATOR = '&';
    const KEY_VALUE_SEPARATOR = '=';

    const rawParseParams = (paramsString) => {
        const pairs = paramsString.split(PAIRS_SEPARATOR);
        const paramsMap = new Map();
        for (const pair of pairs) {
            if (pair) {
                const [key, value] = pair.split(KEY_VALUE_SEPARATOR);
                paramsMap.set(key, value);
            }
        }
        return paramsMap;
    };
    const stringifyParam = (value, stringify = String) => stringify(value);
    const parseAndNormalizeParams = (rawParamsString, config) => {
        const rawParams = rawParseParams(rawParamsString);
        return Object.keys(config).reduce((parseResult, key) => {
            const paramConfig = config[key];
            if (!rawParams.has(key)) {
                if (!('defaultValue' in paramConfig)) {
                    throw new Error(`Missed required param: ${key}`); // ?
                }
                parseResult.normalized = true;
                parseResult.params[key] = paramConfig.defaultValue;
                const rawParamValue = stringifyParam(paramConfig.defaultValue, paramConfig.stringify);
                parseResult.rawParams.set(key, rawParamValue);
            }
            else {
                parseResult.params[key] = paramConfig.parse(rawParams.get(key));
                parseResult.rawParams.set(key, rawParams.get(key));
            }
            return parseResult;
        }, {
            rawParams: new Map(),
            params: {},
            normalized: false
        });
    };

    const stringifyRawParams = (pairs) => Array.from(pairs)
        .map(pair => pair.join(KEY_VALUE_SEPARATOR))
        .join(PAIRS_SEPARATOR);
    class ParamsState {
        constructor(config) {
            this.config = config;
            this.preventHashChange = false;
        }
        stringifyParam(key, value) {
            return stringifyParam(value, this.config[key].stringify);
        }
        syncRawParams() {
            this.preventHashChange = true;
            const params = stringifyRawParams(this.rawParams.entries());
            this.storeParams(params);
        }
        readAndSync() {
            const paramsString = this.readParamsString();
            const parseResult = parseAndNormalizeParams(paramsString, this.config);
            this.rawParams = parseResult.rawParams;
            this.params = parseResult.params;
            if (parseResult.normalized) {
                this.syncRawParams();
            }
        }
        listen(onParams = noop, onError = noop) {
            try {
                this.readAndSync();
                onParams(this.params);
            }
            catch (e) {
                console.error(e);
                onError();
            }
            this.addEventListener(() => {
                if (!this.preventHashChange) {
                    try {
                        this.readAndSync();
                        onParams(this.params);
                    }
                    catch (_a) {
                        onError();
                    }
                }
                else {
                    this.preventHashChange = false;
                }
            });
        }
        setParam(key, value) {
            this.rawParams.set(key, this.stringifyParam(key, value));
            this.params[key] = value;
            this.syncRawParams();
        }
    }

    const getLocationHash = () => location.hash.slice(1);

    class LocationHashParamsState extends ParamsState {
        readParamsString() {
            return getLocationHash();
        }
        storeParams(params) {
            location.hash = params;
        }
        addEventListener(listener) {
            window.addEventListener('hashchange', listener);
        }
    }

    const TERRAIN_COLORS = {
        grassland: '#388E3C',
        steppe: '#88C34A',
        sea: '#0090c4'
    };

    const tileSize = 32;
    const locationParams = new LocationHashParamsState(paramsConfig);
    const canvas = $('canvas');
    const refreshButton = $('button', 'REFRESH', {
        onclick: () => {
            setParam('seed', SeedRandom.getDefaultSeed());
        }
    });
    const seedSpan = $('span');
    const context = canvas.getContext('2d');
    const sizeInputs = createSizeInputs({
        onChange: size => {
            setParam('size', size);
            refreshButton.disabled = false;
        },
        onError: () => {
            refreshButton.disabled = true;
        },
        min: MIN_SIDE,
        max: MAX_SIDE
    });
    const setParam = (key, value) => {
        locationParams.setParam(key, value);
        update();
    };
    const update = () => {
        const { size, size: [width, height], seed } = locationParams.params;
        const map = generateMap(width, height, seed);
        seedSpan.innerText = seed.toString(16);
        updateDomNode(canvas, {
            width: width * tileSize,
            height: height * tileSize
        });
        sizeInputs.update(size);
        drawTiles(context, map, width, tileSize, terrain => TERRAIN_COLORS[terrain.name]);
    };
    locationParams.listen(update, () => {
        alert('Invalid params');
    });
    document.body.append($('div', { className: 'panel' }, [
        refreshButton,
        seedSpan,
        sizeInputs
    ]), canvas);

})();
//# sourceMappingURL=map-gen-demo.js.map
