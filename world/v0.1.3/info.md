## Features

### Viewport

Map has fixed size and option to show/hide grid lines. It's wraps horizontally and vertically. This means that everything that cross map "borders" appears on opposite side. This can be percepted as borderless round world. It is possible move viewport (scroll map) by pressing arrow keys. Viewport match map size. Tile position shown by hovering over it below viewport.

### Placing Objects

There is possibility to place city and two types of terrain: grassland (green) and steppe (yellow). Object to place can be picked in control panel below viewport.

### Next Turn

Some game effects applied only on next turn. Turn completes by pressing `Turn` button below viewport. Current turn number displayed above map viewport. Max turn number is 65536. If max turn reached it just started counting again from 1.

### Skip Turns Unit Event

As there are no many events for now it is possible to skip turns until something significant happens by pressing `Skip Turns Unit Event`. Max skipped turns is 1000. Skipping ends when city population growth, or borders expanded or limit reached.

### Save/Load

Game state can be saved in binary file with .save extension. By default file name is a current date and time in `yyyy-mm-dd hh.mm.ss.ms` format.

## Game Mechanics

### Cities

City information shown by hovering over it below viewport next to tile position.

Min distance between cities is restricted by following rule:

Center of city can not be in max borders of another one city.

#### Borders

Every city has a center and influenced area. By default influenced area is 3x3 square which expanded over time. Max city influenced area is shown when city selected (grey borders).

When city population reach a half of influenced area size city starts accumulate expanding points.

Expanding points per turn = `population - ceil(halfArea) + 1`

So, when population reach 5 and city has 3x3 influenced area it start produce 1 expanding point per turn.

`5 - ceil(3 * 3 / 2) + 1 = 5 - ceil(4.5) + 1 = 5 - 5 + 1 = 1`

City area expanded by one tile at time. Next tile to expand picked automatically. Tiles with more food and less expansion cost are preferable. Cost of expansion to tile depends on its distance to city center and influenced adjacent tiles. Less distant tiles with more influenced adjacent tiles cost less.

Exact algorithm of calculation expansion cost to tile is under consideration and will be described later.

There is possibility to expand selected city borders by just by click on tile.

#### Population and Growth

City center and citizens worked influenced area produces food. Amount of produced food depends on terrain type: 2 for grassland and 1 for steppe. Every citizen consume 2 food per turn. Food surplus accumulates in the city. When amount of stored food reach threshold city spent it to increase its population. The larger city requires more food for growth.

Food required for growth = `10 * population + pow(population - 1, 2)`

New citizen start works on better tile automatically. Tiles with more food nearest to city center are preferable.
