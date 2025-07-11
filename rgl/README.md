# Versions

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
