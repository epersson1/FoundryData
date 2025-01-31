// GET MODULE FUNCTIONS
import { MODULE } from '../_module.mjs';

;(function (window) {
	if (Object.keys(Element.prototype).some(keys => ['onEventListener', 'offEventListener', 'onceEventListener'].includes(keys))) {
		console.error('Element has defined Prototype, Event Delegation Well not work');
		return false;
	}
	if (Object.keys(NodeList.prototype).some(keys => ['onEventListener', 'offEventListener', 'onceEventListener'].includes(keys))) {
		console.error('NodeList has defined Prototype, Event Delegation Well not work');
		return false;
	}

	const storedEvents = new Map();

	const getIndex = (array, selector, callback) => {
		return array.find(value => value.selector === selector && value.callback.toString() === callback.toString()) ?? -1
	} 

	const shouldEventExec = (target, selector) => {
		if (['*', 'window', 'document', 'document.documentElement', window, document, document.documentElement].includes(selector)) return true;
		if (typeof selector !== 'string' && selector.contains) return selector === target || selector.contains(target);
		return target.closest(selector);
	}
	
	const handleEvent = (event) => {
		if (!(storedEvents.has(event.type))) return;
		storedEvents.get(event.type)
			.filter(obj => shouldEventExec(event.target, obj.selector))
			.forEach(obj => obj.callback(event))
	}

	Element.prototype.onEventListener = function(types, selector, callback) {
		const element = this;

		if (!types || !callback) return;

		types.split(',').forEach(type => {
			type = type.trim();

			storedEvents.set(type, [...(storedEvents.get(type) ?? []), {
				element: element,
				selector: selector,
				callback: callback
			}]);

			this.addEventListener(type.split('.')[0], handleEvent, true);
		});
	}

	Element.prototype.offEventListener = function(types, selector, callback) {
		const element = this;

		if (!types) return;

		types.split(',').forEach(type => {
			type = type.trim();

			if (!(storedEvents.has(type))) return;

			if (storedEvents.get(type).length == 1 || !selector) {
				storedEvents.delete(type);
				window.removeEventListener(type, handleEvent, true);
				return;
			}

			const eventIndex = getIndex(storedEvents.get(type), selector, callback);
			if (eventIndex < 0) return;

			storedEvents.set(type, storedEvents.get(type).slice(eventIndex, 1));
		});
	}

	Element.prototype.onceEventListener = function(types, selector, callback) {
		const element = this;
		element.onEventListener(types, selector, (function temporary(event) {
			callback(event);
			element.offEventListener(types, selector, temporary);
		}))
	}

	NodeList.prototype.onEventListener = function(types, selector, callback) {
		Array.from(this).forEach(element => element.onEventListener(types, selector, callback));
	}

	NodeList.prototype.offEventListener = function(types, selector, callback) {
		Array.from(this).forEach(element => element.offEventListener(types, selector, callback));
	}

	NodeList.prototype.onceEventListener = function(types, selector, callback) {
		Array.from(this).forEach(element => element.onceEventListener(types, selector, callback));
	}
})();