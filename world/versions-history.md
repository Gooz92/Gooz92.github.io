# Versions History

Short description of *functional* changes introduced in each version.

## v0.1.0, v0.1.1

These version are lost. I just forgot from which commits they were builded. They were never be released anywhere. Not a big loss because released v0.1.2 includes almost same features plus critical bugfixes. As I remember...

## [v0.1.2](v0.1.2) (2022-07-03)

* Place city
* Cities population growth
* Auto citizen distribution
* Borders expanding
* Highlight max city borders
* Saves
* Place terrain (grassland and steppe)

## [v0.1.3](v0.1.3) (2023-03-03)

* Min distance between cities decreased from 9 to 8 (4 axial tiles).
* Tiles expansion cost calculation improved
* Label "expansion cost" added
* Documentation page added
* Placing terrain on tile with city fixed

## [v0.2.0](v0.2.0) (2023-03-10)

### Breaking Changes
* saves files from version 0.1.x are not supported

### Features
* First units: warrior, settler, worker. Color is only one difference. There are no unit abilities. Unit movement without pathfinding. Unit can move only to adjacent tile. Movement loops and chains.
* Swapped tiles detection. No possibility to swap. Just show that tile can be swapped by hovering over it.
* Citizen displayed on the map only if city selected.
* New icons for city and citizen
* Tile size increased to 32 px
* New algorithm for choosing next tile to expand with more sophisticated conflicts resolving.
* Possibility to create world with given size.

## [v0.3.0](v0.3.0) (2023-07-03)

### Fixes
* Border viewport tile info not showing after mouse leaving (minor)
* Now checkboxes toggled by clicking on label (minor) 

### Features
* Path following. Now unit can automatically move not only to adjacent tile.

### Known Issues
* Units collision handling is not ideal.
  - One of collided units still will be moved to target tile. Others moves will be cancelled.
  - If unit move to occupied tile movement cancellation can occurs too early.
  - Collision can be handled differently after loading.
* There is no path smoothing
* Path drawing is ugly

## [v0.3.1](v0.3.1) (2023-07-08)

### Fixes
* Disable tools dropdown when manually unselected

### Features
* Remove unit by pressing `delete` (win), `fn+backspace` (mac)

### Other Changes
* Order of units names in dropdown changed. Now they are sorted by "cost": worker, warrior, settler

## [v0.3.2](v0.3.2) (2023-07-11)

### Fixes
* Error in key pressing handling prevented

## [v0.4.0](v0.4.0) (2023-07-30)

### Features
* Building units by cities
* UI/UX improvements

## [v0.4.1](v0.4.1) (2023-08-18)

### Features
* Place sea tile
