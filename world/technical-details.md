# Dev Tools, Technologies, Techniques and Approaches

## TypeScript

TypeScript used as a primary language for UI and game logic. JavasScript can be used only for some building or testing tools.

## Canvas

Several canvas elements stacked into layer are used for displaying map viewport. In the future some svg and html elements can be added. Especially for viewport overlay components such as icons, cities titles, tooltips, e.t.c.

## Node and NPM

Node and NPM are used for bundling and unit tests running. Potentially game core logic can be run on served side using node in the future. This possibility can be used for multiplayer development and hiding implementation to avoid cheating.

## No 3rd Libs in Production Build

Everything included in final build is developed by author. This doesn't mean that architecture is fully monolith. Some things are made to be potentially replaceable. Especially it applies to two main parts of the game: UI and core engine.
