## Features

### Viewport and Map

Map is wraparounded vertically and horizontally. This means that everything that cross map edge appears on opposite side. For example if unit moves up and left from top left corner (0, 0) it occurs in bottom right corner. This can be percepted as borderless round world.

Viewport displays whole map and can be scrolled by pressing arrow keys. So, all map tiles displayed on viewport at the same time but their displays positions can be shifted.

**Minor Map Features**

* Show/hide grid lines.
* Tile position and its index shown by hovering over it below viewport.

### New World

There is possibility to create new world with given size by pressing `New World` button. New world width and height should be provided in pop-up input. Any non-numeric characters can be used as separator. For example: '32x18', '20 15', '40 / 30'.

Min side is 13. Max side is 265.

### Placing Game Objects

There is possibility to place a city, unit and two types of terrain: grassland (green) and steppe (yellow). Object to place can be picked in control panel below viewport. After placing selected object type in control panel will be unselected. Hold `ctrl` to place several object with the same type. Information about placed object shown by hovering over it below viewport next to tile position.

### Next Turn

Some game effects applied only on next turn. Turn completes by pressing `Turn` button below viewport. Current turn number displayed above map viewport. Max turn number is 65536. If max turn reached it just started counting again from 1.

### Skip Turns Unit Event

As there are no many events for now it is possible to skip turns until something significant happens by pressing `Skip Turns Unit Event`. Max skipped turns is 1000. Skipping ends when city population growth, borders expanded, unit moved or limit reached.

### Save/Load

Game state can be saved in binary file with .save extension. By default file name is a current date and time in `yyyy-mm-dd hh.mm.ss.ms` format.

## Game Core Concepts

### Cities

Min distance between cities is restricted by following rule:
Center of city can not be in max borders of another one city.

Cities name are composed automatically by uppercase latin letters.

#### Borders

Every city has a center and influenced area. By default influenced area is 3x3 square which expanded over time. Max city influenced area is shown when city selected (grey borders). If tile is influenced by the city its name will be displayed by hovering over tile.

When city population reach a half of influenced area size city starts accumulate expanding points.

Expanding points per turn = `population - ceil(halfArea) + 1`

So, when population reach 5 and city has 3x3 influenced area it start produce 1 expanding point per turn.

`5 - ceil(3 * 3 / 2) + 1 = 5 - ceil(4.5) + 1 = 5 - 5 + 1 = 1`

City area expanded by one tile at time. Next tile to expand picked automatically. Tiles with more food and less expansion cost are preferable. Cost of expansion to tile depends on its distance to city center and influenced adjacent tiles. Less distant tiles with more influenced adjacent tiles cost less.

Exact algorithm of calculation expansion cost to tile is under consideration and will be described later.

There is possibility to expand selected city borders by just by click on tile.

#### Swappable Tiles

For the future tile in the borders of two cities can be shared between them. This means that influenced tile can be reassigned to another city.

Only detection of such tiles has been implemented. If tile is swappable this is displayed by hovering over it in the info string below viewport.

To be swappable tile must:
* be in the max borders of both cities
* has at least one axial and one diagonal adjacent swappable or captured by selected city tile

#### Population and Growth

City center and citizens working in influenced area produces food. Amount of produced food depends on terrain type: 2 for grassland and 1 for steppe. Every citizen consume 2 food per turn. Food surplus accumulates in the city. When amount of stored food reach threshold city spent it to increase its population. The larger city requires more food for growth.

Food required for growth = `10 * population + pow(population - 1, 2)`

New citizen start works on better tile automatically. Tiles with more food nearest to city center are preferable.

### Units

There are 3 unit types: settler, warrior, worker. Color of the unit icon is only one difference. There are no unit abilities. Only one unit per tile allowed. Unit can be placed in the city as garrison. In this case city icon on the map has grayed gates.

Press `delete` (win) or `fn+backspace` (mac) to remove selected unit.

#### Movement

Every unit has 6 movement points (MP) by default. Cardinal move (up, right, down, left) cost 2 MP. Diagonal move cost 3 MP. Selected unit can be moved by right click on target tile. It will continue moving in the direction of target tile while MP will be enough. If target tile is not reached on current turn, the movement will continue on the next. There can be a situation when MP is not zero but it not enough to move on next tile in the path. In this case remaining MP will be carried over next turn. For example, if unit has 1 MP and moves to cardinal tile on the next turn it will have 1 + 6 - 2 = 5 MP. Selected unit path to target tile displayed as blue dots.

There is possibility to move several units at time. For example, unit A can be moved to unit B position and unit B moved to unoccupied tile. To do so, just select first unit, right click on another one and then right click on empty tile. In the same manner units on adjacent tile can be swapped i.e unit A goes to unit B tile and unit B goes to unit A tile. There are more complex cases: 

* Long movement chain: unit A goes to unit B tile, unit B goes to unit C tile and unit C goes to empty tile. (A -> B -> C -> _).
* Loop: unit A goes to unit B tile, unit B goes to unit C and unit C goes to unit A tile (A -> B -> C -> A).

There are no restrictions of size such loops and chains. To cancel any type of move just right click on moving unit tile.
