/* jQuery YellowBox plugin (Beta)
 * Copyright 2011 Oscar Sobrevilla (oscar.sobrevilla@gmail.com)
 * Released under the MIT and GPL licenses.
 * version 1.0 Beta
 */
(function ($) {

    'use strict';

    /**
     * Show Yellowbox alerts, confirms messages
     * @param elem {dom object}
     * @param options {object}
     * Require have HTML:
     *
     *  <div class="yellowbox">
     *    <div class="yellowbox-title">The title example</div>
     *    <div class="yellowbox-body">The body example for yellowbox box messages</div>
     *  </div>
     *
     * Init Plugin with:
     *
     *  <script>
     *    $(function(){
     *      $(".yellowbox").yellowBox();
     *    });
     *  </script>
     *
     */

    var YellowBox = function (elem, options) {
        var i;
        // Set general options
        this.options = {
            hideFx: 'slideUp',
            showFx: 'fadeIn',
            speedFx: 500,
            closer: true,
            onClose: false,
            onOpen: false,
            timeToClose: 5000,
            shakeDuration: 1.1,
            intervalRpt: 1000,
            autoFx: false,
            strClose: 'Close'
        };
        for (i in options)
            this.options[i] = options[i];
        // Set DOM box element
        this.el = $(elem);
        // Set closer
        this.closer = null;
        // Set initial color
        this.boxInitBgColor = this.el.css('backgroundColor') || "white";
        // Set box buttons
        this.boxButtons = $('<div class="yellowbox-buttons" />');
        // Other dom objets
        this.dom = {};
        this.dom.title = this.el.find('.yellowbox-title');
        this.dom.body = this.el.find('.yellowbox-body');
        this.dom.closer = this.el.find('.close');
        // Set Timer 
        this.timer = null;
        // Set Timer closeIn 
        this.timerIn = null;
        // Set custom settings
        this._setup();
    };

    $.extend(YellowBox.prototype, {

        /**
         * Setup
         */

        _setup: function () {
            var that = this,
                close;
            if (that.options.closer) {
                if (!that.dom.closer.size()) {
                    that.dom.closer = $('<a class="yellowbox-closer" href="#close" title="' + that.options.strClose + '"/>');
                }
                that.el.prepend(
                    that.dom.closer.on('click.yellowbox', function (e) {
                        e.preventDefault();
                        that.close();
                    }));
            }
        },

        /**
         * Set new content to the Yellowbox
         * @param title {String/HtmlString}
         * @param body {String/HtmlString}
         */
        _setContent: function (title, body) {
            this.dom.title.html(title || '');
            this.dom.body.html(body || '');
            return this;
        },

        /**
         * Default effect
         * @param options {object}
         * @param speed {Integer} speed of animation in milliseconds.
         */
        _fx: function (options, speed) {
            var that = this;
            options = options || {};
            clearTimeout(that.timer);
            that.el.addClass('yellowbox-emphasis');
            that.timer = setTimeout(function () {
                that.el.removeClass('yellowbox-emphasis');
            }, speed || that.options.speedFx);
        },

        /**
         * Generate buttons
         * @param buttons {object}
         */
        _buildBtns: function (buttons) {
            var that = this,
                listButtons = [];
            $.each(buttons || [], function (label) {
                var button = this,
                    btn = $('<span class="yellowbox-button" />');
                btn.html(label);
                btn.addClass(button.className).on('click.yellowbox', function (e) {
                    e.preventDefault();
                    if (button.onClick) {
                        button.onClick.call(that, this, e);
                    }
                });
                listButtons.push(btn.get(0));
            });
            return listButtons;
        },

        /**
         * Blink the yellowbox
         * @param repeats {Integer} number of repeat blink animation.
         * @param options {object}
         * @param speed {dom object}
         */
        blink: function (repeats, options, speed) {
            var that = this,
                counter = 0,
                nrepeat = repeats || 1,
                timer;
            that._fx(options, speed);
            timer = setInterval(function () {
                if (counter < nrepeat - 1) {
                    that._fx(options, speed);
                    counter += 1;
                } else {
                    clearInterval(timer);
                }
            }, that.options.intervalRpt);
            return that;
        },

        /**
         * Shake the yellowbox
         * @param callback {function}
         * @param duration {int seconds}
         */
        shake: function (callback, duration) {
            var that = this;
            if (!that.el.hasClass('yellowbox-shake')) {
                that.el.one('animationend webkitAnimationEnd oAnimationEnd', function (e) {
                    if (callback) {
                        callback.call(that, this, e);
                    }
                    that.el.removeClass('animation-shake');
                }).css('animation-duration', duration || that.options.shakeDuration + 's').addClass('animation-shake');
            }
            return this;
        },

        /**
         * Show Yellowbox
         * @param callback {function}
         * @param fx {Strign} jQuery animation name ej. slidedown, fadeIn
         * @param speed {Integer} speed of animation in milliseconds.
         */
        show: function (callback, fx, speed) {
            var that = this;
            that.el[fx || that.options.showFx](speed || that.options.speedFx, callback);
            if (that.options.onOpen) {
                that.options.onOpen(this);
            }
            return that;
        },

        /**
         * Hide Yellowbox
         * @param callback {function}
         * @param fx {Strign} jQuery animation name ej. slideup, fadeOut
         * @param speed {Integer} speed of animation in milliseconds.
         */
        close: function (callback, fx, speed) {
            var that = this;
            that.el[fx || that.options.hideFx](speed || that.options.speedFx, callback);
            if (that.options.onClose) {
                that.options.onClose(this);
            }
            return that;
        },

        /**
         * Hide Yellowbox with delay
         * @param timeToClose {Integer} time to wait before close. (milliseconds).
         */
        closeIn: function (timeToClose) {
            var that = this;
            clearTimeout(that.timerIn);
            that.timerIn = setTimeout(function () {
                that.close();
            }, timeToClose || that.options.timeToClose);
            return that;
        },

        /**
         * Asks a question in Yellowbox
         * @param options {options}
         */
        question: function (options) {
            var that = this;
            options = options || {};
            that._setContent(options.title, options.body);
            that.boxButtons.show().empty().append(that._buildBtns(options.buttons));
            that.el.append(that.boxButtons);
            return that;
        },

        /**
         * Se message in Yellowbox
         * @param options {object}
         */
        setMessage: function (options) {
            var that = this;
            options = options || {};
            that.show(null, 'slideDown', 'fast').blink();
            that.boxButtons.hide();
            that._setContent(options.title, options.body);
            if (options.seconds) {
                setTimeout(function () {
                    that.close();
                }, (options.seconds || 5) * 1E3);
            }
            return that;
        }
    });

    // add Yellowbox Class to jQuery fn.
    $.fn.yellowBox = function (options) {
        var t = this,
            yBox;
        if (t && t.length) {
            yBox = $.data(t[0], 'api');
            if (yBox) {
                return yBox;
            }
        }
        return t.each(function () {
            $.data(this, 'api', new YellowBox($(this), options));
        });
    };
}(window.jQuery));
