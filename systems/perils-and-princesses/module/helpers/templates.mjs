/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/perils-and-princesses/templates/actor/parts/actor-features.hbs',
    'systems/perils-and-princesses/templates/actor/parts/actor-items.hbs',
    'systems/perils-and-princesses/templates/actor/parts/actor-gift.hbs',
    'systems/perils-and-princesses/templates/actor/parts/actor-effects.hbs',
    'systems/perils-and-princesses/templates/actor/parts/actor-weapons.hbs',
    // Item partials
    'systems/perils-and-princesses/templates/item/parts/item-effects.hbs',
  ]);
};
