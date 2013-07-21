/*
combined files : 

/kissy-gallery/switchable/1.0/build/index

*/
/**
 * @fileoverview 
 * @author xuejia.cxj<570171025@qq.com>
 * @module switchable
 **/
KISSY.add("/kissy-gallery/switchable/1.0/build/index", function(S, DOM, Event, Anim, Node, Base){
    var CLS_PREFIX = "kissy-switchable-";
    var CLS_PANEL_INTERNAL = CLS_PREFIX + "panel-internal";
    var EVENT_SWITCH = "switch";
    var objectMethods;
    var ConfigDefault;
    var ATTRS;
    var Effects;
    var StaticMethods;
    /**
     * @class {NewsSlider}
     * @DESC                             slider for ad news
     * attr members:
     *   - this.container
     *   - this.content
     *   - this.panels
     *   - this.activeIndex
     *   - this.length
     *   - this.switchTimer
     *   - this.viewSize
     */
    function NewsSlider(config) {
        var self = this;
        if(!(self instanceof NewsSlider)) {
            return new NewsSlider(config);
        }
        /**
         * the container of widget
         * @type {HTMLElement}
         */
        self.container = config.container;
        if (!self.container instanceof HTMLElement){
            S.error("no container found!")
            return;
        }

        /**
         * the content of the NewsSlider
         */
        self.content = DOM.get(config.containerCls, self.container);
        if (!self.content){
            S.error("no content found!")
            return;
        }

        /**
         * the panels of container
         */
        self.panels = DOM.query("li", self.content);
        if (!self.panels || self.panels.length === 0) return;
        self.length = self.panels.length;

        /*
         * 当前正在动画/切换的位置
         * @type {Number}
         */
        self.activeIndex = config.activeIndex || 0;

        NewsSlider.superclass.constructor.apply(this, arguments);
    this._init();
    }

    ConfigDefault = {
        DELAY: "" ,
        EASING: "easeOutStrong",
        EFFECT: "scrolly", 
        DURATION: .2,
        INTERVAL: 3
    };

    ATTRS = {
        container: "",
        contentCls: 'news-items',
        panels: [],
        activeIndex: 0,
    effect : 'scrolly',
    easing : 'easeOutStrong',
    interval : 3,
    duration : .2
    };

  /**
   * @DESC  object methods for NewsSlider instance
   */
    objectMethods = {
        _init: function(){
            // console.log("init");
            var self = this;
            self._panelInternalCls = S.guid(CLS_PANEL_INTERNAL);
            self._initContent();
            self._setAndStartSwitchTimer();
        }, 
        _initContent: function(){
            var self = this;
            var container = self.container;
            var content = self.content;
            var panels = self.panels;
            var panel0 = panels[0];
            var effect = self.get("effect");
            var containerPos = DOM.css(container, "position");



            //add default class to panels
            S.each(panels, function(panel) {
                DOM.addClass(panel, self._panelInternalCls)
            });

            //set viewSize
            self.viewSize = [
                panel0 && DOM.outerWidth(panel0, true),
                panel0 && DOM.outerHeight(panel0, true)
            ];

            //set NewsSlider dom style according to effect attr
            if(effect !== "none"){
                switch (effect) {
                    case "scrolly":
                        //set panels container in absolute layout
                        DOM.css(content, "position", "absolute");
                        if ( containerPos === "static" || containerPos === ""){
                            DOM.css(container, "position", "relative");
                        }
                        // if(effect === "scrollx")
                }
            }
        },
        prev: function(){
            var self = this;
            var activeIndex = self.activeIndex;
            var length = self.length;
            var toIndex = (activeIndex - 1 + length) % self;
            self._switchTo(toIndex);
        },
        next: function(){
            var self = this;
            var activeIndex = self.activeIndex;
            var length = self.length; 
            var toIndex = (activeIndex + 1) % length;
            self._switchTo(toIndex);
        },
        _switchTo: function(toIndex){
            var self = this;
            var fromIndex = self.activeIndex;
            self.activeIndex = toIndex;
            self._switchView(fromIndex, toIndex, function(){});
        },
        _switchView: function(fromIndex, toIndex, callback){
            var self = this;
            var effect = self.get("effect");
            var effectFunc = S.isFunction(effect) ? effect : Effects[effect];

            effectFunc.call(self, fromIndex, toIndex, function(){
                self._fireOnSwitch({}, fromIndex, toIndex);
                callback && callback.call(self);
            })
        },
        _fireOnSwitch: function(ev, fromIndex, toIndex) {
            var self = this;
            self.fire(EVENT_SWITCH, S.merge(ev, {
                fromIndex: fromIndex,
                toIndex: toIndex
            }));
        },
        _cancelSwitchTimer: function () {
            var self = this;
            if (self.switchTimer) {
                self.switchTimer.cancel();
                self.switchTimer = undefined;
            }
        },
        _setAndStartSwitchTimer: function () {
            var self = this;
            if(self.switchTimer) self._cancelSwitchTimer();
            //fn, when, periodi, context, data
            self.switchTimer = S.later(function(){
                if(!NewsSlider.isElInViewPort(self.container)) return;
                // console.log("invoked Interval func");
                this.next();
            }, self.get("interval") * 1000, true, self);
        }
    };

    Effects = {
        scrolly: function(fromIndex, toIndex, callback){
            var self = this;
            var delta = self.viewSize[1] * self.activeIndex;
            var toProps = {
                "top": -delta + "px"
            }

            if(self.anim){
                self.anim.stop();
            }

            if(fromIndex > -1){
                self.anim = new Anim(self.content, toProps,
                        self.get("duration"),
                        self.get("easing"),
                        function(){
                            self.anim = undefined;
                            callback && callback();
                        }).run();
            } else {
                DOM.css(self.content, toProps);
                callback && callback();
            }
        }
    };

    /**
     * @DESC static methods for NewsSlider
     */
    StaticMethods = {
        isElInViewPort: (function(){
            var DEFAULT = 0;

            function cacheWidth(el) {
            if (el._ks_lazy_width) {
                return el._ks_lazy_width; 
            } 
            return el._ks_lazy_width = DOM.outerWidth(el);
        }

        function cacheHeight(el) {
            if (el._ks_lazy_height) {
                return el._ks_lazy_height; 
            } 
            return el._ks_lazy_height = DOM.outerHeight(el);
        }

        //judge is two area cross from eachother
        function isCross(r1, r2) {
            var r = {}; 
            r.top = Math.max(r1.top, r2.top); 
            r.bottom = Math.min(r1.bottom, r2.bottom); 
            r.left = Math.max(r1.left, r2.left); 
            r.right = Math.min(r1.right, r2.right); 
            return r.bottom >= r.top && r.right >= r.left; 
        }

      /**
         * get c's bounding textarea.
         * @param {window|HTMLElement} [c]
         * @private
         */
        function getBoundingRect(c) {
        var vh, vw, left, top;
        if (c !== undefined) {
            vh = DOM.outerHeight(c);
            vw = DOM.outerWidth(c);
            var offset = DOM.offset(c);
            left = offset.left;
            top = offset.top;
        } else {
            vh = DOM.viewportHeight();
            vw = DOM.viewportWidth();
            left = DOM.scrollLeft();
            top = DOM.scrollTop();
        }
     
        var right = left + vw;
        var bottom = top + vh;
        
        return {
            left: left,
            top: top,
            right: right,
            bottom: bottom
        };
            }
            /**
         * whether part of elem can be seen by user.
         * note: it will not handle display none.
         * @ignore
         */
        function elementInViewport(elem, container, windowRegion) {
            // it's better to removeElements,
            // but if user want to append it later?
            // use addElements instead
            // if (!inDocument(elem)) {
            //    return false;
            // }
            // // display none or inside display none
            // if (!elem.offsetWidth) {
            //     return false;
            // }
            if(DOM.attr(elem, "display") === "none") {
                return false;
            }

            windowRegion = windowRegion || getBoundingRect();
            containerRegion = getBoundingRect(container) || windowRegion;
            // console.log(windowRegion, containerRegion);

            var elemOffset = DOM.offset(elem),
                inContainer = true,
                inWin,
                left = elemOffset.left,
                top = elemOffset.top,
                elemRegion = {
                    left: left,
                    top: top,
                    right: left + cacheWidth(elem),
                    bottom: top + cacheHeight(elem)
                };

            inWin = isCross(windowRegion, elemRegion);

            if (inWin && containerRegion) {
                inContainer = isCross(containerRegion, elemRegion);
            }

            return inContainer && inWin;
        }
        return elementInViewport;
        })()
    };

    S.extend(NewsSlider, Base, objectMethods,{
        ConfigDefault: ConfigDefault,
        Effects: Effects,
        isElInViewPort: StaticMethods.isElInViewPort,
        ATTRS: ATTRS
    });
    return NewsSlider;
}, {requires:['dom', 'event', 'anim', 'node', 'base']});




