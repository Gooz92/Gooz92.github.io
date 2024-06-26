# Versioning

Version consists of three parts separated by dots: major, minor, patch.
Lear more: https://semver.org/

## Major

### Updated when:
* Global functionality introduced. Exp: multiplayer, AIs players
* Global mechanics (?): Governments, tech tree

### Should not be updated when:
* Bug fix
* UI/visual changes

## Minor

### Updated when:
* New mechanic added
* Mechanic significantly changed. Probably, broken backward compatibility.
* There are changes in serialization format (no applicable for < 1.0.0)

### Should not be updated when:
* No functional changes introduced

## Patch

### Updated when:
* Bug fix delivered
* Improvements of existing mechanic
* UI improvements/changes

## Letter versions (x.y.z-a, x.y.z-b, ...)

### Updated when:
* Variants for deep testing, reviews, feedback collection

## Notes

Almost not playable dev versions: __0__.x.y

First playable version: __1__.0.0
