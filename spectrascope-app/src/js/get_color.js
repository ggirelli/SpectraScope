/**
 * Convert a visible wavelength to an hexadec color string.
 *
 * Based on: http://www.efg2.com/Lab/ScienceAndEngineering/Spectra.htm
 * Copyright: http://www.efg2.com/Lab/Copyright.htm
 *
 * @param  {number} lambda wavelength in nm
 * @return {string}        color in hexadec format
 */
var get_color = function (lambda) {
    // Set default values
    var R = 0;
    var G = 0;
    var B = 0;
    var factor = 0;
    var gamma = .8;
    var imax = 255;
    // Some nested functions
    var f = {
        adjust: function (color, factor) {
            if (0 == color) {
                return (0);
            }
            else {
                return (Math.round(imax * Math.pow((color * factor), gamma)));
            }
        },
        int2hex: function (color) {
            var scolor = color.toString(16).toUpperCase();
            while (2 > scolor.length) {
                scolor = "0" + scolor;
            }
            return (scolor);
        }
    };
    // Set colors per interval
    switch (true) {
        case (lambda >= 380 && lambda <= 439):
            R = -(lambda - 440) / (440 - 380.);
            B = 1;
            break;
        case (lambda >= 440 && lambda <= 489):
            G = (lambda - 440) / (490 - 440.);
            B = 1;
            break;
        case (lambda >= 490 && lambda <= 509):
            G = 1;
            B = -(lambda - 510) / (510 - 490.);
            break;
        case (lambda >= 510 && lambda <= 579):
            R = (lambda - 510) / (580 - 510.);
            G = 1;
            break;
        case (lambda >= 580 && lambda <= 644):
            R = 1;
            G = -(lambda - 645) / (645 - 580.);
            break;
        case (lambda >= 645 && lambda <= 780):
            R = 1;
            break;
    }
    // Let the intensity fall off near the vision limits
    switch (true) {
        case (lambda >= 380 && lambda <= 419):
            factor = .3 + .7 * (lambda - 380) / (420 - 380.);
            break;
        case (lambda >= 420 && lambda <= 700):
            factor = 1;
            break;
        case (lambda >= 701 && lambda <= 780):
            factor = .3 + .7 * (780 - lambda) / (780 - 700.);
            break;
    }
    // Adjust
    R = f.adjust(R, factor);
    G = f.adjust(G, factor);
    B = f.adjust(B, factor);
    // Convert to hexadecimal
    var sR = f.int2hex(R);
    var sG = f.int2hex(G);
    var sB = f.int2hex(B);
    // To string
    return ("#" + sR + sG + sB);
};