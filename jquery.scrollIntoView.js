/**
 * @preserve $.fn.scrollIntoView - similar to the default browser scrollIntoView
 * The default browser behavior always places the element at the top or bottom of its container. 
 * This override is smart enough to not scroll if the element is already visible.
 *
 * Original script was developed by Arwid Bancewicz. Here follows the original licensing:
 *
 * Copyright 2011 Arwid Bancewicz
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * @date 15 Feb 2016
 * @author Arwid Bancewicz http://arwid.ca (up to version 0.3)
 * @author Leonardo Fernandes <leonardo.monteiro.fernandes@gmail.com>
 * @version 0.5
 */
(function($) {
    var commonAncestor = function() {
        var parents = this.parents();

        for (var i = 0; i < parents.length; i++) {
            var parent = $(parents[i]);
            var containsAll = true;
            this.each(function() {
                if (!parent.has(this)) {
                    containsAll = false;
                    return false;
                }
            });

            if (containsAll) {
                return parent;
            }
        }

        return $([]);
    }

    var scrollableParent = function() {
        // start from the common ancestor
        var pEl = commonAncestor.call(this);

        // go up parents until we find one that scrolls
        while (!pEl.is("html")) {
            // it wiggles?
            var scrollTop = pEl.get(0).scrollTop;

            pEl.get(0).scrollTop = scrollTop;
            pEl.get(0).scrollTop++;
            if (pEl.get(0).scrollTop != scrollTop) {
                pEl.get(0).scrollTop = scrollTop;
                return pEl;
            }

            pEl.get(0).scrollTop = scrollTop;
            pEl.get(0).scrollTop--;
            if (pEl.get(0).scrollTop != scrollTop) {
                pEl.get(0).scrollTop = scrollTop;
                return pEl;
            }

            // try next parent
            pEl = pEl.parent();
        }

        return pEl;
    };

    var scroll = function(el, delta, opts) {
        if (opts.smooth) {
            el.stop().animate({ scrollTop: el.get(0).scrollTop + delta }, opts);
        } else {
            el.get(0).scrollTop += delta;
            if ($.isFunction(opts.complete)) {
                opts.complete.call(el.get(0));
            }
        }
    }

    $.fn.scrollIntoView = function(duration, easing, complete) {
        // The arguments are optional.
        // The first argment can be false for no animation or a duration.
        // The first argment could also be a map of options.
        // Refer to http://api.jquery.com/animate/.
        if (this.length == 0) {
            return this;
        }

        var opts = $.extend({}, $.fn.scrollIntoView.defaults);

        // Get options
        if ($.type(duration) == "object") {
            $.extend(opts, duration);
        } else if ($.type(duration) == "number") {
            $.extend(opts, { duration: duration, easing: easing, complete: complete });
        } else if (duration == false) {
            opts.smooth = false;
        }

        // get enclosing offsets
        var elY = Infinity, elH = 0;
        this.each(function() {
            if ($(this).offset().top < elY) {
                elY = $(this).offset().top;
            }
            if ($(this).offset().top + $(this).outerHeight(false) > elY + elH) {
                elH = $(this).offset().top + $(this).outerHeight(false) - elY;
            }
        });

        var pEl = scrollableParent.call(this);
        var pY = pEl.offset().top;
        var pH = pEl.height();

        if (pEl.is("html") || pEl.is("body")) {
            pY = pEl.get(0).scrollTop;
            pH = $(window).height();
        }

        if (elY <= pY || elH > pH) {
            scroll(pEl, elY - pY, opts); // scroll up
        } else if (elY + elH > pY + pH) {
            scroll(pEl, elY + elH - pY - pH, opts); // scroll down
        } else {
            // no scroll
            if ($.isFunction(opts.complete)) {
                opts.complete.call(el);
            }
        }

        return this;
    };

    $.fn.scrollIntoView.defaults = {
        smooth: true,
        duration: null,
        easing: $.easing && $.easing.easeOutExpo ? 'easeOutExpo': null,
        // Note: easeOutExpo requires jquery.effects.core.js
        //       otherwise jQuery will default to use 'swing'
        complete: $.noop(),
        step: null,
        specialEasing: {} // cannot be null in jQuery 1.8.3
    };

})(jQuery);
