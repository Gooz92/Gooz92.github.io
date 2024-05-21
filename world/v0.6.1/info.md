## Features

### Viewport and Map

The map is wrapped around both vertically and horizontally. This means that anything crossing the map’s edge will appear on the opposite side. For example, if a unit moves up and left from the top left corner (0, 0), it will reappear in the bottom right corner. This can be perceived as a borderless, round world.

The viewport displays the entire map, which can be scrolled using the arrow keys. Thus, all map tiles are displayed in the viewport simultaneously, but their display positions can be shifted.

**Minor Map Features**

* Toggle grid lines on/off.
* Tile position and its index shown below viewport by hovering over it.

### New World

To create new world press `New World` button in the top panel. The world size can be specified in the modal that appears. The minimum world side is *13*, and the maximum is *265*.

Two creation options are available:
 * Create "empty" world with specified filling.
 * Generate world with specified seed. The map seed value is an 8-digit, lowercase hexadecimal number. Currently, only the "pangea" map type is available. There are no lakes or islands, just one large continent with steppe and grassland tiles. The map seed will be displayed on the top panel, visible only if the map is generated and unchanged.

### Placing Game Objects

There is possibility to place a city, unit and three types of terrain: grassland (green), steppe (yellow) and sea (light blue). The object to be placed can be selected in the control panel below the viewport. After placing the selected object, the type in the control panel will be deselected. Hold `Ctrl` to place several objects of the same type. Information about the placed object is shown by hovering over it below the viewport, next to the tile position.

### Turns and Players

Currently, there are only two factions:

* The main player (green), which controls cities.
* Barbarians (red), which control only warrior units.

Both fraction controlled by human player.

The main player goes first. Pressing the Turn button passes the turn to the next player. The current turn number is displayed above the map viewport. The maximum turn number is 65,536. If this maximum is reached, the count starts again from 1.

### Skip Silent Turns

It is possible to skip turns until something significant happens by checking `Skip Silent Turns` checkbox. Max skipped turns is 1000. Skipping ends when at least one event occurred on previous turn (growth of city population, borders expanding, unit movement, city project completion) or limit of silent turns reached.

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
* has at least one orthogonal-adjacent and one diagonal-adjacent swappable or captured by selected city tile

#### Population and Growth

City center and citizens working in influenced area produces food. Amount of produced food depends on terrain type: 2 for grassland and 1 for steppe. Every citizen consume 2 food per turn. Food surplus accumulates in the city. When amount of stored food reach threshold city spent it to increase its population. The larger city requires more food for growth.

Food required for growth = `10 * population + pow(population - 1, 2)`

New citizen start works on better tile automatically. Tiles with more food nearest to city center are preferable.

Press `delete` (win) or `fn+backspace` (mac) to remove selected city.

#### Projects

City can build only units for now. Every city can works only on one project (unit) at a time or just do nothing (default behavior). Project can be chosen in dropdown which enabled when city selected. Count of turns required to complete every project shown in brackets after project name. It is fixed and unrelated to city population and anything else for now. Project progress can be viewed by hovering city along with other city info.

When unit is completed it appears on city tile (if it unoccupied). If city garrisoned project progress stops when one turn left to completion. After project is done city starts do nothing until next project will be selected.

### Units

There are 3 unit types: settler, warrior, worker. Color of the unit icon is only one difference. There are no unit abilities. Only one unit per tile allowed. Unit can be placed in the city as garrison. In this case city icon on the map has grayed gates.

Press `delete` (win) or `fn+backspace` (mac) to remove selected unit.

#### Movement

Every unit has 6 movement points (MP) by default. Cardinal move (up, right, down, left) cost 2 MP. Diagonal move cost 3 MP. Selected unit can be moved by right click on target tile. It will continue moving in the direction of target tile while MP will be enough. If target tile is not reached on current turn, the movement will continue on the next. There can be a situation when MP is not zero but it not enough to move on next tile in the path. In this case remaining MP will be carried over next turn. For example, if unit has 1 MP and moves to cardinal tile on the next turn it will have 1 + 6 - 2 = 5 MP. Selected unit path to target tile displayed as blue dots.

### Combat

To initiate combat, follow these steps:

1. **Select a Unit**: Choose a unit from your current faction.
2. **Target an Enemy Unit**: Right-click on an adjacent tile containing an enemy unit.

The selected unit must have enough movement points (MP) to move to the target tile. The corresponding MP will be spent. Both the attacker and the defender will receive damage. The damage dealt is based solely on the health of the attacker and defender.

### City Pillaging

To pillage a city, follow these steps:

1. **Select a Barbarian Unit**: Choose a barbarian unit.
2. **Target an Adjacent City**: Right-click on a city located on an adjacent tile.
3. **Pillage the City**:
  - If the city is not garrisoned with a military unit, its population will decrease by 1.
  - Additionally, any non-military unit placed in the city will be destroyed.
  - If the city's population decreases to zero, it will be razed.
  - If there is a military unit in the city, combat will be initiated.
