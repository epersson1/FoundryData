# Changelog

## v1.11
### v1.11.1
* Fixed Macro lacking context (and in turn having mismatched arguments)
### v1.11.0
#### General
* Changed `item.executeMacro()` method to be async
* Updated how Item Macro is built and called to allow retrieving its value
#### DnD5e
* Switched DnD 5e's support to `dnd5e.preUseItem` Hook
  * Because of that, there no longer is distinction between using item from sheet, macro or any other way
  * Because of that, using plain `item.use()` in Item Macro is now disabled as it can lead to uncontrolled infinite loops
  * Since good practice dictates that all 3rd party modules, including custom sheets, should make use of `item.use()`, this means that all of them should now be supported by default
* `Character Sheet Hook` and `Right Click Override` settings for dnd5e are now removed in favor of single `Override default macro execution`
* Item Macros that you wish to still execute "standard" `item.use()` must now do it in one of two ways:
  * Return `true` from macro, or
  * Call `item.use({}, {skipItemMacro: true})` instead (passing `skipItemMacro = true` in `options` argument)


## v1.10
### v1.10.5
* Fixed the `Tidy 5e Sheet` stacking issue introduced in previous update 

### v1.10.4
* Added `Tidy 5e Sheet` support, by [@kgar](https://github.com/kgar)

### v1.10.3
* Fixed Item Macro crashing with disabled canvas

### v1.10.2
* Revert accidental change to dungeonworld file...

### v1.10.1
* Fixed the Item Macro not firing on the Actor Sheet in the Shadow of the Demon Lord system

### v1.10.0
* Module got transferred to Forien for upkeep, maintenance and future additions
* Fixed the "Update World Item Macros" context option not working
* Added support for WFRP4e system