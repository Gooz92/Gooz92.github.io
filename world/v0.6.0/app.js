(function () {
    'use strict';

    const noop = () => { };
    const identity = (value) => value;
    const getTrue = () => true;
    const getFalse = () => false;
    const isString = (value) => typeof value === 'string';
    const isNumber = (value) => typeof value === 'number';
    const isUndefined = (value) => typeof value === 'undefined';
    const isFunction = (value) => typeof value === 'function';
    const isNill = (value) => value === null || isUndefined(value);

    const generateArray = (length, createItem) => {
        const array = [];
        for (let i = 0; i < length; i++) {
            const item = createItem(i);
            array.push(item);
        }
        return array;
    };
    const last = (array) => array.at(-1);
    const getItemsCount = (array, condition = getTrue) => array.reduce((counter, item) => condition(item) ? counter + 1 : counter, 0);
    const removeItem = (array, item) => {
        const index = array.indexOf(item);
        if (index === -1) {
            return false;
        }
        removeByIndex(array, index);
        return true;
    };
    const removeByIndex = (array, index) => {
        array.splice(index, 1);
    };
    const map2Dim = (array, convert) => array.map(row => row.map(convert));
    const forEach2Dim = (array, onItem) => {
        for (let i = 0; i < array.length; i++) {
            const row = array[i];
            for (let j = 0; j < row.length; j++) {
                onItem(row[j]);
            }
        }
    };
    const arrify = (value) => Array.isArray(value) ? value : [value];

    const TEXT_V_NODE_TYPE = 0;
    const ELEMENT_V_NODE_TYPE = 1;
    const FN_COMPONENT_V_NODE_TYPE = 2;
    const CLASS_COMPONENT_V_NODE_TYPE = 3;
    const isClassComponentVNode = (vNode) => vNode.type === CLASS_COMPONENT_V_NODE_TYPE;
    const createChild = (child) => {
        if (isNill(child)) {
            return null;
        }
        return isString(child)
            ? { type: TEXT_V_NODE_TYPE, text: child }
            : child;
    };
    const normalizeChildren = (children) => {
        const appendedChildren = [];
        for (const rawChild of children) {
            if (Array.isArray(rawChild)) {
                appendedChildren.push(...normalizeChildren(rawChild));
            }
            else {
                const child = createChild(rawChild);
                appendedChildren.push(child);
            }
        }
        return appendedChildren;
    };

    const createElementVNode = (tagName, options) => {
        const children = [];
        const attributes = {};
        for (const option of options) {
            if (Array.isArray(option)) {
                const appendedChildren = normalizeChildren(option);
                children.push(...appendedChildren);
            }
            else if (typeof option === 'object') {
                Object.assign(attributes, option);
            }
            else {
                children.push({
                    type: TEXT_V_NODE_TYPE,
                    text: option
                });
            }
        }
        return {
            tagName,
            type: ELEMENT_V_NODE_TYPE,
            children,
            attributes
        };
    };
    const isClassComponent = (component) => isFunction(component.prototype?.render);
    const createClassComponentVNode = (Component, props) => ({
        type: CLASS_COMPONENT_V_NODE_TYPE,
        Component,
        props,
        children: null
    });
    const createComponentVNode = (component, props) => {
        if (isClassComponent(component)) {
            return createClassComponentVNode(component, props);
        }
        return {
            type: FN_COMPONENT_V_NODE_TYPE,
            component,
            props,
            children: normalizeChildren([component(props)])
        };
    };
    const createVNode = (...args) => {
        const [first] = args;
        if (isString(first)) {
            const options = args.slice(1);
            return createElementVNode(first, options);
        }
        return createComponentVNode(first, args[1]);
    };

    const forIn = (object, callback) => {
        Object.keys(object).forEach(key => {
            callback(object[key], key);
        });
    };
    const mapValues = (object, callback) => {
        const result = {};
        forIn(object, (value, key) => {
            const newValue = callback(value, key);
            result[key] = newValue;
        });
        return result;
    };

    const renderTextNode = (vNode, context) => ({
        vNode,
        parentElement: context.parentElement,
        prevSibling: context.currentSibling,
        nextSibling: null,
        element: document.createTextNode(vNode.text)
    });
    const mountTextNode = (textVNode, context) => {
        const textNode = renderTextNode(textVNode, context);
        context.parentElement.appendChild(textNode.element);
        return textNode;
    };
    const renderNullNode = (context) => {
        const node = {
            vNode: null,
            parentElement: context.parentElement,
            prevSibling: context.currentSibling,
            nextSibling: null
        };
        if (context.currentSibling) {
            context.currentSibling.nextSibling = node;
        }
        context.currentSibling = node;
        return node;
    };
    const renderElementNode = (vNode, context) => {
        const element = document.createElement(vNode.tagName);
        const node = {
            vNode,
            parentElement: context.parentElement,
            prevSibling: context.currentSibling,
            nextSibling: null,
            element,
            children: []
        };
        const prevParentElement = context.parentElement;
        context.parentElement = element;
        const prevSibling = context.currentSibling;
        context.currentSibling = null;
        mountChildren(node, context);
        context.parentElement = prevParentElement;
        if (prevSibling) {
            prevSibling.nextSibling = node;
        }
        context.currentSibling = node;
        forIn(vNode.attributes, (value, key) => {
            if (key === 'ref') {
                if (isFunction(value)) {
                    value(element);
                }
                else {
                    value.value = element;
                }
            }
            else {
                element[key] = value;
            }
        });
        return node;
    };
    const renderChildren = (parent, context) => processChildren(parent, context, render);
    const mountChildren = (parent, context) => processChildren(parent, context, mount);
    const processChildren = (parent, context, processChild) => {
        parent.children = parent.vNode.children.map(child => processChild(child, context));
    };
    const createClassComponentRNode = (vNode) => {
        const component = new vNode.Component(vNode.props);
        vNode.children = normalizeChildren(arrify(component.render()));
        return {
            vNode,
            component,
            children: null
        };
    };
    const mountClassComponentNode = (vNode, context) => {
        const componentNode = createClassComponentRNode(vNode);
        mountChildren(componentNode, context);
        componentNode.component.$mount(componentNode);
        return componentNode;
    };
    const mountFnComponentNode = (vNode, context) => {
        const componentNode = {
            vNode,
            children: null
        };
        mountChildren(componentNode, context);
        return componentNode;
    };
    const renderFnComponentNode = (vNode, context) => {
        const componentNode = {
            vNode,
            children: null
        };
        renderChildren(componentNode, context);
        return componentNode;
    };
    const renderClassComponentNode = (vNode, context) => {
        const componentNode = createClassComponentRNode(vNode);
        renderChildren(componentNode, context);
        componentNode.component.$mount(componentNode);
        return componentNode;
    };
    const render = (vNode, context) => {
        return vNode === null
            ? renderNullNode(context)
            : renderers[vNode.type](vNode, context);
    };
    const mountElement = (elementVNode, context) => {
        const node = renderElementNode(elementVNode, context);
        context.parentElement.appendChild(node.element);
        return node;
    };
    const renderers = [
        renderTextNode,
        renderElementNode,
        renderFnComponentNode,
        renderClassComponentNode
    ];
    const mount = (vNode, context) => {
        return vNode === null
            ? renderNullNode(context)
            : mounters[vNode.type](vNode, context);
    };
    const mounters = [
        mountTextNode,
        mountElement,
        mountFnComponentNode,
        mountClassComponentNode
    ];
    const mountRoot = (component, props, rootElement) => {
        const node = createComponentVNode(component, props);
        const context = {
            parentElement: rootElement,
            currentSibling: null
        };
        if (isClassComponentVNode(node)) {
            return mountClassComponentNode(node, context);
        }
        return mountFnComponentNode(node, context);
    };

    const isElementOrTextNode = (node) => Boolean(node.element);
    const traverseChildElementNodes = (renderedNode, onElementNode) => {
        const nodes = [renderedNode];
        const elements = [];
        while (nodes.length > 0) {
            const node = nodes.shift();
            if (isNullRNode(node)) {
                continue;
            }
            if (isElementOrTextNode(node)) {
                onElementNode(node);
            }
            else {
                nodes.push(...node.children);
            }
        }
        return elements;
    };
    const getFragment = (node) => {
        const fragment = document.createDocumentFragment();
        traverseChildElementNodes(node, ({ element }) => {
            fragment.appendChild(element);
        });
        return fragment;
    };
    const removeElement = ({ element }) => {
        element.remove();
    };
    const removeElements = (node) => {
        traverseChildElementNodes(node, removeElement);
    };
    const isChildRNode = (rNode) => rNode.vNode === null || isElementOrTextNode(rNode);
    const getFirstChildRNode = (node) => {
        while (!isChildRNode(node)) {
            node = node.children[0];
        }
        return node;
    };
    const getLastChildRNode = (node) => {
        while (!isChildRNode(node)) {
            node = last(node.children);
        }
        return node;
    };
    const getNextElement = (sibling) => {
        do {
            sibling = sibling.nextSibling;
            if (sibling === null) {
                return null;
            }
        } while (!isElementOrTextNode(sibling));
        return sibling.element;
    };
    const updateTextNodes = (currentChild, nextChild) => {
        if (currentChild.element.textContent !== nextChild.text) {
            currentChild.element.textContent = nextChild.text;
            currentChild.vNode = nextChild;
        }
        return currentChild;
    };
    const updateAttributes = (currentChild, nextChild) => {
        // TODO
        Object.assign(currentChild.element, nextChild.attributes);
    };
    const updateElementNodes = (currentChild, nextChild) => {
        if (currentChild.vNode.tagName !== nextChild.tagName) {
            return replace(currentChild, nextChild);
        }
        updateAttributes(currentChild, nextChild);
        updateChildren(currentChild, nextChild.children);
        return currentChild;
    };
    const updateFnComponentNodes = (currentChild, nextChild) => {
        if (currentChild.vNode.component !== nextChild.component) {
            return replace(currentChild, nextChild);
        }
        updateChildren(currentChild, nextChild.children);
        return currentChild;
    };
    const updateClassComponentNodes = (currentChild, nextChild) => {
        if (currentChild.vNode.Component !== nextChild.Component) ;
        currentChild.component.props = nextChild.props;
        const nextChildren = normalizeChildren(arrify(currentChild.component.render()));
        updateChildren(currentChild, nextChildren);
        return currentChild;
    };
    const updaters = [
        updateTextNodes,
        updateElementNodes,
        updateFnComponentNodes,
        updateClassComponentNodes
    ];
    const updateSameTypeNodes = (currentChild, nextChild) => updaters[nextChild.type](currentChild, nextChild);
    const updateChild = (currentChild, nextChild) => {
        if (currentChild.vNode === nextChild) {
            return currentChild;
        }
        if (currentChild.vNode.type !== nextChild.type) {
            return replace(currentChild, nextChild);
        }
        return updateSameTypeNodes(currentChild, nextChild);
    };
    const replace = (currentChild, nextChild) => {
        const fistChild = getFirstChildRNode(currentChild);
        const lastChild = getLastChildRNode(currentChild);
        const nextElement = getNextElement(lastChild);
        // TODO: unmount components
        removeElements(currentChild);
        const context = {
            parentElement: fistChild.parentElement,
            currentSibling: fistChild.prevSibling
        };
        const rendered = render(nextChild, context);
        const fragment = getFragment(rendered);
        fistChild.parentElement.insertBefore(fragment, nextElement);
        context.currentSibling.nextSibling = lastChild.nextSibling;
        return rendered;
    };
    const isNullRNode = (rNode) => rNode.vNode === null;
    const insert = (current, next) => {
        const context = {
            parentElement: current.parentElement,
            currentSibling: current.prevSibling
        };
        const rendered = render(next, context);
        const nextElement = getNextElement(current);
        const fragment = getFragment(rendered);
        current.parentElement.insertBefore(fragment, nextElement);
        if (current.nextSibling) {
            context.currentSibling.nextSibling = current.nextSibling;
            current.nextSibling.prevSibling = context.currentSibling;
        }
        return rendered;
    };
    const remove = (node) => {
        // TODO: unmount components
        removeElements(node);
        const fistChild = getFirstChildRNode(node);
        const lastChild = getLastChildRNode(node);
        const context = {
            parentElement: fistChild.parentElement,
            currentSibling: fistChild.prevSibling
        };
        const nullNode = renderNullNode(context);
        context.currentSibling.nextSibling = lastChild.nextSibling;
        return nullNode;
    };
    const updateChildren = (parent, nextChildren) => {
        for (let i = 0; i < parent.children.length; i++) {
            const currentChild = parent.children[i];
            const nextChild = nextChildren[i];
            if (isNullRNode(currentChild)) {
                if (nextChild !== null) {
                    const rendered = insert(currentChild, nextChild);
                    parent.children[i] = rendered;
                    parent.vNode.children[i] = rendered.vNode;
                }
                continue;
            }
            if (nextChild !== null) {
                const rendered = updateChild(currentChild, nextChild);
                parent.children[i] = rendered;
                parent.vNode.children[i] = rendered.vNode;
            }
            else {
                const nullNode = remove(currentChild);
                parent.children[i] = nullNode;
                parent.vNode.children[i] = null;
            }
        }
    };
    const update = (current, next) => {
        const nextChildren = normalizeChildren(arrify(next));
        updateChildren(current, nextChildren);
    };

    class Component {
        constructor(props) {
            this.props = props;
            this.node = null;
            this.state = this.getInitialState();
        }
        setState(delta) {
            let changed = false;
            forIn(delta, (value, key) => {
                if (!Object.is(this.state[key], value)) {
                    changed = true;
                    this.state[key] = value;
                }
            });
            if (changed && this.isMounted) {
                const rendered = this.render();
                update(this.node, rendered);
            }
        }
        getInitialState() {
            return {};
        }
        $mount(componentNode) {
            this.node = componentNode;
            this.onMounted();
        }
        get isMounted() {
            return this.node !== null;
        }
        onMounted() { }
    }

    var spriteBase64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAYAAADtwH1UAAAAAXNSR0IArs4c6QAAAZFJREFUaEPtmluuwyAMRNutsXC21qtUSkojHsPYxtzK/cYMnmMDRXk+4ufqwNNVPcQfAcC5CEQAUkqvc/05Z9Fczj64ydOmleY7QziKgM5DwXmRPrXwmvlOEK4OdIIg1v/PAMrkT/5UPmQXqOhTC96gA2rJr4Sgpk8BODJ1PAN6ya+AoKpPA7hDWHQLQpK3hKCuLwJA7p1s2EzyFhBM9CkADmcAk7wmBDP9aQA9842uopLkNSCY6k8BQMxXhqCRvASCuf7OADSTZyAs0d8VgEXyMxCW6QeA+p0sALB3VSAOKboAABjJDgkAgHNoBZZmMjGtpUBzpZSu+JwzkNZ7yFcBINVwTbzwGooYUFs7G3c3bzhPaX5x9UYg/ASAXuGMzEOKrjtHzfwJCDyA1ivoHbvCw5zEREnsmcq+AEYQFMw/JKTv7WbxveoHu0DWAQHgc/C2NvzBgRwAgJOy2UHRAdgXEL+9BbW2IaX9P84AoEXfQww/zDKrYPDzlb23IBRQjBs7gPwpGc8SI2gHAgBtnU7gHxo8viHzg01RAAAAAElFTkSuQmCC";

    const spriteImage = new Image();
    const loadSprites = (onload) => {
        spriteImage.src = `data:image/png;base64,${spriteBase64}`;
        spriteImage.onload = onload;
    };

    // TODO: productId is unitTypeId for now
    var cityProjects = [
        { productId: 1, cost: 2 },
        { productId: 2, cost: 5 },
        { productId: 3, cost: 8 }
    ];

    const DEFAULT_MOVE_POINTS = 6;
    var units = [
        { id: 1, name: 'worker', movePoints: DEFAULT_MOVE_POINTS, military: false },
        { id: 2, name: 'warrior', movePoints: DEFAULT_MOVE_POINTS, military: true },
        { id: 3, name: 'settler', movePoints: DEFAULT_MOVE_POINTS, military: false }
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
    // TODO: returned type ?
    const getDefaultTileData = (terrain = DEFAULT_TERRAIN) => ({
        city: null,
        unit: null,
        terrain
    });
    const getDefaultTile = (terrain = DEFAULT_TERRAIN) => ({
        ...getDefaultTileData(terrain),
        influencedBy: null
    });
    const createEmptyTileDatas = (width, height, terrain = DEFAULT_TERRAIN) => generateArray(height * width, () => getDefaultTileData(terrain));
    // TODO
    const getTileFood = (tile) => tile.terrain === GRASSLAND ? 2 : 1;

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
    // TODO: use getOffsets?
    const getRelativePosition = (p0, absolutePosition, width, height) => {
        const [x0, y0] = p0;
        const [absoluteX, absoluteY] = absolutePosition;
        return [
            getOffset(x0, absoluteX, width),
            getOffset(y0, absoluteY, height)
        ];
    };
    const getRelativePositions = (p0, positions, width, height) => (positions.map(position => getRelativePosition(p0, position, width, height)));
    const getAllRelativeOffsets = (maxOctileRadius) => {
        const maxOffset = Math.floor(maxOctileRadius / AXIAL_MOVE_COST);
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
    const DIAGONAL_MOVE_COST = 3;
    const AXIAL_MOVE_COST = 2;
    const octileDistanceByOffsets = (dx, dy) => DIAGONAL_MOVE_COST * Math.min(dx, dy) + AXIAL_MOVE_COST * Math.abs(dx - dy);
    const findBounds = (positions) => {
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
    };
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
    const getCircleBorderTiles = (cx, cy, octileRadius) => {
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
        const topTileBorders = octileRadius % 2 === 0
            ? getTopLedgeBorders()
            : getTopBorders();
        const leftTileBorders = octileRadius % 2 === 0
            ? getLeftLedgeBorders()
            : getLeftBorders();
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
    };

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
        getDirection(from, to) {
            const [dx, dy] = this.getOffsets(from, to);
            return Direction.fromOffsets(dx, dy);
        }
        getCirclePositions(x0, y0, octileRadius) {
            const maxOffset = Math.floor(octileRadius / AXIAL_MOVE_COST);
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
            return positions.toSorted((pa, pb) => (this.comparePositions(p0, pa, pb)));
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
    const getFoodBasketSize = (population) => 10 * population + (population - 1) ** 2;

    const eventNames = [
        'populationIncreased',
        'bordersExpanded',
        'unitCompleted',
        'unitMoved',
        'moveCanceled',
        'combat',
        'unitKilled',
        'cityPillaged',
        'cityDestroyed'
    ];
    var eventCreators = eventNames.reduce((events, type) => ({
        ...events,
        [type]: (payload) => ({ type, payload })
    }), {});

    const MAX_CITY_WORKABLE_OCTILE_RADIUS = 7;

    const getBufferedConvertIterator = (input, convert) => ({
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
    });
    const nextValue = (input) => {
        const [next] = input;
        return next;
    };

    const BITS_IN_BYTE = 8; // orly ? :)
    const binaryToUint = (binary) => {
        let uint = 0;
        for (let i = 0; i < binary.length; i++) {
            if (binary[i]) {
                uint += 2 ** i;
            }
        }
        return uint;
    };
    const booleansToUint = binaryToUint;
    const uintToBinary = (uint, bitsCount, getBinary) => {
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
    };
    const uintToBooleans = (uint, bitsCount) => uintToBinary(uint, bitsCount, identity);
    const byteToBooleans = (byte) => uintToBooleans(byte, BITS_IN_BYTE);
    const uintsToBinary = (uints, bitsCount, getBinary) => {
        const binaries = [];
        for (const uint of uints) {
            const uintsBinaries = uintToBinary(uint, bitsCount, getBinary);
            binaries.push(...uintsBinaries);
        }
        return binaries;
    };
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
                byte += 2 ** count;
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
    const nextUint = (booleans, bitsCount) => {
        let uint = 0;
        let index = 0;
        if (bitsCount === 0) {
            return uint;
        }
        for (const boolean of booleans) {
            if (boolean) {
                uint += 2 ** index;
            }
            ++index;
            if (index === bitsCount) {
                return uint;
            }
        }
        return uint;
    };
    const calculateTruesCount = (bool, stats) => {
        if (bool) {
            ++stats.truesCount;
        }
    };
    const nextBooleansWithTruesCount = (booleans, length) => {
        const stats = { truesCount: 0 };
        const result = nextBooleansStats(booleans, length, stats, calculateTruesCount);
        return {
            booleans: result.booleans,
            count: result.stats.truesCount
        };
    };
    const nextBooleansStats = (booleans, length, stats, callback) => {
        const result = [];
        for (const boolean of booleans) {
            callback(boolean, stats);
            result.push(boolean);
            if (result.length === length) {
                return { booleans: result, stats };
            }
        }
        return { booleans: result, stats };
    };
    const nextBooleans = (booleans, length) => {
        const result = [];
        for (const boolean of booleans) {
            result.push(boolean);
            if (result.length === length) {
                return result;
            }
        }
        return result;
    };
    const getBytesToBooleansIterator = (bytes) => getBufferedConvertIterator(bytes, byteToBooleans);
    const getMaxBitsCount = (maxValue) => Math.ceil(Math.log2(maxValue + 1));
    const nextUints = (booleans, count, uintBitsCount) => {
        const uints = [];
        for (let i = 0; i < count; i++) {
            const uintBooleans = nextBooleans(booleans, uintBitsCount);
            const uint = booleansToUint(uintBooleans);
            uints.push(uint);
        }
        return uints;
    };
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
            return Math.round(160 / weight + d ** 2);
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
            const cityPosition = this.city.position;
            const [toCityX, toCityY] = this.grid.getNextLinePosition(position, cityPosition);
            if (!this.grid.influencedByCity(toCityX, toCityY, this.city)) {
                return false;
            }
            if (!Direction.diagonal.some(({ dx, dy }) => (this.grid.influencedByCity(x + dx, y + dy, this.city)))) {
                return false;
            }
            if (!Direction.axial.some(({ dx, dy }) => (this.grid.influencedByCity(x + dx, y + dy, this.city)))) {
                return false;
            }
            const [cityX, cityY] = cityPosition;
            const distanceToCity = this.grid.getOctileDistance(x, y, cityX, cityY);
            return distanceToCity <= MAX_CITY_WORKABLE_OCTILE_RADIUS;
        }
        getFrontierPositions() {
            const frontierPositions = [];
            for (const position of this.positions) {
                const [x0, y0] = position;
                for (const { dx, dy } of Direction.axial) {
                    const x = x0 + dx;
                    const y = y0 + dy;
                    const { influencedBy } = this.grid.get(x, y);
                    if (influencedBy === null &&
                        !includesPosition(frontierPositions, position)) {
                        frontierPositions.push(position);
                    }
                }
            }
            return frontierPositions;
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
            return flags.every((flag, i) => (flag || toCheck[i].some(([x, y]) => this._canSwap(x, y, checked))));
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
                    if (isPositionsEqual(position, cityPosition) ||
                        positions.some(pos => isPositionsEqual(pos, position))) {
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
            const options = {
                ...DEFAULT_CITY_SETTINGS,
                ...settings
            };
            const influencedPositions = CityInfluence.getStartInfluencePositions(position, grid, options.expansionLevel + 3);
            const assignmentsPositions = Assignments.getDefaultPositions(position, influencedPositions, grid, options.population);
            return new City(grid, {
                position,
                project: null,
                influencedPositions,
                assignmentsPositions,
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
            const [x, y] = this.position;
            const tile = this.grid.get(x, y);
            tile.city = null;
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
        removeCity(city) {
            removeItem(this.cities, city);
            city.remove();
            // TODO ?
            this.updateTilesToExpand();
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
            if (!tile.terrain.dryLand || tile.unit?.playerId === 0) { // TODO
                return false;
            }
            return this.cities.every(({ position: [cityX, cityY] }) => {
                const distance = this.grid.getOctileDistance(cityX, cityY, newCityX, newCityY);
                return distance >= MIN_DISTANCE_BETWEEN_CITIES;
            });
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

    class Unit {
        constructor(grid, data) {
            this.grid = grid;
            this.path = [];
            const { targetPosition, ...restData } = data;
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
        getMoveCost(from, to) {
            const direction = this.grid.getDirection(from, to);
            return direction.isAxial ? 2 : 3;
        }
        isTilePassable(positionIndex) {
            // TODO ?
            return this.grid.tiles[positionIndex].terrain.dryLand;
        }
        getNextPathSegment(path) {
            let fromPosition = this.position;
            let cost = 0;
            const passed = [];
            const passedUnitsPositions = [];
            for (const toIndex of path) {
                if (!this.isTilePassable(toIndex)) {
                    break;
                }
                const toPosition = this.grid.getPositionByIndex(toIndex);
                const stepCost = this.getMoveCost(fromPosition, toPosition);
                const nextCost = cost + stepCost;
                if (nextCost > this.movePoints) {
                    break;
                }
                if (this.grid.tiles[toIndex].unit) {
                    passedUnitsPositions.push(toPosition);
                }
                else {
                    if (passedUnitsPositions.length > 0) {
                        passed.push(...passedUnitsPositions);
                        passedUnitsPositions.length = 0;
                    }
                    passed.push(toPosition);
                }
                cost = nextCost;
                fromPosition = toPosition;
            }
            passed.push(...passedUnitsPositions);
            return { positions: passed, cost };
        }
        moveByPath(path) {
            const pathSegment = this.getNextPathSegment(path);
            const { positions, cost } = pathSegment;
            if (positions.length === 0) {
                this.path = path.slice();
                return null;
            }
            const toPosition = last(positions);
            const [toX, toY] = toPosition;
            if (this.grid.get(toX, toY).unit) {
                return null;
            }
            this.path = path.slice(positions.length);
            const [fromX, fromY] = this.position;
            this.grid.get(fromX, fromY).unit = null;
            this.grid.get(toX, toY).unit = this;
            this.movePoints -= cost;
            positions.unshift(this.position);
            this.position = toPosition;
            return eventCreators.unitMoved({ path: positions });
        }
        getPositionIndex() {
            const [x, y] = this.position;
            return this.grid.getIndexByPosition(x, y);
        }
        get targetPosition() {
            return this.path.length > 0 ? last(this.path) : null;
        }
    }
    // TODO ?
    Unit.DEFAULT_UNIT_TYPE = UNITS[0];
    // TODO ?
    Unit.getDefaultData = (x, y) => ({
        playerId: 1, // 0 for barbs
        position: [x, y],
        type: Unit.DEFAULT_UNIT_TYPE,
        movePoints: Unit.DEFAULT_UNIT_TYPE.movePoints,
        targetPosition: null
    });

    // 0 <= value <= 1
    const scaleUnitRange = (value, min, max) => min + (max - min) * value;
    const scaleUnitRangeToInt = (value, min, max) => Math.floor((min + (max - min + 1) * value));
    const randomInt = (min, max) => scaleUnitRangeToInt(Math.random(), min, max);
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
                if (!isPassable(positionIndex)) {
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

    var _a$1;
    // https://en.wikipedia.org/wiki/Linear_congruential_generator
    const a = 1664525;
    const c = 1013904223;
    const nextRawInt = (seed) => (a * seed + c) % SeedRandom.PERIOD;
    class SeedRandom {
        constructor(seed = _a$1.getDefaultSeed()) {
            this.seed = seed;
        }
        next() {
            this.seed = nextRawInt(this.seed);
            return this.seed / _a$1.PERIOD;
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
            return scaleUnitRangeToInt(next, a, b);
        }
        nextBoolean(threshold = 0.5) {
            return this.next() < threshold;
        }
    }
    _a$1 = SeedRandom;
    SeedRandom.getDefaultSeed = () => randomInt(0, _a$1.PERIOD);
    SeedRandom.PERIOD = 2 ** 32;

    const MIN_D = 8;
    const MAX_D = 12;
    // https://forums.civfanatics.com/threads/hans-lemurson-figures-out-the-combat-formula.606147/
    // https://civilization.fandom.com/wiki/Combat_(Civ6)#Damage_formula
    const baseDamage = (hpAtk, hpDef, deviation) => Math.round(3 * Math.E ** ((hpAtk - hpDef) / 200) * deviation);
    const randomDamage = (hpAtk, hpDef, getDeviation) => {
        const scaledDeviation = scaleUnitRange(getDeviation(), MIN_D, MAX_D);
        return baseDamage(hpAtk, hpDef, scaledDeviation);
    };
    const combatDamage = (hpAtk, hpDef, getDeviation) => {
        const dmgDef = randomDamage(hpAtk, hpDef, getDeviation);
        const dmgAtk = randomDamage(hpDef, hpAtk, getDeviation);
        return postProcessCombatDamage(hpAtk, hpDef, dmgAtk, dmgDef);
    };
    // handle corner cases when attacker or defender could be destroyed
    const postProcessCombatDamage = (hpAtk, hpDef, dmgAtk, // damage caused TO attacker BY defender
    dmgDef // damage caused TO defender BY attacker
    ) => {
        if (hpAtk <= dmgAtk && hpDef <= dmgDef) { // avoid mutual destruction
            // choose survivor
            if (dmgAtk / hpAtk < dmgDef / hpDef) { // defender destroyed
                return killDefender(hpAtk, hpDef, dmgAtk, dmgDef);
            }
            // if all equal defender has priority
            return killAttacker(hpAtk, hpDef, dmgAtk, dmgDef);
        }
        if (hpAtk < dmgAtk) {
            return killAttacker(hpAtk, hpDef, dmgAtk, dmgDef);
        }
        if (hpDef < dmgDef) {
            return killDefender(hpAtk, hpDef, dmgAtk, dmgDef);
        }
        return [dmgAtk, dmgDef];
    };
    const killDefender = (hpAtk, hpDef, dmgAtk, dmgDef) => [
        Math.round(clampPositive(dmgAtk * hpDef / dmgDef, hpAtk - 1)),
        hpDef
    ];
    const killAttacker = (atkHp, defHp, atkDmg, defDmg) => [
        atkHp,
        Math.round(clampPositive(defDmg * atkHp / atkDmg, defHp - 1))
    ];
    const COMBAT_SEED_BITS_COUNT = 31;
    const MAX_COMBAT_SEED = 2 ** COMBAT_SEED_BITS_COUNT - 1;
    const BIT_COUNTS = [
        4, // turn
        8, // atkPos
        3, // direction
        5, // hp1
        5, // hp2
        3, // mp1
        3 // mp2
    ];
    const MAXIMUMS = BIT_COUNTS.map(bitCount => 2 ** bitCount - 1);
    const getCombatHash = (params) => {
        let hash = 0;
        for (let i = 0; i < BIT_COUNTS.length; i++) {
            hash <<= BIT_COUNTS[i];
            hash |= nextRawInt(params[i]) & MAXIMUMS[i];
        }
        return hash;
    };
    const getRandomCombatSeed = () => randomInt(0, MAX_COMBAT_SEED);

    const getAttackDirection = (attacker, defender) => attacker.grid.getDirection(attacker.position, defender.position);
    const getCombatHashParams = (attacker, defender, turn) => [
        turn,
        attacker.getPositionIndex(),
        Direction.members.indexOf(getAttackDirection(attacker, defender)),
        attacker.hitPoints,
        defender.hitPoints,
        attacker.movePoints,
        defender.movePoints
    ];
    const calcDamage = (attacker, defender, turn, combatSeed) => {
        const hashParams = getCombatHashParams(attacker, defender, turn);
        const hash = getCombatHash(hashParams) ^ combatSeed;
        const random = new SeedRandom(hash);
        const getDeviation = () => random.next();
        return combatDamage(attacker.hitPoints, defender.hitPoints, getDeviation);
    };

    class MilitaryUnit extends Unit {
        constructor(grid, data) {
            const { hitPoints, combated, ...unitData } = data;
            super(grid, unitData);
            this.hitPoints = hitPoints;
            this.combated = combated;
        }
        combat(unit, turn, combatSeed) {
            const damage = calcDamage(this, unit, turn, combatSeed);
            const [atkDmg, defDmg] = damage;
            this.combated = true;
            return eventCreators.combat({
                from: this.position,
                to: unit.position,
                damage,
                attackedDestroyed: atkDmg >= this.hitPoints,
                defenderDestroyed: defDmg >= unit.hitPoints
            });
        }
        beforeTurn() {
            super.beforeTurn();
            this.combated = false;
        }
        kill(unit) {
            this.combated = true;
            return eventCreators.unitKilled({
                attackerPosition: this.position,
                killedUnitPosition: unit.position
            });
        }
    }

    const isCombatPossible = (unit, path) => {
        if (path.length !== 1 || !isMilitaryUnit(unit)) {
            return false;
        }
        if (unit.combated) {
            return false;
        }
        const from = unit.position;
        const to = unit.grid.getPositionByIndex(path[0]);
        const direction = unit.grid.getDirection(from, to);
        const moveCost = direction.isAxial ? AXIAL_MOVE_COST : DIAGONAL_MOVE_COST;
        return unit.movePoints >= moveCost;
    };
    const isMilitaryUnitData = (data) => data.type.military;
    const isMilitaryUnit = (unit) => isMilitaryUnitData(unit);
    const createUnit = (grid, data) => {
        return isMilitaryUnitData(data)
            ? new MilitaryUnit(grid, data)
            : new Unit(grid, data);
    };

    class UnitsService {
        constructor(grid, units = [[], []], combatSeed = 0) {
            this.grid = grid;
            this.combatSeed = combatSeed;
            this.movements = new Map();
            this.units = map2Dim(units, data => this.createUnit(data));
        }
        createUnit(data) {
            const unit = createUnit(this.grid, data);
            if (data.targetPosition !== null) {
                const targetPosition = this.grid.getPositionByIndex(data.targetPosition);
                this.movements.set(unit.targetPosition, unit);
                unit.path = this.findPath(unit, targetPosition);
            }
            return unit;
        }
        findPath(unit, target) {
            return findPath(this.grid, unit.position, target, positionIndex => unit.isTilePassable(positionIndex)).map(node => node.positionIndex);
        }
        turnEnd() {
            const moveEvents = [];
            const canceledMoveEvents = [];
            forEach2Dim(this.units, unit => {
                unit.beforeTurn();
                if (unit.targetPosition !== null) {
                    const [fromX, fromY] = unit.position;
                    const fromIndex = this.grid.getIndexByPosition(fromX, fromY);
                    const moveEvent = this.move([fromIndex, ...unit.path]);
                    if (moveEvent === null) {
                        canceledMoveEvents.push(unit.cancelMove());
                    }
                    else {
                        moveEvents.push(moveEvent);
                    }
                }
                unit.movePoints = clampPositive(unit.movePoints, unit.type.movePoints);
            });
            return {
                moves: moveEvents,
                canceledMoves: canceledMoveEvents
            };
        }
        canPlaceUnit(x, y, data) {
            const tile = this.grid.get(x, y);
            if (tile.unit !== null || !tile.terrain.dryLand) {
                return false;
            }
            if (data.playerId === 0 && tile.city) {
                return false;
            }
            return true;
        }
        placeUnit(x, y, data = {}) {
            if (!this.canPlaceUnit(x, y, data)) {
                return null;
            }
            const unitData = Object.assign(Unit.getDefaultData(x, y), data);
            if (isMilitaryUnitData(unitData)) {
                unitData.hitPoints = 100; // TODO
            }
            const unit = this.createUnit(unitData);
            this.units[unit.playerId].push(unit);
            return unit;
        }
        combat(attacker, defender, turn) {
            if (isMilitaryUnit(defender)) {
                const event = attacker.combat(defender, turn, this.combatSeed);
                const { damage: [attackerDamage, defenderDamage] } = event.payload;
                this.causeDamage(attacker, attackerDamage);
                if (this.causeDamage(defender, defenderDamage)) {
                    const [toX, toY] = defender.position;
                    const positionIndex = this.grid.getIndexByPosition(toX, toY);
                    attacker.moveByPath([positionIndex]);
                }
                else {
                    const direction = this.grid.getDirection(attacker.position, defender.position);
                    attacker.movePoints -= direction.isAxial ? 2 : 3;
                }
                return event;
            }
            const event = attacker.kill(defender);
            this.removeUnit(defender);
            const [toX, toY] = event.payload.killedUnitPosition;
            const positionIndex = this.grid.getIndexByPosition(toX, toY);
            attacker.moveByPath([positionIndex]);
            return event;
        }
        handleCombat(unit, toX, toY, turn) {
            const events = [];
            const targetTile = this.grid.get(toX, toY);
            const targetUnit = targetTile.unit;
            if (targetUnit && targetUnit.playerId !== unit.playerId) {
                const combatEvent = this.combat(unit, targetUnit, turn);
                events.push(combatEvent);
            }
            const targetCity = targetTile.city;
            if (unit.playerId === 0 &&
                targetCity &&
                (!targetTile.unit || targetTile.unit.playerId === 0)) {
                const pillageCityEvent = this.pillageCity(unit, targetCity);
                events.push(pillageCityEvent);
            }
            return events;
        }
        moveUnit(unit, toX, toY, turn = 0) {
            const toPosition = [toX, toY];
            if (isPositionsEqual(unit.position, toPosition)) {
                this.cancelMove((unit));
                return [];
            }
            const path = this.findPath(unit, toPosition);
            if (path.length === 0) {
                return [];
            }
            // TODO
            if (isCombatPossible(unit, path)) {
                const combatEvents = this.handleCombat(unit, toX, toY, turn);
                if (combatEvents.length > 0) {
                    return combatEvents;
                }
            }
            const [fromX, fromY] = unit.position;
            const sourcePositionIndex = this.grid.getIndexByPosition(fromX, fromY);
            path.unshift(sourcePositionIndex); // TODO ?
            const moveEvent = this.move(path);
            return moveEvent ? [moveEvent] : [];
        }
        pillageCity(barbarian, city) {
            if (city.population > 1) {
                city.assignments.recalculate(city.population - 1);
                return eventCreators.cityPillaged({ barbarianPosition: barbarian.position });
            }
            return eventCreators.cityDestroyed({ city, barbarian });
        }
        causeDamage(unit, damage) {
            unit.hitPoints -= damage;
            if (unit.hitPoints <= 0) {
                this.removeUnit(unit);
                return true;
            }
            return false;
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
                if (competitor?.path.length === 1) {
                    this.cancelMove(competitor);
                }
            }
            const targetPositionIndex = last(restPath);
            const targetTile = this.grid.tiles[targetPositionIndex];
            if (targetTile.unit !== null ||
                // TODO: temp not allow barb to attack city in post-turn phase
                (targetTile.city && unit.playerId === 0)) {
                return null;
            }
            this.movements.set(targetPositionIndex, unit);
            return unit.moveByPath(restPath);
        }
        removeUnit(unit) {
            const [x, y] = unit.position;
            const tile = this.grid.get(x, y);
            tile.unit = null;
            this.movements.delete(unit.targetPosition);
            removeItem(this.units[unit.playerId], unit);
        }
        cancelMove(unit) {
            this.movements.delete(unit.targetPosition);
            unit.cancelMove();
        }
    }

    const upperFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const createEventHandlers = (world) => ({
        onCityDestroyed: ({ city, barbarian }) => {
            world.removeCity(city);
            world.removeUnit(barbarian);
        },
        onCityPillaged: ({ barbarianPosition: [bx, by] }) => {
            const { unit } = world.grid.get(bx, by);
            world.removeUnit(unit);
        }
    });

    const canUpdateTerrain = (tile, terrain) => {
        if (tile.terrain === terrain) {
            return false;
        }
        return terrain.dryLand || (!tile.city && !tile.unit);
    };
    class World {
        static createEmptyWorldData(width, height, terrain = DEFAULT_TERRAIN) {
            const emptyTiles = createEmptyTileDatas(width, height, terrain);
            return this.fromTilesData(emptyTiles, width);
        }
        static createEmptyWorld(width, height, terrain = DEFAULT_TERRAIN) {
            const emptyWorldData = this.createEmptyWorldData(width, height, terrain);
            return World.fromData(emptyWorldData);
        }
        static fromTerrainMap(terrain, width, seed) {
            const tiles = terrain.map(getDefaultTileData);
            return this.fromData(this.fromTilesData(tiles, width, seed));
        }
        static fromData(data) {
            const grid = GameGrid.createFromTilesData(data.tiles, data.width);
            return new World(grid, data);
        }
        constructor(grid, data) {
            this.eventHandlers = createEventHandlers(this);
            this.grid = grid;
            this.turnNumber = data.turnNumber;
            this.citiesService = new CitiesService(grid, data.cities, data.nextCityId);
            this.citiesService.onUnitCreated(({ cityPositionIndex, unitTypeId }) => {
                this.unitCreationHandler(cityPositionIndex, unitTypeId);
            });
            this.unitsService = new UnitsService(grid, data.units, data.combatSeed);
            this.mapSeed = data.mapSeed;
            this.playerId = data.playerId;
        }
        unitCreationHandler(cityPositionIndex, unitTypeId) {
            const unitType = UNITS[unitTypeId - 1];
            const [x, y] = this.grid.getPositionByIndex(cityPositionIndex);
            this.placeUnit(x, y, { type: unitType });
        }
        turn() {
            if (this.playerId === 0) {
                this.playerId = 1;
                return this.turnEnd();
            }
            this.playerId = 0;
            return [];
        }
        turnEnd() {
            if (this.turnNumber === World.MAX_TURN_NUMBER) {
                console.warn('Max turns reached');
                this.turnNumber = 1;
            }
            else {
                ++this.turnNumber;
            }
            const citiesEvents = this.citiesService.turn();
            const unitsTurnResult = this.unitsService.turnEnd();
            return citiesEvents.concat(unitsTurnResult.moves, unitsTurnResult.canceledMoves);
        }
        processEvents(events) {
            return events.map(event => {
                const handler = this.eventHandlers[`on${upperFirst(event.type)}`];
                handler?.(event.payload);
                return event;
            });
        }
        moveUnit(unitToMove, toX, toY) {
            if (unitToMove.playerId !== this.playerId) {
                return [];
            }
            const events = this.unitsService.moveUnit(unitToMove, toX, toY, this.turnNumber);
            return this.processEvents(events);
        }
        placeTerrain(x, y, terrain) {
            const tile = this.grid.get(x, y);
            if (!canUpdateTerrain(tile, terrain)) {
                return false;
            }
            tile.terrain = terrain;
            this.mapSeed = null;
            const { influencedBy } = tile;
            if (influencedBy) {
                influencedBy.assignments.recalculate();
            }
            const isNeighborTileInfluenced = Direction.axial
                .some(({ dx, dy }) => this.grid.get(x + dx, y + dy).influencedBy);
            if (isNeighborTileInfluenced) {
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
        removeCity(city) {
            this.citiesService.removeCity(city);
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
        get combatSeed() {
            return this.unitsService.combatSeed;
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
    World.MAX_TURN_NUMBER = 2 ** 16;
    World.fromTilesData = (tiles, width, mapSeed = null) => ({
        playerId: 1,
        tiles,
        width,
        height: tiles.length / width,
        cities: [],
        units: [[], []],
        turnNumber: 1,
        nextCityId: 0,
        mapSeed,
        combatSeed: getRandomCombatSeed() // TODO
    });

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
        const maxStringBytes = 2 ** sizeBits;
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
        const maxValue = 2 ** bitsCount + minValue - 1;
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
    const notEmptyString = (sizeBits) => {
        return {
            read: booleans => deserializeNotEmptyString(booleans, sizeBits),
            write: str => serializeNotEmptyString(str, sizeBits)
        };
    };

    const getSimpleAttribute = (name, serializer) => {
        return {
            name,
            read: input => ({ [name]: serializer.read(input) }),
            write: value => serializer.write(value)
        };
    };

    const getDefaultParams = () => ({
        context: {},
        data: {}
    });
    const deserialize = (input, config, params = getDefaultParams()) => {
        const normalizedParams = { ...getDefaultParams(), ...params };
        const { data } = normalizedParams;
        for (const attribute of config) {
            const output = attribute.read(input, normalizedParams);
            if (typeof output === 'object') {
                Object.assign(data, output);
            }
        }
        return data;
    };
    const serialize = (data, config, context = {}) => {
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
    };

    const buildWorkAreaSerializationData = (city, worldSize) => {
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
    };
    const serializationDataToWorkArea = (workArea, cityPosition, worldSize) => {
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
    };

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
    const getFoodBasketSizeBitsCount = (assignmentsCount, influenceSize) => (assignmentsCount === influenceSize
        ? 0
        : getMaxBitsCount(getFoodBasketSize(assignmentsCount)));
    const cityConfig = [
        {
            name: 'id',
            read: (input, { context }) => ({ id: nextUint(input, context.cityIdSize) }),
            write: (id, { context }) => uintToBooleans(id, context.cityIdSize)
        },
        getSimpleAttribute('name', cityNameSerializer),
        {
            write(_, { data, context }) {
                const workAreaData = buildWorkAreaSerializationData(data, context.worldSize);
                return serialize(workAreaData, workAreaConfig);
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
            read: (input, { context }) => ({
                assignments: nextBooleans(input, context.influenceSize)
            }),
            write: (assignments) => assignments
        }
    ];

    const serializeCity = (city, worldSize, cityIdSize) => serialize(city, cityConfig, { worldSize, cityIdSize });
    const deserializeCity = (booleans, position, worldSize, cityIdSize) => deserialize(booleans, cityConfig, { context: { cityIdSize, position, worldSize } });

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
        getSimpleAttribute('playerId', uint(1)),
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
                const targetPosition = targetPositionIndex !== positionIndex
                    ? targetPositionIndex
                    : null;
                const position = getPositionByIndex(positionIndex, worldWidth);
                return ({ targetPosition, position });
            },
            write(targetPosition, { data, context: { targetIndexSize, worldWidth } }) {
                const positionIndex = getTargetPositionIndex(targetPosition, data.position, worldWidth);
                return uintToBooleans(positionIndex, targetIndexSize);
            }
        }
    ];

    const getContext = (worldSize, position = null) => {
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
    };
    const getTargetIndexSize = (worldWidth, worldHeight) => {
        const tilesCount = worldWidth * worldHeight;
        return getMaxBitsCount(tilesCount);
    };

    const hpSerializer = uint(7, 1);
    const deserializeUnit = (input, position, worldSize) => {
        const context = getContext(worldSize, position);
        const unitData = deserialize(input, unitConfig, { context });
        // TODO
        if (isMilitaryUnitData(unitData)) {
            unitData.hitPoints = hpSerializer.read(input);
            unitData.combated = nextValue(input);
        }
        return unitData;
    };
    const serializeUnit = (unit, worldSize) => {
        const context = getContext(worldSize);
        const output = serialize(unit, unitConfig, context);
        // TODO
        if (isMilitaryUnitData(unit)) {
            output.push(...hpSerializer.write(unit.hitPoints));
            output.push(unit.combated);
        }
        return output;
    };

    // to ensure that city affect itself in borders expanding mechanic
    // export const MIN_WORLD_SIDE = (cityRadius + padding) * 2 + 1;
    const MIN_WORLD_SIDE = 13;
    // just to restrict user input and defined bits count in serialization (?)
    const MAX_WORLD_SIDE = 265;

    const ZERO_STRING = '0';
    const formatHex = (number, length) => {
        const hex = number.toString(16);
        return hex.padStart(length, ZERO_STRING);
    };
    const padStart = (number, digits) => String(number).padStart(digits, ZERO_STRING);

    const MAX_SEED = 2 ** 32 - 1;
    const HEX_SEED_LENGTH = 8;
    const HEX_SEED_PATTERN = new RegExp(`^[\\da-f]{${HEX_SEED_LENGTH}}$`);
    const isHexSeedValid = (rawSeed) => HEX_SEED_PATTERN.test(rawSeed);
    const parseHexSeed = (rawSeed) => isHexSeedValid(rawSeed) ? parseInt(rawSeed, 16) : null;
    const seedToHex = (seed) => formatHex(seed, HEX_SEED_LENGTH);
    const getRandomHexSeed = () => seedToHex(getRandomSeed());
    const getRandomSeed = () => SeedRandom.getDefaultSeed();

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

    const WORLD_SIDE_BITS_COUNT = getMaxBitsCount(MAX_WORLD_SIDE - MIN_WORLD_SIDE);
    const TERRAIN_BITS_COUNT = 3;
    const TURN_NUMBER_BITS = getMaxBitsCount(World.MAX_TURN_NUMBER - 1);
    const CITY_ID_SIZE_BITS_COUNT = 5;
    const MAP_SEED_BITS_COUNT = getMaxBitsCount(MAX_SEED);

    const getCityIdBitsCount = (nextCityId) => nextCityId > 0 ? getMaxBitsCount(nextCityId - 1) : 0;
    const deserializeTile = (input, position, worldSize, context) => {
        const [cityPlaced, unitPlaced] = input;
        return {
            city: cityPlaced
                ? deserializeCity(input, position, worldSize, context.cityIdSize)
                : null,
            unit: unitPlaced
                ? deserializeUnit(input, position, worldSize)
                : null,
            terrain: TERRAINS[nextUint(input, TERRAIN_BITS_COUNT)]
        };
    };
    const serializeTile = (tile, worldSize, cityIdSize) => {
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
    };
    const deserializeTiles = (input, world, context) => {
        const cities = [];
        const tiles = [];
        const units = [[], []];
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
                    units[unit.playerId].push(unit);
                }
                tiles.push(tile);
            }
        }
        return {
            tiles,
            cities,
            units
        };
    };
    const serializeTiles = (tiles, worldSize, context) => {
        const output = [];
        tiles.forEach(tile => {
            output.push(...serializeTile(tile, worldSize, context.cityIdSize));
        });
        return output;
    };

    const worldSideSerializer = uint(WORLD_SIDE_BITS_COUNT, MIN_WORLD_SIDE);
    const turnNumberSerializer = uint(TURN_NUMBER_BITS, 1);
    const combatSeedSerializer = uint(COMBAT_SEED_BITS_COUNT);
    const worldConfig = [
        getSimpleAttribute('width', worldSideSerializer),
        getSimpleAttribute('height', worldSideSerializer),
        getSimpleAttribute('turnNumber', turnNumberSerializer),
        getSimpleAttribute('playerId', uint(1)),
        getSimpleAttribute('combatSeed', combatSeedSerializer),
        {
            name: 'mapSeed',
            write(mapSeed) {
                if (mapSeed === null) {
                    return [false];
                }
                return [
                    true,
                    ...uintToBooleans(mapSeed, MAP_SEED_BITS_COUNT)
                ];
            },
            read(input) {
                const [isPresented] = input;
                return {
                    mapSeed: isPresented ? nextUint(input, MAP_SEED_BITS_COUNT) : null
                };
            }
        },
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
     *    steppe,
     *    grassland,
     *    desert,
     *    tundra,
     *    snow,
     *    rainforest (jungle),
     *    marsh,
     *    floodplains,
     *    see,
     *    ocean,
     *    coast
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
    const deserializeWorld = (bytes) => {
        const booleans = getBytesToBooleansIterator(bytes);
        return deserialize(booleans, worldConfig, { data: { nextCityId: 0 } });
    };

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

    const getTileBorderRects = (tileSize) => [
        [0, 0, tileSize, 1],
        [tileSize - 1, 0, 1, tileSize],
        [0, tileSize - 1, tileSize, 1],
        [0, 0, 1, tileSize]
    ];
    const getBorderRenderer = (tileSize) => {
        const rects = getTileBorderRects(tileSize);
        return (context, x, y, borders) => {
            const filledRects = rects.filter((rect, index) => borders[index]);
            filledRects.forEach(([x0, y0, w, h]) => {
                context.fillRect(x + x0, y0 + y, w, h);
            });
        };
    };

    const refresh = (context) => {
        const imageData = context.getImageData(0, 0, 1, 1);
        context.putImageData(imageData, 0, 0);
    };
    const drawPath = (context, [vx, vy], path, fill) => {
        context.fillStyle = fill;
        const [[x0, y0]] = path;
        context.beginPath();
        context.moveTo(vx + x0, vy + y0);
        for (let i = 1; i < path.length; i++) {
            const [x, y] = path[i];
            context.lineTo(vx + x, vy + y);
        }
        context.closePath();
        context.stroke();
        context.fill();
    };

    const flag = [
        [5, 5],
        [27, 5],
        [18, 10],
        [27, 16],
        [8, 16],
        [8, 28],
        [5, 28]
    ];
    const hammer = [
        [13, 3],
        [9, 7],
        [15, 13],
        [3, 25],
        [7, 29],
        [19, 17],
        [25, 23],
        [29, 19]
    ];
    const sword = [
        [28, 4],
        [17, 10],
        [8, 22],
        [5, 19],
        [3, 21],
        [6, 24],
        [3, 27],
        [5, 29],
        [8, 26],
        [11, 29],
        [13, 27],
        [10, 24],
        [22, 15]
    ];
    const icons = [
        hammer,
        sword,
        flag
    ];

    const COLORS = [
        '#da1e28',
        '#006400'
    ];
    class Layer {
        constructor(view, context) {
            this.view = view;
            this.context = context;
        }
        drawIcon(vx, vy, id, playerId) {
            const path = icons[id];
            drawPath(this.context, [vx, vy], path, COLORS[playerId]);
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
        refresh() {
            refresh(this.context);
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
            this.drawSprite(0, vx, vy);
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
        drawUnitSelection(x, y, path = []) {
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
            this.bordersRenderer = bordersRenderer;
            this.context.fillStyle = BordersLayer.BORDERS_COLOR;
        }
        drawTileBorders(vx, vy, borders) {
            this.bordersRenderer(this.context, vx, vy, borders);
        }
    }
    BordersLayer.BORDERS_COLOR = '#000';

    class ObjectsLayer extends Layer {
        drawUnit(vx, vy, { type: { id }, playerId }) {
            this.drawIcon(vx, vy, id - 1, playerId);
        }
        drawHouse(vx, vy) {
            this.drawSprite(1, vx, vy);
        }
        drawCityWithGarrison(vx, vy) {
            this.drawSprite(2, vx, vy);
        }
    }

    var layers = {
        terrain: TerrainLayer,
        grid: GridLayer,
        borders: BordersLayer,
        objects: ObjectsLayer,
        selection: SelectionLayer
    };

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
    const onTabOpened = (listener) => {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                listener();
            }
        });
    };

    /* eslint-disable max-lines */
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
                    if (this.selectedCity?.id === city.id) {
                        this.layers.selection.drawCitizenDistribution(city);
                    }
                },
                onBordersExpanded: ({ city, position }) => {
                    const [tileX, tileY] = position;
                    this.drawCapturedTileBorders(tileX, tileY);
                    if (this.selectedCity?.id === city.id) {
                        this.refreshCitySelection();
                    }
                },
                onUnitMoved: ({ path }) => {
                    const [fromX, fromY] = path[0];
                    const [toX, toY] = last(path);
                    const { unit } = this.grid.get(toX, toY);
                    this.drawObject(fromX, fromY);
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
                },
                onUnitKilled: ({ attackerPosition: [fromX, fromY], killedUnitPosition: [toX, toY] }) => {
                    this.drawObject(fromX, fromY);
                    this.drawObject(toX, toY);
                    this.layers.selection.clear();
                    this.layers.selection.drawUnitSelection(toX, toY);
                },
                onCombat: ({ from: [fromX, fromY], to: [toX, toY], attackedDestroyed, defenderDestroyed }) => {
                    if (attackedDestroyed) {
                        this.drawObject(fromX, fromY);
                        this.clearUnitSelection(); // TODO is attacker always selected?
                    }
                    else if (defenderDestroyed) {
                        this.drawObject(fromX, fromY);
                        this.drawObject(toX, toY);
                        this.layers.selection.clear();
                        this.layers.selection.drawUnitSelection(toX, toY);
                    }
                },
                onCityDestroyed: ({ city, barbarian: { position: [bx, by] } }) => {
                    this.clearCity(city);
                    this.drawObject(bx, by);
                    this.clearUnitSelection(); // TODO is attacker always selected?
                },
                onCityPillaged: ({ barbarianPosition: [bx, by] }) => {
                    this.drawObject(bx, by);
                    this.clearUnitSelection(); // TODO is attacker always selected?
                }
            };
            this.refresh = () => {
                forIn(this.layers, layer => {
                    layer.refresh();
                });
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
            const eventHandlerName = `on${upperFirst(event.type)}`;
            const handleEvent = this.eventHandlers[eventHandlerName];
            if (handleEvent) {
                handleEvent(event.payload);
            }
            else {
                console.warn(`'${eventHandlerName}' event handler not defined`);
            }
        }
        handleEvents(events) {
            events.forEach(event => {
                this.handleEvent(event);
            });
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
            onTabOpened(this.refresh);
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
            const firstClick = !isPositionsEqual(obj?.position, [tileX, tileY]);
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
                    this.layers.objects.drawUnit(vx, vy, unit);
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
            const events = this.world.moveUnit(this.selectedUnit, tileX, tileY);
            if (events.length > 0) {
                this.handleEvents(events);
            }
            else {
                this.layers.selection.clear();
                this.selectUnit(this.selectedUnit);
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
        clearCity(city) {
            const { position: [cx, cy], influence } = city;
            this.drawObject(cx, cy);
            influence.getFrontierPositions().forEach(([x, y]) => {
                this.layers.borders.clearTile(x, y);
                for (const { dx, dy } of Direction.members) {
                    const nextX = x + dx;
                    const nextY = y + dy;
                    if (this.grid.get(nextX, nextY).influencedBy) {
                        this.drawBorders(nextX, nextY);
                    }
                }
            });
        }
        removeSelectedCity() {
            if (this.selectedCity) {
                this.clearCity(this.selectedCity);
                this.unselectCity();
            }
        }
        placeTerrain(tx, ty, terrain) {
            const placed = this.world.placeTerrain(tx, ty, TERRAINS[terrain - 1]);
            if (placed) {
                this.drawTile(tx, ty);
                if (this.selectedCity) {
                    this.refreshCitySelection();
                }
            }
            return placed;
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
                this.layers.objects.drawUnit(vx, vy, unit);
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
        placeUnit(tx, ty, optionId) {
            // TODO
            const unitData = optionId <= UNITS.length
                ? { type: UNITS[optionId - 1], playerId: 1 }
                : { type: UNITS[1], playerId: 0 };
            this.world.placeUnit(tx, ty, unitData);
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

    const saveFile = (name, bytes) => {
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = createDomNode('a', {
            href: url,
            download: `${name}.save`
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatTo2Digits = (number) => padStart(number, 2);
    const formatTo3Digits = (number) => padStart(number, 3);
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
            get: city => {
                if (city.project === null) {
                    return defaultValue;
                }
                const projectName = getProjectName(city.project.type.productId);
                const projectProgress = getProjectProgress(city.project);
                return `${projectName} (${projectProgress})`;
            }
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
        },
        {
            label: 'hit points',
            get: unit => isMilitaryUnitData(unit)
                ? unit.hitPoints
                : null
        }
    ];
    const getCityInfo = getPresenter(cityInfo);
    const getUnitInfo = getPresenter(unitInfo);

    const DEFAULT_WORLD_WIDTH = 40;
    const DEFAULT_WORLD_HEIGHT = 20;
    const saveWorld = (world) => {
        const defaultFileName = getCurrentFormattedFullDate();
        const name = prompt('File Name', defaultFileName);
        if (name !== null) { // if name is null user pressed "cancel" button in prompt pop up
            const booleans = serializeWorld(world);
            const bytes = new Uint8Array(booleansToBytesGenerator(booleans));
            saveFile(name || defaultFileName, bytes);
        }
    };
    const getInfluenceInfo = (position, city) => city.assignments.isPositionOccupied(position) ? `<b>${city.name}</b>` : city.name;
    // TODO: reduce complexity
    const getTileInfo = (view, position) => {
        const [x, y] = position;
        const info = [
            view.world.grid.getIndexByPosition(x, y),
            `[${position.join('; ')}]`
        ];
        const tile = view.grid.get(x, y);
        const { unit, city } = tile;
        if (tile.influencedBy) {
            info.push(getInfluenceInfo(position, tile.influencedBy));
        }
        if (unit) {
            info.push(getUnitInfo(unit));
        }
        else if (city) {
            info.push(getCityInfo(city));
        }
        else if (view.selectedCity) {
            const positionsToExpand = view.selectedCity.influence.getTilesToExpand();
            const tileToExpand = positionsToExpand
                .find(({ position: pos }) => isPositionsEqual(pos, position));
            if (tileToExpand) {
                info.push(`expansion cost: ${tileToExpand.cost}`);
            }
            else if (tile.influencedBy !== null &&
                tile.influencedBy !== view.selectedCity &&
                view.selectedCity.influence.canSwap(x, y)) {
                info.push('swappable');
            }
        }
        return info.join(' ');
    };

    const ModalWrapper = ({ content }) => [
        createVNode('div', { className: 'backdrop' }),
        createVNode('div', { className: 'modal-wrapper' }, [content])
    ];

    var _a;
    class ModalContainer extends Component {
        onMounted() {
            _a.instance = this;
            document.addEventListener('keydown', ({ key }) => {
                if (key === 'Escape') {
                    this.closeModal();
                }
            });
        }
        showModal(modal) {
            this.setState({ modal });
        }
        closeModal() {
            this.setState({ modal: null });
        }
        render() {
            return this.state.modal
                ? createVNode(ModalWrapper, { content: this.state.modal })
                : null;
        }
    }
    _a = ModalContainer;
    ModalContainer.showModal = (modal) => {
        _a.instance.showModal(modal);
    };
    ModalContainer.closeModal = () => {
        _a.instance.closeModal();
    };

    const LabeledField = ({ label, value }) => (createVNode('span', { className: 'field' }, [
        createVNode('span', `${label}: `, { className: 'label' }),
        createVNode('span', value, { className: 'value' })
    ]));

    class SaveLoad extends Component {
        constructor() {
            super(...arguments);
            this.fileInputRef = { value: null };
            this.fileReader = new FileReader();
            this.loadFile = () => {
                this.fileInputRef.value.click();
            };
        }
        onMounted() {
            this.fileReader.addEventListener('loadend', event => {
                const array = new Uint8Array(event.target.result);
                this.props.onLoad(array);
            });
        }
        render() {
            return createVNode('div', { className: 'save-load' }, [
                createVNode('button', 'Save', { onclick: this.props.onSave }),
                createVNode('button', 'Load', { onclick: this.loadFile }),
                createVNode('input', {
                    type: 'file',
                    ref: this.fileInputRef,
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

    const TopPanel = ({ turn, mapSeed, playerName, onSave, onLoad, onNewWorld }) => {
        return createVNode('div', { className: 'top-panel' }, [
            createVNode(LabeledField, { label: 'Turn', value: `${turn} (${playerName})` }),
            createVNode(LabeledField, {
                label: 'Map Seed',
                value: isNumber(mapSeed) ? seedToHex(mapSeed) : '-'
            }),
            createVNode(SaveLoad, { onSave, onLoad }),
            createVNode('button', 'New World', { onclick: onNewWorld })
        ]);
    };

    const Dropdown = ({ items, onChange, selectedItem = items[0], disabled = false }) => {
        return createVNode('select', {
            disabled,
            selectedIndex: items.indexOf(selectedItem),
            onchange: e => {
                const selectedItem = items[e.target.selectedIndex];
                onChange(selectedItem);
            }
        }, items.map(item => createVNode('option', item.name, { value: item.id })));
    };

    const LabeledDropdown = ({ label, disabled, items, selectedItem, onChange }) => {
        return [
            createVNode('span', { className: 'label' }, `${label}: `),
            createVNode(Dropdown, { disabled, items, selectedItem, onChange })
        ];
    };

    const SeedInput = ({ value, onChange }) => createVNode('div', { className: 'seed-field' }, [
        createVNode('label', 'Seed: '),
        createVNode('input', {
            type: 'text',
            value,
            oninput: e => {
                onChange(e.target.value);
            }
        }),
        createVNode('button', '↻', {
            onclick: () => {
                const seed = getRandomHexSeed();
                onChange(seed);
            }
        })
    ]);

    const NumberInput = ({ value, min, max, required, onChange }) => {
        return createVNode('input', {
            value,
            min, max,
            step: 1,
            required,
            type: 'number',
            onchange: (e) => {
                const input = e.target;
                // TODO ??
                onChange(Math.floor(+input.value));
            }
        });
    };

    const SizeInputs = ({ width, height, min, max, onWidthChange, onHeightChange }) => createVNode('div', [
        createVNode('span', 'Size: '),
        createVNode(NumberInput, {
            min, max,
            value: width,
            onChange: onWidthChange,
            required: true
        }),
        createVNode('span', { className: 'size-inputs-separator' }, 'x'),
        createVNode(NumberInput, {
            min, max,
            value: height,
            onChange: onHeightChange,
            required: true
        })
    ]);

    const RadioButtonsGroup = ({ name, options, onChange, value, }) => createVNode('div', options.map(rawOption => {
        const option = isString(rawOption)
            ? { id: rawOption, name: rawOption }
            : rawOption;
        return [
            createVNode('input', {
                type: 'radio',
                name,
                id: option.id,
                value: option.id,
                onchange: () => {
                    onChange(rawOption);
                },
                checked: value === rawOption
            }),
            createVNode('label', option.name, { htmlFor: option.id })
        ];
    }));

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

    class CreateWorldModal extends Component {
        constructor() {
            super(...arguments);
            this.confirm = () => {
                const { width, height } = this.state;
                this.setState({ errors: [] });
                if (this.state.isEmpty) {
                    this.onCreateEmptyWorld(width, height, this.state.terrain);
                }
                else {
                    this.onGenerateWorld(width, height, this.state.seed);
                }
            };
            this.cancel = () => {
                ModalContainer.closeModal();
            };
            this.getChangeHandler = (key) => (value) => {
                this.setState({ [key]: value });
            };
            this.toggleEmpty = () => {
                this.setState({ isEmpty: !this.state.isEmpty });
            };
        }
        getInitialState() {
            return {
                width: 40,
                height: 20,
                seed: getRandomHexSeed(),
                terrain: TERRAINS[0],
                errors: [],
                isEmpty: true
            };
        }
        onCreateEmptyWorld(width, height, terrain) {
            const errors = validateSize([width, height], MIN_WORLD_SIDE, MAX_WORLD_SIDE);
            if (errors.length === 0) {
                this.props.onCreateEmptyWorld(width, height, terrain);
                ModalContainer.closeModal();
            }
            else {
                this.setState({ errors });
            }
        }
        onGenerateWorld(width, height, seed) {
            const errors = validateSize([width, height], MIN_WORLD_SIDE, MAX_WORLD_SIDE);
            const seedNumber = parseHexSeed(seed);
            if (seedNumber === null) {
                errors.push('Invalid seed');
            }
            if (errors.length === 0) {
                this.props.onGenerateWorld(width, height, seedNumber);
                ModalContainer.closeModal();
            }
            else {
                this.setState({ errors });
            }
        }
        render() {
            return createVNode('div', { className: 'modal create-world' }, [
                createVNode('div', { className: 'form-row' }, [
                    createVNode(SizeInputs, {
                        width: this.state.width,
                        height: this.state.height,
                        min: MIN_WORLD_SIDE,
                        max: MAX_WORLD_SIDE,
                        onWidthChange: this.getChangeHandler('width'),
                        onHeightChange: this.getChangeHandler('height')
                    })
                ]),
                createVNode('div', { className: 'form-row' }, [
                    createVNode(RadioButtonsGroup, {
                        name: 'options',
                        options: ['empty', 'generate'],
                        value: this.state.isEmpty ? 'empty' : 'generate',
                        onChange: option => {
                            this.setState({ isEmpty: option === 'empty' });
                        }
                    })
                ]),
                createVNode('div', { className: 'form-row' }, [
                    this.state.isEmpty
                        ? createVNode(LabeledDropdown, {
                            label: 'Terrain',
                            items: TERRAINS,
                            selectedItem: this.state.terrain,
                            onChange: this.getChangeHandler('terrain')
                        })
                        : createVNode(SeedInput, {
                            value: this.state.seed,
                            onChange: this.getChangeHandler('seed')
                        })
                ]),
                this.state.errors.length > 0
                    ? createVNode('ul', { className: 'errors' }, this.state.errors.map(error => createVNode('li', error)))
                    : null,
                createVNode('div', { className: 'modal-buttons' }, [
                    createVNode('button', 'Cancel', { onclick: this.cancel }),
                    createVNode('button', 'Create', { onclick: this.confirm })
                ])
            ]);
        }
    }

    const LabeledCheckBox = ({ checked = false, label, id = label, onChange }) => {
        return createVNode('div', { className: 'labeled-checkbox' }, [
            createVNode('input', {
                type: 'checkbox',
                id,
                checked,
                onchange: (e) => {
                    const checkbox = e.target;
                    onChange(checkbox.checked);
                }
            }),
            createVNode('label', label, { htmlFor: id })
        ]);
    };

    class ButtonWithOption extends Component {
        constructor() {
            super(...arguments);
            this.checked = false;
        }
        render() {
            return createVNode('div', { className: 'controls-group' }, [
                createVNode('button', this.props.buttonText, {
                    onclick: () => {
                        this.props.onPress(this.checked);
                    }
                }),
                createVNode(LabeledCheckBox, {
                    label: this.props.optionName,
                    checked: this.checked,
                    onChange: checked => {
                        this.checked = checked;
                    }
                })
            ]);
        }
    }

    const isParametrizedTool = (tool) => Boolean(tool.items);

    const ToggledDropdown = ({ onToggle, items, selectedItem, onItemSelected, selected }) => {
        return createVNode('div', { className: 'toggled-dropdown' }, [
            createVNode('input', {
                type: 'checkbox',
                checked: selected,
                onchange: () => {
                    onToggle(!selected);
                }
            }),
            createVNode(Dropdown, {
                items,
                selectedItem,
                disabled: !selected,
                onChange: onItemSelected
            })
        ]);
    };

    class ParametrizedToolComponent extends Component {
        constructor() {
            super(...arguments);
            this.selectedItem = this.props.tool.items[0];
        }
        render() {
            return createVNode(ToggledDropdown, {
                selected: this.props.selected,
                items: this.props.tool.items,
                selectedItem: this.selectedItem,
                onItemSelected: item => {
                    this.selectedItem = item;
                    this.props.onChange(item);
                },
                onToggle: toggled => {
                    this.props.onChange(toggled ? this.selectedItem : null);
                }
            });
        }
    }

    const ToolComponent = ({ tool, selectedTool, onChange }) => {
        const selected = tool.id === selectedTool?.id;
        return isParametrizedTool(tool) ?
            createVNode(ParametrizedToolComponent, {
                selected,
                tool,
                onChange: item => {
                    onChange(item ? { id: tool.id, option: item.id } : null);
                }
            })
            : createVNode(LabeledCheckBox, {
                checked: selected,
                label: tool.label,
                onChange: checked => {
                    onChange(checked ? tool : null);
                }
            });
    };

    const ToolsPanel = ({ tools, onChange, selectedTool }) => createVNode('div', { className: 'controls-group' }, tools.map(tool => createVNode(ToolComponent, { tool, selectedTool, onChange })));

    const barb = {
        ...UNITS[1],
        id: UNITS.length + 1,
        name: 'barbarian'
    };
    const placeUnitOptions = [
        ...UNITS,
        barb
    ];
    const TOOLS = [
        {
            id: 'placeTerrain',
            items: TERRAINS
        },
        {
            id: 'placeUnit',
            items: placeUnitOptions
        },
        {
            id: 'placeCity',
            label: 'City'
        }
    ];

    const NONE_PROJECT = { id: 0, name: '-' };
    const PROJECT_ITEMS = [
        NONE_PROJECT,
        ...CITY_PROJECTS.map((project, index) => ({
            id: project.productId,
            name: `${UNITS[index].name} (${project.cost})`
        }))
    ];

    const ProjectSelector = ({ onChange, selectedProject }) => {
        const selectedItem = selectedProject === null
            ? NONE_PROJECT
            : PROJECT_ITEMS.find(item => item.id === selectedProject.productId);
        return createVNode('div', { className: 'controls-group labeled' }, [
            createVNode(LabeledDropdown, {
                label: 'City Project',
                disabled: false,
                onChange: item => {
                    const projectType = item !== NONE_PROJECT
                        ? CITY_PROJECTS.find(project => project.productId === item.id)
                        : null;
                    onChange(projectType);
                },
                selectedItem,
                items: PROJECT_ITEMS
            })
        ]);
    };

    const BottomPanel = ({ onTurn, onSkipTurns, onToggleGrid, onToolSelected, onCityProjectChanged, selectedTool, selectedCity, gridShown, tileInfo }) => {
        return createVNode('div', { className: 'bottom-panel' }, [
            createVNode('div', { className: 'controls-panel' }, [
                createVNode(LabeledCheckBox, {
                    label: 'Grid',
                    checked: gridShown,
                    onChange: onToggleGrid
                }),
                createVNode(ButtonWithOption, {
                    optionName: 'Skip Silent Turns',
                    buttonText: 'Turn',
                    onPress: skip => {
                        if (skip) {
                            onSkipTurns();
                        }
                        else {
                            onTurn();
                        }
                    }
                }),
                createVNode(ToolsPanel, {
                    tools: TOOLS,
                    onChange: onToolSelected,
                    selectedTool
                }),
                selectedCity
                    ? createVNode(ProjectSelector, {
                        onChange: onCityProjectChanged,
                        selectedProject: selectedCity.project ? selectedCity.project.type : null
                    })
                    : null
            ]),
            createVNode('span', { innerHTML: tileInfo ?? '-' })
        ]);
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
            contextmenu: noop, // TODO: (?) just prevent default
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
        const { onLeave, onMove, ...mousePositionHandlers } = handlers;
        const adaptedClickHandlers = mapValues(mousePositionHandlers, handler => (getMouseClickHandler(handler, getTilePosition)));
        return {
            ...adaptedClickHandlers,
            ...getMouseMoveHandlers({ onMove, onLeave }, getTilePosition),
        };
    };
    const addGridMouseHandlers = ({ element, getTilePosition, ...handlers }) => {
        const mouseHandlers = toMouseHandlers(handlers, getTilePosition);
        addMouseHandlers(mouseHandlers, element);
    };

    const offsetsMap = {
        ArrowLeft: Direction.WEST.offset,
        ArrowUp: Direction.NORTH.offset,
        ArrowRight: Direction.EAST.offset,
        ArrowDown: Direction.SOUTH.offset
    };
    const addKeyHandlers = ({ element, ...handlers }) => {
        element.addEventListener('keydown', ({ key }) => {
            if (key.startsWith('Arrow')) {
                const offset = offsetsMap[key];
                handlers.onArrow(offset);
            }
            else {
                handlers[`on${key}`]?.();
            }
        });
    };

    const playerNames = [
        'barbarians',
        'player'
    ];
    class Sandbox extends Component {
        constructor() {
            super(...arguments);
            this.view = new View(World.createEmptyWorld(DEFAULT_WORLD_WIDTH, DEFAULT_WORLD_HEIGHT), {
                onClearSelection: () => {
                    this.setState({ selectedCity: null });
                },
                onCitySelected: selectedCity => {
                    this.setState({ selectedCity });
                }
            });
            this.viewContainerRef = { value: null };
            this.saveWorld = () => {
                saveWorld(this.view.world);
            };
            this.loadWorld = (bytes) => {
                const world = World.fromData(deserializeWorld(bytes));
                this.updateWorld(world);
            };
            this.createWorld = () => {
                ModalContainer.showModal(createVNode(CreateWorldModal, {
                    onCreateEmptyWorld: (width, height, terrain) => {
                        const world = World.createEmptyWorld(width, height, terrain);
                        this.updateWorld(world);
                    },
                    onGenerateWorld: (width, height, seed) => {
                        const map = generateMap(width, height, seed);
                        const world = World.fromTerrainMap(map, width, seed);
                        this.updateWorld(world);
                    }
                }));
            };
            this.onToggleGrid = () => {
                const gridShow = !this.state.gridShow;
                this.view.setGridShown(gridShow);
                this.setState({ gridShow });
            };
            this.onTurn = () => {
                this.view.turn();
                this.setState({
                    turn: this.view.world.turnNumber,
                    playerName: this.getPlayerName()
                });
            };
            this.skipTurns = () => {
                this.view.skipTurnsUntilEvent();
                this.setState({
                    turn: this.view.world.turnNumber,
                    playerName: this.getPlayerName()
                });
            };
            this.onToolSelected = (tool) => {
                this.setState({ selectedTool: tool });
            };
            this.onCityProjectChanged = (project) => {
                this.view.changeCityProject(project?.productId ?? null);
            };
        }
        getPlayerName() {
            return this.view ? playerNames[this.view.world.playerId] : playerNames[1];
        }
        getInitialState() {
            return {
                turn: 1,
                gridShow: true,
                mapSeed: null,
                selectedTool: null,
                selectedCity: null,
                playerName: this.getPlayerName()
            };
        }
        onMounted() {
            this.view.mount(this.viewContainerRef.value);
            this.view.draw();
            this.addMouseHandlers();
            this.addKeyHandlers();
        }
        addMouseHandlers() {
            addGridMouseHandlers({
                element: this.view.layersContainer,
                getTilePosition: ([mx, my]) => {
                    const [vx, vy] = this.view.getViewportPosition();
                    return this.view.grid.getPosition(Math.floor(mx / this.view.tileSize) + vx, Math.floor(my / this.view.tileSize) + vy);
                },
                onLeftClick: ([tileX, tileY]) => {
                    if (this.state.selectedTool) {
                        this.applyTool(tileX, tileY);
                        this.setState({ selectedTool: null });
                    }
                    else {
                        this.view.onTileClick(tileX, tileY);
                    }
                },
                onRightClick: ([tileX, tileY]) => {
                    if (this.view.selectedUnit) {
                        this.view.moveUnit(tileX, tileY);
                    }
                },
                onCtrlClick: ([tileX, tileY]) => {
                    if (this.state.selectedTool) {
                        this.applyTool(tileX, tileY);
                    }
                },
                onMove: tilePosition => {
                    const tileInfo = this.getTileInfo(tilePosition);
                    this.setState({ tileInfo });
                },
                onLeave: () => {
                    this.setState({ tileInfo: null });
                }
            });
        }
        addKeyHandlers() {
            addKeyHandlers({
                element: document,
                onEscape: () => {
                    this.view.clearSelection();
                    this.setState({ selectedTool: null });
                },
                onArrow: ([dx, dy]) => {
                    this.view.moveViewport(dx, dy);
                },
                onDelete: () => {
                    this.view.removeSelectedUnit();
                    this.view.removeSelectedCity(); // TODO
                }
            });
        }
        getTileInfo(position) {
            return getTileInfo(this.view, position);
        }
        applyTool(tileX, tileY) {
            const { selectedTool } = this.state;
            const toolId = selectedTool.id;
            const result = this.view[toolId](tileX, tileY, selectedTool.option);
            if (result) {
                this[`on${upperFirst(toolId)}`]?.(result);
            }
        }
        onPlaceTerrain() {
            this.setState({
                mapSeed: this.view.world.mapSeed
            });
        }
        updateWorld(world) {
            this.view.update(world);
            this.setState({
                turn: this.view.world.turnNumber,
                mapSeed: this.view.world.mapSeed,
                playerName: this.getPlayerName()
            });
        }
        render() {
            return [
                createVNode('div', { className: 'main' }, [
                    createVNode(TopPanel, {
                        turn: this.state.turn,
                        mapSeed: this.state.mapSeed,
                        playerName: this.state.playerName,
                        onSave: this.saveWorld,
                        onLoad: this.loadWorld,
                        onNewWorld: this.createWorld
                    }),
                    createVNode('div', { ref: this.viewContainerRef }),
                    createVNode(BottomPanel, {
                        gridShown: this.state.gridShow,
                        onToggleGrid: this.onToggleGrid,
                        onTurn: this.onTurn,
                        onSkipTurns: this.skipTurns,
                        onToolSelected: this.onToolSelected,
                        onCityProjectChanged: this.onCityProjectChanged,
                        selectedTool: this.state.selectedTool,
                        selectedCity: this.state.selectedCity,
                        tileInfo: this.state.tileInfo
                    })
                ]),
                createVNode(ModalContainer, {})
            ];
        }
    }

    loadSprites(() => {
        mountRoot(Sandbox, {}, document.body);
    });

})();
//# sourceMappingURL=app.js.map
