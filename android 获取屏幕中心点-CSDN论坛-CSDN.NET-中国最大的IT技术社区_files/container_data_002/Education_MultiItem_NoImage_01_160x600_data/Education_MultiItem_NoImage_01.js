/**
 * @fileoverview Provides layout specific functionality for HTML5 layout.
 * This includes layout specific directives, that are responsible for
 * interaction with the user, alignment of the blocks and texts in them.
 * Also includes layout specification and initialization.
 */


/**
 * Utils object with specific functionality for the layout.
 * @param {!angular.Object} ng AngularJS object.
 * @return {!Object.<function>} Available functions.
 */
var layout = (function(ng) {
  /**
   * Minimal aspect ratio to consider an image to be vertical.
   * @const {number}
   */
  var ASPECT_RATIO = 1.2;


  /**
   * Maximum margin in px for the customExtTextFit elements.
   * @const {number}
   */
  var MAX_TEXT_MARGIN = 30;


  /**
   * Maximum font sizes for the elements.
   * @enum {number}
   */
  var MaxFontSize = {
    PRICE: 35,
    PRICE_PREFIX: 18,
    PRODUCT_NAME: 16,
    SUBTITLE: 23,
    SUBTITLE_VERTICAL_LAYOUT: 20
  };


  /**
   * Minimum font sizes for the elements.
   * @enum {number}
   */
  var MinFontSize = {
    PRICE: 12,
    PRICE_PREFIX: 10,
    PRODUCT_NAME: 9,
    SUBTITLE: 11,
    SUBTITLE_VERTICAL_LAYOUT: 10
  };


  /**
   * Height for 300x600 layout.
   * @const {number}
   */
  var LAYOUT_HEIGHT_300x600 = 600;


  /**
   * Width for 300x600 layout.
   * @const {number}
   */
  var LAYOUT_WIDTH_300x600 = 300;


  /**
   * Timeout for uninform text size.
   * @const {number}
   */
  var UNIFORM_TEXT_SIZE_TIMEOUT = 750;


  var module = ng.module('custom', []);

  var loadedRes = {};

  window.onAdData = function(data, util) {
    var preloader = window.initPreloading(data);
    preloader.addCompletionListener(function() {
      loadedRes = preloader.getLoadedImages();
      utils.onAdData(data, util);
    });
    preloader.start();
  };


  /**
   * Convenience alias for querySelectorAll that returns results as Array
   * (instead of querySelectorAll's native nodeList.)
   * @param  {string} selector A CSS-style selector. ex: "#foo .bar>img"
   * @param  {Element} element Root element to query on (document is default).
   * @return {Array.<Element>}
   */
  function getArrayList(selector, element) {
    if (!element) {
      element = document;
    }
    return Array.prototype.slice.call(element.querySelectorAll(selector));
  }

  /**
   * Controller for using data binding in layout.
   * @param {!angular.Scope} $scope AngularJS layout scope.
   * @param {!Object} dynamicData Dynamic data from DAB.
   */
  function LayoutController($scope, dynamicData) {
    helpers.LayoutController($scope, dynamicData);

    var design = $scope.design;
    $scope.classes = getClasses($scope);

    $scope.stopAnimation = false;

    $scope.fontsLoaded = loadFonts($scope);


    /**
     * Changes the brightness of the color using its RGBA representation.
     * @param {string} color The color to change.
     * @param {number} delta Percentage to change the brightness of the color.
     * @param {number=} opt_alpha Alpha channel of the color.
     * @return {?string} Updated color in RGBA.
     */
    $scope.changeBrightnessRGBA = function(color, delta, opt_alpha) {
      var alpha = opt_alpha || 0;
      var hex = color.toColor();
      var result = RGB_CHANNELS_REGEXP.exec(hex);
      var rgb = '', part;
      for (var i = 1; i < result.length; i++) {
        part = parseInt(result[i], 16);
        part += part * delta;
        rgb += Math.round(Math.min(Math.max(0, part), 255));
        rgb += ',';
      }

      return rgb ? 'rgba(' + rgb + alpha + ')' : null;
    };


    /**
     * Checks aspect ratio of the image. All images with aspect ratio
     * less than ASPECT_RATIO are considered to be thin.
     * @return {boolean} Whether the image is thin or not.
     */
    $scope.checkThinLogo = function(url) {
      var imgContainer = loadedRes[url];
      var img = imgContainer && imgContainer[0];
      return img && (img.width / img.height < ASPECT_RATIO);
    };

    $scope.currUrl = $scope.products[0].url;

    if (!($scope.frame_height == LAYOUT_HEIGHT_300x600 &&
        dynamicData.google_width == LAYOUT_WIDTH_300x600)) {
      design.priceSize = Math.max(MinFontSize.PRICE, design.priceSize);
      design.priceSize = Math.min(MaxFontSize.PRICE, design.priceSize);

      design.nameSize = Math.max(MinFontSize.PRODUCT_NAME, design.nameSize);
      design.nameSize = Math.min(MaxFontSize.PRODUCT_NAME, design.nameSize);

      design.pricePrefixSize = Math.max(MinFontSize.PRICE_PREFIX,
          design.pricePrefixSize);
      design.pricePrefixSize = Math.min(MaxFontSize.PRICE_PREFIX,
          design.pricePrefixSize);

      if ($scope.layoutType != LayoutTypes.VERTICAL) {
        design.subTitleSize = Math.max(MinFontSize.SUBTITLE,
            design.subTitleSize);
        design.subTitleSize = Math.min(MaxFontSize.SUBTITLE,
            design.subTitleSize);
      } else {
        design.subTitleSize = Math.max(MinFontSize.SUBTITLE_VERTICAL_LAYOUT,
            design.subTitleSize);
        design.subTitleSize = Math.min(MaxFontSize.SUBTITLE_VERTICAL_LAYOUT,
            design.subTitleSize);
      }
    }
  }


  /**
   * Exposes enhanced CustomTextFit as a custom attribute.
   * @return {angular.Directive} Directive definition object.
   */
  module.directive('customExtTextFit', function() {
    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        scope.$on('fontsLoaded', function() {
          customExtTextFit(el);
        });
      }
    };
  });


  /**
   * Exposes enhanced nameTextFit as a custom attribute.
   * @return {angular.Directive} Directive definition object.
   */
  module.directive('nameTextFit', function() {
    return {
      restrict: 'A',
      link: function(scope, el, attrs) {
        scope.$on('fontsLoaded', function() {
          nameTextFit(el);
        });
      }
    };
  });


  /**
   * After dynamic text sizing, this makes item font sizes uniform based
   * on the smallest
   * @return {!angular.Directive} Directive definition object.
   */
  module.directive('uniformTextSize', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, element, attrs) {
        $timeout(function() {
          var elClass = ng.element(element).attr('class').split(' ')[0];
          elClass = '.' + elClass;
          var smallestSize = 1000;
          // Gets the smallest font size.
          ng.forEach(getArrayList(elClass), function(el) {
            elSize = parseInt(window.getComputedStyle(el).
                getPropertyValue('font-size'));
            if (elSize < smallestSize) {
              smallestSize = elSize;
            }
          });

          // Makes font sizes uniform.
          ng.forEach(getArrayList(elClass), function(el) {
            var ngEl = ng.element(el);
            var ngSpan = ng.element(ngEl[0].querySelector('span'));
            ngEl.css('font-size', smallestSize + 'px');
            ngSpan.css('font-size', smallestSize + 'px');
          });

          scope.$apply();
        }, UNIFORM_TEXT_SIZE_TIMEOUT);
      }
    };
  }]);


  /**
   * Exposes logoFit as a custom attribute.
   * Sets minimum and maximum padding values for the logo.
   * @return {!angular.Directive} Directive definition object.
   */
  module.directive('customLogoFit', function() {
    return {
      restrict: 'A',
      link: function(scope, $el, attrs) {
        var done = false;
        scope.$watch(attrs.loc, function() {
          if (!done) {
            var el = $el[0];
            var src = scope.$eval(attrs.loc);

            if (scope.checkUrl(src)) {
              setTimeout(function() {
                var data = scope.design['logoPadding'] || 0;
                var logoMargins = utils.logoMargin($el);
                var padding = parseInt(data, 10);
                var parent = $el.parent();

                var maxLogoPadding = LogoPadding.MAX;
                var minLogoPadding = LogoPadding.MIN;

                if (attrs.maxLogoPadding) {
                  maxLogoPadding = attrs.maxLogoPadding;
                }
                if (attrs.minLogoPadding) {
                  minLogoPadding = attrs.minLogoPadding;
                }

                padding = Math.min(Math.max(minLogoPadding,
                    padding), maxLogoPadding);
                var availableHeight = parseInt((parent[0].offsetHeight -
                    MIN_LOGO_SIZE) / 2, 10);
                var availableWidth = parseInt((parent[0].offsetWidth -
                    MIN_LOGO_SIZE) / 2, 10);
                parent.css({
                  paddingTop: Math.min(availableHeight, padding +
                      logoMargins.t) + 'px',
                  paddingRight: Math.min(availableWidth, padding +
                      logoMargins.r) + 'px',
                  paddingBottom: Math.min(availableHeight, padding +
                      logoMargins.b) + 'px',
                  paddingLeft: Math.min(availableWidth, padding +
                      logoMargins.l) + 'px'
                });

                var parentDisplay = getStyleProperty(parent[0], 'display');
                $el.addClass('inline-wrapper');
                new ddab.layouts.utils.DynamicImageFit(el,
                    src, attrs.scaletype, attrs.aligntype);
                scope.isLogoPlaced = true;
                scope.$digest();
              }, 0);
            }
            done = true;
          }
        });
      }
    };
  });


  /**
   * Gets requested CSS property value from the element.
   * support now.
   * @param {Element} el The DOM element to get the indent.
   * @param {string} name Property name.
   * @return {number} Property value.
   */
  function getStyleProperty(el, name) {
    var style = window.getComputedStyle(el, null);
    return parseInt(style[name], 10);
  }


  /**
   * Load the custom fonts for the layout
   * @param {Element} el The DOM element to show.
   * @return {boolean} if the fonts were loaded or not.
   */
  function loadFonts(scope) {

    // We need to load the fonts before we try to fit the texts.
    var el = document.getElementById('ad-container');

    el.style.visibility = 'hidden';
    if (!isIE()) {
      WebFont.load({
        google: {
          families: ['Lato:400,700,900', 'Ubuntu Condensed']
        },
        timeout: 2000,
        active: function() {
          // Let's set a small time out just in case it fails.
          setTimeout(function() {
            // Broadcast the event so customExtTextFit can do its magic.
            scope.$broadcast('fontsLoaded');
            el.style.visibility = 'visible';
            layoutMethods.animationBuild();

            return true;
          }, 10);
        }
      });
    } else {
      setTimeout(function() {
        // Broadcast the event and use the default fonts.
        scope.$broadcast('fontsLoaded');
        el.style.visibility = 'visible';
        return false;
      }, 100);
    }


    /**
     * Check if the user is using IE.
     * @return {boolean} Whether is IE.
     */
    function isIE() {
      var myNav = navigator.userAgent.toLowerCase();
      return (myNav.indexOf('msie') != -1) ?
          parseInt(myNav.split('msie')[1], 10) : false;
    }
  }


  /**
   * Calls DynamicTextFit for the passed element.
   * @param {!angular.Object} $el Object of the DOM element to handle.
   */
  function customExtTextFit(el) {
    var minfontsize = el.attr('minfontsize');
    var multiline = el.attr('multiline');
    var truncate = el.attr('truncate');
    var maxWidth = getStyleProperty(el[0], 'max-width');
    var width = el[0].offsetWidth;

    if (width <= maxWidth - MAX_TEXT_MARGIN) {
      el[0].style.width = width + 'px';
      el[0].style.maxWidth = width + MAX_TEXT_MARGIN + 'px';
    }

    var dynamicTextFit = new ddab.layouts.utils.DynamicTextFit(el[0],
        minfontsize && minfontsize.toNumber(),
        multiline && multiline.toBoolean(),
        truncate && truncate.toBoolean());

    dynamicTextFit.scaleText();
  }


  /**
   * Calls DynamicTextFit for the passed element.
   * @param {!angular.Object} element Object of the DOM element to handle.
   */
  function nameTextFit(element) {
    var parentEl = element.parent();
    var nameEl = parentEl[0].querySelector('.product-name');
    var nameWidth = nameEl.offsetWidth;
    var parentWidth = parentEl[0].offsetWidth;
    var nameMargin = element.attr('namemargin') * 1;
    var subtitleWidth = parentWidth - nameWidth - nameMargin;

    element[0].style.width = subtitleWidth + 'px';
    element[0].style.maxWidth = subtitleWidth + 'px';

    var minfontsize = element.attr('minfontsize');
    var multiline = element.attr('multiline');
    var truncate = element.attr('truncate');

    var dynamicTextFit = new ddab.layouts.utils.DynamicTextFit(element[0],
        minfontsize && minfontsize.toNumber(),
        multiline && multiline.toBoolean(),
        truncate && truncate.toBoolean());

    dynamicTextFit.addEventListener('textfit', function() {
      var scaledFontSize = dynamicTextFit.getScaledFontSize();
      helpers.alignText(element, scaledFontSize);
    });

    dynamicTextFit.scaleText();
  }


  /**
   * Creates the list of the CSS classes to apply to the layout content
   * depending on parameters from DAB.
   * @param {!angular.Scope} scope AngularJS layout scope.
   * @return {!Object.<string>} All available CSS classes.
   */
  function getClasses(scope) {
    var layout = [];
    var design = scope.design;

    layout.push(design['cornerStyle']);
    var bg = [];
    var btn = [design['btnStyle']];
    return {
      layout: layout.join(' '),
      bg: bg.join(' '),
      button: btn.join(' ')
    };
  }

  ng.module('layout', ['utils', module.name]);



  return {
    controller: LayoutController
  };
})(angular);


