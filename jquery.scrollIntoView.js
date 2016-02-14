/*!
 * $.fn.scrollIntoView - similar to the default browser scrollIntoView
 * The default browser behavior always places the element at the top or bottom of its container. 
 * This override is smart enough to not scroll if the element is already visible.
 *
 * Copyright 2011 Arwid Bancewicz
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * @date 8 Jan 2013
 * @author Arwid Bancewicz http://arwid.ca
 * @version 0.3
 */
(function($) {
    /*
     Returns the common ancestor of the elements.
     It was taken from http://stackoverflow.com/questions/3217147/jquery-first-parent-containing-all-children
     It has received minimal testing.
    */
    var commonAncestor = function() {
        var parents = [];
        var minlen = Infinity;

        $(this).each(function() {
            var curparents = $(this).parents();
            parents.push(curparents);
            minlen = Math.min(minlen, curparents.length);
        });

        for (var i = 0; i < parents.length; i++) {
            parents[i] = parents[i].slice(parents[i].length - minlen);
        }

        // Iterate until equality is found
        for (var i = 0; i < parents[0].length; i++) {
            var equal = true;
            for (var j = 0; j < parents.length; j++) {
                if (parents[j][i] != parents[0][i]) {
                    equal = false;
                    break;
                }
            }
            if (equal) return $(parents[0][i]);
        }
        return $([]);
    }

    var scrollableParent = function() {
        // start from the common ancester
        var pEl = commonAncestor.call(this).get(0);

        // go up parents until we find one that scrolls
        while (pEl) {
            // it wiggles?
            var scrollTop = pEl.scrollTop;

            pEl.scrollTop = scrollTop;
            pEl.scrollTop++;
            if (pEl.scrollTop != scrollTop) {
                pEl.scrollTop = scrollTop;
                return $(pEl);
            }

            pEl.scrollTop = scrollTop;
            pEl.scrollTop--;
            if (pEl.scrollTop != scrollTop) {
                pEl.scrollTop = scrollTop;
                return $(pEl);
            }

            // try next parent
            pEl = pEl.parentNode;
        }

        return $(window);
    };

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
        if (this.length == 1) {
            elY = this.offset().top;
            elH = this.height();
        } else {
            this.each(function() {
                if ($(this).offset().top < elY) {
                    elY = $(this).offset().top;
                }
                if ($(this).offset().top + $(this).height() > elH) {
                    elH = $(this).offset().top + $(this).height();
                }
            });
            elH -= elY;
        }

        var wH = $(window).height();

        // start from the common ancester
        var pEl = scrollableParent.call(this).get(0);
        var pY = pEl.scrollTop;
        var pH = pEl.clientHeight;

        if (pH > wH) {
            pH = wH;
        }

        // case: if body's elements are all absolutely/fixed positioned, use window height
        if (pH == 0 && pEl.tagName == "BODY") {
            pH = wH;
        }

        function scrollTo(el, scrollTo) {
            if (opts.smooth) {
                $(el).stop().animate({ scrollTop: scrollTo }, opts);
            } else {
                el.scrollTop = scrollTo;
                if ($.isFunction(opts.complete)) {
                    opts.complete.call(el);
                }
            }
        }

        if (elY <= pY) {
            scrollTo(pEl, elY); // scroll up
        } else if (elY + elH > pY + pH) {
            scrollTo(pEl, elY + elH - pH); // scroll down
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
