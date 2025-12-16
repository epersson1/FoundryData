var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const CONSTANTS = {
  MODULE_ID: "pointer",
  PATH: `modules/pointer/`,
  FLAGS: {
    SETTINGS: "settings"
  }
};
CONSTANTS.PATH = `modules/${CONSTANTS.MODULE_ID}/`;
const _Logger = class _Logger {
  static get DEBUG() {
    return game.settings.get(CONSTANTS.MODULE_ID, "debug") || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(CONSTANTS.MODULE_ID, "boolean");
  }
  // export let debugEnabled = 0;
  // 0 = none, warnings = 1, debug = 2, all = 3
  static debug(msg, ...args) {
    try {
      if (game.settings.get(CONSTANTS.MODULE_ID, "debug") || game.modules.get("_dev-mode")?.api?.getPackageDebugValue(CONSTANTS.MODULE_ID, "boolean")) {
        console.log(`DEBUG | ${CONSTANTS.MODULE_ID} | ${msg}`, ...args);
      }
    } catch (e) {
      console.error(e.message);
    }
    return msg;
  }
  static logObject(...args) {
    return this.log("", args);
  }
  static log(message, ...args) {
    try {
      message = `${CONSTANTS.MODULE_ID} | ${message}`;
      console.log(message.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return message;
  }
  static notify(message, ...args) {
    try {
      message = `${CONSTANTS.MODULE_ID} | ${message}`;
      ui.notifications?.notify(message);
      console.log(message.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return message;
  }
  static info(info, notify = false, ...args) {
    try {
      info = `${CONSTANTS.MODULE_ID} | ${info}`;
      if (notify) {
        ui.notifications?.info(info);
      }
      console.log(info.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return info;
  }
  static warn(warning, notify = false, ...args) {
    try {
      warning = `${CONSTANTS.MODULE_ID} | ${warning}`;
      if (notify) {
        ui.notifications?.warn(warning);
      }
      console.warn(warning.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return warning;
  }
  static errorObject(...args) {
    return this.error("", false, args);
  }
  static error(error, notify = true, ...args) {
    try {
      error = `${CONSTANTS.MODULE_ID} | ${error}`;
      if (notify) {
        ui.notifications?.error(error);
      }
      console.error(error.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return new Error(error.replace("<br>", "\n"));
  }
  static errorPermanent(error, notify = true, ...args) {
    try {
      error = `${CONSTANTS.MODULE_ID} | ${error}`;
      if (notify) {
        ui.notifications?.error(error, {
          permanent: true
        });
      }
      console.error(error.replace("<br>", "\n"), ...args);
    } catch (e) {
      console.error(e.message);
    }
    return new Error(error.replace("<br>", "\n"));
  }
  static timelog(message) {
    this.warn(Date.now(), message);
  }
  // setDebugLevel = (debugText): void => {
  //   debugEnabled = { none: 0, warn: 1, debug: 2, all: 3 }[debugText] || 0;
  //   // 0 = none, warnings = 1, debug = 2, all = 3
  //   if (debugEnabled >= 3) CONFIG.debug.hooks = true;
  // };
  static dialogWarning(message, icon = "fas fa-exclamation-triangle") {
    return `<p class="${CONSTANTS.MODULE_ID}-dialog">
        <i style="font-size:3rem;" class="${icon}"></i><br><br>
        <strong style="font-size:1.2rem;">${CONSTANTS.MODULE_ID}</strong>
        <br><br>${message}
    </p>`;
  }
};
__name(_Logger, "Logger");
__publicField(_Logger, "i18n", (key) => {
  return game.i18n.localize(key)?.trim();
});
__publicField(_Logger, "i18nFormat", (key, data = {}) => {
  return game.i18n.format(key, data)?.trim();
});
let Logger = _Logger;
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
__name(_assertThisInitialized, "_assertThisInitialized");
function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}
__name(_inheritsLoose, "_inheritsLoose");
/*!
 * GSAP 3.13.0
 * https://gsap.com
 *
 * @license Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var _config = {
  autoSleep: 120,
  force3D: "auto",
  nullTargetWarn: 1,
  units: {
    lineHeight: ""
  }
}, _defaults = {
  duration: 0.5,
  overwrite: false,
  delay: 0
}, _suppressOverwrites, _reverting$1, _context, _bigNum$1 = 1e8, _tinyNum = 1 / _bigNum$1, _2PI = Math.PI * 2, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt = Math.sqrt, _cos = Math.cos, _sin = Math.sin, _isString = /* @__PURE__ */ __name(function _isString2(value) {
  return typeof value === "string";
}, "_isString"), _isFunction = /* @__PURE__ */ __name(function _isFunction2(value) {
  return typeof value === "function";
}, "_isFunction"), _isNumber = /* @__PURE__ */ __name(function _isNumber2(value) {
  return typeof value === "number";
}, "_isNumber"), _isUndefined = /* @__PURE__ */ __name(function _isUndefined2(value) {
  return typeof value === "undefined";
}, "_isUndefined"), _isObject = /* @__PURE__ */ __name(function _isObject2(value) {
  return typeof value === "object";
}, "_isObject"), _isNotFalse = /* @__PURE__ */ __name(function _isNotFalse2(value) {
  return value !== false;
}, "_isNotFalse"), _windowExists$1 = /* @__PURE__ */ __name(function _windowExists() {
  return typeof window !== "undefined";
}, "_windowExists"), _isFuncOrString = /* @__PURE__ */ __name(function _isFuncOrString2(value) {
  return _isFunction(value) || _isString(value);
}, "_isFuncOrString"), _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function() {
}, _isArray = Array.isArray, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, _globalTimeline, _win$1, _coreInitted, _doc$1, _globals = {}, _installScope = {}, _coreReady, _install = /* @__PURE__ */ __name(function _install2(scope) {
  return (_installScope = _merge(scope, _globals)) && gsap;
}, "_install"), _missingPlugin = /* @__PURE__ */ __name(function _missingPlugin2(property, value) {
  return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
}, "_missingPlugin"), _warn = /* @__PURE__ */ __name(function _warn2(message, suppress) {
  return !suppress && console.warn(message);
}, "_warn"), _addGlobal = /* @__PURE__ */ __name(function _addGlobal2(name, obj) {
  return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
}, "_addGlobal"), _emptyFunc = /* @__PURE__ */ __name(function _emptyFunc2() {
  return 0;
}, "_emptyFunc"), _startAtRevertConfig = {
  suppressEvents: true,
  isStart: true,
  kill: false
}, _revertConfigNoKill = {
  suppressEvents: true,
  kill: false
}, _revertConfig = {
  suppressEvents: true
}, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _lastRenderedFrame, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = /* @__PURE__ */ __name(function _harness2(targets) {
  var target = targets[0], harnessPlugin, i;
  _isObject(target) || _isFunction(target) || (targets = [targets]);
  if (!(harnessPlugin = (target._gsap || {}).harness)) {
    i = _harnessPlugins.length;
    while (i-- && !_harnessPlugins[i].targetTest(target)) {
    }
    harnessPlugin = _harnessPlugins[i];
  }
  i = targets.length;
  while (i--) {
    targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
  }
  return targets;
}, "_harness"), _getCache = /* @__PURE__ */ __name(function _getCache2(target) {
  return target._gsap || _harness(toArray(target))[0]._gsap;
}, "_getCache"), _getProperty = /* @__PURE__ */ __name(function _getProperty2(target, property, v) {
  return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
}, "_getProperty"), _forEachName = /* @__PURE__ */ __name(function _forEachName2(names, func) {
  return (names = names.split(",")).forEach(func) || names;
}, "_forEachName"), _round = /* @__PURE__ */ __name(function _round2(value) {
  return Math.round(value * 1e5) / 1e5 || 0;
}, "_round"), _roundPrecise = /* @__PURE__ */ __name(function _roundPrecise2(value) {
  return Math.round(value * 1e7) / 1e7 || 0;
}, "_roundPrecise"), _parseRelative = /* @__PURE__ */ __name(function _parseRelative2(start, value) {
  var operator = value.charAt(0), end = parseFloat(value.substr(2));
  start = parseFloat(start);
  return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
}, "_parseRelative"), _arrayContainsAny = /* @__PURE__ */ __name(function _arrayContainsAny2(toSearch, toFind) {
  var l = toFind.length, i = 0;
  for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) {
  }
  return i < l;
}, "_arrayContainsAny"), _lazyRender = /* @__PURE__ */ __name(function _lazyRender2() {
  var l = _lazyTweens.length, a = _lazyTweens.slice(0), i, tween;
  _lazyLookup = {};
  _lazyTweens.length = 0;
  for (i = 0; i < l; i++) {
    tween = a[i];
    tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
  }
}, "_lazyRender"), _isRevertWorthy = /* @__PURE__ */ __name(function _isRevertWorthy2(animation) {
  return !!(animation._initted || animation._startAt || animation.add);
}, "_isRevertWorthy"), _lazySafeRender = /* @__PURE__ */ __name(function _lazySafeRender2(animation, time, suppressEvents, force) {
  _lazyTweens.length && !_reverting$1 && _lazyRender();
  animation.render(time, suppressEvents, force || !!(_reverting$1 && time < 0 && _isRevertWorthy(animation)));
  _lazyTweens.length && !_reverting$1 && _lazyRender();
}, "_lazySafeRender"), _numericIfPossible = /* @__PURE__ */ __name(function _numericIfPossible2(value) {
  var n = parseFloat(value);
  return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
}, "_numericIfPossible"), _passThrough = /* @__PURE__ */ __name(function _passThrough2(p) {
  return p;
}, "_passThrough"), _setDefaults = /* @__PURE__ */ __name(function _setDefaults2(obj, defaults2) {
  for (var p in defaults2) {
    p in obj || (obj[p] = defaults2[p]);
  }
  return obj;
}, "_setDefaults"), _setKeyframeDefaults = /* @__PURE__ */ __name(function _setKeyframeDefaults2(excludeDuration) {
  return function(obj, defaults2) {
    for (var p in defaults2) {
      p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults2[p]);
    }
  };
}, "_setKeyframeDefaults"), _merge = /* @__PURE__ */ __name(function _merge2(base, toMerge) {
  for (var p in toMerge) {
    base[p] = toMerge[p];
  }
  return base;
}, "_merge"), _mergeDeep = /* @__PURE__ */ __name(function _mergeDeep2(base, toMerge) {
  for (var p in toMerge) {
    p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject(toMerge[p]) ? _mergeDeep2(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
  }
  return base;
}, "_mergeDeep"), _copyExcluding = /* @__PURE__ */ __name(function _copyExcluding2(obj, excluding) {
  var copy = {}, p;
  for (p in obj) {
    p in excluding || (copy[p] = obj[p]);
  }
  return copy;
}, "_copyExcluding"), _inheritDefaults = /* @__PURE__ */ __name(function _inheritDefaults2(vars) {
  var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
  if (_isNotFalse(vars.inherit)) {
    while (parent) {
      func(vars, parent.vars.defaults);
      parent = parent.parent || parent._dp;
    }
  }
  return vars;
}, "_inheritDefaults"), _arraysMatch = /* @__PURE__ */ __name(function _arraysMatch2(a1, a2) {
  var i = a1.length, match = i === a2.length;
  while (match && i-- && a1[i] === a2[i]) {
  }
  return i < 0;
}, "_arraysMatch"), _addLinkedListItem = /* @__PURE__ */ __name(function _addLinkedListItem2(parent, child, firstProp, lastProp, sortBy) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }
  if (lastProp === void 0) {
    lastProp = "_last";
  }
  var prev = parent[lastProp], t;
  if (sortBy) {
    t = child[sortBy];
    while (prev && prev[sortBy] > t) {
      prev = prev._prev;
    }
  }
  if (prev) {
    child._next = prev._next;
    prev._next = child;
  } else {
    child._next = parent[firstProp];
    parent[firstProp] = child;
  }
  if (child._next) {
    child._next._prev = child;
  } else {
    parent[lastProp] = child;
  }
  child._prev = prev;
  child.parent = child._dp = parent;
  return child;
}, "_addLinkedListItem"), _removeLinkedListItem = /* @__PURE__ */ __name(function _removeLinkedListItem2(parent, child, firstProp, lastProp) {
  if (firstProp === void 0) {
    firstProp = "_first";
  }
  if (lastProp === void 0) {
    lastProp = "_last";
  }
  var prev = child._prev, next = child._next;
  if (prev) {
    prev._next = next;
  } else if (parent[firstProp] === child) {
    parent[firstProp] = next;
  }
  if (next) {
    next._prev = prev;
  } else if (parent[lastProp] === child) {
    parent[lastProp] = prev;
  }
  child._next = child._prev = child.parent = null;
}, "_removeLinkedListItem"), _removeFromParent = /* @__PURE__ */ __name(function _removeFromParent2(child, onlyIfParentHasAutoRemove) {
  child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove && child.parent.remove(child);
  child._act = 0;
}, "_removeFromParent"), _uncache = /* @__PURE__ */ __name(function _uncache2(animation, child) {
  if (animation && (!child || child._end > animation._dur || child._start < 0)) {
    var a = animation;
    while (a) {
      a._dirty = 1;
      a = a.parent;
    }
  }
  return animation;
}, "_uncache"), _recacheAncestors = /* @__PURE__ */ __name(function _recacheAncestors2(animation) {
  var parent = animation.parent;
  while (parent && parent.parent) {
    parent._dirty = 1;
    parent.totalDuration();
    parent = parent.parent;
  }
  return animation;
}, "_recacheAncestors"), _rewindStartAt = /* @__PURE__ */ __name(function _rewindStartAt2(tween, totalTime, suppressEvents, force) {
  return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
}, "_rewindStartAt"), _hasNoPausedAncestors = /* @__PURE__ */ __name(function _hasNoPausedAncestors2(animation) {
  return !animation || animation._ts && _hasNoPausedAncestors2(animation.parent);
}, "_hasNoPausedAncestors"), _elapsedCycleDuration = /* @__PURE__ */ __name(function _elapsedCycleDuration2(animation) {
  return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
}, "_elapsedCycleDuration"), _animationCycle = /* @__PURE__ */ __name(function _animationCycle2(tTime, cycleDuration) {
  var whole = Math.floor(tTime = _roundPrecise(tTime / cycleDuration));
  return tTime && whole === tTime ? whole - 1 : whole;
}, "_animationCycle"), _parentToChildTotalTime = /* @__PURE__ */ __name(function _parentToChildTotalTime2(parentTime, child) {
  return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
}, "_parentToChildTotalTime"), _setEnd = /* @__PURE__ */ __name(function _setEnd2(animation) {
  return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
}, "_setEnd"), _alignPlayhead = /* @__PURE__ */ __name(function _alignPlayhead2(animation, totalTime) {
  var parent = animation._dp;
  if (parent && parent.smoothChildTiming && animation._ts) {
    animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
    _setEnd(animation);
    parent._dirty || _uncache(parent, animation);
  }
  return animation;
}, "_alignPlayhead"), _postAddChecks = /* @__PURE__ */ __name(function _postAddChecks2(timeline2, child) {
  var t;
  if (child._time || !child._dur && child._initted || child._start < timeline2._time && (child._dur || !child.add)) {
    t = _parentToChildTotalTime(timeline2.rawTime(), child);
    if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
      child.render(t, true);
    }
  }
  if (_uncache(timeline2, child)._dp && timeline2._initted && timeline2._time >= timeline2._dur && timeline2._ts) {
    if (timeline2._dur < timeline2.duration()) {
      t = timeline2;
      while (t._dp) {
        t.rawTime() >= 0 && t.totalTime(t._tTime);
        t = t._dp;
      }
    }
    timeline2._zTime = -_tinyNum;
  }
}, "_postAddChecks"), _addToTimeline = /* @__PURE__ */ __name(function _addToTimeline2(timeline2, child, position, skipChecks) {
  child.parent && _removeFromParent(child);
  child._start = _roundPrecise((_isNumber(position) ? position : position || timeline2 !== _globalTimeline ? _parsePosition(timeline2, position, child) : timeline2._time) + child._delay);
  child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
  _addLinkedListItem(timeline2, child, "_first", "_last", timeline2._sort ? "_start" : 0);
  _isFromOrFromStart(child) || (timeline2._recent = child);
  skipChecks || _postAddChecks(timeline2, child);
  timeline2._ts < 0 && _alignPlayhead(timeline2, timeline2._tTime);
  return timeline2;
}, "_addToTimeline"), _scrollTrigger = /* @__PURE__ */ __name(function _scrollTrigger2(animation, trigger) {
  return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
}, "_scrollTrigger"), _attemptInitTween = /* @__PURE__ */ __name(function _attemptInitTween2(tween, time, force, suppressEvents, tTime) {
  _initTween(tween, time, tTime);
  if (!tween._initted) {
    return 1;
  }
  if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
    _lazyTweens.push(tween);
    tween._lazy = [tTime, suppressEvents];
    return 1;
  }
}, "_attemptInitTween"), _parentPlayheadIsBeforeStart = /* @__PURE__ */ __name(function _parentPlayheadIsBeforeStart2(_ref) {
  var parent = _ref.parent;
  return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart2(parent));
}, "_parentPlayheadIsBeforeStart"), _isFromOrFromStart = /* @__PURE__ */ __name(function _isFromOrFromStart2(_ref2) {
  var data = _ref2.data;
  return data === "isFromStart" || data === "isStart";
}, "_isFromOrFromStart"), _renderZeroDurationTween = /* @__PURE__ */ __name(function _renderZeroDurationTween2(tween, totalTime, suppressEvents, force) {
  var prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0, pt, iteration, prevIteration;
  if (repeatDelay && tween._repeat) {
    tTime = _clamp(0, tween._tDur, totalTime);
    iteration = _animationCycle(tTime, repeatDelay);
    tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
    if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
      prevRatio = 1 - ratio;
      tween.vars.repeatRefresh && tween._initted && tween.invalidate();
    }
  }
  if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
    if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
      return;
    }
    prevIteration = tween._zTime;
    tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
    suppressEvents || (suppressEvents = totalTime && !prevIteration);
    tween.ratio = ratio;
    tween._from && (ratio = 1 - ratio);
    tween._time = 0;
    tween._tTime = tTime;
    pt = tween._pt;
    while (pt) {
      pt.r(ratio, pt.d);
      pt = pt._next;
    }
    totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
    tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
    tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
    if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
      ratio && _removeFromParent(tween, 1);
      if (!suppressEvents && !_reverting$1) {
        _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
        tween._prom && tween._prom();
      }
    }
  } else if (!tween._zTime) {
    tween._zTime = totalTime;
  }
}, "_renderZeroDurationTween"), _findNextPauseTween = /* @__PURE__ */ __name(function _findNextPauseTween2(animation, prevTime, time) {
  var child;
  if (time > prevTime) {
    child = animation._first;
    while (child && child._start <= time) {
      if (child.data === "isPause" && child._start > prevTime) {
        return child;
      }
      child = child._next;
    }
  } else {
    child = animation._last;
    while (child && child._start >= time) {
      if (child.data === "isPause" && child._start < prevTime) {
        return child;
      }
      child = child._prev;
    }
  }
}, "_findNextPauseTween"), _setDuration = /* @__PURE__ */ __name(function _setDuration2(animation, duration, skipUncache, leavePlayhead) {
  var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
  totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
  animation._dur = dur;
  animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
  totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
  animation.parent && _setEnd(animation);
  skipUncache || _uncache(animation.parent, animation);
  return animation;
}, "_setDuration"), _onUpdateTotalDuration = /* @__PURE__ */ __name(function _onUpdateTotalDuration2(animation) {
  return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
}, "_onUpdateTotalDuration"), _zeroPosition = {
  _start: 0,
  endTime: _emptyFunc,
  totalDuration: _emptyFunc
}, _parsePosition = /* @__PURE__ */ __name(function _parsePosition2(animation, position, percentAnimation) {
  var labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur, i, offset, isPercent;
  if (_isString(position) && (isNaN(position) || position in labels)) {
    offset = position.charAt(0);
    isPercent = position.substr(-1) === "%";
    i = position.indexOf("=");
    if (offset === "<" || offset === ">") {
      i >= 0 && (position = position.replace(/=/, ""));
      return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
    }
    if (i < 0) {
      position in labels || (labels[position] = clippedDuration);
      return labels[position];
    }
    offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
    if (isPercent && percentAnimation) {
      offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
    }
    return i > 1 ? _parsePosition2(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
  }
  return position == null ? clippedDuration : +position;
}, "_parsePosition"), _createTweenType = /* @__PURE__ */ __name(function _createTweenType2(type, params, timeline2) {
  var isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex], irVars, parent;
  isLegacy && (vars.duration = params[1]);
  vars.parent = timeline2;
  if (type) {
    irVars = vars;
    parent = timeline2;
    while (parent && !("immediateRender" in irVars)) {
      irVars = parent.vars.defaults || {};
      parent = _isNotFalse(parent.vars.inherit) && parent.parent;
    }
    vars.immediateRender = _isNotFalse(irVars.immediateRender);
    type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
  }
  return new Tween(params[0], vars, params[varsIndex + 1]);
}, "_createTweenType"), _conditionalReturn = /* @__PURE__ */ __name(function _conditionalReturn2(value, func) {
  return value || value === 0 ? func(value) : func;
}, "_conditionalReturn"), _clamp = /* @__PURE__ */ __name(function _clamp2(min, max, value) {
  return value < min ? min : value > max ? max : value;
}, "_clamp"), getUnit = /* @__PURE__ */ __name(function getUnit2(value, v) {
  return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
}, "getUnit"), clamp = /* @__PURE__ */ __name(function clamp2(min, max, value) {
  return _conditionalReturn(value, function(v) {
    return _clamp(min, max, v);
  });
}, "clamp"), _slice = [].slice, _isArrayLike = /* @__PURE__ */ __name(function _isArrayLike2(value, nonEmpty) {
  return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win$1;
}, "_isArrayLike"), _flatten = /* @__PURE__ */ __name(function _flatten2(ar, leaveStrings, accumulator) {
  if (accumulator === void 0) {
    accumulator = [];
  }
  return ar.forEach(function(value) {
    var _accumulator;
    return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
  }) || accumulator;
}, "_flatten"), toArray = /* @__PURE__ */ __name(function toArray2(value, scope, leaveStrings) {
  return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc$1).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
}, "toArray"), selector = /* @__PURE__ */ __name(function selector2(value) {
  value = toArray(value)[0] || _warn("Invalid scope") || {};
  return function(v) {
    var el = value.current || value.nativeElement || value;
    return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$1.createElement("div") : value);
  };
}, "selector"), shuffle = /* @__PURE__ */ __name(function shuffle2(a) {
  return a.sort(function() {
    return 0.5 - Math.random();
  });
}, "shuffle"), distribute = /* @__PURE__ */ __name(function distribute2(v) {
  if (_isFunction(v)) {
    return v;
  }
  var vars = _isObject(v) ? v : {
    each: v
  }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
  if (_isString(from)) {
    ratioX = ratioY = {
      center: 0.5,
      edges: 0.5,
      end: 1
    }[from] || 0;
  } else if (!isDecimal && ratios) {
    ratioX = from[0];
    ratioY = from[1];
  }
  return function(i, target, a) {
    var l = (a || vars).length, distances = cache[l], originX, originY, x, y, d, j, max, min, wrapAt;
    if (!distances) {
      wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];
      if (!wrapAt) {
        max = -_bigNum$1;
        while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {
        }
        wrapAt < l && wrapAt--;
      }
      distances = cache[l] = [];
      originX = ratios ? Math.min(wrapAt, l) * ratioX - 0.5 : from % wrapAt;
      originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - 0.5 : from / wrapAt | 0;
      max = 0;
      min = _bigNum$1;
      for (j = 0; j < l; j++) {
        x = j % wrapAt - originX;
        y = originY - (j / wrapAt | 0);
        distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
        d > max && (max = d);
        d < min && (min = d);
      }
      from === "random" && shuffle(distances);
      distances.max = max - min;
      distances.min = min;
      distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
      distances.b = l < 0 ? base - l : base;
      distances.u = getUnit(vars.amount || vars.each) || 0;
      ease = ease && l < 0 ? _invertEase(ease) : ease;
    }
    l = (distances[i] - distances.min) / distances.max || 0;
    return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
  };
}, "distribute"), _roundModifier = /* @__PURE__ */ __name(function _roundModifier2(v) {
  var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
  return function(raw) {
    var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
    return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
  };
}, "_roundModifier"), snap = /* @__PURE__ */ __name(function snap2(snapTo, value) {
  var isArray = _isArray(snapTo), radius, is2D;
  if (!isArray && _isObject(snapTo)) {
    radius = isArray = snapTo.radius || _bigNum$1;
    if (snapTo.values) {
      snapTo = toArray(snapTo.values);
      if (is2D = !_isNumber(snapTo[0])) {
        radius *= radius;
      }
    } else {
      snapTo = _roundModifier(snapTo.increment);
    }
  }
  return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
    is2D = snapTo(raw);
    return Math.abs(is2D - raw) <= radius ? is2D : raw;
  } : function(raw) {
    var x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum$1, closest = 0, i = snapTo.length, dx, dy;
    while (i--) {
      if (is2D) {
        dx = snapTo[i].x - x;
        dy = snapTo[i].y - y;
        dx = dx * dx + dy * dy;
      } else {
        dx = Math.abs(snapTo[i] - x);
      }
      if (dx < min) {
        min = dx;
        closest = i;
      }
    }
    closest = !radius || min <= radius ? snapTo[closest] : raw;
    return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
  });
}, "snap"), random = /* @__PURE__ */ __name(function random2(min, max, roundingIncrement, returnFunction) {
  return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function() {
    return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * 0.99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
  });
}, "random"), pipe = /* @__PURE__ */ __name(function pipe2() {
  for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
    functions[_key] = arguments[_key];
  }
  return function(value) {
    return functions.reduce(function(v, f) {
      return f(v);
    }, value);
  };
}, "pipe"), unitize = /* @__PURE__ */ __name(function unitize2(func, unit) {
  return function(value) {
    return func(parseFloat(value)) + (unit || getUnit(value));
  };
}, "unitize"), normalize = /* @__PURE__ */ __name(function normalize2(min, max, value) {
  return mapRange(min, max, 0, 1, value);
}, "normalize"), _wrapArray = /* @__PURE__ */ __name(function _wrapArray2(a, wrapper, value) {
  return _conditionalReturn(value, function(index) {
    return a[~~wrapper(index)];
  });
}, "_wrapArray"), wrap = /* @__PURE__ */ __name(function wrap2(min, max, value) {
  var range = max - min;
  return _isArray(min) ? _wrapArray(min, wrap2(0, min.length), max) : _conditionalReturn(value, function(value2) {
    return (range + (value2 - min) % range) % range + min;
  });
}, "wrap"), wrapYoyo = /* @__PURE__ */ __name(function wrapYoyo2(min, max, value) {
  var range = max - min, total = range * 2;
  return _isArray(min) ? _wrapArray(min, wrapYoyo2(0, min.length - 1), max) : _conditionalReturn(value, function(value2) {
    value2 = (total + (value2 - min) % total) % total || 0;
    return min + (value2 > range ? total - value2 : value2);
  });
}, "wrapYoyo"), _replaceRandom = /* @__PURE__ */ __name(function _replaceRandom2(value) {
  var prev = 0, s = "", i, nums, end, isArray;
  while (~(i = value.indexOf("random(", prev))) {
    end = value.indexOf(")", i);
    isArray = value.charAt(i + 7) === "[";
    nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
    s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
    prev = end + 1;
  }
  return s + value.substr(prev, value.length - prev);
}, "_replaceRandom"), mapRange = /* @__PURE__ */ __name(function mapRange2(inMin, inMax, outMin, outMax, value) {
  var inRange = inMax - inMin, outRange = outMax - outMin;
  return _conditionalReturn(value, function(value2) {
    return outMin + ((value2 - inMin) / inRange * outRange || 0);
  });
}, "mapRange"), interpolate = /* @__PURE__ */ __name(function interpolate2(start, end, progress, mutate) {
  var func = isNaN(start + end) ? 0 : function(p2) {
    return (1 - p2) * start + p2 * end;
  };
  if (!func) {
    var isString = _isString(start), master = {}, p, i, interpolators, l, il;
    progress === true && (mutate = 1) && (progress = null);
    if (isString) {
      start = {
        p: start
      };
      end = {
        p: end
      };
    } else if (_isArray(start) && !_isArray(end)) {
      interpolators = [];
      l = start.length;
      il = l - 2;
      for (i = 1; i < l; i++) {
        interpolators.push(interpolate2(start[i - 1], start[i]));
      }
      l--;
      func = /* @__PURE__ */ __name(function func2(p2) {
        p2 *= l;
        var i2 = Math.min(il, ~~p2);
        return interpolators[i2](p2 - i2);
      }, "func");
      progress = end;
    } else if (!mutate) {
      start = _merge(_isArray(start) ? [] : {}, start);
    }
    if (!interpolators) {
      for (p in end) {
        _addPropTween.call(master, start, p, "get", end[p]);
      }
      func = /* @__PURE__ */ __name(function func2(p2) {
        return _renderPropTweens(p2, master) || (isString ? start.p : start);
      }, "func");
    }
  }
  return _conditionalReturn(progress, func);
}, "interpolate"), _getLabelInDirection = /* @__PURE__ */ __name(function _getLabelInDirection2(timeline2, fromTime, backward) {
  var labels = timeline2.labels, min = _bigNum$1, p, distance, label;
  for (p in labels) {
    distance = labels[p] - fromTime;
    if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
      label = p;
      min = distance;
    }
  }
  return label;
}, "_getLabelInDirection"), _callback = /* @__PURE__ */ __name(function _callback2(animation, type, executeLazyFirst) {
  var v = animation.vars, callback = v[type], prevContext = _context, context3 = animation._ctx, params, scope, result;
  if (!callback) {
    return;
  }
  params = v[type + "Params"];
  scope = v.callbackScope || animation;
  executeLazyFirst && _lazyTweens.length && _lazyRender();
  context3 && (_context = context3);
  result = params ? callback.apply(scope, params) : callback.call(scope);
  _context = prevContext;
  return result;
}, "_callback"), _interrupt = /* @__PURE__ */ __name(function _interrupt2(animation) {
  _removeFromParent(animation);
  animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
  animation.progress() < 1 && _callback(animation, "onInterrupt");
  return animation;
}, "_interrupt"), _quickTween, _registerPluginQueue = [], _createPlugin = /* @__PURE__ */ __name(function _createPlugin2(config3) {
  if (!config3)
    return;
  config3 = !config3.name && config3["default"] || config3;
  if (_windowExists$1() || config3.headless) {
    var name = config3.name, isFunc = _isFunction(config3), Plugin = name && !isFunc && config3.init ? function() {
      this._props = [];
    } : config3, instanceDefaults = {
      init: _emptyFunc,
      render: _renderPropTweens,
      add: _addPropTween,
      kill: _killPropTweensOf,
      modifier: _addPluginModifier,
      rawVars: 0
    }, statics = {
      targetTest: 0,
      get: 0,
      getSetter: _getSetter,
      aliases: {},
      register: 0
    };
    _wake();
    if (config3 !== Plugin) {
      if (_plugins[name]) {
        return;
      }
      _setDefaults(Plugin, _setDefaults(_copyExcluding(config3, instanceDefaults), statics));
      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config3, statics)));
      _plugins[Plugin.prop = name] = Plugin;
      if (config3.targetTest) {
        _harnessPlugins.push(Plugin);
        _reservedProps[name] = 1;
      }
      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
    }
    _addGlobal(name, Plugin);
    config3.register && config3.register(gsap, Plugin, PropTween);
  } else {
    _registerPluginQueue.push(config3);
  }
}, "_createPlugin"), _255 = 255, _colorLookup = {
  aqua: [0, _255, _255],
  lime: [0, _255, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, _255],
  navy: [0, 0, 128],
  white: [_255, _255, _255],
  olive: [128, 128, 0],
  yellow: [_255, _255, 0],
  orange: [_255, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [_255, 0, 0],
  pink: [_255, 192, 203],
  cyan: [0, _255, _255],
  transparent: [_255, _255, _255, 0]
}, _hue = /* @__PURE__ */ __name(function _hue2(h, m1, m2) {
  h += h < 0 ? 1 : h > 1 ? -1 : 0;
  return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < 0.5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + 0.5 | 0;
}, "_hue"), splitColor = /* @__PURE__ */ __name(function splitColor2(v, toHSL, forceAlpha) {
  var a = !v ? _colorLookup.black : _isNumber(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0, r, g, b, h, s, l, max, min, d, wasHSL;
  if (!a) {
    if (v.substr(-1) === ",") {
      v = v.substr(0, v.length - 1);
    }
    if (_colorLookup[v]) {
      a = _colorLookup[v];
    } else if (v.charAt(0) === "#") {
      if (v.length < 6) {
        r = v.charAt(1);
        g = v.charAt(2);
        b = v.charAt(3);
        v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
      }
      if (v.length === 9) {
        a = parseInt(v.substr(1, 6), 16);
        return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
      }
      v = parseInt(v.substr(1), 16);
      a = [v >> 16, v >> 8 & _255, v & _255];
    } else if (v.substr(0, 3) === "hsl") {
      a = wasHSL = v.match(_strictNumExp);
      if (!toHSL) {
        h = +a[0] % 360 / 360;
        s = +a[1] / 100;
        l = +a[2] / 100;
        g = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        r = l * 2 - g;
        a.length > 3 && (a[3] *= 1);
        a[0] = _hue(h + 1 / 3, r, g);
        a[1] = _hue(h, r, g);
        a[2] = _hue(h - 1 / 3, r, g);
      } else if (~v.indexOf("=")) {
        a = v.match(_numExp);
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
      }
    } else {
      a = v.match(_strictNumExp) || _colorLookup.transparent;
    }
    a = a.map(Number);
  }
  if (toHSL && !wasHSL) {
    r = a[0] / _255;
    g = a[1] / _255;
    b = a[2] / _255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    a[0] = ~~(h + 0.5);
    a[1] = ~~(s * 100 + 0.5);
    a[2] = ~~(l * 100 + 0.5);
  }
  forceAlpha && a.length < 4 && (a[3] = 1);
  return a;
}, "splitColor"), _colorOrderData = /* @__PURE__ */ __name(function _colorOrderData2(v) {
  var values = [], c = [], i = -1;
  v.split(_colorExp).forEach(function(v2) {
    var a = v2.match(_numWithUnitExp) || [];
    values.push.apply(values, a);
    c.push(i += a.length + 1);
  });
  values.c = c;
  return values;
}, "_colorOrderData"), _formatColors = /* @__PURE__ */ __name(function _formatColors2(s, toHSL, orderMatchData) {
  var result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0, c, shell, d, l;
  if (!colors) {
    return s;
  }
  colors = colors.map(function(color) {
    return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
  });
  if (orderMatchData) {
    d = _colorOrderData(s);
    c = orderMatchData.c;
    if (c.join(result) !== d.c.join(result)) {
      shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
      l = shell.length - 1;
      for (; i < l; i++) {
        result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
      }
    }
  }
  if (!shell) {
    shell = s.split(_colorExp);
    l = shell.length - 1;
    for (; i < l; i++) {
      result += shell[i] + colors[i];
    }
  }
  return result + shell[l];
}, "_formatColors"), _colorExp = function() {
  var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", p;
  for (p in _colorLookup) {
    s += "|" + p + "\\b";
  }
  return new RegExp(s + ")", "gi");
}(), _hslExp = /hsl[a]?\(/, _colorStringFilter = /* @__PURE__ */ __name(function _colorStringFilter2(a) {
  var combined = a.join(" "), toHSL;
  _colorExp.lastIndex = 0;
  if (_colorExp.test(combined)) {
    toHSL = _hslExp.test(combined);
    a[1] = _formatColors(a[1], toHSL);
    a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
    return true;
  }
}, "_colorStringFilter"), _tickerActive, _ticker = function() {
  var _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners2 = [], _id, _req, _raf, _self, _delta, _i, _tick = /* @__PURE__ */ __name(function _tick2(v) {
    var elapsed = _getTime() - _lastUpdate, manual = v === true, overlap, dispatch, time, frame;
    (elapsed > _lagThreshold || elapsed < 0) && (_startTime += elapsed - _adjustedLag);
    _lastUpdate += elapsed;
    time = _lastUpdate - _startTime;
    overlap = time - _nextTime;
    if (overlap > 0 || manual) {
      frame = ++_self.frame;
      _delta = time - _self.time * 1e3;
      _self.time = time = time / 1e3;
      _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
      dispatch = 1;
    }
    manual || (_id = _req(_tick2));
    if (dispatch) {
      for (_i = 0; _i < _listeners2.length; _i++) {
        _listeners2[_i](time, _delta, frame, v);
      }
    }
  }, "_tick");
  _self = {
    time: 0,
    frame: 0,
    tick: /* @__PURE__ */ __name(function tick() {
      _tick(true);
    }, "tick"),
    deltaRatio: /* @__PURE__ */ __name(function deltaRatio(fps) {
      return _delta / (1e3 / (fps || 60));
    }, "deltaRatio"),
    wake: /* @__PURE__ */ __name(function wake() {
      if (_coreReady) {
        if (!_coreInitted && _windowExists$1()) {
          _win$1 = _coreInitted = window;
          _doc$1 = _win$1.document || {};
          _globals.gsap = gsap;
          (_win$1.gsapVersions || (_win$1.gsapVersions = [])).push(gsap.version);
          _install(_installScope || _win$1.GreenSockGlobals || !_win$1.gsap && _win$1 || {});
          _registerPluginQueue.forEach(_createPlugin);
        }
        _raf = typeof requestAnimationFrame !== "undefined" && requestAnimationFrame;
        _id && _self.sleep();
        _req = _raf || function(f) {
          return setTimeout(f, _nextTime - _self.time * 1e3 + 1 | 0);
        };
        _tickerActive = 1;
        _tick(2);
      }
    }, "wake"),
    sleep: /* @__PURE__ */ __name(function sleep() {
      (_raf ? cancelAnimationFrame : clearTimeout)(_id);
      _tickerActive = 0;
      _req = _emptyFunc;
    }, "sleep"),
    lagSmoothing: /* @__PURE__ */ __name(function lagSmoothing(threshold, adjustedLag) {
      _lagThreshold = threshold || Infinity;
      _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
    }, "lagSmoothing"),
    fps: /* @__PURE__ */ __name(function fps(_fps) {
      _gap = 1e3 / (_fps || 240);
      _nextTime = _self.time * 1e3 + _gap;
    }, "fps"),
    add: /* @__PURE__ */ __name(function add(callback, once, prioritize) {
      var func = once ? function(t, d, f, v) {
        callback(t, d, f, v);
        _self.remove(func);
      } : callback;
      _self.remove(callback);
      _listeners2[prioritize ? "unshift" : "push"](func);
      _wake();
      return func;
    }, "add"),
    remove: /* @__PURE__ */ __name(function remove(callback, i) {
      ~(i = _listeners2.indexOf(callback)) && _listeners2.splice(i, 1) && _i >= i && _i--;
    }, "remove"),
    _listeners: _listeners2
  };
  return _self;
}(), _wake = /* @__PURE__ */ __name(function _wake2() {
  return !_tickerActive && _ticker.wake();
}, "_wake"), _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = /* @__PURE__ */ __name(function _parseObjectInString2(value) {
  var obj = {}, split = value.substr(1, value.length - 3).split(":"), key = split[0], i = 1, l = split.length, index, val, parsedVal;
  for (; i < l; i++) {
    val = split[i];
    index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
    parsedVal = val.substr(0, index);
    obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
    key = val.substr(index + 1).trim();
  }
  return obj;
}, "_parseObjectInString"), _valueInParentheses = /* @__PURE__ */ __name(function _valueInParentheses2(value) {
  var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
  return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
}, "_valueInParentheses"), _configEaseFromString = /* @__PURE__ */ __name(function _configEaseFromString2(name) {
  var split = (name + "").split("("), ease = _easeMap[split[0]];
  return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
}, "_configEaseFromString"), _invertEase = /* @__PURE__ */ __name(function _invertEase2(ease) {
  return function(p) {
    return 1 - ease(1 - p);
  };
}, "_invertEase"), _propagateYoyoEase = /* @__PURE__ */ __name(function _propagateYoyoEase2(timeline2, isYoyo) {
  var child = timeline2._first, ease;
  while (child) {
    if (child instanceof Timeline) {
      _propagateYoyoEase2(child, isYoyo);
    } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
      if (child.timeline) {
        _propagateYoyoEase2(child.timeline, isYoyo);
      } else {
        ease = child._ease;
        child._ease = child._yEase;
        child._yEase = ease;
        child._yoyo = isYoyo;
      }
    }
    child = child._next;
  }
}, "_propagateYoyoEase"), _parseEase = /* @__PURE__ */ __name(function _parseEase2(ease, defaultEase) {
  return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
}, "_parseEase"), _insertEase = /* @__PURE__ */ __name(function _insertEase2(names, easeIn, easeOut, easeInOut) {
  if (easeOut === void 0) {
    easeOut = /* @__PURE__ */ __name(function easeOut2(p) {
      return 1 - easeIn(1 - p);
    }, "easeOut");
  }
  if (easeInOut === void 0) {
    easeInOut = /* @__PURE__ */ __name(function easeInOut2(p) {
      return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
    }, "easeInOut");
  }
  var ease = {
    easeIn,
    easeOut,
    easeInOut
  }, lowercaseName;
  _forEachName(names, function(name) {
    _easeMap[name] = _globals[name] = ease;
    _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
    for (var p in ease) {
      _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
    }
  });
  return ease;
}, "_insertEase"), _easeInOutFromOut = /* @__PURE__ */ __name(function _easeInOutFromOut2(easeOut) {
  return function(p) {
    return p < 0.5 ? (1 - easeOut(1 - p * 2)) / 2 : 0.5 + easeOut((p - 0.5) * 2) / 2;
  };
}, "_easeInOutFromOut"), _configElastic = /* @__PURE__ */ __name(function _configElastic2(type, amplitude, period) {
  var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? 0.3 : 0.45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = /* @__PURE__ */ __name(function easeOut2(p) {
    return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
  }, "easeOut"), ease = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  p2 = _2PI / p2;
  ease.config = function(amplitude2, period2) {
    return _configElastic2(type, amplitude2, period2);
  };
  return ease;
}, "_configElastic"), _configBack = /* @__PURE__ */ __name(function _configBack2(type, overshoot) {
  if (overshoot === void 0) {
    overshoot = 1.70158;
  }
  var easeOut = /* @__PURE__ */ __name(function easeOut2(p) {
    return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
  }, "easeOut"), ease = type === "out" ? easeOut : type === "in" ? function(p) {
    return 1 - easeOut(1 - p);
  } : _easeInOutFromOut(easeOut);
  ease.config = function(overshoot2) {
    return _configBack2(type, overshoot2);
  };
  return ease;
}, "_configBack");
_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function(name, i) {
  var power = i < 5 ? i + 1 : i;
  _insertEase(name + ",Power" + (power - 1), i ? function(p) {
    return Math.pow(p, power);
  } : function(p) {
    return p;
  }, function(p) {
    return 1 - Math.pow(1 - p, power);
  }, function(p) {
    return p < 0.5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
  });
});
_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
(function(n, c) {
  var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = /* @__PURE__ */ __name(function easeOut2(p) {
    return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + 0.75 : p < n3 ? n * (p -= 2.25 / c) * p + 0.9375 : n * Math.pow(p - 2.625 / c, 2) + 0.984375;
  }, "easeOut");
  _insertEase("Bounce", function(p) {
    return 1 - easeOut(1 - p);
  }, easeOut);
})(7.5625, 2.75);
_insertEase("Expo", function(p) {
  return Math.pow(2, 10 * (p - 1)) * p + p * p * p * p * p * p * (1 - p);
});
_insertEase("Circ", function(p) {
  return -(_sqrt(1 - p * p) - 1);
});
_insertEase("Sine", function(p) {
  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
});
_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
  config: /* @__PURE__ */ __name(function config(steps, immediateStart) {
    if (steps === void 0) {
      steps = 1;
    }
    var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - _tinyNum;
    return function(p) {
      return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
    };
  }, "config")
};
_defaults.ease = _easeMap["quad.out"];
_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(name) {
  return _callbackNames += name + "," + name + "Params,";
});
var GSCache = /* @__PURE__ */ __name(function GSCache2(target, harness) {
  this.id = _gsID++;
  target._gsap = this;
  this.target = target;
  this.harness = harness;
  this.get = harness ? harness.get : _getProperty;
  this.set = harness ? harness.getSetter : _getSetter;
}, "GSCache");
var Animation = /* @__PURE__ */ function() {
  function Animation2(vars) {
    this.vars = vars;
    this._delay = +vars.delay || 0;
    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
      this._rDelay = vars.repeatDelay || 0;
      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
    }
    this._ts = 1;
    _setDuration(this, +vars.duration, 1, 1);
    this.data = vars.data;
    if (_context) {
      this._ctx = _context;
      _context.data.push(this);
    }
    _tickerActive || _ticker.wake();
  }
  __name(Animation2, "Animation");
  var _proto = Animation2.prototype;
  _proto.delay = /* @__PURE__ */ __name(function delay(value) {
    if (value || value === 0) {
      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
      this._delay = value;
      return this;
    }
    return this._delay;
  }, "delay");
  _proto.duration = /* @__PURE__ */ __name(function duration(value) {
    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
  }, "duration");
  _proto.totalDuration = /* @__PURE__ */ __name(function totalDuration(value) {
    if (!arguments.length) {
      return this._tDur;
    }
    this._dirty = 0;
    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
  }, "totalDuration");
  _proto.totalTime = /* @__PURE__ */ __name(function totalTime(_totalTime, suppressEvents) {
    _wake();
    if (!arguments.length) {
      return this._tTime;
    }
    var parent = this._dp;
    if (parent && parent.smoothChildTiming && this._ts) {
      _alignPlayhead(this, _totalTime);
      !parent._dp || parent.parent || _postAddChecks(parent, this);
      while (parent && parent.parent) {
        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
          parent.totalTime(parent._tTime, true);
        }
        parent = parent.parent;
      }
      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
        _addToTimeline(this._dp, this, this._start - this._delay);
      }
    }
    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
      this._ts || (this._pTime = _totalTime);
      _lazySafeRender(this, _totalTime, suppressEvents);
    }
    return this;
  }, "totalTime");
  _proto.time = /* @__PURE__ */ __name(function time(value, suppressEvents) {
    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
  }, "time");
  _proto.totalProgress = /* @__PURE__ */ __name(function totalProgress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
  }, "totalProgress");
  _proto.progress = /* @__PURE__ */ __name(function progress(value, suppressEvents) {
    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.rawTime() > 0 ? 1 : 0;
  }, "progress");
  _proto.iteration = /* @__PURE__ */ __name(function iteration(value, suppressEvents) {
    var cycleDuration = this.duration() + this._rDelay;
    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
  }, "iteration");
  _proto.timeScale = /* @__PURE__ */ __name(function timeScale(value, suppressEvents) {
    if (!arguments.length) {
      return this._rts === -_tinyNum ? 0 : this._rts;
    }
    if (this._rts === value) {
      return this;
    }
    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
    this._rts = +value || 0;
    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
    this.totalTime(_clamp(-Math.abs(this._delay), this.totalDuration(), tTime), suppressEvents !== false);
    _setEnd(this);
    return _recacheAncestors(this);
  }, "timeScale");
  _proto.paused = /* @__PURE__ */ __name(function paused(value) {
    if (!arguments.length) {
      return this._ps;
    }
    if (this._ps !== value) {
      this._ps = value;
      if (value) {
        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
        this._ts = this._act = 0;
      } else {
        _wake();
        this._ts = this._rts;
        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
      }
    }
    return this;
  }, "paused");
  _proto.startTime = /* @__PURE__ */ __name(function startTime(value) {
    if (arguments.length) {
      this._start = value;
      var parent = this.parent || this._dp;
      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
      return this;
    }
    return this._start;
  }, "startTime");
  _proto.endTime = /* @__PURE__ */ __name(function endTime(includeRepeats) {
    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
  }, "endTime");
  _proto.rawTime = /* @__PURE__ */ __name(function rawTime(wrapRepeats) {
    var parent = this.parent || this._dp;
    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
  }, "rawTime");
  _proto.revert = /* @__PURE__ */ __name(function revert(config3) {
    if (config3 === void 0) {
      config3 = _revertConfig;
    }
    var prevIsReverting = _reverting$1;
    _reverting$1 = config3;
    if (_isRevertWorthy(this)) {
      this.timeline && this.timeline.revert(config3);
      this.totalTime(-0.01, config3.suppressEvents);
    }
    this.data !== "nested" && config3.kill !== false && this.kill();
    _reverting$1 = prevIsReverting;
    return this;
  }, "revert");
  _proto.globalTime = /* @__PURE__ */ __name(function globalTime(rawTime) {
    var animation = this, time = arguments.length ? rawTime : animation.rawTime();
    while (animation) {
      time = animation._start + time / (Math.abs(animation._ts) || 1);
      animation = animation._dp;
    }
    return !this.parent && this._sat ? this._sat.globalTime(rawTime) : time;
  }, "globalTime");
  _proto.repeat = /* @__PURE__ */ __name(function repeat(value) {
    if (arguments.length) {
      this._repeat = value === Infinity ? -2 : value;
      return _onUpdateTotalDuration(this);
    }
    return this._repeat === -2 ? Infinity : this._repeat;
  }, "repeat");
  _proto.repeatDelay = /* @__PURE__ */ __name(function repeatDelay(value) {
    if (arguments.length) {
      var time = this._time;
      this._rDelay = value;
      _onUpdateTotalDuration(this);
      return time ? this.time(time) : this;
    }
    return this._rDelay;
  }, "repeatDelay");
  _proto.yoyo = /* @__PURE__ */ __name(function yoyo(value) {
    if (arguments.length) {
      this._yoyo = value;
      return this;
    }
    return this._yoyo;
  }, "yoyo");
  _proto.seek = /* @__PURE__ */ __name(function seek(position, suppressEvents) {
    return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
  }, "seek");
  _proto.restart = /* @__PURE__ */ __name(function restart(includeDelay, suppressEvents) {
    this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
    this._dur || (this._zTime = -_tinyNum);
    return this;
  }, "restart");
  _proto.play = /* @__PURE__ */ __name(function play(from, suppressEvents) {
    from != null && this.seek(from, suppressEvents);
    return this.reversed(false).paused(false);
  }, "play");
  _proto.reverse = /* @__PURE__ */ __name(function reverse(from, suppressEvents) {
    from != null && this.seek(from || this.totalDuration(), suppressEvents);
    return this.reversed(true).paused(false);
  }, "reverse");
  _proto.pause = /* @__PURE__ */ __name(function pause(atTime, suppressEvents) {
    atTime != null && this.seek(atTime, suppressEvents);
    return this.paused(true);
  }, "pause");
  _proto.resume = /* @__PURE__ */ __name(function resume() {
    return this.paused(false);
  }, "resume");
  _proto.reversed = /* @__PURE__ */ __name(function reversed(value) {
    if (arguments.length) {
      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
      return this;
    }
    return this._rts < 0;
  }, "reversed");
  _proto.invalidate = /* @__PURE__ */ __name(function invalidate() {
    this._initted = this._act = 0;
    this._zTime = -_tinyNum;
    return this;
  }, "invalidate");
  _proto.isActive = /* @__PURE__ */ __name(function isActive() {
    var parent = this.parent || this._dp, start = this._start, rawTime;
    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
  }, "isActive");
  _proto.eventCallback = /* @__PURE__ */ __name(function eventCallback(type, callback, params) {
    var vars = this.vars;
    if (arguments.length > 1) {
      if (!callback) {
        delete vars[type];
      } else {
        vars[type] = callback;
        params && (vars[type + "Params"] = params);
        type === "onUpdate" && (this._onUpdate = callback);
      }
      return this;
    }
    return vars[type];
  }, "eventCallback");
  _proto.then = /* @__PURE__ */ __name(function then(onFulfilled) {
    var self = this;
    return new Promise(function(resolve) {
      var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = /* @__PURE__ */ __name(function _resolve2() {
        var _then = self.then;
        self.then = null;
        _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
        resolve(f);
        self.then = _then;
      }, "_resolve");
      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
        _resolve();
      } else {
        self._prom = _resolve;
      }
    });
  }, "then");
  _proto.kill = /* @__PURE__ */ __name(function kill() {
    _interrupt(this);
  }, "kill");
  return Animation2;
}();
_setDefaults(Animation.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: false,
  parent: null,
  _initted: false,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -_tinyNum,
  _prom: 0,
  _ps: false,
  _rts: 1
});
var Timeline = /* @__PURE__ */ function(_Animation) {
  _inheritsLoose(Timeline2, _Animation);
  function Timeline2(vars, position) {
    var _this;
    if (vars === void 0) {
      vars = {};
    }
    _this = _Animation.call(this, vars) || this;
    _this.labels = {};
    _this.smoothChildTiming = !!vars.smoothChildTiming;
    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
    _this._sort = _isNotFalse(vars.sortChildren);
    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
    vars.reversed && _this.reverse();
    vars.paused && _this.paused(true);
    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
    return _this;
  }
  __name(Timeline2, "Timeline");
  var _proto2 = Timeline2.prototype;
  _proto2.to = /* @__PURE__ */ __name(function to(targets, vars, position) {
    _createTweenType(0, arguments, this);
    return this;
  }, "to");
  _proto2.from = /* @__PURE__ */ __name(function from(targets, vars, position) {
    _createTweenType(1, arguments, this);
    return this;
  }, "from");
  _proto2.fromTo = /* @__PURE__ */ __name(function fromTo(targets, fromVars, toVars, position) {
    _createTweenType(2, arguments, this);
    return this;
  }, "fromTo");
  _proto2.set = /* @__PURE__ */ __name(function set(targets, vars, position) {
    vars.duration = 0;
    vars.parent = this;
    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
    vars.immediateRender = !!vars.immediateRender;
    new Tween(targets, vars, _parsePosition(this, position), 1);
    return this;
  }, "set");
  _proto2.call = /* @__PURE__ */ __name(function call(callback, params, position) {
    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
  }, "call");
  _proto2.staggerTo = /* @__PURE__ */ __name(function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.duration = duration;
    vars.stagger = vars.stagger || stagger;
    vars.onComplete = onCompleteAll;
    vars.onCompleteParams = onCompleteAllParams;
    vars.parent = this;
    new Tween(targets, vars, _parsePosition(this, position));
    return this;
  }, "staggerTo");
  _proto2.staggerFrom = /* @__PURE__ */ __name(function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
    vars.runBackwards = 1;
    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
  }, "staggerFrom");
  _proto2.staggerFromTo = /* @__PURE__ */ __name(function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
    toVars.startAt = fromVars;
    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
  }, "staggerFromTo");
  _proto2.render = /* @__PURE__ */ __name(function render3(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur), time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo;
    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
    if (tTime !== this._tTime || force || crossingStart) {
      if (prevTime !== this._time && dur) {
        tTime += this._time - prevTime;
        totalTime += this._time - prevTime;
      }
      time = tTime;
      prevStart = this._start;
      timeScale = this._ts;
      prevPaused = !timeScale;
      if (crossingStart) {
        dur || (prevTime = this._zTime);
        (totalTime || !suppressEvents) && (this._zTime = totalTime);
      }
      if (this._repeat) {
        yoyo = this._yoyo;
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && totalTime < 0) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          }
          time > dur && (time = dur);
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        !prevTime && this._tTime && prevIteration !== iteration && this._tTime - prevIteration * cycleDuration - this._dur <= 0 && (prevIteration = iteration);
        if (yoyo && iteration & 1) {
          time = dur - time;
          isYoyo = 1;
        }
        if (iteration !== prevIteration && !this._lock) {
          var rewinding = yoyo && prevIteration & 1, doesWrap = rewinding === (yoyo && iteration & 1);
          iteration < prevIteration && (rewinding = !rewinding);
          prevTime = rewinding ? 0 : tTime % dur ? dur : tTime;
          this._lock = 1;
          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
          this._tTime = tTime;
          !suppressEvents && this.parent && _callback(this, "onRepeat");
          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
            return this;
          }
          dur = this._dur;
          tDur = this._tDur;
          if (doesWrap) {
            this._lock = 2;
            prevTime = rewinding ? dur : -1e-4;
            this.render(prevTime, true);
            this.vars.repeatRefresh && !isYoyo && this.invalidate();
          }
          this._lock = 0;
          if (!this._ts && !prevPaused) {
            return this;
          }
          _propagateYoyoEase(this, isYoyo);
        }
      }
      if (this._hasPause && !this._forcing && this._lock < 2) {
        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
        if (pauseTween) {
          tTime -= time - (time = pauseTween._start);
        }
      }
      this._tTime = tTime;
      this._time = time;
      this._act = !timeScale;
      if (!this._initted) {
        this._onUpdate = this.vars.onUpdate;
        this._initted = 1;
        this._zTime = totalTime;
        prevTime = 0;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      if (time >= prevTime && totalTime >= 0) {
        child = this._first;
        while (child) {
          next = child._next;
          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = -_tinyNum);
              break;
            }
          }
          child = next;
        }
      } else {
        child = this._last;
        var adjustedTime = totalTime < 0 ? totalTime : time;
        while (child) {
          next = child._prev;
          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
            if (child.parent !== this) {
              return this.render(totalTime, suppressEvents, force);
            }
            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && _isRevertWorthy(child));
            if (time !== this._time || !this._ts && !prevPaused) {
              pauseTween = 0;
              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
              break;
            }
          }
          child = next;
        }
      }
      if (pauseTween && !suppressEvents) {
        this.pause();
        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
        if (this._ts) {
          this._start = prevStart;
          _setEnd(this);
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) {
        if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) {
          if (!this._lock) {
            (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
            if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
              _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
              this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
            }
          }
        }
      }
    }
    return this;
  }, "render");
  _proto2.add = /* @__PURE__ */ __name(function add(child, position) {
    var _this2 = this;
    _isNumber(position) || (position = _parsePosition(this, position, child));
    if (!(child instanceof Animation)) {
      if (_isArray(child)) {
        child.forEach(function(obj) {
          return _this2.add(obj, position);
        });
        return this;
      }
      if (_isString(child)) {
        return this.addLabel(child, position);
      }
      if (_isFunction(child)) {
        child = Tween.delayedCall(0, child);
      } else {
        return this;
      }
    }
    return this !== child ? _addToTimeline(this, child, position) : this;
  }, "add");
  _proto2.getChildren = /* @__PURE__ */ __name(function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
    if (nested === void 0) {
      nested = true;
    }
    if (tweens === void 0) {
      tweens = true;
    }
    if (timelines === void 0) {
      timelines = true;
    }
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = -_bigNum$1;
    }
    var a = [], child = this._first;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        if (child instanceof Tween) {
          tweens && a.push(child);
        } else {
          timelines && a.push(child);
          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
        }
      }
      child = child._next;
    }
    return a;
  }, "getChildren");
  _proto2.getById = /* @__PURE__ */ __name(function getById2(id) {
    var animations = this.getChildren(1, 1, 1), i = animations.length;
    while (i--) {
      if (animations[i].vars.id === id) {
        return animations[i];
      }
    }
  }, "getById");
  _proto2.remove = /* @__PURE__ */ __name(function remove(child) {
    if (_isString(child)) {
      return this.removeLabel(child);
    }
    if (_isFunction(child)) {
      return this.killTweensOf(child);
    }
    child.parent === this && _removeLinkedListItem(this, child);
    if (child === this._recent) {
      this._recent = this._last;
    }
    return _uncache(this);
  }, "remove");
  _proto2.totalTime = /* @__PURE__ */ __name(function totalTime(_totalTime2, suppressEvents) {
    if (!arguments.length) {
      return this._tTime;
    }
    this._forcing = 1;
    if (!this._dp && this._ts) {
      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
    }
    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
    this._forcing = 0;
    return this;
  }, "totalTime");
  _proto2.addLabel = /* @__PURE__ */ __name(function addLabel(label, position) {
    this.labels[label] = _parsePosition(this, position);
    return this;
  }, "addLabel");
  _proto2.removeLabel = /* @__PURE__ */ __name(function removeLabel(label) {
    delete this.labels[label];
    return this;
  }, "removeLabel");
  _proto2.addPause = /* @__PURE__ */ __name(function addPause(position, callback, params) {
    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
    t.data = "isPause";
    this._hasPause = 1;
    return _addToTimeline(this, t, _parsePosition(this, position));
  }, "addPause");
  _proto2.removePause = /* @__PURE__ */ __name(function removePause(position) {
    var child = this._first;
    position = _parsePosition(this, position);
    while (child) {
      if (child._start === position && child.data === "isPause") {
        _removeFromParent(child);
      }
      child = child._next;
    }
  }, "removePause");
  _proto2.killTweensOf = /* @__PURE__ */ __name(function killTweensOf(targets, props, onlyActive) {
    var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
    while (i--) {
      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
    }
    return this;
  }, "killTweensOf");
  _proto2.getTweensOf = /* @__PURE__ */ __name(function getTweensOf2(targets, onlyActive) {
    var a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber(onlyActive), children;
    while (child) {
      if (child instanceof Tween) {
        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
          a.push(child);
        }
      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
        a.push.apply(a, children);
      }
      child = child._next;
    }
    return a;
  }, "getTweensOf");
  _proto2.tweenTo = /* @__PURE__ */ __name(function tweenTo(position, vars) {
    vars = vars || {};
    var tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, initted, tween = Tween.to(tl, _setDefaults({
      ease: vars.ease || "none",
      lazy: false,
      immediateRender: false,
      time: endTime,
      overwrite: "auto",
      duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
      onStart: /* @__PURE__ */ __name(function onStart() {
        tl.pause();
        if (!initted) {
          var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
          tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
          initted = 1;
        }
        _onStart && _onStart.apply(tween, onStartParams || []);
      }, "onStart")
    }, vars));
    return immediateRender ? tween.render(0) : tween;
  }, "tweenTo");
  _proto2.tweenFromTo = /* @__PURE__ */ __name(function tweenFromTo(fromPosition, toPosition, vars) {
    return this.tweenTo(toPosition, _setDefaults({
      startAt: {
        time: _parsePosition(this, fromPosition)
      }
    }, vars));
  }, "tweenFromTo");
  _proto2.recent = /* @__PURE__ */ __name(function recent() {
    return this._recent;
  }, "recent");
  _proto2.nextLabel = /* @__PURE__ */ __name(function nextLabel(afterTime) {
    if (afterTime === void 0) {
      afterTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition(this, afterTime));
  }, "nextLabel");
  _proto2.previousLabel = /* @__PURE__ */ __name(function previousLabel(beforeTime) {
    if (beforeTime === void 0) {
      beforeTime = this._time;
    }
    return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
  }, "previousLabel");
  _proto2.currentLabel = /* @__PURE__ */ __name(function currentLabel(value) {
    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
  }, "currentLabel");
  _proto2.shiftChildren = /* @__PURE__ */ __name(function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
    if (ignoreBeforeTime === void 0) {
      ignoreBeforeTime = 0;
    }
    var child = this._first, labels = this.labels, p;
    while (child) {
      if (child._start >= ignoreBeforeTime) {
        child._start += amount;
        child._end += amount;
      }
      child = child._next;
    }
    if (adjustLabels) {
      for (p in labels) {
        if (labels[p] >= ignoreBeforeTime) {
          labels[p] += amount;
        }
      }
    }
    return _uncache(this);
  }, "shiftChildren");
  _proto2.invalidate = /* @__PURE__ */ __name(function invalidate(soft) {
    var child = this._first;
    this._lock = 0;
    while (child) {
      child.invalidate(soft);
      child = child._next;
    }
    return _Animation.prototype.invalidate.call(this, soft);
  }, "invalidate");
  _proto2.clear = /* @__PURE__ */ __name(function clear(includeLabels) {
    if (includeLabels === void 0) {
      includeLabels = true;
    }
    var child = this._first, next;
    while (child) {
      next = child._next;
      this.remove(child);
      child = next;
    }
    this._dp && (this._time = this._tTime = this._pTime = 0);
    includeLabels && (this.labels = {});
    return _uncache(this);
  }, "clear");
  _proto2.totalDuration = /* @__PURE__ */ __name(function totalDuration(value) {
    var max = 0, self = this, child = self._last, prevStart = _bigNum$1, prev, start, parent;
    if (arguments.length) {
      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
    }
    if (self._dirty) {
      parent = self.parent;
      while (child) {
        prev = child._prev;
        child._dirty && child.totalDuration();
        start = child._start;
        if (start > prevStart && self._sort && child._ts && !self._lock) {
          self._lock = 1;
          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
        } else {
          prevStart = start;
        }
        if (start < 0 && child._ts) {
          max -= start;
          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
            self._start += start / self._ts;
            self._time -= start;
            self._tTime -= start;
          }
          self.shiftChildren(-start, false, -Infinity);
          prevStart = 0;
        }
        child._end > max && child._ts && (max = child._end);
        child = prev;
      }
      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);
      self._dirty = 0;
    }
    return self._tDur;
  }, "totalDuration");
  Timeline2.updateRoot = /* @__PURE__ */ __name(function updateRoot(time) {
    if (_globalTimeline._ts) {
      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
      _lastRenderedFrame = _ticker.frame;
    }
    if (_ticker.frame >= _nextGCFrame) {
      _nextGCFrame += _config.autoSleep || 120;
      var child = _globalTimeline._first;
      if (!child || !child._ts) {
        if (_config.autoSleep && _ticker._listeners.length < 2) {
          while (child && !child._ts) {
            child = child._next;
          }
          child || _ticker.sleep();
        }
      }
    }
  }, "updateRoot");
  return Timeline2;
}(Animation);
_setDefaults(Timeline.prototype, {
  _lock: 0,
  _hasPause: 0,
  _forcing: 0
});
var _addComplexStringPropTween = /* @__PURE__ */ __name(function _addComplexStringPropTween2(target, prop, start, end, setter, stringFilter, funcParam) {
  var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0, result, startNums, color, endNum, chunk, startNum, hasRandom, a;
  pt.b = start;
  pt.e = end;
  start += "";
  end += "";
  if (hasRandom = ~end.indexOf("random(")) {
    end = _replaceRandom(end);
  }
  if (stringFilter) {
    a = [start, end];
    stringFilter(a, target, prop);
    start = a[0];
    end = a[1];
  }
  startNums = start.match(_complexStringNumExp) || [];
  while (result = _complexStringNumExp.exec(end)) {
    endNum = result[0];
    chunk = end.substring(index, result.index);
    if (color) {
      color = (color + 1) % 5;
    } else if (chunk.substr(-5) === "rgba(") {
      color = 1;
    }
    if (endNum !== startNums[matchIndex++]) {
      startNum = parseFloat(startNums[matchIndex - 1]) || 0;
      pt._pt = {
        _next: pt._pt,
        p: chunk || matchIndex === 1 ? chunk : ",",
        //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
        s: startNum,
        c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
        m: color && color < 4 ? Math.round : 0
      };
      index = _complexStringNumExp.lastIndex;
    }
  }
  pt.c = index < end.length ? end.substring(index, end.length) : "";
  pt.fp = funcParam;
  if (_relExp.test(end) || hasRandom) {
    pt.e = 0;
  }
  this._pt = pt;
  return pt;
}, "_addComplexStringPropTween"), _addPropTween = /* @__PURE__ */ __name(function _addPropTween2(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
  _isFunction(end) && (end = end(index || 0, target, targets));
  var currentValue = target[prop], parsedStart = start !== "get" ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc, pt;
  if (_isString(end)) {
    if (~end.indexOf("random(")) {
      end = _replaceRandom(end);
    }
    if (end.charAt(1) === "=") {
      pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
      if (pt || pt === 0) {
        end = pt;
      }
    }
  }
  if (!optional || parsedStart !== end || _forceAllPropTweens) {
    if (!isNaN(parsedStart * end) && end !== "") {
      pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
      funcParam && (pt.fp = funcParam);
      modifier && pt.modifier(modifier, this, target);
      return this._pt = pt;
    }
    !currentValue && !(prop in target) && _missingPlugin(prop, end);
    return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
  }
}, "_addPropTween"), _processVars = /* @__PURE__ */ __name(function _processVars2(vars, index, target, targets, tween) {
  _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
  if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
    return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
  }
  var copy = {}, p;
  for (p in vars) {
    copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
  }
  return copy;
}, "_processVars"), _checkPlugin = /* @__PURE__ */ __name(function _checkPlugin2(property, vars, tween, index, target, targets) {
  var plugin, pt, ptLookup, i;
  if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
    tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
    if (tween !== _quickTween) {
      ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
      i = plugin._props.length;
      while (i--) {
        ptLookup[plugin._props[i]] = pt;
      }
    }
  }
  return plugin;
}, "_checkPlugin"), _overwritingTween, _forceAllPropTweens, _initTween = /* @__PURE__ */ __name(function _initTween2(tween, time, tTime) {
  var vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets, autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites, tl = tween.timeline, cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten;
  tl && (!keyframes || !ease) && (ease = "none");
  tween._ease = _parseEase(ease, _defaults.ease);
  tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults.ease)) : 0;
  if (yoyoEase && tween._yoyo && !tween._repeat) {
    yoyoEase = tween._yEase;
    tween._yEase = tween._ease;
    tween._ease = yoyoEase;
  }
  tween._from = !tl && !!vars.runBackwards;
  if (!tl || keyframes && !vars.stagger) {
    harness = targets[0] ? _getCache(targets[0]).harness : 0;
    harnessVars = harness && vars[harness.prop];
    cleanVars = _copyExcluding(vars, _reservedProps);
    if (prevStartAt) {
      prevStartAt._zTime < 0 && prevStartAt.progress(1);
      time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
      prevStartAt._lazy = 0;
    }
    if (startAt) {
      _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
        data: "isStart",
        overwrite: false,
        parent,
        immediateRender: true,
        lazy: !prevStartAt && _isNotFalse(lazy),
        startAt: null,
        delay: 0,
        onUpdate: onUpdate && function() {
          return _callback(tween, "onUpdate");
        },
        stagger: 0
      }, startAt)));
      tween._startAt._dp = 0;
      tween._startAt._sat = tween;
      time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
      if (immediateRender) {
        if (dur && time <= 0 && tTime <= 0) {
          time && (tween._zTime = time);
          return;
        }
      }
    } else if (runBackwards && dur) {
      if (!prevStartAt) {
        time && (immediateRender = false);
        p = _setDefaults({
          overwrite: false,
          data: "isFromStart",
          //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
          lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
          immediateRender,
          //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
          stagger: 0,
          parent
          //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y: gsap.utils.wrap([-100,100]), stagger: 0.5})
        }, cleanVars);
        harnessVars && (p[harness.prop] = harnessVars);
        _removeFromParent(tween._startAt = Tween.set(targets, p));
        tween._startAt._dp = 0;
        tween._startAt._sat = tween;
        time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
        tween._zTime = time;
        if (!immediateRender) {
          _initTween2(tween._startAt, _tinyNum, _tinyNum);
        } else if (!time) {
          return;
        }
      }
    }
    tween._pt = tween._ptCache = 0;
    lazy = dur && _isNotFalse(lazy) || lazy && !dur;
    for (i = 0; i < targets.length; i++) {
      target = targets[i];
      gsData = target._gsap || _harness(targets)[i]._gsap;
      tween._ptLookup[i] = ptLookup = {};
      _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
      index = fullTargets === targets ? i : fullTargets.indexOf(target);
      if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
        tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
        plugin._props.forEach(function(name) {
          ptLookup[name] = pt;
        });
        plugin.priority && (hasPriority = 1);
      }
      if (!harness || harnessVars) {
        for (p in cleanVars) {
          if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
            plugin.priority && (hasPriority = 1);
          } else {
            ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
          }
        }
      }
      tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
      if (autoOverwrite && tween._pt) {
        _overwritingTween = tween;
        _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
        overwritten = !tween.parent;
        _overwritingTween = 0;
      }
      tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
    }
    hasPriority && _sortPropTweensByPriority(tween);
    tween._onInit && tween._onInit(tween);
  }
  tween._onUpdate = onUpdate;
  tween._initted = (!tween._op || tween._pt) && !overwritten;
  keyframes && time <= 0 && tl.render(_bigNum$1, true, true);
}, "_initTween"), _updatePropTweens = /* @__PURE__ */ __name(function _updatePropTweens2(tween, property, value, start, startIsRelative, ratio, time, skipRecursion) {
  var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property], pt, rootPT, lookup, i;
  if (!ptCache) {
    ptCache = tween._ptCache[property] = [];
    lookup = tween._ptLookup;
    i = tween._targets.length;
    while (i--) {
      pt = lookup[i][property];
      if (pt && pt.d && pt.d._pt) {
        pt = pt.d._pt;
        while (pt && pt.p !== property && pt.fp !== property) {
          pt = pt._next;
        }
      }
      if (!pt) {
        _forceAllPropTweens = 1;
        tween.vars[property] = "+=0";
        _initTween(tween, time);
        _forceAllPropTweens = 0;
        return skipRecursion ? _warn(property + " not eligible for reset") : 1;
      }
      ptCache.push(pt);
    }
  }
  i = ptCache.length;
  while (i--) {
    rootPT = ptCache[i];
    pt = rootPT._pt || rootPT;
    pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
    pt.c = value - pt.s;
    rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e));
    rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
  }
}, "_updatePropTweens"), _addAliasesToVars = /* @__PURE__ */ __name(function _addAliasesToVars2(targets, vars) {
  var harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases, copy, p, i, aliases;
  if (!propertyAliases) {
    return vars;
  }
  copy = _merge({}, vars);
  for (p in propertyAliases) {
    if (p in copy) {
      aliases = propertyAliases[p].split(",");
      i = aliases.length;
      while (i--) {
        copy[aliases[i]] = copy[p];
      }
    }
  }
  return copy;
}, "_addAliasesToVars"), _parseKeyframe = /* @__PURE__ */ __name(function _parseKeyframe2(prop, obj, allProps, easeEach) {
  var ease = obj.ease || easeEach || "power1.inOut", p, a;
  if (_isArray(obj)) {
    a = allProps[prop] || (allProps[prop] = []);
    obj.forEach(function(value, i) {
      return a.push({
        t: i / (obj.length - 1) * 100,
        v: value,
        e: ease
      });
    });
  } else {
    for (p in obj) {
      a = allProps[p] || (allProps[p] = []);
      p === "ease" || a.push({
        t: parseFloat(prop),
        v: obj[p],
        e: ease
      });
    }
  }
}, "_parseKeyframe"), _parseFuncOrString = /* @__PURE__ */ __name(function _parseFuncOrString2(value, tween, i, target, targets) {
  return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
}, "_parseFuncOrString"), _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", _staggerPropsToSkip = {};
_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function(name) {
  return _staggerPropsToSkip[name] = 1;
});
var Tween = /* @__PURE__ */ function(_Animation2) {
  _inheritsLoose(Tween2, _Animation2);
  function Tween2(targets, vars, position, skipInherit) {
    var _this3;
    if (typeof vars === "number") {
      position.duration = vars;
      vars = position;
      position = null;
    }
    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
    var _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults2 = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [targets] : toArray(targets), tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge;
    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://gsap.com", !_config.nullTargetWarn) || [];
    _this3._ptLookup = [];
    _this3._overwrite = overwrite;
    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
      vars = _this3.vars;
      tl = _this3.timeline = new Timeline({
        data: "nested",
        defaults: defaults2 || {},
        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
      });
      tl.kill();
      tl.parent = tl._dp = _assertThisInitialized(_this3);
      tl._start = 0;
      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
        l = parsedTargets.length;
        staggerFunc = stagger && distribute(stagger);
        if (_isObject(stagger)) {
          for (p in stagger) {
            if (~_staggerTweenProps.indexOf(p)) {
              staggerVarsToMerge || (staggerVarsToMerge = {});
              staggerVarsToMerge[p] = stagger[p];
            }
          }
        }
        for (i = 0; i < l; i++) {
          copy = _copyExcluding(vars, _staggerPropsToSkip);
          copy.stagger = 0;
          yoyoEase && (copy.yoyoEase = yoyoEase);
          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
          curTarget = parsedTargets[i];
          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
          if (!stagger && l === 1 && copy.delay) {
            _this3._delay = delay = copy.delay;
            _this3._start += delay;
            copy.delay = 0;
          }
          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
          tl._ease = _easeMap.none;
        }
        tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
      } else if (keyframes) {
        _inheritDefaults(_setDefaults(tl.vars.defaults, {
          ease: "none"
        }));
        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
        var time = 0, a, kf, v;
        if (_isArray(keyframes)) {
          keyframes.forEach(function(frame) {
            return tl.to(parsedTargets, frame, ">");
          });
          tl.duration();
        } else {
          copy = {};
          for (p in keyframes) {
            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
          }
          for (p in copy) {
            a = copy[p].sort(function(a2, b) {
              return a2.t - b.t;
            });
            time = 0;
            for (i = 0; i < a.length; i++) {
              kf = a[i];
              v = {
                ease: kf.e,
                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
              };
              v[p] = kf.v;
              tl.to(parsedTargets, v, time);
              time += v.duration;
            }
          }
          tl.duration() < duration && tl.to({}, {
            duration: duration - tl.duration()
          });
        }
      }
      duration || _this3.duration(duration = tl.duration());
    } else {
      _this3.timeline = 0;
    }
    if (overwrite === true && !_suppressOverwrites) {
      _overwritingTween = _assertThisInitialized(_this3);
      _globalTimeline.killTweensOf(parsedTargets);
      _overwritingTween = 0;
    }
    _addToTimeline(parent, _assertThisInitialized(_this3), position);
    vars.reversed && _this3.reverse();
    vars.paused && _this3.paused(true);
    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
      _this3._tTime = -_tinyNum;
      _this3.render(Math.max(0, -delay) || 0);
    }
    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
    return _this3;
  }
  __name(Tween2, "Tween");
  var _proto3 = Tween2.prototype;
  _proto3.render = /* @__PURE__ */ __name(function render3(totalTime, suppressEvents, force) {
    var prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime, time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline2, yoyoEase;
    if (!dur) {
      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative || this._lazy) {
      time = tTime;
      timeline2 = this.timeline;
      if (this._repeat) {
        cycleDuration = dur + this._rDelay;
        if (this._repeat < -1 && isNegative) {
          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
        }
        time = _roundPrecise(tTime % cycleDuration);
        if (tTime === tDur) {
          iteration = this._repeat;
          time = dur;
        } else {
          prevIteration = _roundPrecise(tTime / cycleDuration);
          iteration = ~~prevIteration;
          if (iteration && iteration === prevIteration) {
            time = dur;
            iteration--;
          } else if (time > dur) {
            time = dur;
          }
        }
        isYoyo = this._yoyo && iteration & 1;
        if (isYoyo) {
          yoyoEase = this._yEase;
          time = dur - time;
        }
        prevIteration = _animationCycle(this._tTime, cycleDuration);
        if (time === prevTime && !force && this._initted && iteration === prevIteration) {
          this._tTime = tTime;
          return this;
        }
        if (iteration !== prevIteration) {
          timeline2 && this._yEase && _propagateYoyoEase(timeline2, isYoyo);
          if (this.vars.repeatRefresh && !isYoyo && !this._lock && time !== cycleDuration && this._initted) {
            this._lock = force = 1;
            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
          }
        }
      }
      if (!this._initted) {
        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
          this._tTime = 0;
          return this;
        }
        if (prevTime !== this._time && !(force && this.vars.repeatRefresh && iteration !== prevIteration)) {
          return this;
        }
        if (dur !== this._dur) {
          return this.render(totalTime, suppressEvents, force);
        }
      }
      this._tTime = tTime;
      this._time = time;
      if (!this._act && this._ts) {
        this._act = 1;
        this._lazy = 0;
      }
      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
      if (this._from) {
        this.ratio = ratio = 1 - ratio;
      }
      if (!prevTime && tTime && !suppressEvents && !prevIteration) {
        _callback(this, "onStart");
        if (this._tTime !== tTime) {
          return this;
        }
      }
      pt = this._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
      timeline2 && timeline2.render(totalTime < 0 ? totalTime : timeline2._dur * timeline2._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
      if (this._onUpdate && !suppressEvents) {
        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
        _callback(this, "onUpdate");
      }
      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
          _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
        }
      }
    }
    return this;
  }, "render");
  _proto3.targets = /* @__PURE__ */ __name(function targets() {
    return this._targets;
  }, "targets");
  _proto3.invalidate = /* @__PURE__ */ __name(function invalidate(soft) {
    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
    this._ptLookup = [];
    this.timeline && this.timeline.invalidate(soft);
    return _Animation2.prototype.invalidate.call(this, soft);
  }, "invalidate");
  _proto3.resetTo = /* @__PURE__ */ __name(function resetTo(property, value, start, startIsRelative, skipRecursion) {
    _tickerActive || _ticker.wake();
    this._ts || this.play();
    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts), ratio;
    this._initted || _initTween(this, time);
    ratio = this._ease(time / this._dur);
    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time, skipRecursion)) {
      return this.resetTo(property, value, start, startIsRelative, 1);
    }
    _alignPlayhead(this, 0);
    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
    return this.render(0);
  }, "resetTo");
  _proto3.kill = /* @__PURE__ */ __name(function kill(targets, vars) {
    if (vars === void 0) {
      vars = "all";
    }
    if (!targets && (!vars || vars === "all")) {
      this._lazy = this._pt = 0;
      this.parent ? _interrupt(this) : this.scrollTrigger && this.scrollTrigger.kill(!!_reverting$1);
      return this;
    }
    if (this.timeline) {
      var tDur = this.timeline.totalDuration();
      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this);
      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
      return this;
    }
    var parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt, overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i;
    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
      vars === "all" && (this._pt = 0);
      return _interrupt(this);
    }
    overwrittenProps = this._op = this._op || [];
    if (vars !== "all") {
      if (_isString(vars)) {
        p = {};
        _forEachName(vars, function(name) {
          return p[name] = 1;
        });
        vars = p;
      }
      vars = _addAliasesToVars(parsedTargets, vars);
    }
    i = parsedTargets.length;
    while (i--) {
      if (~killingTargets.indexOf(parsedTargets[i])) {
        curLookup = propTweenLookup[i];
        if (vars === "all") {
          overwrittenProps[i] = vars;
          props = curLookup;
          curOverwriteProps = {};
        } else {
          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
          props = vars;
        }
        for (p in props) {
          pt = curLookup && curLookup[p];
          if (pt) {
            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
              _removeLinkedListItem(this, pt, "_pt");
            }
            delete curLookup[p];
          }
          if (curOverwriteProps !== "all") {
            curOverwriteProps[p] = 1;
          }
        }
      }
    }
    this._initted && !this._pt && firstPT && _interrupt(this);
    return this;
  }, "kill");
  Tween2.to = /* @__PURE__ */ __name(function to(targets, vars) {
    return new Tween2(targets, vars, arguments[2]);
  }, "to");
  Tween2.from = /* @__PURE__ */ __name(function from(targets, vars) {
    return _createTweenType(1, arguments);
  }, "from");
  Tween2.delayedCall = /* @__PURE__ */ __name(function delayedCall(delay, callback, params, scope) {
    return new Tween2(callback, 0, {
      immediateRender: false,
      lazy: false,
      overwrite: false,
      delay,
      onComplete: callback,
      onReverseComplete: callback,
      onCompleteParams: params,
      onReverseCompleteParams: params,
      callbackScope: scope
    });
  }, "delayedCall");
  Tween2.fromTo = /* @__PURE__ */ __name(function fromTo(targets, fromVars, toVars) {
    return _createTweenType(2, arguments);
  }, "fromTo");
  Tween2.set = /* @__PURE__ */ __name(function set(targets, vars) {
    vars.duration = 0;
    vars.repeatDelay || (vars.repeat = 0);
    return new Tween2(targets, vars);
  }, "set");
  Tween2.killTweensOf = /* @__PURE__ */ __name(function killTweensOf(targets, props, onlyActive) {
    return _globalTimeline.killTweensOf(targets, props, onlyActive);
  }, "killTweensOf");
  return Tween2;
}(Animation);
_setDefaults(Tween.prototype, {
  _targets: [],
  _lazy: 0,
  _startAt: 0,
  _op: 0,
  _onInit: 0
});
_forEachName("staggerTo,staggerFrom,staggerFromTo", function(name) {
  Tween[name] = function() {
    var tl = new Timeline(), params = _slice.call(arguments, 0);
    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
    return tl[name].apply(tl, params);
  };
});
var _setterPlain = /* @__PURE__ */ __name(function _setterPlain2(target, property, value) {
  return target[property] = value;
}, "_setterPlain"), _setterFunc = /* @__PURE__ */ __name(function _setterFunc2(target, property, value) {
  return target[property](value);
}, "_setterFunc"), _setterFuncWithParam = /* @__PURE__ */ __name(function _setterFuncWithParam2(target, property, value, data) {
  return target[property](data.fp, value);
}, "_setterFuncWithParam"), _setterAttribute = /* @__PURE__ */ __name(function _setterAttribute2(target, property, value) {
  return target.setAttribute(property, value);
}, "_setterAttribute"), _getSetter = /* @__PURE__ */ __name(function _getSetter2(target, property) {
  return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
}, "_getSetter"), _renderPlain = /* @__PURE__ */ __name(function _renderPlain2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e6) / 1e6, data);
}, "_renderPlain"), _renderBoolean = /* @__PURE__ */ __name(function _renderBoolean2(ratio, data) {
  return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
}, "_renderBoolean"), _renderComplexString = /* @__PURE__ */ __name(function _renderComplexString2(ratio, data) {
  var pt = data._pt, s = "";
  if (!ratio && data.b) {
    s = data.b;
  } else if (ratio === 1 && data.e) {
    s = data.e;
  } else {
    while (pt) {
      s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 1e4) / 1e4) + s;
      pt = pt._next;
    }
    s += data.c;
  }
  data.set(data.t, data.p, s, data);
}, "_renderComplexString"), _renderPropTweens = /* @__PURE__ */ __name(function _renderPropTweens2(ratio, data) {
  var pt = data._pt;
  while (pt) {
    pt.r(ratio, pt.d);
    pt = pt._next;
  }
}, "_renderPropTweens"), _addPluginModifier = /* @__PURE__ */ __name(function _addPluginModifier2(modifier, tween, target, property) {
  var pt = this._pt, next;
  while (pt) {
    next = pt._next;
    pt.p === property && pt.modifier(modifier, tween, target);
    pt = next;
  }
}, "_addPluginModifier"), _killPropTweensOf = /* @__PURE__ */ __name(function _killPropTweensOf2(property) {
  var pt = this._pt, hasNonDependentRemaining, next;
  while (pt) {
    next = pt._next;
    if (pt.p === property && !pt.op || pt.op === property) {
      _removeLinkedListItem(this, pt, "_pt");
    } else if (!pt.dep) {
      hasNonDependentRemaining = 1;
    }
    pt = next;
  }
  return !hasNonDependentRemaining;
}, "_killPropTweensOf"), _setterWithModifier = /* @__PURE__ */ __name(function _setterWithModifier2(target, property, value, data) {
  data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
}, "_setterWithModifier"), _sortPropTweensByPriority = /* @__PURE__ */ __name(function _sortPropTweensByPriority2(parent) {
  var pt = parent._pt, next, pt2, first, last;
  while (pt) {
    next = pt._next;
    pt2 = first;
    while (pt2 && pt2.pr > pt.pr) {
      pt2 = pt2._next;
    }
    if (pt._prev = pt2 ? pt2._prev : last) {
      pt._prev._next = pt;
    } else {
      first = pt;
    }
    if (pt._next = pt2) {
      pt2._prev = pt;
    } else {
      last = pt;
    }
    pt = next;
  }
  parent._pt = first;
}, "_sortPropTweensByPriority");
var PropTween = /* @__PURE__ */ function() {
  function PropTween2(next, target, prop, start, change, renderer, data, setter, priority) {
    this.t = target;
    this.s = start;
    this.c = change;
    this.p = prop;
    this.r = renderer || _renderPlain;
    this.d = data || this;
    this.set = setter || _setterPlain;
    this.pr = priority || 0;
    this._next = next;
    if (next) {
      next._prev = this;
    }
  }
  __name(PropTween2, "PropTween");
  var _proto4 = PropTween2.prototype;
  _proto4.modifier = /* @__PURE__ */ __name(function modifier(func, tween, target) {
    this.mSet = this.mSet || this.set;
    this.set = _setterWithModifier;
    this.m = func;
    this.mt = target;
    this.tween = tween;
  }, "modifier");
  return PropTween2;
}();
_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(name) {
  return _reservedProps[name] = 1;
});
_globals.TweenMax = _globals.TweenLite = Tween;
_globals.TimelineLite = _globals.TimelineMax = Timeline;
_globalTimeline = new Timeline({
  sortChildren: false,
  defaults: _defaults,
  autoRemoveChildren: true,
  id: "root",
  smoothChildTiming: true
});
_config.stringFilter = _colorStringFilter;
var _media = [], _listeners = {}, _emptyArray = [], _lastMediaTime = 0, _contextID = 0, _dispatch = /* @__PURE__ */ __name(function _dispatch2(type) {
  return (_listeners[type] || _emptyArray).map(function(f) {
    return f();
  });
}, "_dispatch"), _onMediaChange = /* @__PURE__ */ __name(function _onMediaChange2() {
  var time = Date.now(), matches = [];
  if (time - _lastMediaTime > 2) {
    _dispatch("matchMediaInit");
    _media.forEach(function(c) {
      var queries = c.queries, conditions = c.conditions, match, p, anyMatch, toggled;
      for (p in queries) {
        match = _win$1.matchMedia(queries[p]).matches;
        match && (anyMatch = 1);
        if (match !== conditions[p]) {
          conditions[p] = match;
          toggled = 1;
        }
      }
      if (toggled) {
        c.revert();
        anyMatch && matches.push(c);
      }
    });
    _dispatch("matchMediaRevert");
    matches.forEach(function(c) {
      return c.onMatch(c, function(func) {
        return c.add(null, func);
      });
    });
    _lastMediaTime = time;
    _dispatch("matchMedia");
  }
}, "_onMediaChange");
var Context = /* @__PURE__ */ function() {
  function Context2(func, scope) {
    this.selector = scope && selector(scope);
    this.data = [];
    this._r = [];
    this.isReverted = false;
    this.id = _contextID++;
    func && this.add(func);
  }
  __name(Context2, "Context");
  var _proto5 = Context2.prototype;
  _proto5.add = /* @__PURE__ */ __name(function add(name, func, scope) {
    if (_isFunction(name)) {
      scope = func;
      func = name;
      name = _isFunction;
    }
    var self = this, f = /* @__PURE__ */ __name(function f2() {
      var prev = _context, prevSelector = self.selector, result;
      prev && prev !== self && prev.data.push(self);
      scope && (self.selector = selector(scope));
      _context = self;
      result = func.apply(self, arguments);
      _isFunction(result) && self._r.push(result);
      _context = prev;
      self.selector = prevSelector;
      self.isReverted = false;
      return result;
    }, "f");
    self.last = f;
    return name === _isFunction ? f(self, function(func2) {
      return self.add(null, func2);
    }) : name ? self[name] = f : f;
  }, "add");
  _proto5.ignore = /* @__PURE__ */ __name(function ignore(func) {
    var prev = _context;
    _context = null;
    func(this);
    _context = prev;
  }, "ignore");
  _proto5.getTweens = /* @__PURE__ */ __name(function getTweens() {
    var a = [];
    this.data.forEach(function(e) {
      return e instanceof Context2 ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
    });
    return a;
  }, "getTweens");
  _proto5.clear = /* @__PURE__ */ __name(function clear() {
    this._r.length = this.data.length = 0;
  }, "clear");
  _proto5.kill = /* @__PURE__ */ __name(function kill(revert, matchMedia2) {
    var _this4 = this;
    if (revert) {
      (function() {
        var tweens = _this4.getTweens(), i2 = _this4.data.length, t;
        while (i2--) {
          t = _this4.data[i2];
          if (t.data === "isFlip") {
            t.revert();
            t.getChildren(true, true, false).forEach(function(tween) {
              return tweens.splice(tweens.indexOf(tween), 1);
            });
          }
        }
        tweens.map(function(t2) {
          return {
            g: t2._dur || t2._delay || t2._sat && !t2._sat.vars.immediateRender ? t2.globalTime(0) : -Infinity,
            t: t2
          };
        }).sort(function(a, b) {
          return b.g - a.g || -Infinity;
        }).forEach(function(o) {
          return o.t.revert(revert);
        });
        i2 = _this4.data.length;
        while (i2--) {
          t = _this4.data[i2];
          if (t instanceof Timeline) {
            if (t.data !== "nested") {
              t.scrollTrigger && t.scrollTrigger.revert();
              t.kill();
            }
          } else {
            !(t instanceof Tween) && t.revert && t.revert(revert);
          }
        }
        _this4._r.forEach(function(f) {
          return f(revert, _this4);
        });
        _this4.isReverted = true;
      })();
    } else {
      this.data.forEach(function(e) {
        return e.kill && e.kill();
      });
    }
    this.clear();
    if (matchMedia2) {
      var i = _media.length;
      while (i--) {
        _media[i].id === this.id && _media.splice(i, 1);
      }
    }
  }, "kill");
  _proto5.revert = /* @__PURE__ */ __name(function revert(config3) {
    this.kill(config3 || {});
  }, "revert");
  return Context2;
}();
var MatchMedia = /* @__PURE__ */ function() {
  function MatchMedia2(scope) {
    this.contexts = [];
    this.scope = scope;
    _context && _context.data.push(this);
  }
  __name(MatchMedia2, "MatchMedia");
  var _proto6 = MatchMedia2.prototype;
  _proto6.add = /* @__PURE__ */ __name(function add(conditions, func, scope) {
    _isObject(conditions) || (conditions = {
      matches: conditions
    });
    var context3 = new Context(0, scope || this.scope), cond = context3.conditions = {}, mq, p, active;
    _context && !context3.selector && (context3.selector = _context.selector);
    this.contexts.push(context3);
    func = context3.add("onMatch", func);
    context3.queries = conditions;
    for (p in conditions) {
      if (p === "all") {
        active = 1;
      } else {
        mq = _win$1.matchMedia(conditions[p]);
        if (mq) {
          _media.indexOf(context3) < 0 && _media.push(context3);
          (cond[p] = mq.matches) && (active = 1);
          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
        }
      }
    }
    active && func(context3, function(f) {
      return context3.add(null, f);
    });
    return this;
  }, "add");
  _proto6.revert = /* @__PURE__ */ __name(function revert(config3) {
    this.kill(config3 || {});
  }, "revert");
  _proto6.kill = /* @__PURE__ */ __name(function kill(revert) {
    this.contexts.forEach(function(c) {
      return c.kill(revert, true);
    });
  }, "kill");
  return MatchMedia2;
}();
var _gsap = {
  registerPlugin: /* @__PURE__ */ __name(function registerPlugin() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    args.forEach(function(config3) {
      return _createPlugin(config3);
    });
  }, "registerPlugin"),
  timeline: /* @__PURE__ */ __name(function timeline(vars) {
    return new Timeline(vars);
  }, "timeline"),
  getTweensOf: /* @__PURE__ */ __name(function getTweensOf(targets, onlyActive) {
    return _globalTimeline.getTweensOf(targets, onlyActive);
  }, "getTweensOf"),
  getProperty: /* @__PURE__ */ __name(function getProperty(target, property, unit, uncache) {
    _isString(target) && (target = toArray(target)[0]);
    var getter = _getCache(target || {}).get, format = unit ? _passThrough : _numericIfPossible;
    unit === "native" && (unit = "");
    return !target ? target : !property ? function(property2, unit2, uncache2) {
      return format((_plugins[property2] && _plugins[property2].get || getter)(target, property2, unit2, uncache2));
    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
  }, "getProperty"),
  quickSetter: /* @__PURE__ */ __name(function quickSetter(target, property, unit) {
    target = toArray(target);
    if (target.length > 1) {
      var setters = target.map(function(t) {
        return gsap.quickSetter(t, property, unit);
      }), l = setters.length;
      return function(value) {
        var i = l;
        while (i--) {
          setters[i](value);
        }
      };
    }
    target = target[0] || {};
    var Plugin = _plugins[property], cache = _getCache(target), p = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
      var p2 = new Plugin();
      _quickTween._pt = 0;
      p2.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
      p2.render(1, p2);
      _quickTween._pt && _renderPropTweens(1, _quickTween);
    } : cache.set(target, p);
    return Plugin ? setter : function(value) {
      return setter(target, p, unit ? value + unit : value, cache, 1);
    };
  }, "quickSetter"),
  quickTo: /* @__PURE__ */ __name(function quickTo(target, property, vars) {
    var _setDefaults22;
    var tween = gsap.to(target, _setDefaults((_setDefaults22 = {}, _setDefaults22[property] = "+=0.1", _setDefaults22.paused = true, _setDefaults22.stagger = 0, _setDefaults22), vars || {})), func = /* @__PURE__ */ __name(function func2(value, start, startIsRelative) {
      return tween.resetTo(property, value, start, startIsRelative);
    }, "func");
    func.tween = tween;
    return func;
  }, "quickTo"),
  isTweening: /* @__PURE__ */ __name(function isTweening(targets) {
    return _globalTimeline.getTweensOf(targets, true).length > 0;
  }, "isTweening"),
  defaults: /* @__PURE__ */ __name(function defaults(value) {
    value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
    return _mergeDeep(_defaults, value || {});
  }, "defaults"),
  config: /* @__PURE__ */ __name(function config2(value) {
    return _mergeDeep(_config, value || {});
  }, "config"),
  registerEffect: /* @__PURE__ */ __name(function registerEffect(_ref3) {
    var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults2 = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
    (plugins || "").split(",").forEach(function(pluginName) {
      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
    });
    _effects[name] = function(targets, vars, tl) {
      return effect(toArray(targets), _setDefaults(vars || {}, defaults2), tl);
    };
    if (extendTimeline) {
      Timeline.prototype[name] = function(targets, vars, position) {
        return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
      };
    }
  }, "registerEffect"),
  registerEase: /* @__PURE__ */ __name(function registerEase(name, ease) {
    _easeMap[name] = _parseEase(ease);
  }, "registerEase"),
  parseEase: /* @__PURE__ */ __name(function parseEase(ease, defaultEase) {
    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
  }, "parseEase"),
  getById: /* @__PURE__ */ __name(function getById(id) {
    return _globalTimeline.getById(id);
  }, "getById"),
  exportRoot: /* @__PURE__ */ __name(function exportRoot(vars, includeDelayedCalls) {
    if (vars === void 0) {
      vars = {};
    }
    var tl = new Timeline(vars), child, next;
    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
    _globalTimeline.remove(tl);
    tl._dp = 0;
    tl._time = tl._tTime = _globalTimeline._time;
    child = _globalTimeline._first;
    while (child) {
      next = child._next;
      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
        _addToTimeline(tl, child, child._start - child._delay);
      }
      child = next;
    }
    _addToTimeline(_globalTimeline, tl, 0);
    return tl;
  }, "exportRoot"),
  context: /* @__PURE__ */ __name(function context(func, scope) {
    return func ? new Context(func, scope) : _context;
  }, "context"),
  matchMedia: /* @__PURE__ */ __name(function matchMedia(scope) {
    return new MatchMedia(scope);
  }, "matchMedia"),
  matchMediaRefresh: /* @__PURE__ */ __name(function matchMediaRefresh() {
    return _media.forEach(function(c) {
      var cond = c.conditions, found, p;
      for (p in cond) {
        if (cond[p]) {
          cond[p] = false;
          found = 1;
        }
      }
      found && c.revert();
    }) || _onMediaChange();
  }, "matchMediaRefresh"),
  addEventListener: /* @__PURE__ */ __name(function addEventListener(type, callback) {
    var a = _listeners[type] || (_listeners[type] = []);
    ~a.indexOf(callback) || a.push(callback);
  }, "addEventListener"),
  removeEventListener: /* @__PURE__ */ __name(function removeEventListener(type, callback) {
    var a = _listeners[type], i = a && a.indexOf(callback);
    i >= 0 && a.splice(i, 1);
  }, "removeEventListener"),
  utils: {
    wrap,
    wrapYoyo,
    distribute,
    random,
    snap,
    normalize,
    getUnit,
    clamp,
    splitColor,
    toArray,
    selector,
    mapRange,
    pipe,
    unitize,
    interpolate,
    shuffle
  },
  install: _install,
  effects: _effects,
  ticker: _ticker,
  updateRoot: Timeline.updateRoot,
  plugins: _plugins,
  globalTimeline: _globalTimeline,
  core: {
    PropTween,
    globals: _addGlobal,
    Tween,
    Timeline,
    Animation,
    getCache: _getCache,
    _removeLinkedListItem,
    reverting: /* @__PURE__ */ __name(function reverting() {
      return _reverting$1;
    }, "reverting"),
    context: /* @__PURE__ */ __name(function context2(toAdd) {
      if (toAdd && _context) {
        _context.data.push(toAdd);
        toAdd._ctx = _context;
      }
      return _context;
    }, "context"),
    suppressOverwrites: /* @__PURE__ */ __name(function suppressOverwrites(value) {
      return _suppressOverwrites = value;
    }, "suppressOverwrites")
  }
};
_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function(name) {
  return _gsap[name] = Tween[name];
});
_ticker.add(Timeline.updateRoot);
_quickTween = _gsap.to({}, {
  duration: 0
});
var _getPluginPropTween = /* @__PURE__ */ __name(function _getPluginPropTween2(plugin, prop) {
  var pt = plugin._pt;
  while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
    pt = pt._next;
  }
  return pt;
}, "_getPluginPropTween"), _addModifiers = /* @__PURE__ */ __name(function _addModifiers2(tween, modifiers) {
  var targets = tween._targets, p, i, pt;
  for (p in modifiers) {
    i = targets.length;
    while (i--) {
      pt = tween._ptLookup[i][p];
      if (pt && (pt = pt.d)) {
        if (pt._pt) {
          pt = _getPluginPropTween(pt, p);
        }
        pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
      }
    }
  }
}, "_addModifiers"), _buildModifierPlugin = /* @__PURE__ */ __name(function _buildModifierPlugin2(name, modifier) {
  return {
    name,
    headless: 1,
    rawVars: 1,
    //don't pre-process function-based values or "random()" strings.
    init: /* @__PURE__ */ __name(function init5(target, vars, tween) {
      tween._onInit = function(tween2) {
        var temp, p;
        if (_isString(vars)) {
          temp = {};
          _forEachName(vars, function(name2) {
            return temp[name2] = 1;
          });
          vars = temp;
        }
        if (modifier) {
          temp = {};
          for (p in vars) {
            temp[p] = modifier(vars[p]);
          }
          vars = temp;
        }
        _addModifiers(tween2, vars);
      };
    }, "init")
  };
}, "_buildModifierPlugin");
var gsap = _gsap.registerPlugin({
  name: "attr",
  init: /* @__PURE__ */ __name(function init(target, vars, tween, index, targets) {
    var p, pt, v;
    this.tween = tween;
    for (p in vars) {
      v = target.getAttribute(p) || "";
      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
      pt.op = p;
      pt.b = v;
      this._props.push(p);
    }
  }, "init"),
  render: /* @__PURE__ */ __name(function render(ratio, data) {
    var pt = data._pt;
    while (pt) {
      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
      pt = pt._next;
    }
  }, "render")
}, {
  name: "endArray",
  headless: 1,
  init: /* @__PURE__ */ __name(function init2(target, value) {
    var i = value.length;
    while (i--) {
      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
    }
  }, "init")
}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
Tween.version = Timeline.version = gsap.version = "3.13.0";
_coreReady = 1;
_windowExists$1() && _wake();
_easeMap.Power0;
_easeMap.Power1;
_easeMap.Power2;
_easeMap.Power3;
_easeMap.Power4;
_easeMap.Linear;
_easeMap.Quad;
_easeMap.Cubic;
_easeMap.Quart;
_easeMap.Quint;
_easeMap.Strong;
_easeMap.Elastic;
_easeMap.Back;
_easeMap.SteppedEase;
_easeMap.Bounce;
_easeMap.Sine;
_easeMap.Expo;
_easeMap.Circ;
/*!
 * CSSPlugin 3.13.0
 * https://gsap.com
 *
 * Copyright 2008-2025, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license
 * @author: Jack Doyle, jack@greensock.com
*/
var _win, _doc, _docElement, _pluginInitted, _tempDiv, _recentSetterPlugin, _reverting, _windowExists2 = /* @__PURE__ */ __name(function _windowExists3() {
  return typeof window !== "undefined";
}, "_windowExists"), _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _atan2 = Math.atan2, _bigNum = 1e8, _capsExp = /([A-Z])/g, _horizontalExp = /(left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
  autoAlpha: "opacity,visibility",
  scale: "scaleX,scaleY",
  alpha: "opacity"
}, _renderCSSProp = /* @__PURE__ */ __name(function _renderCSSProp2(ratio, data) {
  return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, "_renderCSSProp"), _renderPropWithEnd = /* @__PURE__ */ __name(function _renderPropWithEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u, data);
}, "_renderPropWithEnd"), _renderCSSPropWithBeginning = /* @__PURE__ */ __name(function _renderCSSPropWithBeginning2(ratio, data) {
  return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 1e4) / 1e4 + data.u : data.b, data);
}, "_renderCSSPropWithBeginning"), _renderRoundedCSSProp = /* @__PURE__ */ __name(function _renderRoundedCSSProp2(ratio, data) {
  var value = data.s + data.c * ratio;
  data.set(data.t, data.p, ~~(value + (value < 0 ? -0.5 : 0.5)) + data.u, data);
}, "_renderRoundedCSSProp"), _renderNonTweeningValue = /* @__PURE__ */ __name(function _renderNonTweeningValue2(ratio, data) {
  return data.set(data.t, data.p, ratio ? data.e : data.b, data);
}, "_renderNonTweeningValue"), _renderNonTweeningValueOnlyAtEnd = /* @__PURE__ */ __name(function _renderNonTweeningValueOnlyAtEnd2(ratio, data) {
  return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
}, "_renderNonTweeningValueOnlyAtEnd"), _setterCSSStyle = /* @__PURE__ */ __name(function _setterCSSStyle2(target, property, value) {
  return target.style[property] = value;
}, "_setterCSSStyle"), _setterCSSProp = /* @__PURE__ */ __name(function _setterCSSProp2(target, property, value) {
  return target.style.setProperty(property, value);
}, "_setterCSSProp"), _setterTransform = /* @__PURE__ */ __name(function _setterTransform2(target, property, value) {
  return target._gsap[property] = value;
}, "_setterTransform"), _setterScale = /* @__PURE__ */ __name(function _setterScale2(target, property, value) {
  return target._gsap.scaleX = target._gsap.scaleY = value;
}, "_setterScale"), _setterScaleWithRender = /* @__PURE__ */ __name(function _setterScaleWithRender2(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache.scaleX = cache.scaleY = value;
  cache.renderTransform(ratio, cache);
}, "_setterScaleWithRender"), _setterTransformWithRender = /* @__PURE__ */ __name(function _setterTransformWithRender2(target, property, value, data, ratio) {
  var cache = target._gsap;
  cache[property] = value;
  cache.renderTransform(ratio, cache);
}, "_setterTransformWithRender"), _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _saveStyle = /* @__PURE__ */ __name(function _saveStyle2(property, isNotCSS) {
  var _this = this;
  var target = this.target, style = target.style, cache = target._gsap;
  if (property in _transformProps && style) {
    this.tfm = this.tfm || {};
    if (property !== "transform") {
      property = _propertyAliases[property] || property;
      ~property.indexOf(",") ? property.split(",").forEach(function(a) {
        return _this.tfm[a] = _get(target, a);
      }) : this.tfm[property] = cache.x ? cache[property] : _get(target, property);
      property === _transformOriginProp && (this.tfm.zOrigin = cache.zOrigin);
    } else {
      return _propertyAliases.transform.split(",").forEach(function(p) {
        return _saveStyle2.call(_this, p, isNotCSS);
      });
    }
    if (this.props.indexOf(_transformProp) >= 0) {
      return;
    }
    if (cache.svg) {
      this.svgo = target.getAttribute("data-svg-origin");
      this.props.push(_transformOriginProp, isNotCSS, "");
    }
    property = _transformProp;
  }
  (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
}, "_saveStyle"), _removeIndependentTransforms = /* @__PURE__ */ __name(function _removeIndependentTransforms2(style) {
  if (style.translate) {
    style.removeProperty("translate");
    style.removeProperty("scale");
    style.removeProperty("rotate");
  }
}, "_removeIndependentTransforms"), _revertStyle = /* @__PURE__ */ __name(function _revertStyle2() {
  var props = this.props, target = this.target, style = target.style, cache = target._gsap, i, p;
  for (i = 0; i < props.length; i += 3) {
    if (!props[i + 1]) {
      props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].substr(0, 2) === "--" ? props[i] : props[i].replace(_capsExp, "-$1").toLowerCase());
    } else if (props[i + 1] === 2) {
      target[props[i]](props[i + 2]);
    } else {
      target[props[i]] = props[i + 2];
    }
  }
  if (this.tfm) {
    for (p in this.tfm) {
      cache[p] = this.tfm[p];
    }
    if (cache.svg) {
      cache.renderTransform();
      target.setAttribute("data-svg-origin", this.svgo || "");
    }
    i = _reverting();
    if ((!i || !i.isStart) && !style[_transformProp]) {
      _removeIndependentTransforms(style);
      if (cache.zOrigin && style[_transformOriginProp]) {
        style[_transformOriginProp] += " " + cache.zOrigin + "px";
        cache.zOrigin = 0;
        cache.renderTransform();
      }
      cache.uncache = 1;
    }
  }
}, "_revertStyle"), _getStyleSaver = /* @__PURE__ */ __name(function _getStyleSaver2(target, properties) {
  var saver = {
    target,
    props: [],
    revert: _revertStyle,
    save: _saveStyle
  };
  target._gsap || gsap.core.getCache(target);
  properties && target.style && target.nodeType && properties.split(",").forEach(function(p) {
    return saver.save(p);
  });
  return saver;
}, "_getStyleSaver"), _supports3D, _createElement = /* @__PURE__ */ __name(function _createElement2(type, ns) {
  var e = _doc.createElementNS ? _doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc.createElement(type);
  return e && e.style ? e : _doc.createElement(type);
}, "_createElement"), _getComputedProperty = /* @__PURE__ */ __name(function _getComputedProperty2(target, property, skipPrefixFallback) {
  var cs = getComputedStyle(target);
  return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty2(target, _checkPropPrefix(property) || property, 1) || "";
}, "_getComputedProperty"), _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = /* @__PURE__ */ __name(function _checkPropPrefix2(property, element, preferPrefix) {
  var e = element || _tempDiv, s = e.style, i = 5;
  if (property in s && !preferPrefix) {
    return property;
  }
  property = property.charAt(0).toUpperCase() + property.substr(1);
  while (i-- && !(_prefixes[i] + property in s)) {
  }
  return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
}, "_checkPropPrefix"), _initCore = /* @__PURE__ */ __name(function _initCore2() {
  if (_windowExists2() && window.document) {
    _win = window;
    _doc = _win.document;
    _docElement = _doc.documentElement;
    _tempDiv = _createElement("div") || {
      style: {}
    };
    _createElement("div");
    _transformProp = _checkPropPrefix(_transformProp);
    _transformOriginProp = _transformProp + "Origin";
    _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
    _supports3D = !!_checkPropPrefix("perspective");
    _reverting = gsap.core.reverting;
    _pluginInitted = 1;
  }
}, "_initCore"), _getReparentedCloneBBox = /* @__PURE__ */ __name(function _getReparentedCloneBBox2(target) {
  var owner = target.ownerSVGElement, svg = _createElement("svg", owner && owner.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), clone = target.cloneNode(true), bbox;
  clone.style.display = "block";
  svg.appendChild(clone);
  _docElement.appendChild(svg);
  try {
    bbox = clone.getBBox();
  } catch (e) {
  }
  svg.removeChild(clone);
  _docElement.removeChild(svg);
  return bbox;
}, "_getReparentedCloneBBox"), _getAttributeFallbacks = /* @__PURE__ */ __name(function _getAttributeFallbacks2(target, attributesArray) {
  var i = attributesArray.length;
  while (i--) {
    if (target.hasAttribute(attributesArray[i])) {
      return target.getAttribute(attributesArray[i]);
    }
  }
}, "_getAttributeFallbacks"), _getBBox = /* @__PURE__ */ __name(function _getBBox2(target) {
  var bounds, cloned;
  try {
    bounds = target.getBBox();
  } catch (error) {
    bounds = _getReparentedCloneBBox(target);
    cloned = 1;
  }
  bounds && (bounds.width || bounds.height) || cloned || (bounds = _getReparentedCloneBBox(target));
  return bounds && !bounds.width && !bounds.x && !bounds.y ? {
    x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
    y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
    width: 0,
    height: 0
  } : bounds;
}, "_getBBox"), _isSVG = /* @__PURE__ */ __name(function _isSVG2(e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
}, "_isSVG"), _removeProperty = /* @__PURE__ */ __name(function _removeProperty2(target, property) {
  if (property) {
    var style = target.style, first2Chars;
    if (property in _transformProps && property !== _transformOriginProp) {
      property = _transformProp;
    }
    if (style.removeProperty) {
      first2Chars = property.substr(0, 2);
      if (first2Chars === "ms" || property.substr(0, 6) === "webkit") {
        property = "-" + property;
      }
      style.removeProperty(first2Chars === "--" ? property : property.replace(_capsExp, "-$1").toLowerCase());
    } else {
      style.removeAttribute(property);
    }
  }
}, "_removeProperty"), _addNonTweeningPT = /* @__PURE__ */ __name(function _addNonTweeningPT2(plugin, target, property, beginning, end, onlySetAtEnd) {
  var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
  plugin._pt = pt;
  pt.b = beginning;
  pt.e = end;
  plugin._props.push(property);
  return pt;
}, "_addNonTweeningPT"), _nonConvertibleUnits = {
  deg: 1,
  rad: 1,
  turn: 1
}, _nonStandardLayouts = {
  grid: 1,
  flex: 1
}, _convertToUnit = /* @__PURE__ */ __name(function _convertToUnit2(target, property, value, unit) {
  var curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = target.tagName.toLowerCase() === "svg", measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = unit === "px", toPercent = unit === "%", px, parent, cache, isSVG;
  if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
    return curValue;
  }
  curUnit !== "px" && !toPixels && (curValue = _convertToUnit2(target, property, value, "px"));
  isSVG = target.getCTM && _isSVG(target);
  if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
    px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
    return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
  }
  style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
  parent = unit !== "rem" && ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
  if (isSVG) {
    parent = (target.ownerSVGElement || {}).parentNode;
  }
  if (!parent || parent === _doc || !parent.appendChild) {
    parent = _doc.body;
  }
  cache = parent._gsap;
  if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
    return _round(curValue / cache.width * amount);
  } else {
    if (toPercent && (property === "height" || property === "width")) {
      var v = target.style[property];
      target.style[property] = amount + unit;
      px = target[measureProperty];
      v ? target.style[property] = v : _removeProperty(target, property);
    } else {
      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
      parent === target && (style.position = "static");
      parent.appendChild(_tempDiv);
      px = _tempDiv[measureProperty];
      parent.removeChild(_tempDiv);
      style.position = "absolute";
    }
    if (horizontal && toPercent) {
      cache = _getCache(parent);
      cache.time = _ticker.time;
      cache.width = parent[measureProperty];
    }
  }
  return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
}, "_convertToUnit"), _get = /* @__PURE__ */ __name(function _get2(target, property, unit, uncache) {
  var value;
  _pluginInitted || _initCore();
  if (property in _propertyAliases && property !== "transform") {
    property = _propertyAliases[property];
    if (~property.indexOf(",")) {
      property = property.split(",")[0];
    }
  }
  if (_transformProps[property] && property !== "transform") {
    value = _parseTransform(target, uncache);
    value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
  } else {
    value = target.style[property];
    if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
      value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0);
    }
  }
  return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
}, "_get"), _tweenComplexCSSString = /* @__PURE__ */ __name(function _tweenComplexCSSString2(target, prop, start, end) {
  if (!start || start === "none") {
    var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
    if (s && s !== start) {
      prop = p;
      start = s;
    } else if (prop === "borderColor") {
      start = _getComputedProperty(target, "borderTopColor");
    }
  }
  var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0, a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues;
  pt.b = start;
  pt.e = end;
  start += "";
  end += "";
  if (end.substring(0, 6) === "var(--") {
    end = _getComputedProperty(target, end.substring(4, end.indexOf(")")));
  }
  if (end === "auto") {
    startValue = target.style[prop];
    target.style[prop] = end;
    end = _getComputedProperty(target, prop) || end;
    startValue ? target.style[prop] = startValue : _removeProperty(target, prop);
  }
  a = [start, end];
  _colorStringFilter(a);
  start = a[0];
  end = a[1];
  startValues = start.match(_numWithUnitExp) || [];
  endValues = end.match(_numWithUnitExp) || [];
  if (endValues.length) {
    while (result = _numWithUnitExp.exec(end)) {
      endValue = result[0];
      chunk = end.substring(index, result.index);
      if (color) {
        color = (color + 1) % 5;
      } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
        color = 1;
      }
      if (endValue !== (startValue = startValues[matchIndex++] || "")) {
        startNum = parseFloat(startValue) || 0;
        startUnit = startValue.substr((startNum + "").length);
        endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
        endNum = parseFloat(endValue);
        endUnit = endValue.substr((endNum + "").length);
        index = _numWithUnitExp.lastIndex - endUnit.length;
        if (!endUnit) {
          endUnit = endUnit || _config.units[prop] || startUnit;
          if (index === end.length) {
            end += endUnit;
            pt.e += endUnit;
          }
        }
        if (startUnit !== endUnit) {
          startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
        }
        pt._pt = {
          _next: pt._pt,
          p: chunk || matchIndex === 1 ? chunk : ",",
          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
          s: startNum,
          c: endNum - startNum,
          m: color && color < 4 || prop === "zIndex" ? Math.round : 0
        };
      }
    }
    pt.c = index < end.length ? end.substring(index, end.length) : "";
  } else {
    pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
  }
  _relExp.test(end) && (pt.e = 0);
  this._pt = pt;
  return pt;
}, "_tweenComplexCSSString"), _keywordToPercent = {
  top: "0%",
  bottom: "100%",
  left: "0%",
  right: "100%",
  center: "50%"
}, _convertKeywordsToPercentages = /* @__PURE__ */ __name(function _convertKeywordsToPercentages2(value) {
  var split = value.split(" "), x = split[0], y = split[1] || "50%";
  if (x === "top" || x === "bottom" || y === "left" || y === "right") {
    value = x;
    x = y;
    y = value;
  }
  split[0] = _keywordToPercent[x] || x;
  split[1] = _keywordToPercent[y] || y;
  return split.join(" ");
}, "_convertKeywordsToPercentages"), _renderClearProps = /* @__PURE__ */ __name(function _renderClearProps2(ratio, data) {
  if (data.tween && data.tween._time === data.tween._dur) {
    var target = data.t, style = target.style, props = data.u, cache = target._gsap, prop, clearTransforms, i;
    if (props === "all" || props === true) {
      style.cssText = "";
      clearTransforms = 1;
    } else {
      props = props.split(",");
      i = props.length;
      while (--i > -1) {
        prop = props[i];
        if (_transformProps[prop]) {
          clearTransforms = 1;
          prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp;
        }
        _removeProperty(target, prop);
      }
    }
    if (clearTransforms) {
      _removeProperty(target, _transformProp);
      if (cache) {
        cache.svg && target.removeAttribute("transform");
        style.scale = style.rotate = style.translate = "none";
        _parseTransform(target, 1);
        cache.uncache = 1;
        _removeIndependentTransforms(style);
      }
    }
  }
}, "_renderClearProps"), _specialProps = {
  clearProps: /* @__PURE__ */ __name(function clearProps(plugin, target, property, endValue, tween) {
    if (tween.data !== "isFromStart") {
      var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
      pt.u = endValue;
      pt.pr = -10;
      pt.tween = tween;
      plugin._props.push(property);
      return 1;
    }
  }, "clearProps")
  /* className feature (about 0.4kb gzipped).
  , className(plugin, target, property, endValue, tween) {
  	let _renderClassName = (ratio, data) => {
  			data.css.render(ratio, data.css);
  			if (!ratio || ratio === 1) {
  				let inline = data.rmv,
  					target = data.t,
  					p;
  				target.setAttribute("class", ratio ? data.e : data.b);
  				for (p in inline) {
  					_removeProperty(target, p);
  				}
  			}
  		},
  		_getAllStyles = (target) => {
  			let styles = {},
  				computed = getComputedStyle(target),
  				p;
  			for (p in computed) {
  				if (isNaN(p) && p !== "cssText" && p !== "length") {
  					styles[p] = computed[p];
  				}
  			}
  			_setDefaults(styles, _parseTransform(target, 1));
  			return styles;
  		},
  		startClassList = target.getAttribute("class"),
  		style = target.style,
  		cssText = style.cssText,
  		cache = target._gsap,
  		classPT = cache.classPT,
  		inlineToRemoveAtEnd = {},
  		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
  		changingVars = {},
  		startVars = _getAllStyles(target),
  		transformRelated = /(transform|perspective)/i,
  		endVars, p;
  	if (classPT) {
  		classPT.r(1, classPT.d);
  		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
  	}
  	target.setAttribute("class", data.e);
  	endVars = _getAllStyles(target, true);
  	target.setAttribute("class", startClassList);
  	for (p in endVars) {
  		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
  			changingVars[p] = endVars[p];
  			if (!style[p] && style[p] !== "0") {
  				inlineToRemoveAtEnd[p] = 1;
  			}
  		}
  	}
  	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
  	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://gsap.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
  		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
  	}
  	_parseTransform(target, true); //to clear the caching of transforms
  	data.css = new gsap.plugins.css();
  	data.css.init(target, changingVars, tween);
  	plugin._props.push(...data.css._props);
  	return 1;
  }
  */
}, _identity2DMatrix = [1, 0, 0, 1, 0, 0], _rotationalProperties = {}, _isNullTransform = /* @__PURE__ */ __name(function _isNullTransform2(value) {
  return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
}, "_isNullTransform"), _getComputedTransformMatrixAsArray = /* @__PURE__ */ __name(function _getComputedTransformMatrixAsArray2(target) {
  var matrixString = _getComputedProperty(target, _transformProp);
  return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
}, "_getComputedTransformMatrixAsArray"), _getMatrix = /* @__PURE__ */ __name(function _getMatrix2(target, force2D) {
  var cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target), parent, nextSibling, temp, addedToDOM;
  if (cache.svg && target.getAttribute("transform")) {
    temp = target.transform.baseVal.consolidate().matrix;
    matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
    return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
  } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
    temp = style.display;
    style.display = "block";
    parent = target.parentNode;
    if (!parent || !target.offsetParent && !target.getBoundingClientRect().width) {
      addedToDOM = 1;
      nextSibling = target.nextElementSibling;
      _docElement.appendChild(target);
    }
    matrix = _getComputedTransformMatrixAsArray(target);
    temp ? style.display = temp : _removeProperty(target, "display");
    if (addedToDOM) {
      nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
    }
  }
  return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
}, "_getMatrix"), _applySVGOrigin = /* @__PURE__ */ __name(function _applySVGOrigin2(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
  var cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0, bounds, determinant, x, y;
  if (!originIsAbsolute) {
    bounds = _getBBox(target);
    xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
    yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
  } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
    x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
    y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
    xOrigin = x;
    yOrigin = y;
  }
  if (smooth || smooth !== false && cache.smooth) {
    tx = xOrigin - xOriginOld;
    ty = yOrigin - yOriginOld;
    cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
    cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
  } else {
    cache.xOffset = cache.yOffset = 0;
  }
  cache.xOrigin = xOrigin;
  cache.yOrigin = yOrigin;
  cache.smooth = !!smooth;
  cache.origin = origin;
  cache.originIsAbsolute = !!originIsAbsolute;
  target.style[_transformOriginProp] = "0px 0px";
  if (pluginToAddPropTweensTo) {
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
    _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
  }
  target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
}, "_applySVGOrigin"), _parseTransform = /* @__PURE__ */ __name(function _parseTransform2(target, uncache) {
  var cache = target._gsap || new GSCache(target);
  if ("x" in cache && !uncache && !cache.uncache) {
    return cache;
  }
  var style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0", x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32;
  x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
  scaleX = scaleY = 1;
  cache.svg = !!(target.getCTM && _isSVG(target));
  if (cs.translate) {
    if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
      style[_transformProp] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp] !== "none" ? cs[_transformProp] : "");
    }
    style.scale = style.rotate = style.translate = "none";
  }
  matrix = _getMatrix(target, cache.svg);
  if (cache.svg) {
    if (cache.uncache) {
      t2 = target.getBBox();
      origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
      t1 = "";
    } else {
      t1 = !uncache && target.getAttribute("data-svg-origin");
    }
    _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
  }
  xOrigin = cache.xOrigin || 0;
  yOrigin = cache.yOrigin || 0;
  if (matrix !== _identity2DMatrix) {
    a = matrix[0];
    b = matrix[1];
    c = matrix[2];
    d = matrix[3];
    x = a12 = matrix[4];
    y = a22 = matrix[5];
    if (matrix.length === 6) {
      scaleX = Math.sqrt(a * a + b * b);
      scaleY = Math.sqrt(d * d + c * c);
      rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
      skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
      skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
      if (cache.svg) {
        x -= xOrigin - (xOrigin * a + yOrigin * c);
        y -= yOrigin - (xOrigin * b + yOrigin * d);
      }
    } else {
      a32 = matrix[6];
      a42 = matrix[7];
      a13 = matrix[8];
      a23 = matrix[9];
      a33 = matrix[10];
      a43 = matrix[11];
      x = matrix[12];
      y = matrix[13];
      z = matrix[14];
      angle = _atan2(a32, a33);
      rotationX = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a12 * cos + a13 * sin;
        t2 = a22 * cos + a23 * sin;
        t3 = a32 * cos + a33 * sin;
        a13 = a12 * -sin + a13 * cos;
        a23 = a22 * -sin + a23 * cos;
        a33 = a32 * -sin + a33 * cos;
        a43 = a42 * -sin + a43 * cos;
        a12 = t1;
        a22 = t2;
        a32 = t3;
      }
      angle = _atan2(-c, a33);
      rotationY = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(-angle);
        sin = Math.sin(-angle);
        t1 = a * cos - a13 * sin;
        t2 = b * cos - a23 * sin;
        t3 = c * cos - a33 * sin;
        a43 = d * sin + a43 * cos;
        a = t1;
        b = t2;
        c = t3;
      }
      angle = _atan2(b, a);
      rotation = angle * _RAD2DEG;
      if (angle) {
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        t1 = a * cos + b * sin;
        t2 = a12 * cos + a22 * sin;
        b = b * cos - a * sin;
        a22 = a22 * cos - a12 * sin;
        a = t1;
        a12 = t2;
      }
      if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
        rotationX = rotation = 0;
        rotationY = 180 - rotationY;
      }
      scaleX = _round(Math.sqrt(a * a + b * b + c * c));
      scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
      angle = _atan2(a12, a22);
      skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
      perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
    }
    if (cache.svg) {
      t1 = target.getAttribute("transform");
      cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
      t1 && target.setAttribute("transform", t1);
    }
  }
  if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
    if (invertedScaleX) {
      scaleX *= -1;
      skewX += rotation <= 0 ? 180 : -180;
      rotation += rotation <= 0 ? 180 : -180;
    } else {
      scaleY *= -1;
      skewX += skewX <= 0 ? 180 : -180;
    }
  }
  uncache = uncache || cache.uncache;
  cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
  cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
  cache.z = z + px;
  cache.scaleX = _round(scaleX);
  cache.scaleY = _round(scaleY);
  cache.rotation = _round(rotation) + deg;
  cache.rotationX = _round(rotationX) + deg;
  cache.rotationY = _round(rotationY) + deg;
  cache.skewX = skewX + deg;
  cache.skewY = skewY + deg;
  cache.transformPerspective = perspective + px;
  if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || !uncache && cache.zOrigin || 0) {
    style[_transformOriginProp] = _firstTwoOnly(origin);
  }
  cache.xOffset = cache.yOffset = 0;
  cache.force3D = _config.force3D;
  cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
  cache.uncache = 0;
  return cache;
}, "_parseTransform"), _firstTwoOnly = /* @__PURE__ */ __name(function _firstTwoOnly2(value) {
  return (value = value.split(" "))[0] + " " + value[1];
}, "_firstTwoOnly"), _addPxTranslate = /* @__PURE__ */ __name(function _addPxTranslate2(target, start, value) {
  var unit = getUnit(start);
  return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
}, "_addPxTranslate"), _renderNon3DTransforms = /* @__PURE__ */ __name(function _renderNon3DTransforms2(ratio, cache) {
  cache.z = "0px";
  cache.rotationY = cache.rotationX = "0deg";
  cache.force3D = 0;
  _renderCSSTransforms(ratio, cache);
}, "_renderNon3DTransforms"), _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = /* @__PURE__ */ __name(function _renderCSSTransforms2(ratio, cache) {
  var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true;
  if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
    var angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle), cos;
    angle = parseFloat(rotationX) * _DEG2RAD;
    cos = Math.cos(angle);
    x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
    y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
    z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
  }
  if (transformPerspective !== _zeroPx) {
    transforms += "perspective(" + transformPerspective + _endParenthesis;
  }
  if (xPercent || yPercent) {
    transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
  }
  if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
    transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
  }
  if (rotation !== _zeroDeg) {
    transforms += "rotate(" + rotation + _endParenthesis;
  }
  if (rotationY !== _zeroDeg) {
    transforms += "rotateY(" + rotationY + _endParenthesis;
  }
  if (rotationX !== _zeroDeg) {
    transforms += "rotateX(" + rotationX + _endParenthesis;
  }
  if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
    transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
  }
  if (scaleX !== 1 || scaleY !== 1) {
    transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
  }
  target.style[_transformProp] = transforms || "translate(0, 0)";
}, "_renderCSSTransforms"), _renderSVGTransforms = /* @__PURE__ */ __name(function _renderSVGTransforms2(ratio, cache) {
  var _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y), a11, a21, a12, a22, temp;
  rotation = parseFloat(rotation);
  skewX = parseFloat(skewX);
  skewY = parseFloat(skewY);
  if (skewY) {
    skewY = parseFloat(skewY);
    skewX += skewY;
    rotation += skewY;
  }
  if (rotation || skewX) {
    rotation *= _DEG2RAD;
    skewX *= _DEG2RAD;
    a11 = Math.cos(rotation) * scaleX;
    a21 = Math.sin(rotation) * scaleX;
    a12 = Math.sin(rotation - skewX) * -scaleY;
    a22 = Math.cos(rotation - skewX) * scaleY;
    if (skewX) {
      skewY *= _DEG2RAD;
      temp = Math.tan(skewX - skewY);
      temp = Math.sqrt(1 + temp * temp);
      a12 *= temp;
      a22 *= temp;
      if (skewY) {
        temp = Math.tan(skewY);
        temp = Math.sqrt(1 + temp * temp);
        a11 *= temp;
        a21 *= temp;
      }
    }
    a11 = _round(a11);
    a21 = _round(a21);
    a12 = _round(a12);
    a22 = _round(a22);
  } else {
    a11 = scaleX;
    a22 = scaleY;
    a21 = a12 = 0;
  }
  if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
    tx = _convertToUnit(target, "x", x, "px");
    ty = _convertToUnit(target, "y", y, "px");
  }
  if (xOrigin || yOrigin || xOffset || yOffset) {
    tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
    ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
  }
  if (xPercent || yPercent) {
    temp = target.getBBox();
    tx = _round(tx + xPercent / 100 * temp.width);
    ty = _round(ty + yPercent / 100 * temp.height);
  }
  temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
  target.setAttribute("transform", temp);
  forceCSS && (target.style[_transformProp] = temp);
}, "_renderSVGTransforms"), _addRotationalPropTween = /* @__PURE__ */ __name(function _addRotationalPropTween2(plugin, target, property, startNum, endValue) {
  var cap = 360, isString = _isString(endValue), endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg", direction, pt;
  if (isString) {
    direction = endValue.split("_")[1];
    if (direction === "short") {
      change %= cap;
      if (change !== change % (cap / 2)) {
        change += change < 0 ? cap : -cap;
      }
    }
    if (direction === "cw" && change < 0) {
      change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
    } else if (direction === "ccw" && change > 0) {
      change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
    }
  }
  plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
  pt.e = finalValue;
  pt.u = "deg";
  plugin._props.push(property);
  return pt;
}, "_addRotationalPropTween"), _assign = /* @__PURE__ */ __name(function _assign2(target, source) {
  for (var p in source) {
    target[p] = source[p];
  }
  return target;
}, "_assign"), _addRawTransformPTs = /* @__PURE__ */ __name(function _addRawTransformPTs2(plugin, transforms, target) {
  var startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style, endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit;
  if (startCache.svg) {
    startValue = target.getAttribute("transform");
    target.setAttribute("transform", "");
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    _removeProperty(target, _transformProp);
    target.setAttribute("transform", startValue);
  } else {
    startValue = getComputedStyle(target)[_transformProp];
    style[_transformProp] = transforms;
    endCache = _parseTransform(target, 1);
    style[_transformProp] = startValue;
  }
  for (p in _transformProps) {
    startValue = startCache[p];
    endValue = endCache[p];
    if (startValue !== endValue && exclude.indexOf(p) < 0) {
      startUnit = getUnit(startValue);
      endUnit = getUnit(endValue);
      startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
      endNum = parseFloat(endValue);
      plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
      plugin._pt.u = endUnit || 0;
      plugin._props.push(p);
    }
  }
  _assign(endCache, startCache);
}, "_addRawTransformPTs");
_forEachName("padding,margin,Width,Radius", function(name, index) {
  var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function(side) {
    return index < 2 ? name + side : "border" + side + name;
  });
  _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
    var a, vars;
    if (arguments.length < 4) {
      a = props.map(function(prop) {
        return _get(plugin, prop, property);
      });
      vars = a.join(" ");
      return vars.split(a[0]).length === 5 ? a[0] : vars;
    }
    a = (endValue + "").split(" ");
    vars = {};
    props.forEach(function(prop, i) {
      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
    });
    plugin.init(target, vars, tween);
  };
});
var CSSPlugin = {
  name: "css",
  register: _initCore,
  targetTest: /* @__PURE__ */ __name(function targetTest(target) {
    return target.style && target.nodeType;
  }, "targetTest"),
  init: /* @__PURE__ */ __name(function init3(target, vars, tween, index, targets) {
    var props = this._props, style = target.style, startAt = tween.vars.startAt, startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority, inlineProps;
    _pluginInitted || _initCore();
    this.styles = this.styles || _getStyleSaver(target);
    inlineProps = this.styles.props;
    this.tween = tween;
    for (p in vars) {
      if (p === "autoRound") {
        continue;
      }
      endValue = vars[p];
      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
        continue;
      }
      type = typeof endValue;
      specialProp = _specialProps[p];
      if (type === "function") {
        endValue = endValue.call(tween, index, target, targets);
        type = typeof endValue;
      }
      if (type === "string" && ~endValue.indexOf("random(")) {
        endValue = _replaceRandom(endValue);
      }
      if (specialProp) {
        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
      } else if (p.substr(0, 2) === "--") {
        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
        endValue += "";
        _colorExp.lastIndex = 0;
        if (!_colorExp.test(startValue)) {
          startUnit = getUnit(startValue);
          endUnit = getUnit(endValue);
        }
        endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
        props.push(p);
        inlineProps.push(p, 0, style[p]);
      } else if (type !== "undefined") {
        if (startAt && p in startAt) {
          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
          _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
          getUnit(startValue + "") || startValue === "auto" || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p));
        } else {
          startValue = _get(target, p);
        }
        startNum = parseFloat(startValue);
        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
        relative && (endValue = endValue.substr(2));
        endNum = parseFloat(endValue);
        if (p in _propertyAliases) {
          if (p === "autoAlpha") {
            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
              startNum = 0;
            }
            inlineProps.push("visibility", 0, style.visibility);
            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
          }
          if (p !== "scale" && p !== "transform") {
            p = _propertyAliases[p];
            ~p.indexOf(",") && (p = p.split(",")[0]);
          }
        }
        isTransformRelated = p in _transformProps;
        if (isTransformRelated) {
          this.styles.save(p);
          if (type === "string" && endValue.substring(0, 6) === "var(--") {
            endValue = _getComputedProperty(target, endValue.substring(4, endValue.indexOf(")")));
            endNum = parseFloat(endValue);
          }
          if (!transformPropTween) {
            cache = target._gsap;
            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
            smooth = vars.smoothOrigin !== false && cache.smooth;
            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
            transformPropTween.dep = 1;
          }
          if (p === "scale") {
            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
            this._pt.u = 0;
            props.push("scaleY", p);
            p += "X";
          } else if (p === "transformOrigin") {
            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
            endValue = _convertKeywordsToPercentages(endValue);
            if (cache.svg) {
              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
            } else {
              endUnit = parseFloat(endValue.split(" ")[2]) || 0;
              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
            }
            continue;
          } else if (p === "svgOrigin") {
            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
            continue;
          } else if (p in _rotationalProperties) {
            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
            continue;
          } else if (p === "smoothOrigin") {
            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
            continue;
          } else if (p === "force3D") {
            cache[p] = endValue;
            continue;
          } else if (p === "transform") {
            _addRawTransformPTs(this, endValue, target);
            continue;
          }
        } else if (!(p in style)) {
          p = _checkPropPrefix(p) || p;
        }
        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
          startUnit = (startValue + "").substr((startNum + "").length);
          endNum || (endNum = 0);
          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
          this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
          this._pt.u = endUnit || 0;
          if (startUnit !== endUnit && endUnit !== "%") {
            this._pt.b = startValue;
            this._pt.r = _renderCSSPropWithBeginning;
          }
        } else if (!(p in style)) {
          if (p in target) {
            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
          } else if (p !== "parseTransform") {
            _missingPlugin(p, endValue);
            continue;
          }
        } else {
          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
        }
        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : typeof target[p] === "function" ? inlineProps.push(p, 2, target[p]()) : inlineProps.push(p, 1, startValue || target[p]));
        props.push(p);
      }
    }
    hasPriority && _sortPropTweensByPriority(this);
  }, "init"),
  render: /* @__PURE__ */ __name(function render2(ratio, data) {
    if (data.tween._time || !_reverting()) {
      var pt = data._pt;
      while (pt) {
        pt.r(ratio, pt.d);
        pt = pt._next;
      }
    } else {
      data.styles.revert();
    }
  }, "render"),
  get: _get,
  aliases: _propertyAliases,
  getSetter: /* @__PURE__ */ __name(function getSetter(target, property, plugin) {
    var p = _propertyAliases[property];
    p && p.indexOf(",") < 0 && (property = p);
    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
  }, "getSetter"),
  core: {
    _removeProperty,
    _getMatrix
  }
};
gsap.utils.checkPrefix = _checkPropPrefix;
gsap.core.getStyleSaver = _getStyleSaver;
(function(positionAndScale, rotation, others, aliases) {
  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function(name) {
    _transformProps[name] = 1;
  });
  _forEachName(rotation, function(name) {
    _config.units[name] = "deg";
    _rotationalProperties[name] = 1;
  });
  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
  _forEachName(aliases, function(name) {
    var split = name.split(":");
    _propertyAliases[split[1]] = all[split[0]];
  });
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(name) {
  _config.units[name] = "px";
});
gsap.registerPlugin(CSSPlugin);
var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
gsapWithCSS.core.Tween;
const _Pointer = class _Pointer extends PIXI.Container {
  constructor(data = {}, userId = game.userId, gridSize = canvas.grid?.size) {
    super();
    this.data = foundry.utils.duplicate(foundry.utils.expandObject(data));
    this.userId = userId;
    this.gridSize = gridSize;
    this.draw();
  }
  static get defaultSettings() {
    return this.default("pointer");
  }
  async draw(newData = this.data) {
    if (this._drawing) {
      return;
    }
    this._drawing = true;
    const data = this.data;
    if (newData.img) {
      if (this.sprite) {
        this.sprite.destroy();
      }
      const tex = await foundry.canvas.loadTexture(data.img);
      this.sprite = this.addChild(new PIXI.Sprite(tex));
      const src = tex.baseTexture.resource.source;
      if (src.tagName === "VIDEO") {
        src.loop = true;
        src.muted = true;
        game.video.play(src);
      }
      const { height, width } = tex;
      this.sprite.pivot.x = width / 2;
      this.sprite.pivot.y = height / 2;
      newData = this.data;
    }
    if (newData.position) {
      this.position = data.position;
      delete data.position;
    }
    if (newData.scale) {
      const { height, width } = this.sprite.texture;
      const ratio = height / width;
      this.sprite.scale = new PIXI.Point(
        this.gridSize / width * data.scale,
        this.gridSize / height * data.scale * ratio
      );
    }
    if (newData.offset) {
      this.sprite.position = new PIXI.Point(
        data.offset.x * this.gridSize * data.scale,
        data.offset.y * this.gridSize * data.scale
      );
    }
    if (newData.angle) {
      this.sprite.angle = data.angle;
    }
    if (newData.tint) {
      if (this.data.tint.useUser) {
        if (foundry.utils.isNewerVersion(game.version, 12)) {
          this.sprite.tint = Number("0x" + game.users.get(this.userId).color.css.slice(1));
        } else {
          this.sprite.tint = Number("0x" + game.users.get(this.userId).color.slice(1));
        }
      } else {
        this.sprite.tint = Number("0x" + data.tint.color.slice(1));
      }
    }
    if (newData.animations) {
      this.animations = newData.animations;
      if (this.timeline) {
        this.timeline.clear();
      } else {
        this.timeline = gsapWithCSS.timeline();
      }
      if (this.animations?.rotation?.use) {
        const rotData = this.animations.rotation;
        const min = rotData.min, max = rotData.max, dur = rotData.dur, yoyo = rotData.yoyo, ease = rotData.easing.method === "none" ? "none" : rotData.easing.method + "." + rotData.easing.type;
        this.timeline.set(this, { angle: min }, 0);
        this.timeline.to(this, dur, { angle: max, ease, repeat: -1, yoyo }, 0);
      } else {
        this.rotation = 0;
      }
      if (this.animations?.scale?.use) {
        const scaleData = this.animations.scale;
        const min = scaleData.min, max = scaleData.max, dur = scaleData.dur, yoyo = scaleData.yoyo, ease = scaleData.easing.method === "none" ? null : scaleData.easing.method + "." + scaleData.easing.type;
        this.timeline.set(this.scale, { x: min, y: min }, 0);
        this.timeline.to(this.scale, dur, { x: max, y: max, ease, repeat: -1, yoyo }, 0);
      } else {
        this.scale = new PIXI.Point(1, 1);
      }
      this.timeline.play();
    }
    this._drawing = false;
  }
  async update(udata) {
    this.data = foundry.utils.mergeObject(this.data, foundry.utils.duplicate(udata));
    await this.draw(foundry.utils.expandObject(this.data));
    return;
  }
  async save() {
    const collection = foundry.utils.duplicate(game.settings.get(CONSTANTS.MODULE_ID, "collection"));
    let idx = collection.findIndex((e) => e.id === this.id);
    const data = foundry.utils.duplicate(this.data);
    delete data.position;
    collection[idx] = data;
    return game.settings.set(CONSTANTS.MODULE_ID, "collection", collection);
  }
  hide() {
    this.renderable = false;
  }
  ping(position) {
    return;
  }
  destroy(...args) {
    super.destroy(...args);
    this.timeline?.kill();
  }
};
__name(_Pointer, "Pointer");
let Pointer = _Pointer;
const _Ping = class _Ping extends Pointer {
  async draw(newData) {
    this.renderable = true;
    await super.draw(newData);
    if (newData?.position) {
      if (!this.timeline)
        this.timeline = gsapWithCSS.timeline();
      const removeTween = this.timeline.getById("remove");
      if (removeTween) {
        this.timeline.remove(removeTween);
      }
      this.timeline.set(
        this,
        {
          id: "remove",
          onComplete: () => {
            this.renderable = false;
            this.timeline.pause();
          }
        },
        this.pingDuration || 3
      );
      this.timeline.restart();
    } else
      this.renderable = false;
  }
};
__name(_Ping, "Ping");
let Ping = _Ping;
let controls;
let pointerManager;
function init4(manager2) {
  if (manager2)
    pointerManager = manager2;
  Logger.debug("Pointer Initializing controls");
  const settings = foundry.utils.mergeObject(
    PointerSettingsMenu.defaultSettings.controls,
    game.user.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SETTINGS)?.controls
  );
  removeListeners();
  setUpControls(settings);
  addListeners();
}
__name(init4, "init");
function getKey(event) {
  if (event.code === "Space")
    return event.code;
  if (/^Digit/.test(event.code))
    return event.code[5];
  if (event.location === 3 && (event.code in game.keyboard.moveKeys || event.code in game.keyboard.zoomKeys)) {
    return event.code;
  }
  return event.key;
}
__name(getKey, "getKey");
function setUpControls(settings) {
  controls = { pointer: {}, ping: {}, force: {} };
  for (let objKey of ["ping", "pointer"]) {
    const keys = settings[objKey].key.split(" + ");
    const metaKeys = keys.splice(0, keys.length - 1);
    controls[objKey].meta = {};
    for (const meta of ["Ctrl", "Shift", "Meta", "Alt"])
      controls[objKey].meta[meta.toLowerCase() + "Key"] = metaKeys.includes(meta);
    if (keys[0]?.includes("Click")) {
      controls[objKey].event = "mouse";
      if (keys[0].includes("Left"))
        controls[objKey].button = 0;
      else
        controls[objKey].button = 2;
    } else {
      controls[objKey].event = "key";
      controls[objKey].key = keys[0];
    }
  }
  controls.ping.pointerActive = settings.ping.pointerActive;
  if (game.user.isGM) {
    const keys = settings.ping.force.split(" + ");
    const metaKeys = keys.splice(0, keys.length - 1);
    controls.force.meta = {};
    for (const meta of ["Ctrl", "Shift", "Meta", "Alt"])
      controls.force.meta[meta.toLowerCase() + "Key"] = metaKeys.includes(meta);
    if (keys[0]?.includes("Click")) {
      controls.force.event = "mouse";
      if (keys[0].includes("Left"))
        controls.force.button = 0;
      else
        controls.force.button = 2;
    } else {
      controls.force.event = "key";
      controls.force.key = keys[0];
    }
  }
}
__name(setUpControls, "setUpControls");
function removeListeners() {
  if (!controls)
    return;
  if (controls.pointer.event === "key") {
    window.removeEventListener(`${controls.pointer.event}down`, onPointerDown);
    window.removeEventListener(`${controls.pointer.event}up`, onPointerUp);
  } else {
    window.removeEventListener(`${controls.pointer.event}down`, onPointerDown);
    window.removeEventListener(`${controls.pointer.event}up`, onPointerUp);
  }
  if (controls.ping.event === "key") {
    window.removeEventListener(`${controls.ping.event}down`, onPing);
  } else {
    window.removeEventListener(`${controls.ping.event}down`, onPing);
  }
  if (controls.force.event) {
    if (controls.force.event === "key") {
      window.removeEventListener(`${controls.ping.event}down`, onForcePing);
    } else {
      window.removeEventListener(`${controls.ping.event}down`, onForcePing);
    }
  }
}
__name(removeListeners, "removeListeners");
function addListeners() {
  if (controls.pointer.event === "key") {
    window.addEventListener(`${controls.pointer.event}down`, onPointerDown);
    window.addEventListener(`${controls.pointer.event}up`, onPointerUp);
  } else {
    window.addEventListener(`${controls.pointer.event}down`, onPointerDown);
    window.addEventListener(`${controls.pointer.event}up`, onPointerUp);
  }
  if (controls.ping.event === "key") {
    window.addEventListener(`${controls.ping.event}down`, onPing);
  } else {
    window.addEventListener(`${controls.ping.event}down`, onPing);
  }
  if (controls.force.event) {
    if (controls.force.event === "key") {
      window.addEventListener(`${controls.ping.event}down`, onForcePing);
    } else {
      window.addEventListener(`${controls.ping.event}down`, onForcePing);
    }
  }
}
__name(addListeners, "addListeners");
function checkKey(ev, obj) {
  if (ev.target !== document.body && ev.target !== canvas.app.view)
    return false;
  const key = getKey(ev);
  if (key) {
    if (key?.toUpperCase() !== obj.key?.toUpperCase())
      return false;
  } else {
    if (ev.button !== obj.button)
      return false;
  }
  for (let key2 of Object.keys(obj.meta)) {
    if (obj.meta[key2] !== ev[key2])
      return false;
  }
  ev.preventDefault();
  ev.stopPropagation();
  return true;
}
__name(checkKey, "checkKey");
function onPointerDown(ev) {
  if (ev.repeat) {
    return;
  }
  if (!checkKey(ev, controls.pointer) || controls.pointer.active || !pointerManager) {
    return;
  }
  Logger.debug("Pointer Key down", ev);
  controls.pointer.active = true;
  pointerManager.start();
}
__name(onPointerDown, "onPointerDown");
function onPointerUp(ev) {
  if (ev.key && ev.key.toUpperCase() !== controls.pointer.key.toUpperCase()) {
    return;
  } else if (ev.button && !checkKey(ev, controls.pointer)) {
    return;
  }
  if (!pointerManager) {
    Logger.debug("Pointer controls not available, cannot stop pointer");
    return;
  }
  Logger.debug("Pointer Key up", ev);
  controls.pointer.active = false;
  pointerManager.stop();
}
__name(onPointerUp, "onPointerUp");
function onPing(ev) {
  if (controls.ping.pointerActive && !controls.pointer.active) {
    return;
  }
  if (!checkKey(ev, controls.ping)) {
    return;
  }
  Logger.debug("Pointer on Ping", ev);
  if (pointerManager)
    pointerManager.ping();
}
__name(onPing, "onPing");
function onForcePing(ev) {
  if (controls.ping.pointerActive && !controls.pointer.active) {
    return;
  }
  if (!checkKey(ev, controls.force)) {
    return;
  }
  Logger.debug("Pointer on Force Ping", ev);
  if (pointerManager)
    pointerManager.ping({ force: true });
}
__name(onForcePing, "onForcePing");
const _PointerSettingsMenu = class _PointerSettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  get title() {
    return "Pings and Pointers - Settings";
  }
  static get defaultCollection() {
    return [
      {
        name: "Pointer Hand",
        id: "wztq19uwjl",
        scale: 1,
        angle: 0,
        offset: {
          x: 0.5,
          y: 0.5
        },
        tint: {
          useUser: true,
          color: "#ffffff"
        },
        pingDuration: 1,
        animations: {
          rotation: {
            use: false,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: 0,
            max: 180
          },
          scale: {
            use: false,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: 0.5,
            max: 2
          }
        },
        img: `modules/${CONSTANTS.MODULE_ID}/assets/pointer.svg`
      },
      {
        name: "Ping Round",
        id: "gw4tu2ov86",
        scale: 1,
        angle: 0,
        offset: {
          x: 0,
          y: 0
        },
        tint: {
          useUser: true,
          color: "#ffffff"
        },
        pingDuration: 5,
        animations: {
          rotation: {
            use: true,
            dur: 5,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: -180,
            max: 180
          },
          scale: {
            use: false,
            dur: 2.5,
            easing: {
              method: "sine",
              type: "inOut"
            },
            yoyo: true,
            min: 1,
            max: 1.5
          }
        },
        img: `modules/${CONSTANTS.MODULE_ID}/assets/focus.svg`,
        gridSize: 50,
        default: "ping"
      },
      {
        name: "Ping Arrows",
        id: "6p55sd7xi3",
        scale: 1,
        angle: 0,
        offset: {
          x: 0,
          y: 0
        },
        tint: {
          useUser: true,
          color: "#ffffff"
        },
        pingDuration: 5,
        animations: {
          rotation: {
            use: false,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: 0,
            max: 180
          },
          scale: {
            use: true,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: true,
            min: 0.9,
            max: 1.3
          }
        },
        img: `modules/${CONSTANTS.MODULE_ID}/assets/convergence-target.svg`
      },
      {
        name: "Ping Triangle",
        id: "eogjz9yjn3",
        scale: 1,
        angle: 0,
        offset: {
          x: 0,
          y: -0.1
        },
        tint: {
          useUser: true,
          color: "#ffffff"
        },
        pingDuration: 5,
        animations: {
          rotation: {
            use: true,
            dur: 4,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: -180,
            max: 180
          },
          scale: {
            use: true,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: true,
            min: 0.9,
            max: 1.3
          }
        },
        img: `modules/${CONSTANTS.MODULE_ID}/assets/triangle-target.svg`
      },
      {
        name: "Pointer Pin",
        id: "dvs2vb9y0y",
        scale: 1,
        angle: -15,
        offset: {
          x: 0.35,
          y: -0.6
        },
        tint: {
          useUser: true,
          color: "#ffffff"
        },
        pingDuration: 1,
        animations: {
          rotation: {
            use: false,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: 0,
            max: 180
          },
          scale: {
            use: true,
            dur: 1.5,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: true,
            min: 0.9,
            max: 1
          }
        },
        img: `modules/${CONSTANTS.MODULE_ID}/assets/pin.svg`
      },
      {
        name: "Pointer Arrow",
        id: "6njoyebxpf",
        scale: 1,
        angle: 0,
        offset: {
          x: 0,
          y: -0.5
        },
        tint: {
          useUser: true,
          color: "#ffffff"
        },
        pingDuration: 1,
        animations: {
          rotation: {
            use: false,
            dur: 1,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: false,
            min: 0,
            max: 180
          },
          scale: {
            use: true,
            dur: 1.5,
            easing: {
              method: "none",
              type: "in"
            },
            yoyo: true,
            min: 0.9,
            max: 1
          }
        },
        img: `modules/${CONSTANTS.MODULE_ID}/assets/plain-arrow.svg`
      }
    ];
  }
  static get defaultSettings() {
    return {
      controls: {
        pointer: {
          key: "X"
        },
        ping: {
          key: "Left Click",
          force: "Right Click",
          pointerActive: true
        }
      }
    };
  }
  async _onRender(context3, options) {
    const html = this.element;
    html.querySelectorAll(".pointer-control-chooser").forEach((e) => this._initControlChooser(e));
    this._initDesigner(html.querySelector(".designer"));
    const chooser = html.querySelector(".chooser");
    chooser.addEventListener("click", (ev) => {
      let target = ev.target.closest(".pointer-name");
      if (target) {
        this._onClickName(ev);
      }
      target = ev.target.closest(".delete-pointer");
      if (target) {
        const li = target.closest("li");
        let collection = foundry.utils.duplicate(game.settings.get(CONSTANTS.MODULE_ID, "collection"));
        const pointerData = li.dataset.pointerId === this.pointer.id ? {} : foundry.utils.duplicate(this.pointer.data);
        collection = collection.filter((e) => e.id !== li.dataset.pointerId);
        if (collection.length === 0)
          collection = foundry.utils.duplicate(this.constructor.defaultCollection);
        game.settings.set(CONSTANTS.MODULE_ID, "collection", collection).then(async (e) => {
          await this.render();
          this._selectPointer(pointerData);
        });
      }
      target = ev.target.closest(".add-pointer");
      if (target) {
        this._addPointer();
      }
    });
    chooser.querySelectorAll("input").forEach(
      (e) => e.addEventListener("change", async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const target = ev.currentTarget;
        const list = target.closest(".chooser");
        const checkboxes = Array.from(list.querySelectorAll(`input[name=${target.name}]`)).filter((e2) => e2 !== target);
        target.checked = true;
        for (let checkbox of checkboxes) {
          checkbox.checked = false;
        }
        await this.submit(ev);
        updateCanvas();
      })
    );
    const updateCanvas = /* @__PURE__ */ __name(() => {
      const pointerId = this.userData.pointer;
      const collection = game.settings.get(CONSTANTS.MODULE_ID, "collection");
      const pointerData = collection.find((e) => e.id === pointerId) || collection[0];
      pointerData.position = new PIXI.Point(this._pixiApp.view.width / 2, this._pixiApp.view.height / 2);
      this._pixiApp.stage.removeChild(this._pixiApp.stage.children[2]);
      const pointer = new Pointer(pointerData, game.user.id, this.options.gridSize);
      this._pixiApp.stage.addChild(pointer);
    }, "updateCanvas");
    if (!game.user.isGM) {
      return;
    }
    html.querySelector(".pointer-apply-settings").addEventListener("click", async (ev) => {
      const settings = this.userData;
      Logger.debug("Flag 'settings' updated :", settings);
      for (let user of game.users) {
        await user.unsetFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SETTINGS);
        await user.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SETTINGS, settings);
      }
      ui.notifications.info("Finished applying settings to all users!");
    });
  }
  async _addPointer() {
    const idx = Math.floor(Math.random() * _PointerSettingsMenu.defaultCollection.length);
    const pointerData = foundry.utils.duplicate(_PointerSettingsMenu.defaultCollection[idx]);
    pointerData.name = "New";
    pointerData.id = foundry.utils.randomID();
    const collection = foundry.utils.duplicate(game.settings.get(CONSTANTS.MODULE_ID, "collection"));
    collection.push(pointerData);
    await game.settings.set(CONSTANTS.MODULE_ID, "collection", collection);
    await this.render(false);
    this._selectPointer(pointerData);
  }
  async _onClickName(ev) {
    const li = ev.target.closest(".pointer-selection");
    if (this.canConfigure) {
      await this.pointer.save();
    }
    const pointerId = li.dataset.pointerId;
    const collection = game.settings.get(CONSTANTS.MODULE_ID, "collection");
    const pointerData = collection.find((e) => e.id === pointerId);
    this._selectPointer(pointerData);
  }
  async _selectPointer(pointerData) {
    this.pointer.update(pointerData);
    const designer = this.form.querySelector(".designer");
    const flatData = foundry.utils.flattenObject(pointerData);
    Logger.debug("Flatdata updated:", flatData);
    for (let key of Object.keys(flatData)) {
      const inp = designer.querySelector(`input[name="pointer.${key}"]`);
      if (!inp) {
        continue;
      }
      if (inp.type === "checkbox") {
        inp.checked = flatData[key];
      } else if (inp.type === "range") {
        inp.value = flatData[key];
        inp.parentNode.querySelector(".range-value").innerText = flatData[key];
      } else {
        inp.value = flatData[key];
      }
    }
  }
  _initControlChooser(inp) {
    inp.addEventListener("focusout", (ev) => {
      this.submit(ev);
      this._focusedControl = null;
      ev.preventDefault();
      ev.stopPropagation();
    });
    inp.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this._focusedControl !== ev.currentTarget) {
        this._focusedControl = ev.currentTarget;
        return;
      }
      ev.currentTarget.value = this._getMetaKeys(ev) + "Left Click";
    });
    inp.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this._focusedControl !== ev.currentTarget) {
        this._focusedControl = ev.currentTarget;
        return;
      }
      ev.currentTarget.value = this._getMetaKeys(ev) + "Right Click";
    });
    inp.addEventListener("keydown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this._focusedControl !== ev.currentTarget) {
        this._focusedControl = ev.currentTarget;
        return;
      }
      let key = getKey(ev);
      if (["Control", "Shift", "Alt", "Meta"].includes(key)) {
        ev.currentTarget.value = key;
        return;
      }
      ev.currentTarget.value = this._getMetaKeys(ev) + getKey(ev).toUpperCase();
    });
  }
  _getMetaKeys(ev) {
    let keys = [];
    if (ev.shiftKey) {
      keys.push("Shift");
    }
    if (ev.ctrlKey) {
      keys.push("Ctrl");
    }
    if (ev.altKey) {
      keys.push("Alt");
    }
    if (ev.metaKey) {
      keys.push("Meta");
    }
    if (keys.length > 0) {
      return keys.join(" + ") + " + ";
    }
    return "";
  }
  get canConfigure() {
    return game.user.can("SETTINGS_MODIFY");
  }
  get userData() {
    return foundry.utils.mergeObject(
      _PointerSettingsMenu.defaultSettings,
      game.user.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SETTINGS) || {}
    );
  }
  _prepareContext(options) {
    let data = foundry.utils.mergeObject(options, this.userData);
    data = foundry.utils.mergeObject(data, this.userData);
    data.canConfigure = this.canConfigure;
    data.easingMethod = {
      none: "Linear",
      sine: "Sine",
      expo: "Exponential",
      elastic: "Elastic",
      bounce: "Bounce"
    };
    data.easingType = {
      in: "In",
      out: "Out",
      inOut: "In and Out"
    };
    data.collection = game.settings.get(CONSTANTS.MODULE_ID, "collection");
    if (data.canConfigure && !data.collection.length) {
      data.collection = foundry.utils.duplicate(this.constructor.defaultCollection);
      game.settings.set(CONSTANTS.MODULE_ID, "collection", data.collection);
    }
    const userSettings = this.userData;
    let selectedPointer = data.collection.find((e) => e.id === userSettings.pointer);
    if (!userSettings.pointer || !selectedPointer) {
      selectedPointer = data.collection[0];
      userSettings.pointer = selectedPointer.id;
    }
    data.collection.forEach((pointer) => {
      pointer.selectedAsPointer = pointer.id === userSettings.pointer;
    });
    data.pixi = foundry.utils.expandObject(selectedPointer);
    let selectedPing = data.collection.find((e) => e.id === userSettings.ping);
    if (!userSettings.ping || !selectedPing) {
      selectedPing = data.collection[1] || data.collection[0];
      userSettings.ping = selectedPing.id;
    }
    data.collection.forEach((ping) => {
      ping.selectedAsPing = ping.id === userSettings.ping;
    });
    selectedPing.selectedAsPing = true;
    data.isGM = game.user.isGM;
    if (!this.tabGroups.primary) {
      this.tabGroups.primary = "info";
    }
    data.tabs = {
      info: {
        id: "info",
        group: "primary",
        label: "Info",
        cssClass: this.tabGroups.primary === "info" ? "active" : ""
      },
      general: {
        id: "general",
        group: "primary",
        label: "General",
        cssClass: this.tabGroups.primary === "general" ? "active" : ""
      },
      chooser: {
        id: "chooser",
        group: "primary",
        label: "Choose your Pointer!",
        cssClass: this.tabGroups.primary === "chooser" ? "active" : ""
      }
    };
    return data;
  }
  static async myOnSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    if (this.canConfigure) {
      this.pointer.save();
      data.pointer.img = this.pointer.data.img;
      new Pointer(data.pointer);
      this.pointer.save(data.pointer);
    }
    if (event.currentTarget?.closest(".designer")) {
      return;
    }
    let settings = foundry.utils.duplicate(this.userData);
    settings = foundry.utils.mergeObject(settings, data.user);
    const chooser = form.querySelector(".chooser");
    const pingId = chooser.querySelector('input[name="selectedAsPing"]:checked').closest("li").dataset.pointerId;
    settings.ping = pingId;
    const pointerId = chooser.querySelector('input[name="selectedAsPointer"]:checked').closest("li").dataset.pointerId;
    settings.pointer = pointerId;
    await game.user.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SETTINGS, settings);
    await this.render();
    const updatedPointerId = this.pointer.data.id;
    const collection = game.settings.get(CONSTANTS.MODULE_ID, "collection");
    const pointerData = collection.find((e) => e.id === updatedPointerId);
    this._selectPointer(pointerData);
  }
  /** PIXI STUFF */
  _initDesigner(container) {
    container.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("input", this._designerInputChange.bind(this));
      el.addEventListener("wheel", (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
      });
    });
    if (this._pixiApp) {
      container.querySelector(".canvas-container").appendChild(this._pixiApp.view);
      return;
    }
    const { stage } = this._initPixiApp(container);
    this._pixiApp.view.addEventListener("click", (ev) => {
      new foundry.applications.apps.FilePicker.implementation({
        type: "imagevideo",
        current: this.pointer.img || "",
        callback: (path) => {
          this.pointer.update({ img: path });
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      }).browse(this.pointer.img);
    });
    const pointerId = this.userData.pointer;
    const collection = game.settings.get(CONSTANTS.MODULE_ID, "collection");
    const pointerData = collection.find((e) => e.id === pointerId) || collection[0];
    pointerData.position = new PIXI.Point(this._pixiApp.view.width / 2, this._pixiApp.view.height / 2);
    this.pointer = stage.addChild(new Pointer(pointerData, game.user.id, this.options.gridSize));
  }
  _designerInputChange(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    let udata = {};
    const val = ev.currentTarget.type === "range" ? Number(ev.currentTarget.value) : ev.currentTarget.type === "checkbox" ? !!ev.currentTarget.checked : ev.currentTarget.value;
    if (ev.currentTarget.type === "range") {
      const rangevalue = ev.currentTarget.parentNode.querySelector(".range-value");
      rangevalue.innerText = ev.currentTarget.value;
    }
    const prop = ev.currentTarget.name.split(".").slice(1).join(".");
    udata[prop] = val;
    this.pointer.update(udata).then(async () => {
      const collection = game.settings.get(CONSTANTS.MODULE_ID, "collection");
      const pointerId = this.pointer.data.id;
      const pointerData = collection.find((e) => e.id === pointerId);
      pointerData[prop] = val;
      if (prop === "name") {
        const chooser = this.form.querySelector(".chooser");
        if (!chooser) {
          return;
        }
        chooser.querySelector(`.pointer-selection[data-pointer-id="${pointerId}"] .pointer-name`).innerText = val;
        this._selectPointer(pointerData);
      }
    });
  }
  _initPixiApp(container) {
    const pixiOptions = this.options.pixiOptions;
    const app = new PIXI.Application(pixiOptions);
    this._pixiApp = app;
    container.querySelector(".canvas-container").appendChild(app.view);
    app.view.style.cursor = "pointer";
    const stage = app.stage;
    const grid = app.stage.addChild(new PIXI.Graphics());
    this.grid = grid;
    const gridColor = document.body.classList.contains("dark-mode") ? 11184810 : 6710886;
    const gridSize = this.options.gridSize;
    grid.lineStyle(3, gridColor, 0.8);
    const gridLength = 20 * gridSize;
    for (let x2 = 0; x2 <= gridLength; x2 += gridSize) {
      for (let y2 = 0; y2 <= gridLength; y2 += gridSize) {
        grid.moveTo(x2, 0).lineTo(x2, gridLength).moveTo(0, y2).lineTo(gridLength, y2);
      }
    }
    grid.position = new PIXI.Point(pixiOptions.width * 0.5, pixiOptions.height * 0.5);
    grid.pivot = new PIXI.Point(gridLength * 0.5, gridLength * 0.5);
    const target = app.stage.addChild(new PIXI.Graphics());
    target.lineStyle(5, 13369344, 1);
    const targetSize = gridSize * 0.25;
    const x = pixiOptions.width * 0.5, y = pixiOptions.height * 0.5;
    target.moveTo(x - targetSize, y - targetSize).lineTo(x + targetSize, y + targetSize).moveTo(x - targetSize, y + targetSize).lineTo(x + targetSize, y - targetSize);
    return {
      stage
    };
  }
};
__name(_PointerSettingsMenu, "PointerSettingsMenu");
__publicField(_PointerSettingsMenu, "DEFAULT_OPTIONS", {
  id: "pointer-settings-menu",
  classes: ["pointer", "pointer-settings"],
  form: {
    handler: _PointerSettingsMenu.myOnSubmit,
    submitOnClose: true,
    submitOnChange: true,
    closeOnSubmit: false
  },
  window: {
    contentClasses: ["standard-form"]
  },
  position: {
    width: 700,
    height: "auto"
  },
  tag: "form",
  maxScale: 3,
  pixiOptions: {
    width: 300,
    height: 300,
    transparent: true,
    sharedTicker: true,
    sharedLoader: true
  },
  gridSize: 50
});
__publicField(_PointerSettingsMenu, "PARTS", {
  tabs: {
    template: "templates/generic/tab-navigation.hbs"
  },
  content: {
    template: `modules/${CONSTANTS.MODULE_ID}/templates/settings.html`
  }
});
let PointerSettingsMenu = _PointerSettingsMenu;
const registerSettings = /* @__PURE__ */ __name(function() {
  game.settings.register(CONSTANTS.MODULE_ID, "default", {
    name: "Activate placeables changes.",
    hint: "Changes some behaviours of placeables, like preview snapping to grid. Reload for all connected clients is required for this to take effect if changed!",
    scope: "world",
    config: false,
    default: PointerSettingsMenu.defaultSettings,
    type: Object
  });
  game.settings.registerMenu(CONSTANTS.MODULE_ID, "design-studio", {
    name: game.i18n.localize("POINTER.Settings.Name"),
    label: game.i18n.localize("POINTER.Settings.Button"),
    icon: "fas fa-paint-roller",
    type: PointerSettingsMenu,
    restricted: false
  });
  game.settings.register(CONSTANTS.MODULE_ID, "collection", {
    name: "Collection of all pings and pointers",
    config: false,
    restricted: false,
    scope: "world",
    type: Object,
    default: PointerSettingsMenu.defaultCollection,
    onChange: (data) => {
      canvas.controls.pointer.updateAll();
    }
  });
  game.settings.register(CONSTANTS.MODULE_ID, "debug", {
    name: `${CONSTANTS.MODULE_ID}.setting.debug.name`,
    hint: `${CONSTANTS.MODULE_ID}.setting.debug.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean
  });
}, "registerSettings");
const _ResetSettingsDialog = class _ResetSettingsDialog extends FormApplication {
  constructor(...args) {
    super(...args);
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.title`),
      content: '<p style="margin-bottom:1rem;">' + game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.content`) + "</p>",
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.confirm`),
          callback: async () => {
            const worldSettings = game.settings.storage?.get("world")?.filter((setting) => setting.key.startsWith(`${CONSTANTS.MODULE_ID}.`));
            for (let setting of worldSettings) {
              Logger.log(`Reset setting '${setting.key}'`);
              await setting.delete();
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.dialogs.resetsettings.cancel`)
        }
      },
      default: "cancel"
    });
  }
  async _updateObject(event, formData) {
  }
};
__name(_ResetSettingsDialog, "ResetSettingsDialog");
let ResetSettingsDialog = _ResetSettingsDialog;
const _PointerContainer = class _PointerContainer extends PIXI.Container {
  constructor() {
    super();
    this.initUsers();
  }
  get deltaTime() {
    return 1e3 / 30;
  }
  async initUsers() {
    this._users = {};
    for (let user of game.users) {
      const data = this._getUserPointerData(user);
      const pointer = this.addChild(new Pointer(data.pointer, user.id));
      const ping = this.addChild(new Ping(data.ping, user.id));
      ping.hide();
      pointer.hide();
      this._users[user.id] = { pointer, ping };
    }
  }
  _getUserPointerData(user) {
    const collection = game.settings.get(CONSTANTS.MODULE_ID, "collection") || PointerSettingsMenu.defaultCollection;
    const settings = foundry.utils.mergeObject(
      PointerSettingsMenu.defaultSettings,
      user.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.SETTINGS)
    );
    const pointerData = collection.find((e) => e.id === settings.pointer) || collection[0];
    const pingData = collection.find((e) => e.id === settings.ping) || collection[1] || collection[0];
    return { pointer: pointerData, ping: pingData };
  }
  update(user) {
    const data = this._getUserPointerData(user);
    if (!data.pointer || !data.ping) {
      return;
    }
    if (this._users[user.id]) {
      this._users[user.id].pointer.update(data.pointer);
      this._users[user.id].ping.update(data.ping);
    }
  }
  updateAll() {
    for (let user of game.users) {
      this.update(user);
    }
  }
  updateUserColor(user) {
    if (!this._users[user.id])
      return;
    const pointer = this._users[user.id].pointer;
    pointer.update({ tint: pointer.tint });
    const ping = this._users[user.id].ping;
    ping.update({ tint: ping.tint });
  }
  getMouseWorldCoord() {
    if (canvas.mousePosition) {
      return canvas.mousePosition;
    }
    return canvas.app.renderer.events.pointer.getLocalPosition(canvas.stage);
  }
  ping({
    userId = game.user.id,
    position = this.getMouseWorldCoord(),
    force = false,
    scale = canvas.stage.scale.x
  } = {}) {
    if (!this._users[userId])
      return;
    const ping = this._users[userId].ping;
    ping.update({ position });
  }
  movePointer(userId, { x, y }) {
    if (!this._users[userId])
      return;
    const pointer = this._users[userId].pointer;
    if (pointer.renderable) {
      gsapWithCSS.to(pointer.position, { duration: this.deltaTime / 1e3, x, y });
    } else {
      pointer.renderable = true;
      this._users[userId].pointer.update({ position: { x, y } });
    }
  }
  updatePointerPosition(userId, { x, y }) {
    if (!this._users[userId])
      return;
    this._users[userId].pointer.update({ position: { x, y } });
  }
  showPointer(userId) {
    if (!this._users[userId])
      return;
    this._users[userId].pointer.renderable = true;
  }
  hidePointer(userId) {
    if (!this._users[userId])
      return;
    const pointer = this._users[userId].pointer;
    pointer.hide();
  }
  destroy(options) {
    super.destroy(options);
  }
};
__name(_PointerContainer, "PointerContainer");
let PointerContainer = _PointerContainer;
const _PointerManager = class _PointerManager {
  constructor() {
    this._socket = "module.pointer";
    this.lastTime = 0;
    this.deltaTime = 1e3 / 30;
    this._onMouseMove = this._mouseMove.bind(this);
  }
  static init() {
    const manager2 = new _PointerManager();
    manager2.registerHooks();
    return manager2;
  }
  registerHooks() {
    game.socket.on(this._socket, this._socketHandler.bind(this));
    Hooks.on("canvasReady", this._onCanvasReady.bind(this));
  }
  _onCanvasReady() {
    if (canvas.controls.pointer) {
      canvas.controls.pointer.destroy({ children: true });
    }
    canvas.controls.pointer = canvas.controls.addChild(new PointerContainer());
  }
  _socketHandler(data) {
    const container = canvas.controls.pointer;
    if (!container)
      return;
    if (data.stop) {
      container.hidePointer(data.senderId);
    } else if (data.sceneId !== canvas.scene.id) {
      return;
    } else if (data.type === "pointer") {
      container.movePointer(data.senderId, data.position);
    } else if (data.type === "ping") {
      container.ping({
        userId: data.senderId,
        position: data.position,
        force: data.force,
        scale: data.scale
      });
    }
  }
  start() {
    this.lastTime = 0;
    window.addEventListener("mousemove", this._onMouseMove);
    const container = canvas.controls.pointer;
    if (container) {
      container.showPointer(game.user.id);
    }
  }
  stop() {
    window.removeEventListener("mousemove", this._onMouseMove);
    const container = canvas.controls.pointer;
    if (container) {
      container.hidePointer(game.user.id);
    }
    const data = {
      senderId: game.user.id,
      stop: true
    };
    game.socket.emit(this._socket, data);
  }
  _mouseMove(ev) {
    const container = canvas.controls.pointer;
    if (!container)
      return;
    const { x, y } = container.getMouseWorldCoord();
    container.updatePointerPosition(game.user.id, { x, y });
    const dt = Date.now() - this.lastTime;
    if (dt < this.deltaTime)
      return;
    this.lastTime = Date.now();
    const mdata = {
      senderId: game.user.id,
      position: { x, y },
      sceneId: canvas.scene.id,
      type: "pointer"
    };
    game.socket.emit(this._socket, mdata);
  }
  ping(options = {}) {
    const container = canvas.controls.pointer;
    if (!container)
      return;
    const defaults2 = {
      userId: game.user.id,
      position: container.getMouseWorldCoord(),
      force: false,
      scale: canvas.stage.scale.x
    };
    const finalOptions = { ...defaults2, ...options };
    container.ping(finalOptions);
    if (finalOptions.force) {
      canvas.animatePan({ x: finalOptions.position.x, y: finalOptions.position.y, scale: finalOptions.scale });
    }
    const data = {
      senderId: finalOptions.userId,
      position: finalOptions.position,
      sceneId: canvas.scene.id,
      type: "ping",
      force: finalOptions.force,
      scale: finalOptions.scale
    };
    game.socket.emit(this._socket, data);
  }
};
__name(_PointerManager, "PointerManager");
let PointerManager = _PointerManager;
let manager;
const initHooks = /* @__PURE__ */ __name(async () => {
  manager = PointerManager.init();
}, "initHooks");
const setupHooks = /* @__PURE__ */ __name(async () => {
}, "setupHooks");
const readyHooks = /* @__PURE__ */ __name(() => {
  foundry.applications.handlebars.loadTemplates([`modules/${CONSTANTS.MODULE_ID}/templates/designer.html`]);
  Hooks.on("updateUser", (entity, udata) => {
    if (udata.color) {
      canvas.controls.pointer?.updateUserColor(entity);
    }
    if (udata.flags?.pointer?.settings) {
      canvas.controls.pointer?.update(entity);
    }
    if (udata.flags?.pointer?.settings?.controls && entity.id === game.user.id) {
      init4(manager);
    }
  });
  init4(manager);
}, "readyHooks");
Hooks.once("init", async () => {
  registerSettings();
  initHooks();
});
Hooks.once("setup", function() {
  setupHooks();
});
Hooks.once("ready", async () => {
  readyHooks();
});
Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});
//# sourceMappingURL=module.js.map
