var storeApp = angular
    .module('storeApp', ['infinite-scroll', 'ngRoute', 'ngSanitize', 'ngAnimate', 'ngTouch', 'chieffancypants.loadingBar', 'gsn.core', 'ui.map', 'ui.keypress', 'ui.event', 'ui.utils', 'angulartics'])
    .config(['$routeProvider', function ($routeProvider) {
      // disable theme
      gsn.config.SiteTheme = 'bootstrap';
      gsn.config.defaultMobileListView = true;

      var le = [gsn.getThemeUrl('/views/layout.html')];
      for(var i = 1; i < 5; i++){
        le.push(gsn.getThemeUrl('/views/layout-gsn' + i + '.html'));
      }
      var urls = [
        {   login: 0, store: 0, path: '/', tpl: gsn.getThemeUrl('/views/home.html') }
        , { login: 0, store: 0, layout: le[3], path: '/article', tpl: gsn.getThemeUrl('/views/engine/article.html') }
        , { login: 0, store: 0, layout: le[3], path: '/article/:id', tpl: gsn.getThemeUrl('/views/engine/article.html') }
        , { login: 0, store: 1, layout: le[4], path: '/circular', tpl: gsn.getThemeUrl('/views/engine/circular-view.html')}
        , { login: 0, store: 1, layout: le[4], path: '/circular/:viewtype', tpl: gsn.getThemeUrl('/views/engine/circular-view.html') }
        , { login: 0, store: 0, layout: le[3], path: '/contactus', tpl: gsn.getThemeUrl('/views/engine/contact-us.html'), controller: 'ContactUsCtrl' }
        , { login: 0, store: 1, layout: le[3], path: '/coupons/digital', tpl: gsn.getThemeUrl('/views/engine/coupons-view.html') }
        , { login: 0, store: 1, layout: le[3], path: '/coupons/printable', tpl: gsn.getThemeUrl('/views/engine/coupons-view.html') }
        , { login: 0, store: 1, layout: le[3], path: '/coupons/store', tpl: gsn.getThemeUrl('/views/engine/coupons-view.html') }
        , { login: 0, store: 0, layout: le[3], path: '/mealplannerfull', tpl: gsn.getThemeUrl('/views/engine/meal-planner.html') }
        , { login: 1, store: 0, layout: le[3], path: '/savedlists', tpl: gsn.getThemeUrl('/views/engine/saved-lists.html') }
        , { login: 0, store: 0, layout: le[3], path: '/mylist', tpl: gsn.getThemeUrl('/views/engine/shopping-list.html') }
        , { login: 0, store: 0, path: '/mylist/print', tpl: gsn.getThemeUrl('/views/engine/shopping-list-print.html') }
        , { login: 0, store: 0, layout: le[2], path: '/mylist/email', tpl: gsn.getThemeUrl('/views/engine/shopping-list-email.html') }
        , { login: 1, store: 0, layout: le[3], path: '/myrecipes', tpl: gsn.getThemeUrl('/views/engine/my-recipes.html') }
        , { login: 1, store: 0, path: '/profile', tpl: gsn.getThemeUrl('/views/engine/profile-edit.html') }
        , { login: 0, store: 0, layout: le[3], path: '/recipe/search', tpl: gsn.getThemeUrl('/views/engine/recipe-search.html') }
        , { login: 0, store: 0, layout: le[2], path: '/recipe', tpl: gsn.getThemeUrl('/views/engine/recipe-details.html') }
        , { login: 0, store: 0, layout: le[2], path: '/recipe/:id', tpl: gsn.getThemeUrl('/views/engine/recipe-details.html') }
        , { login: 0, store: 0, layout: le[2], path: '/recipecenter', tpl: gsn.getThemeUrl('/views/engine/recipe-center.html') }
        , { login: 0, store: 0, layout: le[3], path: '/recipevideo', tpl: gsn.getThemeUrl('/views/engine/recipe-video.html') }
        , { login: 0, store: 0, layout: le[3], path: '/recipevideo/:id', tpl: gsn.getThemeUrl('/views/engine/recipe-video.html') }
        , { login: 0, store: 0, path: '/registration', tpl: gsn.getThemeUrl('/views/engine/registration.html') }
        , { login: 0, store: 0, layout: le[3], path: '/signin', tpl: gsn.getThemeUrl('/views/engine/signin.html') }
        , { login: 0, store: 0, layout: le[1], path: '/store/:id', tpl: gsn.getThemeUrl('/views/engine/store-info.html') }
        , { login: 0, store: 0, layout: le[2], path: '/storelocator', tpl: gsn.getThemeUrl('/views/engine/store-locator.html') }
        , { login: 0, store: 0, layout: le[3], path: '/unsubscribe', tpl: gsn.getThemeUrl('/views/engine/unsubscribe.html') }
      ];


      angular.forEach(urls, function(v, k){
        $routeProvider.when(v.path, { 
          templateUrl: v.tpl, 
          caseInsensitiveMatch: true, 
          storeRequired: v.store, 
          requireLogin: v.login, 
          controller: v.controller,
          layout: v.layout })
      });
      $routeProvider.otherwise({ templateUrl: gsn.getThemeUrl('/views/engine/static-content.html'), caseInsensitiveMatch: true} );
    }]);

