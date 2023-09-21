(function () {
    'use strict';

    var spriteBase64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAYAAADlNHIOAAAAAXNSR0IArs4c6QAAAs5JREFUeF7tm0lywyAQRfEZvM9hdHAdJnufISm5ChmrGD49gGz9bNPQ8F/TzSDfAv+mKnCb6p3OAwFMDgIVgJ/w+Ivj/w13VV8SHR4h7P7vYUow7f6D0L9YtFT8GRBS8aP/wRBS8eMQuvXsbrB5yok/EkJO/MEQcuKLIBCAJPclqS/TvEvTLuPojCvgVXumACiloZGF+NI1ILcSRoof/V96FyRLnWx1VIA1QBYT83ZBtQI8Yita24IO2orWxO/einatAER8TwiI+M4QEPG7IBBAXwoiAFQvp2sJAiAAUAGPcwFrQHL93OJAANj1OItwK5Le/88agOrFIuzwQnb5GtB6jPE8hOUu4EqrwSn6ozskDcGpHTZMJ8v3gMnvAQRAAMU04Jx+kDTUlVW6jPkkuSfiedfRNQgeh69SoeWT5OHzlJHi80kSPQ3RrqmAqAY0e6UBrAABwFL5GBKAj65wrwQAS+VjSAA+usK9qgAsy7IfSNZ1VfUFj/jLDMWipeJHTSZB2IJAPA8Dnir/ooHnxJ8EQf0LFSUAtf9PBmDyCxUFABP/nwrA7DJMCMDMvwjANuiJNcD0RUoAwNS/GMARwqACjEw+aqqaWwGMuX+PQQqCCmrSM3kPCC7+RQAm7IIkk7eE4Oa/G0BNfKetqGbyFhBc/XcBQMQ3hmAxeQ0Ed/9nBmA5eQmEIf7PCsBj8j0QhvkngPwGjACgjanMCAk6ApBpC7UiAEAmNAJTMSVtSkOB+lqWZW+/riswrafJWwAg0bB3PHAbigiQG7u03VG8Zj+p+MnWG4HwFQBqgdMSDwm6ah858TsgyAGUbkGP2A0u5jQiatrGqZwXQAuCgfibC+19u1v7WvSDq0C3AgjgVXhLCb9RkAkAqJTFFcQVgH0B8d0pqJSGjPI/awCwRJ8mjh9muUUw+A3RuVMQCoh2bQWQQ0m7F1qIFSAAsXQ2Df8B3W5UUCMxzBcAAAAASUVORK5CYIIA";

    const spriteImage = new Image();
    const loadSprites = (onload) => {
        spriteImage.src = `data:image/png;base64,${spriteBase64}`;
        spriteImage.onload = onload;
    };

    class Component {
        constructor(props) {
            this.props = props;
        }
    }

    const noop = () => { };
    const identity = (value) => value;
    const getTrue = () => true;
    const getFalse = () => false;
    const isString = (value) => typeof value === 'string';
    const isUndefined = (value) => typeof value === 'undefined';
    const isNill = (value) => value === null || isUndefined(value);

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

    function generateArray(length, createItem) {
        const array = [];
        for (let i = 0; i < length; i++) {
            const item = createItem(i);
            array.push(item);
        }
        return array;
    }
    const last = (array) => array[array.length - 1];
    const getItemsCount = (array, condition = getTrue) => array.reduce((counter, item) => condition(item) ? counter + 1 : counter, 0);
    // immutable sorting
    const sort = (array, compare) => array.slice().sort(compare);
    function removeItem(array, item) {
        const index = array.indexOf(item);
        if (index === -1) {
            return false;
        }
        removeByIndex(array, index);
        return true;
    }
    const removeByIndex = (array, index) => {
        array.splice(index, 1);
    };

    // TODO: productId is unitTypeId for now
    var cityProjects = [
        { productId: 1, cost: 2 },
        { productId: 2, cost: 5 },
        { productId: 3, cost: 8 }
    ];

    const DEFAULT_MOVE_POINTS = 6;
    var units = [
        { id: 1, name: 'worker', movePoints: DEFAULT_MOVE_POINTS },
        { id: 2, name: 'warrior', movePoints: DEFAULT_MOVE_POINTS },
        { id: 3, name: 'settler', movePoints: DEFAULT_MOVE_POINTS }
    ];

    const TERRAINS = [
        { id: 1, name: 'grassland', dryLand: true },
        { id: 2, name: 'steppe', dryLand: true },
        { id: 3, name: 'sea', dryLand: false }
    ];
    const [GRASSLAND, STEPPE, SEA] = TERRAINS;

    const UNITS = units;
    const CITY_PROJECTS = cityProjects;

    const DEFAULT_TERRAIN = TERRAINS[0];
    const getDefaultTileData = (terrain = DEFAULT_TERRAIN) => ({
        city: null,
        unit: null,
        terrain
    });
    const getDefaultTile = (terrain = DEFAULT_TERRAIN) => (Object.assign(Object.assign({}, getDefaultTileData(terrain)), { influencedBy: null }));
    const createEmptyTileDatas = (width, height) => generateArray(height * width, () => getDefaultTileData());
    // TODO
    const getTileFood = (tile) => tile.terrain === GRASSLAND ? 2 : 1;
    // TODO
    const isTilePassable = (tile) => tile.terrain.dryLand;

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
    // TODO: use getOffsets?
    function getRelativePosition(p0, absolutePosition, width, height) {
        const [x0, y0] = p0;
        const [absoluteX, absoluteY] = absolutePosition;
        return [
            getOffset(x0, absoluteX, width),
            getOffset(y0, absoluteY, height)
        ];
    }
    const getRelativePositions = (p0, positions, width, height) => positions.map(position => getRelativePosition(p0, position, width, height));
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
    function findBounds(positions) {
        const [x0, y0] = positions[0];
        let minX = x0;
        let minY = y0;
        let maxX = x0;
        let maxY = y0;
        for (const [x, y] of positions) {
            if (x < minX) {
                minX = x;
            }
            if (y < minY) {
                minY = y;
            }
            if (x > maxX) {
                maxX = x;
            }
            if (y > maxY) {
                maxY = y;
            }
        }
        return [minX, minY, maxX, maxY];
    }
    const isPositionsEqual = (p1, p2) => {
        if (p1 === p2) {
            return true;
        }
        if (!p1 || !p2) {
            return false;
        }
        const [x1, y1] = p1;
        const [x2, y2] = p2;
        return x1 === x2 && y1 === y2;
    };
    const includesPosition = (positions, p0) => positions.some(p => isPositionsEqual(p, p0));
    const ALL_OFFSETS = getAllRelativeOffsets(7);
    const R7_OFFSETS = ALL_OFFSETS[5];
    const flipPointVertical = ([x, y], y0) => [x, 2 * y0 - y];
    const flipPointHorizontal = ([x, y], x0) => [2 * x0 - x, y];
    const flipBordersVertical = ([top, right, bottom, left]) => [
        bottom,
        right,
        top,
        left
    ];
    const flipBordersHorizontal = ([top, right, bottom, left]) => [
        top,
        left,
        bottom,
        right
    ];
    const flipBorderTileVertical = (borderTile, y0) => ({
        position: flipPointVertical(borderTile.position, y0),
        borders: flipBordersVertical(borderTile.borders)
    });
    const flipBorderTileHorizontal = (borderTile, x0) => ({
        position: flipPointHorizontal(borderTile.position, x0),
        borders: flipBordersHorizontal(borderTile.borders)
    });
    const getTopBorders = () => [
        true, false, false, false
    ];
    const getTopLeftBorders = () => [
        true, false, false, true
    ];
    const getLeftBorders = () => [
        false, false, false, true
    ];
    const getTopLedgeBorders = () => [
        true, true, false, true
    ];
    const getLeftLedgeBorders = () => [
        true, false, true, true
    ];
    // TODO: reduce complexity
    function getCircleBorderTiles(cx, cy, octileRadius) {
        const radius = Math.floor(octileRadius / 2);
        const startX = cx - radius;
        const startY = cy - radius;
        const tiles = [];
        let minX = cx;
        for (let y = startY; y < cy; y++) {
            const dy = Math.abs(y - cy);
            let left = true;
            for (let x = startX; x < cx; x++) {
                const previousMinX = minX;
                const dx = Math.abs(x - cx);
                const distance = octileDistanceByOffsets(dx, dy);
                if (distance !== octileRadius && distance !== octileRadius - 1) {
                    continue;
                }
                let borders;
                if (x < previousMinX) {
                    if (left) {
                        borders = getTopLeftBorders();
                    }
                    else {
                        borders = getTopBorders();
                    }
                    minX = x;
                }
                else if (x === previousMinX) {
                    borders = getLeftBorders();
                }
                else {
                    borders = getTopBorders();
                }
                left = false;
                const leftTop = {
                    position: [x, y],
                    borders
                };
                const rightTop = flipBorderTileHorizontal(leftTop, cx);
                const rightBottom = flipBorderTileVertical(rightTop, cy);
                const leftBottom = flipBorderTileHorizontal(rightBottom, cx);
                tiles.push(leftTop, rightTop, rightBottom, leftBottom);
                left = false;
            }
        }
        const topTileBorders = octileRadius % 2 === 0 ? getTopLedgeBorders() : getTopBorders();
        const leftTileBorders = octileRadius % 2 === 0 ? getLeftLedgeBorders() : getLeftBorders();
        const top = {
            position: [cx, cy - radius],
            borders: topTileBorders
        };
        const left = {
            position: [cx - radius, cy],
            borders: leftTileBorders
        };
        const bottom = flipBorderTileVertical(top, cy);
        const right = flipBorderTileHorizontal(left, cx);
        tiles.push(top, left, bottom, right);
        return tiles;
    }

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

    class GameGrid extends GeometryGrid {
        constructor(tiles, width) {
            super(width, tiles.length / width);
            this.tiles = tiles;
        }
        get(x, y) {
            const [cx, cy] = this.getPosition(x, y);
            const index = this.getIndexByPosition(cx, cy);
            return this.tiles[index];
        }
        getTileFood(x, y) {
            const tile = this.get(x, y);
            return getTileFood(tile);
        }
        isTilePassable(x, y) {
            const tile = this.get(x, y);
            return isTilePassable(tile);
        }
        influencedByCity(x, y, city) {
            const tile = this.get(x, y);
            return tile.influencedBy === city;
        }
        addInfluence(x, y, city) {
            this.get(x, y).influencedBy = city;
        }
    }
    GameGrid.createTileFromTileData = (tileData) => getDefaultTile(tileData.terrain);
    GameGrid.createFromTilesData = (tilesData, width) => new GameGrid(tilesData.map(GameGrid.createTileFromTileData), width);

    const getExpandingPoints = (area, population) => {
        const halfArea = Math.ceil(area / 2);
        return population >= halfArea ? population - halfArea + 1 : 0;
    };
    const getFoodBasketSize = (population) => 10 * population + Math.pow((population - 1), 2);

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

    const eventNames = [
        'populationIncreased',
        'bordersExpanded',
        'unitCompleted',
        'unitMoved',
        'moveCanceled'
    ];
    var eventCreators = eventNames.reduce((events, type) => (Object.assign(Object.assign({}, events), { [type]: (payload) => ({ type, payload }) })), {});

    const MAX_CITY_WORKABLE_OCTILE_RADIUS = 7;

    const getBufferedConvertIterator = (input, convert) => {
        return {
            index: 0,
            buffer: [],
            *[Symbol.iterator]() {
                while (this.index < input.length) {
                    if (this.buffer.length === 0) {
                        this.buffer = convert(input[this.index]);
                        ++this.index;
                    }
                    yield this.buffer.shift();
                }
                while (this.buffer.length > 0) {
                    yield this.buffer.shift();
                }
                throw new Error('Unexpected end of input');
            }
        };
    };

    const BITS_IN_BYTE = 8; // orly ? :)
    function binaryToUint(binary) {
        let uint = 0;
        for (let i = 0; i < binary.length; i++) {
            if (binary[i]) {
                uint += Math.pow(2, i);
            }
        }
        return uint;
    }
    const booleansToUint = binaryToUint;
    function uintToBinary(uint, bitsCount, getBinary) {
        const binaries = [];
        while (uint > 0 && binaries.length < bitsCount) {
            const bit = getBinary(uint % 2 === 1);
            uint = Math.floor(uint / 2);
            binaries.push(bit);
        }
        const falsy = getBinary(false);
        while (binaries.length < bitsCount) {
            binaries.push(falsy);
        }
        return binaries;
    }
    const uintToBooleans = (uint, bitsCount) => uintToBinary(uint, bitsCount, identity);
    const byteToBooleans = (byte) => uintToBooleans(byte, BITS_IN_BYTE);
    function uintsToBinary(uints, bitsCount, getBinary) {
        const binaries = [];
        for (const uint of uints) {
            const uintsBinaries = uintToBinary(uint, bitsCount, getBinary);
            binaries.push(...uintsBinaries);
        }
        return binaries;
    }
    const uintsToBooleans = (uints, bitsCount) => uintsToBinary(uints, bitsCount, identity);
    const bytesToBooleans = (bytes) => uintsToBooleans(bytes, BITS_IN_BYTE);
    function* booleansToBytesGenerator(booleans) {
        let count = 0;
        let byte = 0;
        for (const boolean of booleans) {
            if (count === BITS_IN_BYTE) {
                yield byte;
                count = 0;
                byte = 0;
            }
            if (boolean) {
                byte += Math.pow(2, count);
            }
            ++count;
        }
        if (count > 0) {
            yield byte;
        }
    }
    // js uses 32 signed (one bit for +/-)
    // so only 31 bits available
    const HALF_BITS_COUNT = 15;
    const packTwoUints = (i, j) => i << HALF_BITS_COUNT | j;
    function nextUint(booleans, bitsCount) {
        let uint = 0;
        let index = 0;
        if (bitsCount === 0) {
            return uint;
        }
        for (const boolean of booleans) {
            if (boolean) {
                uint += Math.pow(2, index);
            }
            ++index;
            if (index === bitsCount) {
                return uint;
            }
        }
        return uint;
    }
    const calculateTruesCount = (bool, stats) => {
        if (bool) {
            ++stats.truesCount;
        }
    };
    function nextBooleansWithTruesCount(booleans, length) {
        const stats = { truesCount: 0 };
        const result = nextBooleansStats(booleans, length, stats, calculateTruesCount);
        return {
            booleans: result.booleans,
            count: result.stats.truesCount
        };
    }
    function nextBooleansStats(booleans, length, stats, callback) {
        const result = [];
        for (const boolean of booleans) {
            callback(boolean, stats);
            result.push(boolean);
            if (result.length === length) {
                return { booleans: result, stats };
            }
        }
        return { booleans: result, stats };
    }
    function nextBooleans(booleans, length) {
        const result = [];
        for (const boolean of booleans) {
            result.push(boolean);
            if (result.length === length) {
                return result;
            }
        }
        return result;
    }
    const getBytesToBooleansIterator = (bytes) => getBufferedConvertIterator(bytes, byteToBooleans);
    const getMaxBitsCount = (maxValue) => Math.ceil(Math.log2(maxValue + 1));
    function nextUints(booleans, count, uintBitsCount) {
        const uints = [];
        for (let i = 0; i < count; i++) {
            const uintBooleans = nextBooleans(booleans, uintBitsCount);
            const uint = booleansToUint(uintBooleans);
            uints.push(uint);
        }
        return uints;
    }
    const nextBytes = (booleans, count) => nextUints(booleans, count, BITS_IN_BYTE);

    class CityInfluence {
        static getStartInfluencePositions(cityPosition, grid, radius = 3) {
            const [cityX, cityY] = cityPosition;
            return grid.getCirclePositions(cityX, cityY, radius)
                .filter(([x, y]) => !grid.get(x, y).influencedBy);
        }
        constructor(city, cityData) {
            this.city = city;
            this.tileToExpand = null;
            this.positions = this.grid.sortPositions(city.position, cityData.influencedPositions);
            this.expandingProgress = cityData.expandingProgress;
            this.place();
        }
        // TODO: private on some level
        getFreeTilesCount() {
            const [cx, cy] = this.city.position;
            return getItemsCount(R7_OFFSETS, ([dx, dy]) => {
                const { influencedBy } = this.grid.get(cx + dx, cy + dy);
                return influencedBy === null;
            });
        }
        getTileExpansionCost(position) {
            const [x, y] = position;
            let weight = 0;
            for (const { dx, dy } of Direction.members) {
                const xi = x + dx;
                const yi = y + dy;
                const { influencedBy } = this.grid.get(xi, yi);
                if (influencedBy) {
                    // 6 / 2 = 3; 6 / 3 = 2;
                    weight += 6 / this.grid.getOctileDistance(xi, yi, x, y);
                }
            }
            const [cx, cy] = this.city.position;
            // min distance = 4
            const d = this.grid.getOctileDistance(cx, cy, x, y) - 3;
            return Math.round(160 / weight + Math.pow(d, 2));
        }
        getTilesToExpand() {
            const frontierPositions = this.getNextFrontierPositions();
            const positionsToExpand = [];
            for (const frontierPosition of frontierPositions) {
                if (this.canExpandToPosition(frontierPosition)) {
                    const cost = this.getTileExpansionCost(frontierPosition);
                    positionsToExpand.push({
                        position: frontierPosition,
                        turnsToExpand: cost / this.getExpandingPoints(),
                        cost
                    });
                }
            }
            return positionsToExpand.sort((p1, p2) => this.compareTilesToExpand(p1, p2));
        }
        compareTilesToExpand(tileA, tileB) {
            const costDelta = tileA.cost - tileB.cost;
            if (costDelta !== 0) {
                return costDelta;
            }
            const [xa, ya] = tileA.position;
            const [xb, yb] = tileB.position;
            const foodA = this.grid.getTileFood(xa, ya);
            const foodB = this.grid.getTileFood(xb, yb);
            return foodB - foodA;
        }
        getExpandingPoints() {
            return getExpandingPoints(this.positions.length, this.city.population);
        }
        expand() {
            const { position } = this.tileToExpand;
            this.tileToExpand = null;
            const [x, y] = position;
            this.addTile(x, y);
            return eventCreators.bordersExpanded({ city: this.city, position });
        }
        // TODO: set expandingProgress to zero if last tile to expand was reassigned
        turn() {
            if (this.tileToExpand === null) {
                return null;
            }
            this.expandingProgress += this.getExpandingPoints();
            const delta = this.expandingProgress - this.tileToExpand.cost;
            if (delta >= 0) {
                this.expandingProgress = delta;
                return this.expand();
            }
            return null;
        }
        place() {
            for (const [x, y] of this.positions) {
                this.grid.addInfluence(x, y, this.city);
            }
        }
        remove() {
            this.positions.forEach(([x, y]) => {
                const tile = this.grid.get(x, y);
                tile.influencedBy = null;
            });
        }
        canExpandToPosition(position) {
            const [x, y] = position;
            if (this.grid.get(x, y).influencedBy !== null) {
                return false;
            }
            const [toCityX, toCityY] = this.grid.getNextLinePosition(position, this.city.position);
            if (!this.grid.influencedByCity(toCityX, toCityY, this.city)) {
                return false;
            }
            if (!Direction.diagonal.some(({ dx, dy }) => (this.grid.influencedByCity(x + dx, y + dy, this.city)))) {
                return false;
            }
            if (!Direction.axial.some(({ dx, dy }) => (this.grid.influencedByCity(x + dx, y + dy, this.city)))) {
                return false;
            }
            const [cityX, cityY] = this.city.position;
            return this.grid.getOctileDistance(x, y, cityX, cityY) <= MAX_CITY_WORKABLE_OCTILE_RADIUS;
        }
        getNextFrontierPositions() {
            const frontierPositions = [];
            for (const [x0, y0] of this.positions) {
                for (const { dx, dy } of Direction.axial) {
                    const x = x0 + dx;
                    const y = y0 + dy;
                    const position = this.grid.getPosition(x, y);
                    const { influencedBy } = this.grid.get(x, y);
                    if (influencedBy === null &&
                        !includesPosition(frontierPositions, position)) {
                        frontierPositions.push(position);
                    }
                }
            }
            return frontierPositions;
        }
        // TODO: private on some level
        swap(x, y) {
            const withCity = this.grid.get(x, y).influencedBy;
            const index = this.positions.findIndex(([xi, yi]) => x === xi && y === yi);
            removeByIndex(this.positions, index);
            this.positions = this.grid.sortPositions(this.city.position, this.positions);
            withCity.influence.addTile(x, y);
        }
        canSwap(x, y) {
            return this._canSwap(x, y, new Map());
        }
        // TODO: refactor, reduce complexity
        _canSwap(x, y, checked) {
            const key = packTwoUints(x, y);
            if (checked.has(key)) {
                return checked.get(key);
            }
            const withCity = this.grid.get(x, y).influencedBy;
            if (withCity === null || withCity === this.city) {
                checked.set(key, false);
                return false;
            }
            const [cx, cy] = this.city.position;
            const distance = this.grid.getOctileDistance(x, y, cx, cy);
            if (distance > MAX_CITY_WORKABLE_OCTILE_RADIUS) {
                checked.set(key, false);
                return false;
            }
            if (!withCity.assignments.hasFreeTiles()) {
                checked.set(key, false);
                return false;
            }
            const flags = [false, false];
            const toCheck = [[], []];
            for (const { dx, dy, isAxial } of Direction.members) {
                const nextX = x + dx;
                const nextY = y + dy;
                const { influencedBy } = this.grid.get(nextX, nextY);
                const i = +isAxial;
                if (influencedBy !== this.city) {
                    toCheck[i].push([nextX, nextY]);
                    continue;
                }
                const j = +!isAxial;
                flags[i] = true;
                if (flags[j]) {
                    checked.set(key, true);
                    return true;
                }
            }
            return flags.every((flag, i) => flag || toCheck[i].some(([x, y]) => this._canSwap(x, y, checked)));
        }
        addTile(x, y) {
            this.grid.addInfluence(x, y, this.city);
            const { positions } = this;
            positions.push([x, y]);
            this.positions = this.grid.sortPositions(this.city.position, positions);
        }
        // should be private on some level
        expandToTile(x, y) {
            const position = [x, y];
            if (!includesPosition(this.positions, position)) {
                this.addTile(x, y);
            }
        }
        get grid() {
            return this.city.grid;
        }
    }

    class Assignments {
        static getDefaultPositions(cityPosition, positionsToAssign, grid, population = 1) {
            const positions = [];
            while (population-- > 0) {
                let maxFood = 0;
                let optimalPosition;
                for (let i = 0; i < positionsToAssign.length; i++) {
                    const position = positionsToAssign[i];
                    if (isPositionsEqual(position, cityPosition) || positions.some(pos => isPositionsEqual(pos, position))) {
                        continue;
                    }
                    const [x, y] = position;
                    const food = grid.getTileFood(x, y);
                    if (food > maxFood) {
                        maxFood = food;
                        optimalPosition = position;
                    }
                }
                if (optimalPosition) { // TODO
                    positions.push(optimalPosition);
                }
            }
            return positions;
        }
        recalculate(population = this.influence.city.population) {
            this.positions = Assignments.getDefaultPositions(this.influence.city.position, this.influence.positions, this.grid, population);
        }
        constructor(grid, influence, positions) {
            this.grid = grid;
            this.influence = influence;
            this.positions = positions;
        }
        isPositionOccupied(position) {
            return (isPositionsEqual(position, this.city.position) ||
                includesPosition(this.positions, position));
        }
        isPositionFree(position) {
            return !this.isPositionOccupied(position);
        }
        hasFreeTiles() {
            return this.influence.positions.some(position => (this.isPositionFree(position)));
        }
        getFreeTilesCount() {
            return getItemsCount(this.influence.positions, position => (this.isPositionFree(position)));
        }
        getFoodPerTurn() {
            const [cx, cy] = this.influence.city.position;
            const food = this.grid.getTileFood(cx, cy);
            return this.positions.reduce((totalFood, position) => {
                if (!this.influence.positions.some(pos => isPositionsEqual(pos, position))) {
                    return totalFood;
                }
                const [x, y] = position;
                return totalFood + this.grid.getTileFood(x, y);
            }, food);
        }
        get city() {
            return this.influence.city;
        }
    }

    const DEFAULT_CITY_SETTINGS = {
        population: 1,
        expansionLevel: 0
    };
    class City {
        // eslint-disable-next-line max-params
        static found(grid, position, id = 0, name = '', settings = {}) {
            const options = Object.assign(Object.assign({}, DEFAULT_CITY_SETTINGS), settings);
            const influencedPositions = CityInfluence.getStartInfluencePositions(position, grid, options.expansionLevel + 3);
            return new City(grid, {
                position,
                project: null,
                influencedPositions,
                assignmentsPositions: Assignments.getDefaultPositions(position, influencedPositions, grid, options.population),
                growthProgress: 0,
                expandingProgress: 0,
                name,
                id
            });
        }
        constructor(grid, cityData) {
            this.grid = grid;
            this.position = cityData.position;
            this.name = cityData.name;
            this.id = cityData.id;
            this.growthProgress = cityData.growthProgress;
            this.project = cityData.project;
            const [x, y] = cityData.position;
            grid.get(x, y).city = this;
            this.influence = new CityInfluence(this, cityData);
            this.assignments = new Assignments(grid, this.influence, cityData.assignmentsPositions);
            if (this.assignments.getFreeTilesCount() > 0) {
                this.foodBasketSize = getFoodBasketSize(this.population);
            }
            else {
                this.foodBasketSize = 0;
            }
        }
        turn(unitCreationHandler = noop) {
            const events = this.updateGrowthProgress();
            const unitCreationEvent = this.updateProjectProgress(unitCreationHandler);
            if (unitCreationEvent !== null) {
                events.push(unitCreationEvent);
            }
            return events;
        }
        // TODO: toooo large method ?
        updateGrowthProgress() {
            const events = [];
            const freePositionsCount = this.assignments.getFreeTilesCount();
            if (freePositionsCount === 0) {
                return events;
            }
            const basketSize = getFoodBasketSize(this.population);
            this.growthProgress += this.foodSurplus;
            let population = this.population;
            // exp progress depends on population so expand first
            const bordersExpandedEvent = this.influence.turn();
            if (bordersExpandedEvent !== null) {
                events.push(bordersExpandedEvent);
            }
            const delta = this.growthProgress - basketSize;
            if (delta >= 0) {
                if (freePositionsCount > 1) {
                    this.growthProgress = delta;
                    this.foodBasketSize = getFoodBasketSize(this.population + 1);
                }
                else {
                    this.growthProgress = 0;
                    this.foodBasketSize = 0;
                }
                ++population;
                const event = eventCreators.populationIncreased({ city: this });
                events.push(event);
            }
            else if (this.growthProgress < 0) ;
            if (events.length > 0) {
                this.assignments.recalculate(population);
            }
            return events;
        }
        updateProjectProgress(unitCreationHandler) {
            const { project } = this;
            if (project === null) {
                return null;
            }
            const [x, y] = this.position;
            const cityPositionIndex = this.grid.getIndexByPosition(x, y);
            const updatedProgress = this.project.progress + 1;
            const done = updatedProgress === this.project.type.cost;
            if (!done) {
                this.project.progress = updatedProgress;
                return null;
            }
            const garrisoned = !!this.grid.tiles[cityPositionIndex].unit;
            if (garrisoned) {
                return null;
            }
            const unitCreationEvent = eventCreators.unitCompleted({
                unitTypeId: this.project.type.productId,
                cityPositionIndex
            });
            this.project = null;
            unitCreationHandler(unitCreationEvent.payload);
            return unitCreationEvent;
        }
        setProject(type) {
            if (type === null) {
                this.project = null;
                return;
            }
            if (this.project === null || type.productId !== this.project.type.productId) {
                this.project = {
                    type,
                    progress: 0
                };
            }
        }
        get foodSurplus() {
            return this.assignments.getFoodPerTurn() - 2 * this.population;
        }
        get population() {
            return this.assignments.positions.length;
        }
        get influencedPositions() {
            return this.influence.positions;
        }
        get assignmentsPositions() {
            return this.assignments.positions;
        }
        get expandingProgress() {
            return this.influence.expandingProgress;
        }
        remove() {
            this.influence.remove();
        }
    }

    // TODO somehow make it related to Terrain enum
    // type TerrainPoints = {
    //   [k in Terrain]: number
    // }
    const MIN_DISTANCE_BETWEEN_CITIES = MAX_CITY_WORKABLE_OCTILE_RADIUS + 1;

    const nextCityName = (nextCityId) => {
        const letters = [];
        do {
            const number = nextCityId % 26;
            nextCityId = Math.floor(nextCityId / 26);
            letters.push(String.fromCharCode(number + 65));
        } while (nextCityId > 0);
        return letters.join('');
    };
    class CityExpansionCenter {
        constructor(influence) {
            this.influence = influence;
            this.tilesToExpand = influence.getTilesToExpand();
            this.tilesToExpandLeft = influence.getFreeTilesCount();
        }
        get tileToExpand() {
            return this.influence.tileToExpand;
        }
        set tileToExpand(tileToExpand) {
            this.influence.tileToExpand = tileToExpand;
        }
    }

    const needToReassign = (previous, next) => {
        if (next.tileToExpand.turnsToExpand !== previous.tileToExpand.turnsToExpand) {
            return next.tileToExpand.turnsToExpand < previous.tileToExpand.turnsToExpand;
        }
        return next.tilesToExpandLeft < previous.tilesToExpandLeft;
    };
    const updateTilesToExpand = (queue) => {
        const positionMap = new Map();
        while (queue.length > 0) {
            const next = queue.shift();
            if (next.tilesToExpand.length === 0) {
                continue;
            }
            const tileToExpand = next.tilesToExpand.shift();
            const [x, y] = tileToExpand.position;
            const positionId = packTwoUints(x, y);
            const previous = positionMap.get(positionId);
            next.tileToExpand = tileToExpand;
            if (!previous) {
                positionMap.set(positionId, next);
            }
            else if (needToReassign(previous, next)) {
                previous.tileToExpand = null;
                queue.push(previous);
                positionMap.set(positionId, next);
            }
            else {
                next.tileToExpand = null;
                queue.push(next);
            }
        }
    };

    class CitiesService {
        constructor(grid, citiesData = [], nextCityId = 0) {
            this.grid = grid;
            this.unitCreationHandler = noop;
            this.cities = CitiesService.createCities(grid, citiesData);
            this._nextCityId = nextCityId;
            this.updateTilesToExpand();
        }
        onUnitCreated(unitCreationHandler) {
            this.unitCreationHandler = unitCreationHandler;
        }
        updateTilesToExpand() {
            const centers = this.cities.map(city => {
                // TODO ?
                city.influence.tileToExpand = null;
                return new CityExpansionCenter(city.influence);
            });
            updateTilesToExpand(centers);
        }
        turn() {
            const events = [];
            this.cities.forEach(city => {
                const cityEvents = city.turn(this.unitCreationHandler);
                events.push(...cityEvents);
            });
            this.updateTilesToExpand();
            return events;
        }
        addCity(city) {
            this.cities.push(city);
            // TODO ?
            this.updateTilesToExpand();
            ++this._nextCityId;
        }
        nextCityName() {
            return nextCityName(this.nextCityId);
        }
        // TODO: settings used only testing/sandbox
        foundCity(x, y, settings) {
            if (!this.canPlaceCity(x, y)) {
                return null;
            }
            const city = City.found(this.grid, [x, y], this.nextCityId, this.nextCityName(), settings);
            this.addCity(city);
            return city;
        }
        canPlaceCity(newCityX, newCityY) {
            const tile = this.grid.get(newCityX, newCityY);
            if (!tile.terrain.dryLand) {
                return false;
            }
            return this.cities.every(({ position: [cityX, cityY] }) => (this.grid.getOctileDistance(cityX, cityY, newCityX, newCityY) >= MIN_DISTANCE_BETWEEN_CITIES));
        }
        captureRelativePosition(city, [dx, dy]) {
            const [cx, cy] = city.position;
            const [tileX, tileY] = this.grid.getPosition(cx + dx, cy + dy);
            this.captureTile(cx, cy, tileX, tileY);
        }
        captureTile(cityX, cityY, tileX, tileY) {
            const { city } = this.grid.get(cityX, cityY);
            city.influence.expandToTile(tileX, tileY);
            this.updateTilesToExpand();
        }
        setProject(cityPositionIndex, type) {
            const { city } = this.grid.tiles[cityPositionIndex];
            city.setProject(type);
        }
        get nextCityId() {
            return this._nextCityId;
        }
    }
    CitiesService.createCities = (grid, citiesData) => citiesData
        .map(cityData => new City(grid, cityData))
        .sort((ca, cb) => ca.id - cb.id);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */


    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    class Unit {
        constructor(grid, data) {
            this.grid = grid;
            this.path = [];
            const restData = __rest(data, ["targetPosition"]);
            Object.assign(this, restData);
            const [x, y] = data.position;
            grid.get(x, y).unit = this;
        }
        beforeTurn() {
            this.movePoints += this.type.movePoints;
        }
        cancelMove() {
            const toPosition = this.grid.getPositionByIndex(last(this.path));
            this.path = [];
            return eventCreators.moveCanceled({ from: this.position, to: toPosition });
        }
        hasEnoughPointsToMove() {
            const toPosition = this.grid.getPositionByIndex(this.path[0]);
            const moveCost = this.getMoveCost(this.position, toPosition);
            return moveCost <= this.movePoints;
        }
        getMoveCost(from, to) {
            const [dx, dy] = this.grid.getOffsets(from, to);
            const direction = Direction.fromOffsets(dx, dy);
            return direction.isAxial ? 2 : 3;
        }
        isNextTurnPathPassable() {
            let pathNodeIndex = 0;
            let moveCost = 0;
            let from = this.position;
            while (pathNodeIndex < this.path.length) {
                const toIndex = this.path[pathNodeIndex];
                const to = this.grid.getPositionByIndex(toIndex);
                moveCost += this.getMoveCost(from, to);
                if (moveCost > this.movePoints) {
                    return true;
                }
                if (!this.grid.tiles[toIndex].terrain.dryLand) {
                    return false;
                }
                ++pathNodeIndex;
                from = to;
            }
            return true;
        }
        moveByPath(path = this.path) {
            const passedPath = [this.position];
            let previousMoveCost = 0;
            let moveCost = 0;
            while (passedPath.length - 1 < path.length) {
                const toIndex = path[passedPath.length - 1];
                const to = this.grid.getPositionByIndex(toIndex);
                const from = last(passedPath);
                const nextMoveCost = moveCost + this.getMoveCost(from, to);
                if (nextMoveCost > this.movePoints) {
                    if (passedPath.length > 1 && this.grid.tiles[path[passedPath.length - 2]].unit) {
                        passedPath.pop(); // TODO
                        moveCost = previousMoveCost;
                    }
                    break;
                }
                passedPath.push(to);
                previousMoveCost = moveCost;
                moveCost = nextMoveCost;
            }
            //
            this.path = path.slice(passedPath.length - 1);
            if (passedPath.length === 1) {
                return null;
            }
            this.movePoints -= moveCost;
            const [x0, y0] = this.position;
            this.position = last(passedPath);
            const [nextX, nextY] = this.position;
            this.grid.get(nextX, nextY).unit = this;
            const sourceTile = this.grid.get(x0, y0);
            if (sourceTile.unit === this) {
                sourceTile.unit = null;
            }
            return passedPath.length > 0
                ? eventCreators.unitMoved({ path: passedPath })
                : null;
        }
        get targetPosition() {
            return this.path.length > 0 ? last(this.path) : null;
        }
    }
    // TODO ?
    Unit.DEFAULT_UNIT_TYPE = UNITS[0];
    // TODO ?
    Unit.getDefaultData = (x, y) => ({
        position: [x, y],
        type: Unit.DEFAULT_UNIT_TYPE,
        movePoints: Unit.DEFAULT_UNIT_TYPE.movePoints,
        targetPosition: null
    });

    /**
     *
     * @param min
     * @param max
     * @param value [0,1)
     */
    const normalizeToInt = (min, max, value) => Math.floor((min + (max - min + 1) * value));
    const randomInt = (min, max) => normalizeToInt(min, max, Math.random());
    const clamp = (value, min, max) => {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    };
    const clampPositive = (value, max) => clamp(value, 0, max);
    const PI2 = 2 * Math.PI;

    // TODO: use more sophisticated priority queue
    const popMin$1 = (queue) => {
        let min = queue[0];
        let minIndex = 0;
        for (let i = 1; i < queue.length; i++) {
            const node = queue[i];
            if (node.f < min.f) {
                min = node;
                minIndex = i;
            }
        }
        removeByIndex(queue, minIndex);
        return min;
    };
    const backtrace = (node) => {
        const path = [];
        while (node.previous) {
            path.unshift({
                position: node.position,
                positionIndex: node.positionIndex
            });
            node = node.previous;
        }
        return path;
    };

    const findPath = (grid, from, to, isPassable = getTrue) => {
        const [fromX, fromY] = from;
        const [toX, toY] = to;
        const startPositionIndex = grid.getIndexByPosition(fromX, fromY);
        const queue = [{
                position: from,
                positionIndex: startPositionIndex,
                g: 0,
                f: grid.getOctileDistance(fromX, fromY, toX, toY),
                previous: null
            }];
        const visited = new Set([startPositionIndex]);
        while (queue.length > 0) {
            const node = popMin$1(queue);
            const [currentX, currentY] = node.position;
            if (currentX === toX && currentY === toY) {
                return backtrace(node);
            }
            visited.add(node.positionIndex);
            for (const { dx, dy, isAxial } of Direction.members) {
                const nextPosition = grid.getPosition(currentX + dx, currentY + dy);
                const [nextX, nextY] = nextPosition;
                const positionIndex = grid.getIndexByPosition(nextX, nextY);
                if (visited.has(positionIndex)) {
                    continue;
                }
                if (!isPassable(nextX, nextY)) {
                    continue;
                }
                // TODO: honor different passability
                const g = node.g + (isAxial ? 2 : 3);
                const distanceToTarget = grid.getOctileDistance(nextX, nextY, toX, toY);
                const f = g + distanceToTarget;
                // TODO: optimize
                const oldNode = queue.find(node => node.positionIndex === positionIndex);
                // need to update node in queue if new path shorter
                if (oldNode) {
                    if (g < oldNode.g) {
                        oldNode.g = g;
                        oldNode.f = f;
                        oldNode.previous = node;
                    }
                    continue;
                }
                queue.push({
                    previous: node,
                    position: nextPosition,
                    positionIndex,
                    g,
                    f: g + distanceToTarget
                });
            }
        }
        return [];
    };

    class UnitsService {
        constructor(grid, units = []) {
            this.grid = grid;
            this.movements = new Map();
            this.units = [];
            // TODO ?
            this.isTilePassable = (x, y) => this.grid.isTilePassable(x, y);
            this.createUnits(units);
        }
        createUnits(units) {
            units.forEach(unitData => {
                const unit = this.addUnit(unitData);
                if (unitData.targetPosition !== null) {
                    const targetPosition = this.grid.getPositionByIndex(unitData.targetPosition);
                    this.movements.set(unit.targetPosition, unit);
                    unit.path = this.findPath(unit, targetPosition);
                }
            });
        }
        findPath(unit, target) {
            return findPath(this.grid, unit.position, target, this.isTilePassable)
                .map(node => node.positionIndex);
        }
        turn() {
            const moveEvents = [];
            this.units.forEach(unit => {
                unit.beforeTurn();
            });
            const movedUnits = [];
            for (const unit of this.units) {
                if (unit.targetPosition !== null) {
                    const [fromX, fromY] = unit.position;
                    const fromIndex = this.grid.getIndexByPosition(fromX, fromY);
                    const chainMoveEvents = this.move([fromIndex, ...unit.path]); // TODO: to many empty chains
                    const chainUnits = chainMoveEvents.map(({ payload: { path } }) => {
                        const [toX, toY] = last(path);
                        return this.grid.get(toX, toY).unit;
                    });
                    movedUnits.push(...chainUnits);
                    moveEvents.push(...chainMoveEvents);
                }
            }
            const cancelMoveEvents = [];
            this.units.forEach(unit => {
                unit.movePoints = clampPositive(unit.movePoints, unit.type.movePoints);
                if (unit.targetPosition !== null && !movedUnits.includes(unit)) {
                    // TODO: reject moves for all collided units
                    cancelMoveEvents.push(unit.cancelMove());
                }
            });
            return {
                moves: moveEvents,
                canceledMoved: cancelMoveEvents
            };
        }
        addUnit(unitData) {
            const unit = new Unit(this.grid, unitData);
            this.units.push(unit);
            return unit;
        }
        placeUnit(x, y, data = {}) {
            const tile = this.grid.get(x, y);
            if (tile.unit !== null || !tile.terrain.dryLand) {
                return null;
            }
            const unitData = Object.assign(Unit.getDefaultData(x, y), data);
            return this.addUnit(unitData);
        }
        moveUnit(unit, toX, toY) {
            const toPosition = [toX, toY];
            if (isPositionsEqual(unit.position, toPosition)) {
                this.cancelMove((unit));
                return [];
            }
            const path = this.findPath(unit, toPosition);
            if (path.length === 0) {
                return [];
            }
            const [fromX, fromY] = unit.position;
            const sourcePositionIndex = this.grid.getIndexByPosition(fromX, fromY);
            path.unshift(sourcePositionIndex);
            return this.move(path);
        }
        move(path) {
            const [unitPositionIndex, ...restPath] = path;
            const nextPositionIndex = restPath[0];
            const { unit } = this.grid.tiles[unitPositionIndex];
            if (this.movements.has(unit.targetPosition)) {
                this.movements.delete(unit.targetPosition);
            }
            if (path.length === 2) {
                const competitor = this.movements.get(nextPositionIndex);
                if (competitor && competitor.path.length === 1) {
                    this.cancelMove(competitor);
                }
            }
            const targetPositionIndex = last(restPath);
            unit.path = restPath;
            this.movements.set(targetPositionIndex, unit);
            const chain = this.getMoveChain(unit, true);
            // if target position of unit to move is empty chain is not loop
            // a -> b -> _
            // all units can move on current turn because of mustBeProcessedNow = true
            // so neither chain is loop or target is empty, otherwise chain is not completed
            if (chain.isLoop || this.grid.tiles[targetPositionIndex].unit === null) {
                return this.moveUnits(chain.units);
            }
            return [];
        }
        removeUnit(unit) {
            const [x, y] = unit.position;
            const unitPositionIndex = this.grid.getIndexByPosition(x, y);
            this.grid.tiles[unitPositionIndex].unit = null;
            this.movements.delete(unit.targetPosition);
            removeItem(this.units, unit);
        }
        moveUnits(units) {
            return units.map(unit => {
                this.movements.delete(unit.targetPosition);
                return unit.moveByPath();
            });
        }
        cancelMove(unit) {
            const { units } = this.getMoveChain(unit, false);
            this.chancelUnitsMoves(units);
        }
        chancelUnitsMoves(units) {
            units.forEach(unit => {
                if (unit.targetPosition !== null) {
                    this.movements.delete(unit.targetPosition);
                    unit.cancelMove();
                }
            });
        }
        getMoveChain(unitToMove, immediate) {
            const sources = [];
            const units = [];
            while (!isNill(unitToMove === null || unitToMove === void 0 ? void 0 : unitToMove.targetPosition) && (!immediate || (unitToMove.hasEnoughPointsToMove() && unitToMove.isNextTurnPathPassable()))) {
                const [fromX, fromY] = unitToMove.position;
                const sourcePositionIndex = this.grid.getIndexByPosition(fromX, fromY);
                if (sources.includes(sourcePositionIndex)) {
                    return { units, isLoop: true };
                }
                units.push(unitToMove);
                sources.push(sourcePositionIndex);
                unitToMove = this.movements.get(sourcePositionIndex);
            }
            return { units, isLoop: false };
        }
    }

    class World {
        static createEmptyWorldData(width, height) {
            const emptyTiles = createEmptyTileDatas(width, height);
            return this.fromMap(emptyTiles, width);
        }
        static createEmptyWorld(width, height) {
            const emptyWorldData = this.createEmptyWorldData(width, height);
            return World.fromData(emptyWorldData);
        }
        static fromDryLandBitMap(bitMap, width) {
            const tiles = bitMap.map(dryLand => getDefaultTileData(dryLand ? GRASSLAND : SEA));
            return this.fromData(this.fromMap(tiles, width));
        }
        static fromData(data) {
            const grid = GameGrid.createFromTilesData(data.tiles, data.width);
            return new World(grid, data);
        }
        constructor(grid, data) {
            this.grid = grid;
            this.turnNumber = data.turnNumber;
            this.citiesService = new CitiesService(grid, data.cities, data.nextCityId);
            this.citiesService.onUnitCreated(payload => {
                this.unitCreationHandler(payload);
            });
            this.unitsService = new UnitsService(grid, data.units);
        }
        unitCreationHandler({ cityPositionIndex, unitTypeId }) {
            const unitType = UNITS[unitTypeId - 1];
            const [x, y] = this.grid.getPositionByIndex(cityPositionIndex);
            this.placeUnit(x, y, { type: unitType });
        }
        turn() {
            if (this.turnNumber === World.MAX_TURN_NUMBER) {
                console.warn('Max turns reached');
                this.turnNumber = 1;
            }
            const citiesEvents = this.citiesService.turn();
            const unitsTurnResult = this.unitsService.turn();
            ++this.turnNumber;
            return citiesEvents.concat(unitsTurnResult.moves, unitsTurnResult.canceledMoved);
        }
        moveUnit(unitToMove, toX, toY) {
            return this.unitsService.moveUnit(unitToMove, toX, toY);
        }
        placeTerrain(x, y, terrain) {
            const tile = this.grid.get(x, y);
            if (!terrain.dryLand && tile.city || tile.unit) {
                return false;
            }
            tile.terrain = terrain;
            const { influencedBy } = tile;
            if (influencedBy) {
                influencedBy.assignments.recalculate();
            }
            if (Direction.axial.some(({ dx, dy }) => this.grid.get(x + dx, y + dy).influencedBy)) {
                this.citiesService.updateTilesToExpand();
            }
            return true;
        }
        placeUnit(x, y, data = {}) {
            return this.unitsService.placeUnit(x, y, data);
        }
        removeUnit(unit) {
            this.unitsService.removeUnit(unit);
        }
        foundCity(x, y, setting) {
            return this.citiesService.foundCity(x, y, setting);
        }
        captureTile(cityX, cityY, tileX, tileY) {
            this.citiesService.captureTile(cityX, cityY, tileX, tileY);
        }
        setCityProject(cityPositionIndex, productId) {
            const projectType = productId !== null
                ? CITY_PROJECTS.find(project => project.productId === productId)
                : null;
            this.citiesService.setProject(cityPositionIndex, projectType);
        }
        get cities() {
            return this.citiesService.cities;
        }
        get units() {
            return this.unitsService.units;
        }
        get nextCityId() {
            return this.citiesService.nextCityId;
        }
        get tiles() {
            return this.grid.tiles;
        }
        get width() {
            return this.grid.width;
        }
        get height() {
            return this.grid.height;
        }
    }
    World.MAX_TURN_NUMBER = Math.pow(2, 16);
    World.fromMap = (tiles, width) => ({
        tiles,
        width,
        height: tiles.length / width,
        cities: [],
        units: [],
        turnNumber: 1,
        nextCityId: 0
    });

    const getTileBorderRects = (tileSize) => [
        [0, 0, tileSize, 1],
        [tileSize - 1, 0, 1, tileSize],
        [0, tileSize - 1, tileSize, 1],
        [0, 0, 1, tileSize]
    ];
    function getBorderRenderer(tileSize) {
        const rects = getTileBorderRects(tileSize);
        return (context, x, y, borders) => {
            const filledRects = rects.filter((rect, index) => borders[index]);
            filledRects.forEach(([x0, y0, w, h]) => {
                context.fillRect(x + x0, y0 + y, w, h);
            });
        };
    }

    class Layer {
        constructor(view, context) {
            this.view = view;
            this.context = context;
        }
        drawSprite(spriteIndex, vx, vy) {
            const { tileSize } = this.view;
            const colCount = spriteImage.width / tileSize;
            const [stx, sty] = getPositionByIndex(spriteIndex, colCount);
            const sx = stx * tileSize;
            const sy = sty * tileSize;
            this.context.drawImage(spriteImage, sx, sy, tileSize, tileSize, vx, vy, tileSize, tileSize);
        }
        clearTile(tileX, tileY) {
            const [vx, vy] = this.view.toCanvasPosition(tileX, tileY);
            const { tileSize } = this.view;
            this.context.clearRect(vx, vy, tileSize, tileSize);
        }
        clear() {
            this.context.clearRect(0, 0, this.view.width, this.view.height);
        }
        moveViewport(dx, dy) {
            const { context } = this;
            const { width, height, tileSize } = this.view;
            if (dx !== 0) {
                const dxt = dx * tileSize;
                const delta = dx > 0 ? dxt : width + dxt;
                const leftImageData = context.getImageData(0, 0, delta, height);
                const rightImageData = context.getImageData(delta, 0, width - delta, height);
                context.putImageData(leftImageData, width - delta, 0);
                context.putImageData(rightImageData, 0, 0);
            }
            if (dy !== 0) {
                const dyt = dy * tileSize;
                const delta = dy > 0 ? dyt : height + dyt;
                const topImageData = context.getImageData(0, 0, width, delta);
                const bottomImageData = context.getImageData(0, delta, width, height - delta);
                context.putImageData(topImageData, 0, height - delta);
                context.putImageData(bottomImageData, 0, 0);
            }
        }
    }

    const TERRAIN_COLORS = {
        grassland: '#388E3C',
        steppe: '#88C34A',
        sea: '#0090c4'
    };
    class TerrainLayer extends Layer {
        drawTerrain(vx, vy, terrainTypeName) {
            this.context.fillStyle = TERRAIN_COLORS[terrainTypeName];
            const { tileSize } = this.view;
            this.context.fillRect(vx, vy, tileSize, tileSize);
        }
    }

    class GridLayer extends Layer {
        drawGrid() {
            this.context.fillStyle = GridLayer.GRID_COLOR;
            const { tileSize } = this.view;
            const { width, height } = this.context.canvas;
            for (let x = tileSize; x < width; x += this.view.tileSize) {
                this.context.fillRect(x, 0, 1, height);
            }
            for (let y = tileSize; y < height; y += this.view.tileSize) {
                this.context.fillRect(0, y, width, 1);
            }
        }
        moveViewport() { }
    }
    GridLayer.GRID_COLOR = '#555';

    const BORDERS_COLOR = '#333';
    const PATH_COLOR = '#5af';
    const getBorderTiles = (x, y) => getCircleBorderTiles(x, y, MAX_CITY_WORKABLE_OCTILE_RADIUS);
    const PATH_MARK_RADIUS = 4;
    class SelectionLayer extends Layer {
        constructor(view, context, borderRenderer) {
            super(view, context);
            this.borderRenderer = borderRenderer;
        }
        drawMaxCityBorders([x, y]) {
            this.context.fillStyle = BORDERS_COLOR;
            const borderTiles = getBorderTiles(x, y);
            borderTiles.forEach(tile => {
                const [x, y] = this.view.toCanvasPosition(...tile.position);
                this.borderRenderer(this.context, x, y, tile.borders);
            });
        }
        clearMaxCityMaxBorders([x, y]) {
            const borderTiles = getBorderTiles(x, y);
            borderTiles.forEach(({ position: [x, y] }) => {
                this.clearTile(x, y);
            });
        }
        drawCitizenDistribution(city) {
            for (const [x, y] of city.assignmentsPositions) {
                this.drawCitizen(x, y);
            }
        }
        clearCitizenDistribution(city) {
            for (const [x, y] of city.influencedPositions) {
                this.clearTile(x, y);
            }
        }
        drawCitizen(x, y) {
            const [vx, vy] = this.view.toCanvasPosition(x, y);
            this.drawSprite(3, vx, vy);
        }
        drawPath(path) {
            this.context.fillStyle = PATH_COLOR;
            for (let i = 0; i < path.length; i++) {
                const positionIndex = path[i];
                const [x, y] = this.view.grid.getPositionByIndex(positionIndex);
                const [vx, vy] = this.view.toCanvasPosition(x, y);
                this.drawPathNode(vx, vy);
            }
        }
        drawPathNode(vx, vy) {
            const offset = this.view.tileSize / 2;
            const x0 = vx + offset;
            const y0 = vy + offset;
            this.context.beginPath();
            this.context.arc(x0, y0, PATH_MARK_RADIUS, 0, 2 * Math.PI, false);
            this.context.closePath();
            this.context.fill();
        }
        drawUnitSelection(x, y, path) {
            if (path.length > 0) {
                this.drawPath(path);
            }
            const [vx, vy] = this.view.toCanvasPosition(x, y);
            this.context.strokeStyle = '#000';
            this.context.beginPath();
            this.context.rect(vx + 2, vy + 2, this.view.tileSize - 3, this.view.tileSize - 3);
            this.context.closePath();
            this.context.stroke();
        }
        clearPath(path) {
            path.forEach(positionIndex => {
                const [x, y] = this.view.grid.getPositionByIndex(positionIndex);
                this.clearTile(x, y);
            });
        }
        clearUnitSelection(x, y, path) {
            super.clearTile(x, y);
            this.clearPath(path);
        }
        drawCitySelection(city) {
            this.drawCitizenDistribution(city);
            this.drawMaxCityBorders(city.position);
        }
        clearCitySelection(city) {
            this.clearMaxCityMaxBorders(city.position);
            this.clearCitizenDistribution(city);
        }
    }

    class BordersLayer extends Layer {
        constructor(view, context, bordersRenderer) {
            super(view, context);
            this.context.fillStyle = BordersLayer.BORDERS_COLOR;
            this.bordersRenderer = bordersRenderer;
        }
        drawTileBorders(vx, vy, borders) {
            this.bordersRenderer(this.context, vx, vy, borders);
        }
    }
    BordersLayer.BORDERS_COLOR = '#000';

    class ObjectsLayer extends Layer {
        drawUnit(vx, vy, unitTypeId) {
            this.drawSprite(unitTypeId - 1, vx, vy);
        }
        drawHouse(vx, vy) {
            this.drawSprite(4, vx, vy);
        }
        drawCityWithGarrison(vx, vy) {
            this.drawSprite(5, vx, vy);
        }
    }

    var layers = {
        terrain: TerrainLayer,
        grid: GridLayer,
        borders: BordersLayer,
        objects: ObjectsLayer,
        selection: SelectionLayer
    };

    function forIn(object, callback) {
        Object.keys(object).forEach((key) => {
            callback(object[key], key);
        });
    }
    function mapValues(object, callback) {
        const result = {};
        forIn(object, (value, key) => {
            const newValue = callback(value, key);
            result[key] = newValue;
        });
        return result;
    }

    const upperFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    /**
     * Coordinates
     *
     * viewportPosition = [ vx0, vy0 ];
     * inViewportPosition = [ vx, vy ];
     * tilePosition = [ tx, ty ];
     * mousePosition = [ mx, my ];
     *
     */
    // TODO: too large file
    class View {
        static getLayerId(name) {
            return View.LAYER_ID_PREFIX + name;
        }
        constructor(world, selectionHandlers, tileSize = View.DEFAULT_TILE_SIZE) {
            this.world = world;
            this.selectionHandlers = selectionHandlers;
            this.tileSize = tileSize;
            this.selectedUnit = null;
            this.selectedCity = null;
            this.viewportPosition = [0, 0];
            this.selectors = [
                ({ unit }) => this.selectUnit(unit),
                ({ city }) => this.selectCity(city),
                () => this.clearSelection()
            ];
            this.eventHandlers = {
                onPopulationIncreased: ({ city }) => {
                    var _a;
                    if (((_a = this.selectedCity) === null || _a === void 0 ? void 0 : _a.id) === city.id) {
                        this.layers.selection.drawCitizenDistribution(city);
                    }
                },
                onBordersExpanded: ({ city, position }) => {
                    var _a;
                    const [tileX, tileY] = position;
                    this.drawCapturedTileBorders(tileX, tileY);
                    if (((_a = this.selectedCity) === null || _a === void 0 ? void 0 : _a.id) === city.id) {
                        this.refreshCitySelection();
                    }
                },
                onUnitMoved: ({ path }) => {
                    const [fromX, fromY] = path[0];
                    const [toX, toY] = last(path);
                    const { unit } = this.grid.get(toX, toY);
                    const fromTile = this.grid.get(fromX, fromY);
                    if (fromTile.unit === null && fromTile.city === null) {
                        this.layers.objects.clearTile(fromX, fromY);
                    }
                    else {
                        this.drawObject(fromX, fromY);
                    }
                    this.drawObject(toX, toY);
                    if (this.selectedUnit === unit) {
                        this.layers.selection.clear();
                        this.layers.selection.drawUnitSelection(toX, toY, unit.path);
                    }
                },
                onMoveCanceled: ({ from: [fromX, fromY] }) => {
                    const { unit } = this.grid.get(fromX, fromY);
                    if (this.selectedUnit === unit) {
                        this.layers.selection.clear();
                        this.layers.selection.drawUnitSelection(fromX, fromY, unit.path);
                    }
                },
                onUnitCompleted: ({ cityPositionIndex }) => {
                    const [tileX, tileY] = this.grid.getPositionByIndex(cityPositionIndex);
                    this.drawObject(tileX, tileY);
                }
            };
            this.bordersRender = getBorderRenderer(tileSize);
        }
        get grid() {
            return this.world.grid;
        }
        get width() {
            return this.world.width * this.tileSize;
        }
        get height() {
            return this.world.height * this.tileSize;
        }
        handleEvent(event) {
            this.eventHandlers[`on${upperFirst(event.type)}`](event.payload);
        }
        createLayer(name) {
            const canvas = $('canvas', {
                id: View.getLayerId(name),
                width: this.width,
                height: this.height
            });
            this.layersContainer.appendChild(canvas);
            return canvas.getContext('2d', { willReadFrequently: true });
        }
        createLayers() {
            this.layers = {};
            for (const [layerName, Layer] of Object.entries(layers)) {
                const context = this.createLayer(layerName);
                this.layers[layerName] = new Layer(this, context, this.bordersRender);
            }
            this.layers.grid.drawGrid();
        }
        mount(container) {
            this.layersContainer = $('div', {
                id: 'layers',
                style: {
                    width: this.width + 'px',
                    height: this.height + 'px'
                }
            });
            this.createLayers();
            container.appendChild(this.layersContainer);
        }
        canCapture(tileX, tileY) {
            return this.selectedCity.influence.canExpandToPosition([tileX, tileY]);
        }
        drawCapturedTileBorders(tileX, tileY) {
            this.drawBorders(tileX, tileY);
            for (const { dx, dy } of Direction.axial) {
                const nextX = tileX + dx;
                const nextY = tileY + dy;
                if (this.grid.get(nextX, nextY).influencedBy) {
                    this.drawBorders(tileX + dx, tileY + dy);
                }
            }
        }
        captureTile(tileX, tileY) {
            const [cx, cy] = this.selectedCity.position;
            this.world.captureTile(cx, cy, tileX, tileY);
            this.drawCapturedTileBorders(tileX, tileY);
        }
        selectCity(city) {
            const canSelect = !!city;
            if (canSelect) {
                this.clearSelection();
                this.selectedCity = city;
                this.drawCitySelection();
                this.selectionHandlers.onCitySelected(city);
            }
            return canSelect;
        }
        selectUnit(unit) {
            const canSelect = !!unit;
            if (canSelect) {
                this.clearSelection();
                this.selectedUnit = unit;
                const [x, y] = unit.position;
                this.layers.selection.drawUnitSelection(x, y, unit.path);
            }
            return canSelect;
        }
        select(tile, firstClick = true) {
            const startIndex = firstClick ? 0 : 1;
            for (let index = startIndex; index < this.selectors.length; index++) {
                const selector = this.selectors[index];
                const isSelected = selector(tile);
                if (isSelected) {
                    break;
                }
            }
        }
        onTileClick(tileX, tileY) {
            if (this.selectedCity && this.canCapture(tileX, tileY)) {
                this.captureTile(tileX, tileY);
                return;
            }
            const obj = this.selectedUnit || this.selectedCity;
            const firstClick = !isPositionsEqual(obj === null || obj === void 0 ? void 0 : obj.position, [tileX, tileY]);
            const tile = this.grid.get(tileX, tileY);
            this.select(tile, firstClick);
        }
        drawCitySelection() {
            this.layers.selection.drawCitySelection(this.selectedCity);
            for (const [x, y] of this.selectedCity.assignmentsPositions) {
                const { unit } = this.grid.get(x, y);
                if (unit) {
                    this.layers.objects.clearTile(x, y);
                }
            }
        }
        clearSelection() {
            this.unselectUnit();
            this.unselectCity();
        }
        refreshCitySelection() {
            this.clearCitySelection();
            this.drawCitySelection();
        }
        unselectCity() {
            if (this.selectedCity !== null) {
                this.clearCitySelection();
                this.selectedCity = null;
            }
        }
        clearCitySelection() {
            this.selectionHandlers.onClearSelection();
            this.layers.selection.clearCitySelection(this.selectedCity);
            for (const [x, y] of this.selectedCity.assignmentsPositions) {
                const { unit } = this.grid.get(x, y);
                if (unit) {
                    const [vx, vy] = this.toCanvasPosition(x, y);
                    this.layers.objects.drawUnit(vx, vy, unit.type.id);
                }
            }
        }
        unselectUnit() {
            if (this.selectedUnit) {
                this.clearUnitSelection();
                this.selectedUnit = null;
            }
        }
        clearUnitSelection() {
            this.selectionHandlers.onClearSelection();
            const [x, y] = this.selectedUnit.position;
            this.layers.selection.clearUnitSelection(x, y, this.selectedUnit.path);
            this.selectedUnit = null;
        }
        changeCityProject(productId) {
            const [cx, cy] = this.selectedCity.position;
            const cityPositionIndex = this.grid.getIndexByPosition(cx, cy);
            this.world.setCityProject(cityPositionIndex, productId);
        }
        moveUnit(tileX, tileY) {
            const unit = this.selectedUnit;
            const targetTile = this.world.grid.get(tileX, tileY);
            const unitOnTargetTile = targetTile.unit;
            if (unitOnTargetTile &&
                unitOnTargetTile !== unit &&
                !this.grid.isAdjacentPositions(unit.position, [tileX, tileY])) {
                return; // TODO ?
            }
            const events = this.world.moveUnit(unit, tileX, tileY);
            events.forEach(event => {
                this.handleEvent(event);
            });
            if (events.length === 0) {
                const unitToSelect = unitOnTargetTile || unit;
                this.layers.selection.clear();
                this.selectUnit(unitToSelect);
            }
        }
        draw() {
            for (let i = 0; i < this.grid.tiles.length; i++) {
                const [x, y] = this.grid.getPositionByIndex(i);
                this.drawTile(x, y);
            }
        }
        toCanvasPosition(x, y) {
            const [vx0, vy0] = this.viewportPosition;
            const [tx, ty] = this.grid.getPosition(x - vx0, y - vy0);
            return [
                tx * this.tileSize,
                ty * this.tileSize
            ];
        }
        moveViewport(dx, dy) {
            const [x0, y0] = this.viewportPosition;
            this.viewportPosition = this.grid.getPosition(x0 + dx, y0 + dy);
            forIn(this.layers, layer => {
                layer.moveViewport(dx, dy);
            });
        }
        removeSelectedUnit() {
            if (this.selectedUnit) {
                const [x, y] = this.selectedUnit.position;
                this.world.removeUnit(this.selectedUnit);
                this.drawObject(x, y);
                this.clearUnitSelection();
            }
        }
        placeTerrain(tx, ty, terrain) {
            this.world.placeTerrain(tx, ty, TERRAINS[terrain - 1]);
            this.drawTile(tx, ty);
        }
        drawBorders(tileX, tileY) {
            this.layers.borders.clearTile(tileX, tileY);
            const mask = Direction.axial.map(({ dx, dy }) => (!this.grid.get(tileX + dx, tileY + dy).influencedBy));
            const [vx, vy] = this.toCanvasPosition(tileX, tileY);
            this.layers.borders.drawTileBorders(vx, vy, mask);
        }
        drawObject(tileX, tileY) {
            const [vx, vy] = this.toCanvasPosition(tileX, tileY);
            const { unit, city } = this.grid.get(tileX, tileY);
            this.layers.objects.clearTile(tileX, tileY);
            if (unit && city) {
                this.layers.objects.drawCityWithGarrison(vx, vy);
            }
            else if (unit) {
                this.layers.objects.drawUnit(vx, vy, unit.type.id);
            }
            else if (city) {
                this.layers.objects.drawHouse(vx, vy);
            }
        }
        drawTile(tx, ty) {
            const canvasPosition = this.toCanvasPosition(tx, ty);
            const tile = this.grid.get(tx, ty);
            const [vx, vy] = canvasPosition;
            this.layers.terrain.drawTerrain(vx, vy, tile.terrain.name);
            if (tile.city || tile.unit) {
                this.drawObject(tx, ty);
            }
            if (tile.influencedBy) {
                this.drawBorders(tx, ty);
            }
        }
        skipTurnsUntilEvent(maxTurnNumber = 1000) {
            let skippedTurns = maxTurnNumber;
            for (let i = 1; i <= maxTurnNumber; i++) {
                const events = this.world.turn();
                if (events.length > 0) {
                    events.forEach(event => {
                        this.handleEvent(event);
                    });
                    skippedTurns = i;
                    break;
                }
            }
            return skippedTurns;
        }
        update(world) {
            this.world = world;
            this.viewportPosition = [0, 0];
            this.layersContainer.innerHTML = '';
            Object.assign(this.layersContainer.style, {
                width: this.width + 'px',
                height: this.height + 'px'
            });
            this.createLayers();
            this.draw();
        }
        setGridShown(showGrid) {
            const gridCanvas = document.getElementById('layer-grid'); // TODO
            gridCanvas.style.display = showGrid ? 'block' : 'none';
        }
        turn() {
            const events = this.world.turn();
            events.forEach(event => {
                this.handleEvent(event);
            });
            return events;
        }
        placeUnit(tx, ty, unitTypeId) {
            this.world.placeUnit(tx, ty, { type: UNITS[unitTypeId - 1] });
            this.drawObject(tx, ty);
        }
        placeCity(tx, ty, setting) {
            const city = this.world.foundCity(tx, ty, setting);
            if (!city) {
                return;
            }
            this.drawObject(tx, ty);
            // TODO wont work if placed city has expanded borders
            for (const { dx, dy } of Direction.members) {
                this.drawCapturedTileBorders(tx + dx, ty + dy);
            }
        }
        getViewportPosition() {
            return this.viewportPosition;
        }
    }
    View.DEFAULT_TILE_SIZE = 32;
    View.LAYER_ID_PREFIX = 'layer-';

    const ID_PREFIX = 'checkbox';
    let id = 0;
    const nextId = () => `${ID_PREFIX}-${id++}`;
    class LabeledCheckBox extends Component {
        constructor(props) {
            const { checked = false, id = nextId() } = props;
            super(Object.assign(Object.assign({}, props), { checked,
                id }));
        }
        render() {
            return $('div', { className: 'labeled-checkbox' }, [
                this.checkBox = $('input', {
                    type: 'checkbox',
                    id: this.props.id,
                    checked: this.props.checked,
                    onchange: (e) => {
                        const checkbox = e.target;
                        this.props.checked = checkbox.checked;
                        this.props.onChange(checkbox.checked);
                    }
                }),
                $('label', this.props.label, { htmlFor: this.props.id })
            ]);
        }
        get selected() {
            return this.props.checked;
        }
        set selected(checked) {
            this.props.checked = checked;
            this.checkBox.checked = checked;
        }
    }

    class ToolsPanel extends Component {
        constructor() {
            super(...arguments);
            this.components = [];
        }
        onToolSelected(selectedComponent) {
            for (const component of this.components) {
                component.selected = component === selectedComponent;
            }
        }
        clearToolSelection() {
            this.props.onChange(null);
            for (const component of this.components) {
                component.selected = false;
            }
        }
        render() {
            return $('div', { className: 'controls-group' }, this.props.tools.map(tool => {
                const component = tool.createComponent({
                    onSelect: tool => {
                        this.props.onChange(tool);
                        this.onToolSelected(component);
                    },
                    onUnselect: () => {
                        this.props.onChange(null);
                    }
                });
                this.components.push(component);
                return component.render();
            }));
        }
    }

    class Dropdown extends Component {
        render() {
            return this.element = $('select', {
                disabled: this.props.disabled,
                onchange: () => {
                    const selectedItem = this.props.items[this.element.selectedIndex];
                    this.props.onChange(selectedItem);
                }
            }, this.props.items.map(item => $('option', item.name, { value: item.id.toString() })));
        }
        set selectedItemId(itemId) {
            this.element.selectedIndex = this.props.items.findIndex(item => item.id === itemId);
        }
        set disabled(disabled) {
            this.props.disabled = disabled;
            this.element.disabled = disabled;
        }
    }

    const buildProjectItems = () => [{ id: 0, name: '-' }].concat(CITY_PROJECTS.map((project, index) => ({
        id: project.productId,
        name: `${UNITS[index].name} (${project.cost})`
    })));
    class ProjectSelector extends Component {
        render() {
            this.dropdown = new Dropdown({
                disabled: true,
                items: buildProjectItems(),
                onChange: this.props.onChange
            });
            return $('div', { className: 'controls-group labeled' }, [
                // TODO: $('span', { className: 'label' }, 'City Project:'),
                $('span', 'City Project:', { className: 'label' }),
                this.dropdown.render()
            ]);
        }
        set projectId(projectId) {
            this.dropdown.disabled = false;
            this.dropdown.selectedItemId = projectId;
        }
        disable() {
            this.dropdown.selectedItemId = 0;
            this.dropdown.disabled = true;
        }
    }

    class NextTurn extends Component {
        constructor() {
            super(...arguments);
            this.skipSilentTurns = false;
            this.skipSilentTurnsCheckBox = new LabeledCheckBox({
                label: 'Skip Silent Turns',
                onChange: checked => {
                    this.skipSilentTurns = checked;
                },
            });
        }
        render() {
            return $('div', { className: 'controls-group' }, [
                $('button', 'Turn', {
                    onclick: () => {
                        this.props.onTurn(this.skipSilentTurns);
                    }
                }),
                this.skipSilentTurnsCheckBox.render()
            ]);
        }
    }

    class BottomPanel extends Component {
        render() {
            this.showGridComponent = new LabeledCheckBox({
                label: 'Grid',
                checked: this.props.gridShown,
                onChange: this.props.onToggleGrid
            });
            this.toolsPanel = new ToolsPanel({
                tools: this.props.tools,
                onChange: tool => {
                    this.props.onToolSelected(tool);
                }
            });
            this.projectSelector = new ProjectSelector({
                onChange: this.props.onCityProjectChanged
            });
            this.nextTurn = new NextTurn({
                onTurn: skipSilentTurns => {
                    if (skipSilentTurns) {
                        this.props.onSkipTurns();
                    }
                    else {
                        this.props.onTurn();
                    }
                }
            });
            return $('div', { className: 'bottom-panel' }, [
                $('div', { className: 'controls-panel' }, [
                    this.showGridComponent.render(),
                    this.nextTurn.render(),
                    this.toolsPanel.render(),
                    this.projectSelector.render()
                ]),
                this.infoSpan = $('span', '-')
            ]);
        }
        clearToolSelection() {
            this.toolsPanel.clearToolSelection();
        }
        set info(info) {
            this.infoSpan.innerHTML = info || '-';
        }
        set cityProject(projectTypeId) {
            this.projectSelector.projectId = projectTypeId;
        }
        unselectCity() {
            this.projectSelector.disable();
        }
    }

    function saveFile(name, bytes) {
        let binaryString = '';
        for (const b of bytes) {
            binaryString += String.fromCharCode(b);
        }
        const base64data = btoa(binaryString);
        const a = document.createElement('a');
        a.href = 'data:;base64,' + base64data;
        a.download = `${name}.save`;
        a.click();
    }

    // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');
    const stringToUtf8ByteArray = (str) => encoder.encode(str);
    const utf8ByteArrayToString = (bytes) => {
        const { buffer } = new Uint8Array(bytes);
        return decoder.decode(buffer);
    };
    const serializeNotEmptyString = (str, sizeBits) => {
        if (!str) {
            throw new Error('Serialized string must not be empty');
        }
        const maxStringBytes = Math.pow(2, sizeBits);
        const bytes = stringToUtf8ByteArray(str);
        if (bytes.length > maxStringBytes) {
            throw new Error(`Max string size exceeded. ${bytes.length} > ${maxStringBytes}`);
        }
        const lengthBooleans = uintToBooleans(bytes.length - 1, sizeBits);
        return lengthBooleans.concat(bytesToBooleans(bytes));
    };
    const deserializeNotEmptyString = (booleans, sizeBits) => {
        const bytesCount = nextUint(booleans, sizeBits) + 1;
        const stringBytes = nextBytes(booleans, bytesCount);
        return utf8ByteArrayToString(stringBytes);
    };

    const uint = (bitsCount, minValue = 0) => {
        const maxValue = Math.pow(2, bitsCount) + minValue - 1;
        return {
            read: booleans => nextUint(booleans, bitsCount) + minValue,
            write: value => {
                if (value > maxValue) {
                    throw new Error('Overflow error');
                }
                return uintToBooleans(value - minValue, bitsCount);
            }
        };
    };
    const notEmptyString = sizeBits => {
        return {
            read: booleans => deserializeNotEmptyString(booleans, sizeBits),
            write: str => serializeNotEmptyString(str, sizeBits)
        };
    };

    const getSimpleAttribute = (name, serializer) => ({
        name,
        read: input => ({ [name]: serializer.read(input) }),
        write: value => serializer.write(value)
    });

    const getDefaultParams = () => ({
        context: {},
        data: {}
    });
    function deserialize(input, config, params = getDefaultParams()) {
        const normalizedParams = Object.assign(Object.assign({}, getDefaultParams()), params);
        const { data } = normalizedParams;
        for (const attribute of config) {
            const output = attribute.read(input, normalizedParams);
            if (typeof output === 'object') {
                Object.assign(data, output);
            }
        }
        return data;
    }
    function serialize(data, config, context = {}) {
        const output = [];
        const params = { data, context };
        for (const attribute of config) {
            const value = data[attribute.name];
            const booleans = attribute.write(value, params);
            // TODO: optimize
            for (const boolean of booleans) {
                output.push(boolean);
            }
        }
        return output;
    }

    function buildWorkAreaSerializationData(city, worldSize) {
        const relativeInfluence = getRelativePositions(city.position, city.influencedPositions, worldSize.width, worldSize.height);
        const [minX, minY, maxX, maxY] = findBounds(relativeInfluence);
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        /*
         * TODO: save several bits and store cityIndex in influence ?
         * getMaxBitsCount(influencedPositions.length)
         */
        const cityIndex = getIndexByPosition(Math.abs(minX), Math.abs(minY), width);
        const normalizedInfluence = relativeInfluence
            .map(([x, y]) => getIndexByPosition(x - minX, y - minY, width));
        const influenceSize = width * height;
        const influence = [];
        const assignments = [];
        for (let i = 0; i < influenceSize; i++) {
            const index = normalizedInfluence.indexOf(i);
            const influenced = index >= 0;
            influence.push(influenced);
            if (influenced) {
                const influencedPosition = city.influencedPositions[index];
                const occupied = includesPosition(city.assignmentsPositions, influencedPosition);
                assignments.push(occupied);
            }
        }
        return {
            width, height,
            cityIndex,
            influence,
            assignments,
            influenceSize: city.influencedPositions.length
        };
    }
    function serializationDataToWorkArea(workArea, cityPosition, worldSize) {
        const influence = [];
        const { width, height } = workArea;
        const length = width * height;
        const [rx, ry] = getPositionByIndex(workArea.cityIndex, width);
        const [dx, dy] = [cityPosition[0] - rx, cityPosition[1] - ry];
        for (let index = 0; index < length; index++) {
            if (workArea.influence[index]) {
                const [ix, iy] = getPositionByIndex(index, width);
                const [x, y] = getCyclicPosition(ix + dx, iy + dy, worldSize.width, worldSize.height);
                influence.push([x, y]);
            }
        }
        const assignmentsPositions = [];
        for (let index = 0; index < workArea.assignments.length; index++) {
            if (workArea.assignments[index]) {
                assignmentsPositions.push(influence[index]);
            }
        }
        return {
            position: cityPosition,
            influencedPositions: influence,
            assignmentsPositions,
        };
    }

    // max bytes in UTF-8 character is 4
    // max length = 128 / 4 = 32
    // reasonable user input limit is 30
    // potentially length > 30 can signalize that stored is string is longest
    const CITY_NAME_SIZE_IN_BITS = 7;
    const MIN_INFLUENCE_SIDE = 3; // ?
    const INFLUENCE_MASK_SIDE_BITS = 3;
    const cityNameSerializer = notEmptyString(CITY_NAME_SIZE_IN_BITS);
    const expandingProgress = uint(7); // TODO: why 7 ?
    const influenceSide = uint(INFLUENCE_MASK_SIDE_BITS, MIN_INFLUENCE_SIDE);
    const PROJECT_ID_SIZE = 3;
    const projectIdSerializer = uint(PROJECT_ID_SIZE);
    const getFoodBasketSizeBitsCount = (assignmentsCount, influenceSize) => assignmentsCount === influenceSize ? 0 : getMaxBitsCount(getFoodBasketSize(assignmentsCount));
    const cityConfig = [
        {
            name: 'id',
            read: (input, { context }) => ({ id: nextUint(input, context.cityIdSize) }),
            write: (id, { context }) => uintToBooleans(id, context.cityIdSize)
        },
        getSimpleAttribute('name', cityNameSerializer),
        {
            write(_, { data, context }) {
                const workAreaSerializationData = buildWorkAreaSerializationData(data, context.worldSize);
                return serialize(workAreaSerializationData, workAreaConfig);
            },
            read(input, { context }) {
                const data = deserialize(input, workAreaConfig);
                return serializationDataToWorkArea(data, context.position, context.worldSize);
            }
        },
        {
            name: 'project',
            read: input => {
                const projectTypeId = projectIdSerializer.read(input);
                if (projectTypeId === 0) {
                    return { project: null };
                }
                const projectType = CITY_PROJECTS[projectTypeId - 1];
                const size = getMaxBitsCount(projectType.cost);
                const progress = nextUint(input, size);
                return {
                    project: {
                        type: projectType,
                        progress
                    }
                };
            },
            write: (project) => {
                if (project === null) {
                    return generateArray(PROJECT_ID_SIZE, getFalse);
                }
                const size = getMaxBitsCount(project.type.cost);
                return projectIdSerializer.write(project.type.productId)
                    .concat(uintToBooleans(project.progress, size));
            }
        },
        {
            name: 'growthProgress',
            write(growthProgress, { data }) {
                const valueSize = getFoodBasketSizeBitsCount(data.assignmentsPositions.length, data.influencedPositions.length);
                return uintToBooleans(growthProgress, valueSize);
            },
            read(input, { data }) {
                const valueSize = getFoodBasketSizeBitsCount(data.assignmentsPositions.length, data.influencedPositions.length);
                return ({ growthProgress: nextUint(input, valueSize) });
            }
        },
        getSimpleAttribute('expandingProgress', expandingProgress)
    ];
    const workAreaConfig = [
        getSimpleAttribute('width', influenceSide),
        getSimpleAttribute('height', influenceSide),
        {
            name: 'cityIndex',
            write(cityIndex, { data }) {
                return uintToBooleans(cityIndex, getMaxBitsCount(data.width * data.height));
            },
            read(input, { data }) {
                return { cityIndex: nextUint(input, getMaxBitsCount(data.width * data.height)) };
            }
        },
        {
            name: 'influence',
            read(input, { data, context }) {
                const { booleans: influence, count } = nextBooleansWithTruesCount(input, data.width * data.height);
                context.influenceSize = count;
                return { influence };
            },
            write: (influence) => influence
        },
        {
            name: 'assignments',
            read: (input, { context }) => ({ assignments: nextBooleans(input, context.influenceSize) }),
            write: (assignments) => assignments
        }
    ];

    function serializeCity(city, worldSize, cityIdSize) {
        return serialize(city, cityConfig, { worldSize, cityIdSize });
    }
    function deserializeCity(booleans, position, worldSize, cityIdSize) {
        return deserialize(booleans, cityConfig, { context: { cityIdSize, position, worldSize } });
    }

    /*
     * Will be enough for change save version in every release.
     * Even if i'm going to change version every day in more then next
     * 150 years:
     * 150 * 366 = 54900; pow2(16) = 65536;
     * TODO: decrease ?
     *
     * TODO: use only 2 bits (0, 1, 2, 3)
     *
     * 0 -> migrate (3, 2, 1)
     * 1 -> migrate (0, 3, 2)
     * 2 -> migrate (1, 0, 3)
     * 3 -> migrate (2, 1, 0)
     */
    const SAVE_VERSION_BITS = 16;
    const SAVE_VERSION = 1;

    /*
     * Early game units
     *
     * Warrior
     * Settler
     * Worker
     * Archer ?
     * Ship ?
     *
     * total: ~5
     */
    const UNIT_TYPE_BITS_COUNT = 3;
    /*
     * Diagonal move base cost: 3
     * Penalties from hills, forest, river (3)
     * 3 + 3 * 3 = 12; pow2(4) = 16;
     */
    const UNIT_MOVE_POINTS_BITS_COUNT = 4;

    const unitTypeIdSerializer = uint(UNIT_TYPE_BITS_COUNT);
    const movePointsSerializer = uint(UNIT_MOVE_POINTS_BITS_COUNT);
    const getTargetPositionIndex = (targetPosition, position, worldWidth) => {
        if (targetPosition === null) {
            const [x, y] = position;
            return getIndexByPosition(x, y, worldWidth);
        }
        return targetPosition;
    };
    const unitConfig = [
        {
            name: 'type',
            read: input => {
                const unitTypeIndex = unitTypeIdSerializer.read(input);
                return { type: UNITS[unitTypeIndex] };
            },
            write: (type) => {
                return unitTypeIdSerializer.write(type.id - 1);
            }
        },
        getSimpleAttribute('movePoints', movePointsSerializer),
        {
            name: 'targetPosition',
            read(input, { context: { targetIndexSize, positionIndex, worldWidth } }) {
                const targetPositionIndex = nextUint(input, targetIndexSize);
                const targetPosition = targetPositionIndex !== positionIndex ? targetPositionIndex : null;
                const position = getPositionByIndex(positionIndex, worldWidth);
                return ({ targetPosition, position });
            },
            write(targetPosition, { data, context: { targetIndexSize, worldWidth } }) {
                const positionIndex = getTargetPositionIndex(targetPosition, data.position, worldWidth);
                return uintToBooleans(positionIndex, targetIndexSize);
            }
        }
    ];

    function getContext(worldSize, position = null) {
        const { width, height } = worldSize;
        const context = {
            worldWidth: width,
            targetIndexSize: getTargetIndexSize(width, height)
        };
        if (position !== null) {
            const [x, y] = position;
            context.positionIndex = getIndexByPosition(x, y, width);
        }
        return context;
    }
    function getTargetIndexSize(worldWidth, worldHeight) {
        const tilesCount = worldWidth * worldHeight;
        return getMaxBitsCount(tilesCount);
    }

    function deserializeUnit(input, position, worldSize) {
        const context = getContext(worldSize, position);
        return deserialize(input, unitConfig, { context });
    }
    function serializeUnit(unit, worldSize) {
        const context = getContext(worldSize);
        return serialize(unit, unitConfig, context);
    }

    // to ensure that city affect itself in borders expanding mechanic
    // export const MIN_WORLD_SIDE = (cityRadius + padding) * 2 + 1;
    const MIN_WORLD_SIDE = 13;
    // just to restrict user input and defined bits count in serialization (?)
    const MAX_WORLD_SIDE = 265;

    const WORLD_SIDE_BITS_COUNT = getMaxBitsCount(MAX_WORLD_SIDE - MIN_WORLD_SIDE);
    const TERRAIN_BITS_COUNT = 3;
    const TURN_NUMBER_BITS = getMaxBitsCount(World.MAX_TURN_NUMBER - 1);
    const CITY_ID_SIZE_BITS_COUNT = 5;

    const saveVersionSerializer = uint(SAVE_VERSION_BITS);
    const getCityIdBitsCount = (nextCityId) => nextCityId > 0 ? getMaxBitsCount(nextCityId - 1) : 0;
    const writeSaveVersion = () => saveVersionSerializer.write(SAVE_VERSION);
    const readSaveVersion = (input) => saveVersionSerializer.read(input);
    function deserializeTile(input, position, worldSize, context) {
        const [cityPlaced, unitPlaced] = input;
        return {
            city: cityPlaced ? deserializeCity(input, position, worldSize, context.cityIdSize) : null,
            unit: unitPlaced ? deserializeUnit(input, position, worldSize) : null,
            terrain: TERRAINS[nextUint(input, TERRAIN_BITS_COUNT)]
        };
    }
    function serializeTile(tile, worldSize, cityIdSize) {
        const terrainBooleans = uintToBooleans(tile.terrain.id - 1, TERRAIN_BITS_COUNT);
        const { city, unit } = tile;
        const output = [!!city, !!unit];
        if (city) {
            output.push(...serializeCity(city, worldSize, cityIdSize));
        }
        if (unit) {
            output.push(...serializeUnit(unit, worldSize));
        }
        return output.concat(terrainBooleans);
    }
    function deserializeTiles(input, world, context) {
        const cities = [];
        const tiles = [];
        const units = [];
        for (let y = 0; y < world.height; y++) {
            for (let x = 0; x < world.width; x++) {
                const tile = deserializeTile(input, [x, y], world, context);
                const { city, unit } = tile;
                if (city) {
                    cities.push(city);
                    if (city.id >= world.nextCityId) {
                        world.nextCityId = city.id + 1;
                    }
                }
                if (unit) {
                    units.push(unit);
                }
                tiles.push(tile);
            }
        }
        return {
            tiles,
            cities,
            units
        };
    }
    function serializeTiles(tiles, worldSize, context) {
        const output = [];
        tiles.forEach(tile => {
            output.push(...serializeTile(tile, worldSize, context.cityIdSize));
        });
        return output;
    }

    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
        LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
        LogLevel[LogLevel["INFO"] = 2] = "INFO";
        LogLevel[LogLevel["WARN"] = 3] = "WARN";
        LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
        LogLevel[LogLevel["OFF"] = 5] = "OFF";
    })(LogLevel || (LogLevel = {}));
    const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'off'];
    const logger = Object.assign({ level: 0 }, logLevels.reduce((logFns, levelName, priority) => (Object.assign(Object.assign({}, logFns), { [levelName](message) {
            if (this.level <= priority) {
                console.log(message);
            }
        } })), {}));

    const worldSideSerializer = uint(WORLD_SIDE_BITS_COUNT, MIN_WORLD_SIDE);
    const turnNumberSerializer = uint(TURN_NUMBER_BITS, 1);
    const worldConfig = [
        {
            write: writeSaveVersion,
            read: input => {
                const version = readSaveVersion(input);
                logger.info(`save version: ${version}`);
            }
        },
        getSimpleAttribute('width', worldSideSerializer),
        getSimpleAttribute('height', worldSideSerializer),
        getSimpleAttribute('turnNumber', turnNumberSerializer),
        {
            name: 'nextCityId',
            write(nextCityId, { context }) {
                context.cityIdSize = getCityIdBitsCount(nextCityId);
                return uintToBooleans(context.cityIdSize, CITY_ID_SIZE_BITS_COUNT);
            },
            read(input, { context }) {
                context.cityIdSize = nextUint(input, CITY_ID_SIZE_BITS_COUNT);
            }
        },
        {
            name: 'tiles',
            write(tiles, { data, context }) {
                return serializeTiles(tiles, data, context);
            },
            read(input, { context, data }) {
                return deserializeTiles(input, data, context);
            }
        }
    ];
    /*
     * Version 16 bits +
     * seed -
     * game setting -
     * width, height
     * turnNumber (move up)
     * cityIdSize (move up)
     *
     * Tile
     *  terrain (3 bits) (will be 4 bits)
     *  (steppe, grassland, desert, tundra, snow, rainforest (jungle), marsh, floodplains, see, ocean, coast)
     * hills (1 bit) optional. not for all terrain types -
     * forest (1bit) optional. not for all terrain types -
     *
     * City
     * name, id
     * influence, job assignments, expanding progress, food basket
     *
     * Unit -
     * health, move point, path -
     * target position offset 16 bits (?) -
     * path: length, pathNode (8 directions) 3 bits -
     * control points, smoothing ? -
     *
     *
     * Validation
     * Distance between cities
     * Influence shape
     *
     */

    // maxCityId = 2 147 483 647
    /*
     * if there are no cities nextCityId = 0
     * if nextCityId = 1 => only one city with id = 0
     */
    const serializeWorld = (data) => serialize(data, worldConfig);
    function deserializeWorld(bytes) {
        const booleans = getBytesToBooleansIterator(bytes);
        return deserialize(booleans, worldConfig, { data: { nextCityId: 0 } });
    }

    function formatNumber(number, digits) {
        const stringified = number.toString();
        if (stringified.length >= digits) {
            return stringified;
        }
        const leadZerosCount = digits - stringified.length;
        return '0'.repeat(leadZerosCount) + stringified;
    }
    const formatTo2Digits = (number) => formatNumber(number, 2);
    const formatTo3Digits = (number) => formatNumber(number, 3);
    const formatYMD = (date, separator = '-') => [
        date.getFullYear(),
        formatTo2Digits(date.getMonth() + 1),
        formatTo2Digits(date.getDate())
    ].join(separator);
    const formatHMS = (date, separator = '.') => [
        formatTo2Digits(date.getHours()),
        formatTo2Digits(date.getMinutes()),
        formatTo2Digits(date.getSeconds())
    ].join(separator);
    const formatMS = (date) => formatTo3Digits(date.getMilliseconds());
    const formatFullDate = (date) => `${formatYMD(date)} ${formatHMS(date)}.${formatMS(date)}`;
    const getCurrentFormattedFullDate = () => formatFullDate(new Date());

    // two positive integer numbers without leading zeros separated by any non-numeric characters
    // with possible leading and trailing spaces
    const SIZE_PATTERN = /^\s*([1-9]\d*)[^\d]+([1-9]\d*)\s*$/;
    const parseSize = (size) => {
        const match = SIZE_PATTERN.exec(size);
        return match ? [+match[1], +match[2]] : null;
    };
    const SIDE_NAMES = ['width', 'height'];
    const validateSize = (size, minSide, maxSide) => {
        const errors = [];
        size.forEach((side, index) => {
            if (side < minSide) {
                const sideName = SIDE_NAMES[index];
                errors.push(`World ${sideName} must be equal or greater than ${minSide}`);
            }
            else if (side > maxSide) {
                const sideName = SIDE_NAMES[index];
                errors.push(`World ${sideName} must be equal or less than ${maxSide}`);
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

    class ToggledDropdown extends Component {
        render() {
            this.dropdown = new Dropdown({
                items: this.props.items,
                disabled: !this.props.selected,
                onChange: this.props.onItemSelected
            });
            return $('div', { className: 'toggled-dropdown' }, [
                this.checkbox = $('input', {
                    type: 'checkbox',
                    onchange: () => {
                        this.props.onToggle(this.checkbox.checked);
                        this.selected = this.checkbox.checked;
                    }
                }),
                this.dropdown.render()
            ]);
        }
        get selected() {
            return this.props.selected;
        }
        set selected(selected) {
            this.props.selected = selected;
            this.checkbox.checked = selected;
            this.dropdown.disabled = !selected;
        }
    }

    const createParametrizedTool = (id, items) => ({
        id,
        createComponent: ({ onSelect, onUnselect }) => {
            let selectedItemId = items[0].id;
            return new ToggledDropdown({
                items,
                selected: false,
                onToggle: selected => {
                    if (selected) {
                        onSelect({ id, option: selectedItemId });
                    }
                    else {
                        onUnselect();
                    }
                },
                onItemSelected: (item) => {
                    selectedItemId = item.id;
                    onSelect({ id, option: selectedItemId });
                }
            });
        }
    });
    const createSimpleTool = (id, label) => ({
        id,
        createComponent: ({ onSelect, onUnselect }) => {
            return new LabeledCheckBox({
                label,
                onChange: checked => {
                    if (checked) {
                        onSelect({ id, option: null });
                    }
                    else {
                        onUnselect();
                    }
                }
            });
        }
    });
    const tools = [
        createParametrizedTool('placeTerrain', TERRAINS),
        createParametrizedTool('placeUnit', UNITS),
        createSimpleTool('placeCity', 'City')
    ];

    const addListener = (element, type, listener) => {
        element.addEventListener(type, event => {
            event.preventDefault();
            listener(event);
        });
    };
    const addListeners = (element, listeners) => {
        forIn(listeners, (listener, eventName) => {
            addListener(element, eventName, listener);
        });
    };

    const getMousePosition = (event) => {
        const { offsetX, offsetY } = event;
        const { clientWidth, clientHeight } = event.target;
        const maxX = clientWidth - 1;
        const maxY = clientHeight - 1;
        return [
            clampPositive(offsetX, maxX),
            clampPositive(offsetY, maxY)
        ];
    };
    const LEFT_BUTTON = 0;
    const addMouseHandlers = (handlers, element) => {
        addListeners(element, {
            contextmenu: noop,
            mouseup: event => {
                const mousePosition = getMousePosition(event);
                if (event.button === LEFT_BUTTON) {
                    if (event.ctrlKey) {
                        handlers.onCtrlClick(mousePosition);
                    }
                    else {
                        handlers.onLeftClick(mousePosition);
                    }
                }
                else {
                    handlers.onRightClick(mousePosition);
                }
            },
            mousemove: event => {
                const mousePosition = getMousePosition(event);
                handlers.onMove(mousePosition);
            },
            mouseleave: () => {
                handlers.onLeave();
            }
        });
    };

    const getMouseClickHandler = (handler, getTilePosition) => mousePosition => {
        handler(getTilePosition(mousePosition));
    };
    const getMouseMoveHandlers = (moveHandlers, getTilePosition) => {
        let previousTilePosition = null;
        return {
            onMove: mousePosition => {
                const tilePosition = getTilePosition(mousePosition);
                if (!isPositionsEqual(tilePosition, previousTilePosition)) {
                    moveHandlers.onMove(tilePosition);
                    previousTilePosition = tilePosition;
                }
            },
            onLeave: () => {
                moveHandlers.onLeave();
                previousTilePosition = null;
            }
        };
    };
    const toMouseHandlers = (handlers, getTilePosition) => {
        const { onLeave, onMove } = handlers, mousePositionHandlers = __rest(handlers, ["onLeave", "onMove"]);
        const adaptedClickHandlers = mapValues(mousePositionHandlers, handler => (getMouseClickHandler(handler, getTilePosition)));
        return Object.assign(Object.assign({}, adaptedClickHandlers), getMouseMoveHandlers({ onMove, onLeave }, getTilePosition));
    };
    const addGridMouseHandlers = (_a) => {
        var { element, getTilePosition } = _a, handlers = __rest(_a, ["element", "getTilePosition"]);
        const mouseHandlers = toMouseHandlers(handlers, getTilePosition);
        addMouseHandlers(mouseHandlers, element);
    };

    const getInfo = (obj, config) => {
        const info = [];
        for (const infoField of config) {
            const label = infoField.label || infoField.field;
            const value = infoField.get ? infoField.get(obj) : obj[infoField.field];
            if (!isNill(value)) {
                const entry = `${label}: ${value}`;
                info.push(entry);
            }
        }
        return info.join('; ');
    };
    const getPresenter = (infoFields) => (object) => getInfo(object, infoFields);

    const cityShortInfo = [
        { field: 'id' },
        { field: 'name' },
        { field: 'population' }
    ];
    const defaultValue = '-';
    const getProjectName = (productId) => UNITS[productId - 1].name;
    const getProjectProgress = (project) => project.progress + '/' + project.type.cost;
    const cityInfo = [
        ...cityShortInfo,
        {
            label: 'project',
            get: city => city.project !== null
                ? `${getProjectName(city.project.type.productId)} (${getProjectProgress(city.project)})`
                : defaultValue
        },
        {
            label: 'grow progress',
            get: city => city.foodBasketSize > 0
                ? city.growthProgress + '/' + city.foodBasketSize
                : defaultValue
        },
        {
            label: 'food surplus',
            field: 'foodSurplus'
        },
        {
            label: 'free tiles',
            get: city => city.assignments.getFreeTilesCount()
        },
        {
            label: 'expanding progress',
            get: city => {
                const { tileToExpand } = city.influence;
                return tileToExpand
                    ? city.influence.expandingProgress + '/' + tileToExpand.cost
                    : defaultValue;
            }
        },
        {
            label: 'growth to',
            get: city => {
                const { tileToExpand } = city.influence;
                return tileToExpand ? tileToExpand.position.join(', ') : defaultValue;
            }
        }
    ];
    const unitInfo = [
        {
            label: 'move points',
            field: 'movePoints'
        }
    ];
    const getCityInfo = getPresenter(cityInfo);
    const getUnitInfo = getPresenter(unitInfo);

    const offsetsMap = {
        ArrowLeft: Direction.WEST.offset,
        ArrowUp: Direction.NORTH.offset,
        ArrowRight: Direction.EAST.offset,
        ArrowDown: Direction.SOUTH.offset
    };
    const addKeyHandlers = (_a) => {
        var { element } = _a, handlers = __rest(_a, ["element"]);
        element.addEventListener('keydown', ({ key }) => {
            var _a;
            if (key.startsWith('Arrow')) {
                const offset = offsetsMap[key];
                handlers.onArrow(offset);
            }
            else {
                (_a = handlers[`on${key}`]) === null || _a === void 0 ? void 0 : _a.call(handlers);
            }
        });
    };

    class LabeledField extends Component {
        render() {
            return $('span', { className: 'field' }, [
                $('span', `${this.props.label}: `, { className: 'label' }),
                this.valueSpan = $('span', this.props.value, { className: 'value' })
            ]);
        }
        set value(value) {
            this.props.value = value;
            this.valueSpan.innerText = value;
        }
    }

    class SaveLoad extends Component {
        constructor(props) {
            super(props);
            this.fileReader = new FileReader();
            this.loadFile = () => {
                this.fileInput.click();
            };
            this.fileReader.addEventListener('loadend', event => {
                const array = new Uint8Array(event.target.result);
                this.props.onLoad(array);
            });
        }
        render() {
            return $('div', [
                $('button', 'Save', { onclick: this.props.onSave }),
                $('button', 'Load', { onclick: this.loadFile }),
                this.fileInput = $('input', {
                    type: 'file',
                    onchange: (e) => {
                        const fileInput = e.target;
                        this.fileReader.readAsArrayBuffer(fileInput.files[0]);
                        fileInput.value = null;
                    },
                    style: { display: 'none' }
                })
            ]);
        }
    }

    class TopPanel extends Component {
        render() {
            this.turnField = new LabeledField({
                label: 'Turn',
                value: String(this.props.turn)
            });
            this.saveLoadComponent = new SaveLoad({
                onSave: this.props.onSave,
                onLoad: this.props.onLoad
            });
            return $('div', { className: 'top-panel' }, [
                this.turnField.render(),
                this.saveLoadComponent.render(),
                $('button', 'New World', { onclick: this.props.onNewWorld }),
                $('button', 'Generate World', { onclick: this.props.onGenerateWorld })
            ]);
        }
        set turnNumber(turnNumber) {
            this.turnField.value = String(turnNumber);
        }
    }

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

    const SEED_LENGTH = 8;
    const SEED_PATTERN = new RegExp(`^[0-f]{${SEED_LENGTH}}$`, 'i');
    const isSeedValid = (rawSeed) => SEED_PATTERN.test(rawSeed);
    const parseSeed = (rawSeed) => isSeedValid(rawSeed) ? parseInt(rawSeed, 16) : null;
    const getRandomRawSeed = () => formatHex(SeedRandom.getDefaultSeed(), SEED_LENGTH);
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

    const saveWorld = (world) => {
        const defaultFileName = getCurrentFormattedFullDate();
        const name = prompt('File Name', defaultFileName);
        if (name !== null) { // if name is null user pressed "cancel" button in prompt pop up
            const booleans = serializeWorld(world);
            const bytes = Array.from(booleansToBytesGenerator(booleans));
            saveFile(name || defaultFileName, bytes);
        }
    };
    const getInfluenceInfo = (position, city) => city.assignments.isPositionOccupied(position) ? `<b>${city.name}</b>` : city.name;
    const WORLD_WIDTH = 40;
    const WORLD_HEIGHT = 20;
    class Sandbox extends Component {
        constructor() {
            super({});
            this.viewContainer = $('div');
            this.view = new View(World.createEmptyWorld(WORLD_WIDTH, WORLD_HEIGHT), {
                onClearSelection: () => {
                    this.bottomPanel.unselectCity();
                },
                onCitySelected: city => {
                    this.bottomPanel.cityProject = city.project ? city.project.type.productId : 0;
                }
            });
            this.bottomPanel = new BottomPanel({
                gridShown: true,
                onToggleGrid: (gridShown) => this.view.setGridShown(gridShown),
                onTurn: () => {
                    this.turn();
                },
                onSkipTurns: () => {
                    this.skipTurns();
                },
                onCityProjectChanged: project => {
                    // TODO
                    this.view.changeCityProject(project.id);
                },
                onToolSelected: tool => {
                    this.selectedTool = tool;
                    this.view.clearSelection();
                },
                tools
            });
            this.addKeyHandlers();
        }
        addKeyHandlers() {
            addKeyHandlers({
                element: document,
                onEscape: () => {
                    this.view.clearSelection();
                    this.bottomPanel.clearToolSelection();
                },
                onArrow: ([dx, dy]) => {
                    this.view.moveViewport(dx, dy);
                },
                onDelete: () => {
                    this.view.removeSelectedUnit();
                }
            });
        }
        addMouseHandlers() {
            addGridMouseHandlers({
                element: this.view.layersContainer,
                getTilePosition: ([mx, my]) => {
                    const [vx, vy] = this.view.getViewportPosition();
                    return this.view.grid.getPosition(Math.floor(mx / this.view.tileSize) + vx, Math.floor(my / this.view.tileSize) + vy);
                },
                onLeftClick: ([tileX, tileY]) => {
                    if (this.selectedTool) {
                        this.view[this.selectedTool.id](tileX, tileY, this.selectedTool.option);
                        this.bottomPanel.clearToolSelection();
                        return;
                    }
                    this.view.onTileClick(tileX, tileY);
                },
                onRightClick: ([tileX, tileY]) => {
                    if (this.view.selectedUnit) {
                        this.view.moveUnit(tileX, tileY);
                    }
                },
                onCtrlClick: ([tileX, tileY]) => {
                    if (this.selectedTool) {
                        this.view[this.selectedTool.id](tileX, tileY, this.selectedTool.option);
                    }
                },
                onMove: tilePosition => {
                    this.bottomPanel.info = this.getTileInfo(tilePosition);
                },
                onLeave: () => {
                    this.bottomPanel.info = null;
                }
            });
        }
        // TODO: reduce complexity
        getTileInfo(position) {
            const [x, y] = position;
            let info = this.view.world.grid.getIndexByPosition(x, y) + ' [' + position.join('; ') + ']';
            const tile = this.view.grid.get(x, y);
            const { unit, city } = tile;
            if (tile.influencedBy) {
                info += ' ' + getInfluenceInfo(position, tile.influencedBy);
            }
            if (unit) {
                info += ' ' + getUnitInfo(unit);
            }
            else if (city) {
                info += ' ' + getCityInfo(city);
            }
            else if (this.view.selectedCity) {
                const positionsToExpand = this.view.selectedCity.influence.getTilesToExpand();
                const tileToExpand = positionsToExpand.find(({ position: pos }) => isPositionsEqual(pos, position));
                if (tileToExpand) {
                    info += ' expansion cost: ' + tileToExpand.cost;
                }
                else if (tile.influencedBy !== null &&
                    tile.influencedBy !== this.view.selectedCity &&
                    this.view.selectedCity.influence.canSwap(x, y)) {
                    info += ' swappable';
                }
            }
            return info;
        }
        updateWorld(world) {
            this.view.update(world);
            this.topPanel.turnNumber = this.view.world.turnNumber;
        }
        turn() {
            this.view.turn();
            this.topPanel.turnNumber = this.view.world.turnNumber;
        }
        skipTurns() {
            this.view.skipTurnsUntilEvent();
            this.topPanel.turnNumber = this.view.world.turnNumber;
        }
        render() {
            this.view.mount(this.viewContainer);
            this.view.draw();
            this.addMouseHandlers();
            this.topPanel = new TopPanel({
                onSave: () => {
                    saveWorld(this.view.world);
                },
                onLoad: (bytes) => {
                    const world = World.fromData(deserializeWorld(bytes));
                    this.updateWorld(world);
                },
                onNewWorld: () => {
                    const input = prompt('New world size:');
                    if (input === null) { // "Cancel" pressed in prompt
                        return;
                    }
                    const size = parseAndValidate(input, MIN_WORLD_SIDE, MAX_WORLD_SIDE, error => {
                        alert(error);
                    });
                    if (size !== null) {
                        const [width, height] = size;
                        const world = World.createEmptyWorld(width, height);
                        this.updateWorld(world);
                    }
                },
                onGenerateWorld: () => {
                    const rawSeed = prompt('Map Seed:', getRandomRawSeed());
                    if (rawSeed === null) {
                        return;
                    }
                    const seed = parseSeed(rawSeed);
                    if (seed === null) {
                        alert(`Invalid seed: ${rawSeed}`);
                    }
                    else {
                        const map = generateMap(WORLD_WIDTH, WORLD_HEIGHT, 7, seed);
                        const world = World.fromDryLandBitMap(map, WORLD_WIDTH);
                        this.updateWorld(world);
                    }
                },
                turn: 1
            });
            return $('div', { id: 'view' }, [
                this.topPanel.render(),
                this.viewContainer,
                this.bottomPanel.render()
            ]);
        }
    }

    loadSprites(() => {
        const sandbox = new Sandbox();
        document.body.appendChild(sandbox.render());
    });

})();
//# sourceMappingURL=app.js.map
