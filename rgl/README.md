# Versions

## [v0.2.1](v0.2.1) (2025-08-12)

### Improvements
- Error page to display deserialization from url hash issues, as well as other unexpected errors.

## [v0.2.0](v0.2.0) (2025-07-31)

### Features

**Movement**
- Unit speed defines how many steps a unit can take per turn
- Orthogonal and diagonal moves cost 1 tile
- Movement is limited to one adjacent tile per action

**Actions**
- Attack automatically ends current unit turn
- *End Turn* button

**Map Layout**
- Increase tile size
- Grid lines

## [v0.1.2](v0.1.2) (2025-07-23)

### Improvement
- Show unit max health
- Enhance unit hover highlights

## [v0.1.1](v0.1.1) (2025-07-20)

### Features
- Units in the move queue are color-coded according to their faction.
- Units are highlighted on the map and in the queue when hovered over.

## [v0.1.0](v0.1.0) (2025-07-12)

### Release Goals
- Conduct testing of the initiative queue through visual display and different battle scenes.
- Develop and prepare serialization utility modules for future integration.

### Features
- Select predefined battle scenes from a list.
- Display the move queue.

## [v0.0.2](v0.0.2) (2025-07-02)

### Release Goal
Prepare the Initiative system for serialization.

### Improvements
- The winning faction is now represented by its color rather than a numeric identifier.

## [v0.0.1](v0.0.1) (2025-06-26)

### Release Goal
Ensure the player receives visual feedback by triggering a shaking animation on the unit when it is attacked.

### Features
- Shaking animation on attacked unit

## [v0.0.0](v0.0.0) (2025-06-23)

### Release Goal
Kick off iterative development with a minimal scene illustrating the fundamentals of core game mechanics.

### Features
- **Battle scene** with two rats `r` and one dude `d`
- **Map layout** includes passable tiles (`.`) and impassable obstacles (`#`)
- **Units** can move to adjacent passable tiles or attack adjacent enemy units
- **Unit factions** are visually distinguished by red and blue colors
- **Active unit** is highlighted as a bold character on the map
- **Unit health** is viewable by hovering over the tile occupied by the unit
- **Initiative system**: rats act before the human unit and move slightly more frequently
