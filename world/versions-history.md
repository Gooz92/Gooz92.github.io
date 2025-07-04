# Versions History

Short description of *functional* changes introduced in each version.

## [v0.6.4](v0.6.4) (2024-07-23)

### Features
  * Military units healing

## [v0.6.3](v0.6.3) (2024-06-16)

### Features
  * UI styling

### Fixes
  * Remove native browser validation in `Create World Modal`. (Map size was affected)
  
## [v0.6.2](v0.6.2) (2024-06-03)

### Fixes
  * Combat shaking animation now works after viewport move
  * Disallow possibility to cancel opponents move by targeting to same tile
  * Make tile occupied by enemy impassable
  * Make city tile impassable for barbarians

## [v0.6.1](v0.6.1) (2024-05-21)

### Features
  * Combat shaking animation
  * Form html element used in `create new world` modal. New world can be created by pressing `Enter`

## [v0.6.0](v0.6.0) (2024-05-09)

### Features
  * Barbarians
  * Combat system
  * City pillaging

## [v0.5.5](v0.5.5) (2024-04-04)

### Features
  * Ability to remove city

### Fixes
  * Prevent to show blank viewport after tab inactivity

## [v0.5.4](v0.5.4) (2024-03-24)

### Features
  * show/hide city project selector
  * new generate world modal
  * size of generated world
  * filling of empty world

### Fixes
  * do not reset viewport position after terrain placement

## [v0.5.3](v0.5.3) (2024-01-07)

### Features
* Steppe tiles generation

### Fixes
* Select none ("-") city project

### Changes
* Map seed should be in lowercase

### Misc
* [Map generation demo](v0.5.3/map-gen-demo.html)

## [v0.5.2](v0.5.2) (2023-12-26)

### Features
* Unit icons

### Changes
* Remove units cyclic movements
* Strict map size validation

## [v0.5.1](v0.5.1) (2023-10-03)

### Features
* Display and save map seed

### Fixed
* Fix map seed validation

## [v0.5.0](v0.5.0) (2023-09-21)

### Features
* Map generation

### Known Issues
* Error in map seed validation
* Source code is not minified

## [v0.4.1](v0.4.1) (2023-08-18)

### Features
* Place sea tile

## [v0.4.0](v0.4.0) (2023-07-30)

### Features
* Building units by cities
* UI/UX improvements

## [v0.3.2](v0.3.2) (2023-07-11)

### Fixes
* Error in key pressing handling prevented

## [v0.3.1](v0.3.1) (2023-07-08)

### Fixes
* Disable tools dropdown when manually unselected

### Features
* Remove unit by pressing `delete` (win), `fn+backspace` (mac)

### Other Changes
* Order of units names in dropdown changed. Now they are sorted by "cost": worker, warrior, settler

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

## [v0.1.3](v0.1.3) (2023-03-03)

* Min distance between cities decreased from 9 to 8 (4 axial tiles).
* Tiles expansion cost calculation improved
* Label "expansion cost" added
* Documentation page added
* Placing terrain on tile with city fixed

## [v0.1.2](v0.1.2) (2022-07-03)

* Place city
* Cities population growth
* Auto citizen distribution
* Borders expanding
* Highlight max city borders
* Saves
* Place terrain (grassland and steppe)

## v0.1.0, v0.1.1

These version are lost. Not a big loss because released v0.1.2 includes almost same features plus critical bugfixes.