(function (angular, undefined) {
  'use strict';
  var myModule = angular.module('gsn.core');

  myModule.directive("gsnSvgImage", ['$window', '$timeout', 'debounce', function ($window, $timeout, debounce) {

    var directive = {
      link: link,
      restrict: 'A',
    };
    return directive;



    function link(scope, element, attrs) {
      var src = attrs.src, svg;
      var width = 0, height = 0;

      var loadImage = function(src, cb) {
          var img = new Image();    
          img.src = src;
          var error = null;
          img.onload = function() {
              cb(null, img);
          };
          img.onerror = function() {
              cb('ERROR LOADING IMAGE ' + src, null);
          };

      };

      scope.$watch('vm.pageIdx', function() {
        var $win = angular.element($window);
        loadImage(attrs.src, function(err, img) {
          if (!err) {
            element.html('');
            element.append(img);
            width = img.width || img.naturalWidth || img.offsetWidth;
            height = img.height || img.naturalHeight || img.offsetHeight; 

            // set viewBox
            img = angular.element(attrs.gsnSvgImage);
            svg = img.parent('svg');
            // append Image
            svg[0].setAttributeNS("", "viewBox", "0 0 " + width + " " + height + ""); 
            img.attr("width", width).attr("height", height).attr("xlink:href", attrs.src);
            img.show();
            var isIE = /Trident.*rv:11\.0/.test(navigator.userAgent) || /msie/.test(navigator.userAgent);

            if (isIE && attrs.syncHeight){
              var resizer = debounce(function(){
                var actualWidth = element.parent().width();
                var ratio = actualWidth / (width || actualWidth || 1);
                var newHeight = ratio * height;

                if (newHeight > height){
                  angular.element(attrs.syncHeight).height(newHeight);
                }
              }, 200);

              resizer();
              $win.on('resize', resizer);
            }

            // re-adjust
            var reAdjust = debounce(function() {
              angular.element('rect').click();
            }, 200);
            reAdjust();

            $win.on('resize', reAdjust);
            $win.on('orientationchange', reAdjust);
          }
        });
      });

    }
  }]);
})(angular);

(function (angular, undefined) {
  'use strict';
  var myModule = angular.module('gsn.core');

  myModule.directive("gsnHoverSync", ['$window', '$timeout', 'debounce', function ($window, $timeout, debounce) {

    var directive = {
      link: link,
      restrict: 'A',
    };
    return directive;

    function link(scope, element, attrs) {
      var doDisplay = debounce(function(e) {
        var ppos = element.parent().offset();
        var pos = element.offset();
        var rect = element[0].getBoundingClientRect();
        angular.element(attrs.gsnHoverSync).css({top: pos.top - ppos.top, left: pos.left - ppos.left, width: rect.width, height: rect.height}).show();
      }, 200);

      element.mouseover(doDisplay);
      element.click(doDisplay);
    }
  }]);
})(angular);
