# Changelog

## v2.2.0
* Change how additional parameters are passed to Item Macro
  * First parameters is expected to be a `scope` object and its fields will be available in Item Macro under `args` argument, for example `args.activity`
  * all additional parameters will be added to `scope` object via destructuring and will also be available under `args` argument, for example `args[0]`
#### DnD5e
* Added automatic migration of `item.use({}, {skipItemMacro: true})` to `item.use({{skipItemMacro: true, legacy: falce})`
  * This automatic migration only works if no other data was passed to `item.use`.

## v2.1.0
#### DnD5e
* Switched DnD 5e's support from `dnd5e.preUseItem` Hook to `dnd5e.preUseActivity` Hook
* Item Macros that you wish to still execute "standard" `item.use()` must now do it in one of two ways:
  * Return `true` from macro, or
  * Call `item.use({{skipItemMacro: true, legacy: falce})` instead (passing `skipItemMacro = true` and `legacy = false` in `usageConfig` argument)

## v2.0.1
* Fix Item Macro permission for players 

## v2.0.0
* Added Support for [Shadowrun 5e](https://foundryvtt.com/packages/shadowrun5e) ([PR #19](https://github.com/Foundry-Workshop/Item-Macro/pull/19) by Thogrim1984)
* Added Support for [Worlds Without Number](https://foundryvtt.com/packages/wwn) ([PR #15](https://github.com/Foundry-Workshop/Item-Macro/pull/15) by pandanielxd)
* Added Support for [Dungeon Crawl Classics](https://foundryvtt.com/packages/ddc) ([#21](https://github.com/Foundry-Workshop/Item-Macro/issues/21))
* Added Support for [Dragonbane](https://foundryvtt.com/packages/dragonbane) ([#17](https://github.com/Foundry-Workshop/Item-Macro/issues/17))
* Added Support for [World of Darkness 20th edition](https://foundryvtt.com/packages/worldofdarkness) ([#12](https://github.com/Foundry-Workshop/Item-Macro/issues/12))
* Added Support for [Symbaroum](https://foundryvtt.com/packages/symbaroum) ([#9](https://github.com/Foundry-Workshop/Item-Macro/issues/9))
* Refactored huge parts of the module:
  * Systems no longer are comprised of loose functions, instead they now need to extend the `BaseSystem` class.
  * Systems Handlers should now be added to the `SystemManager.#systemHandlers` array in `scripts/systems/SystemManager.mjs` file.
  * Created new class ItemMacro which extends Foundry's Macro class, ensuring proper and consistend Item Macro execution regardless of context.
  * Allowed Item Macros to be of `chat` type.
* Updated template for ItemMacroConfig
  * Fixed `Type` dropdown and `Execute Macro` button.
* Restored all settings for all systems to avoid future issues with 3rd party modules crashing due to non-existing settings
* Added setting override framework to System Handlers
  * Hidden `click` and `charsheet` and renamed `defaultmacro` for DND5e system
* Fixed Macro Hotbar Drop for Simple World-Building system ([#13](https://github.com/Foundry-Workshop/Item-Macro/issues/13))

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