/**
 * Education multi item vertical.
 */
(function() {
  utils.defineMeta('version', '4.0');

  // REQUIRED
  // Per discussion in the design ticket we have 4 required fields.

  utils.defineAttribute('Headline', 'productClickOnly', true);
  utils.defineAttribute('Product', 'name', true);
  utils.defineAttribute('Product', 'url', true);

  // OPTIONAL

  utils.defineAttribute('Design', 'logoImageUrl', false);
  utils.defineAttribute('Headline', 'disclaimer', false);
  utils.defineAttribute('Headline', 'txt', false);
  utils.defineAttribute('Headline', 'url', false);
  utils.defineAttribute('Product', 'description', false);
  utils.defineAttribute('Product', 'subTitle', false);
  utils.defineAttribute('Design', 'logoImageUrl', false);
  utils.defineAttribute('Design', 'borderColor', false);
  utils.defineAttribute('Design', 'bgColor', false);
  utils.defineAttribute('Design', 'bgColorAlt', false);
  utils.defineAttribute('Design', 'logoPadding', false);
  utils.defineAttribute('Design', 'txtColorDisc', false);
  utils.defineAttribute('Design', 'txtColorProduct', false);
  utils.defineAttribute('Design', 'txtColorTitle', false);
  utils.defineAttribute('Design', 'txtColorSubTitle', false);
  utils.defineAttribute('Design', 'txtColorDescription', false);
  utils.defineAttribute('Design', 'fontUrl', false);

  // OCCURRENCES

  utils.defineOccurrences('Headline', 1, 1);
  utils.defineOccurrences('Design', 1, 1);
  utils.defineOccurrences('Product', 1, 3);

  window.setup = function() {
    document.body.addEventListener('click', utils.clickHandler, false);
  };

  window.initPreloading = function(dynamicData) {
    var data = dynamicData.google_template_data.adData[0];
    var design = utils.parse(data, 'Design')[0];
    var prods = utils.parse(data, 'Product').slice(0);
    var preloader = utils.preloader;
    for (var i = 0; i < prods.length; i++) {
      preloader.addImage(prods[i].imageUrl);
    }
    preloader.addImage(design.logoImageUrl);
    preloader.addImage(design.bgImageUrl);
    return preloader;
  };
})();
