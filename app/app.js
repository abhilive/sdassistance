var app = angular.module('ngWebApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ngAnimate', 'angularUtils.directives.dirPagination']); // Removed -  'angularUtils.directives.dirPagination'

app.run(["$location","$rootScope", function($location, $rootScope) {
  $rootScope.$on("$routeChangeSuccess", function(event, current, previous) {
      // Check the for current route
        if(current.$$route) {
            // Set current page title 
            $rootScope.title = current.$$route.title;
        }

        $rootScope.isActive = function (viewLocation) { 
          // Set the class of selected menu item 'active'
          return ($location.path().substr(0, viewLocation.length) === viewLocation) ? 'active' : '';
      };
  });

  $rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
    if (eventObj.authenticated === false) {
      console.log(eventObj.authenticated);
      $location.path("/login");
    }
  });
}]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider','$locationProvider', function ($routeProvider, $locationProvider){

  $routeProvider
    .when("/", {
        title: 'sD Assistance Portal',
        templateUrl: "partials/services.html",
        controller: "PageCtrl",
        resolve: {
            auth: function ($q, authenticationSvc) {
                var userInfo = authenticationSvc.getUserInfo();
                if (userInfo) {
                    return $q.when(userInfo);
                } else {
                    return $q.reject({ authenticated: false });
                }
            }
        }
    })
    .when("/recharge", {
        title: 'sD Assistance Portal - Recharge',
        templateUrl: "partials/recharge.html",
        controller: "RechargeCtrl",
        resolve: {
            auth: function ($q, authenticationSvc) {
                var userInfo = authenticationSvc.getUserInfo();
                if (userInfo) {
                    return $q.when(userInfo);
                } else {
                    return $q.reject({ authenticated: false });
                }
            }
        }
    })
    .when("/food-coupons/create-order", {
        title: 'sD Assistance Portal - Food Coupons',
        templateUrl: "partials/foodcoupons.html",
        controller: "CouponsCtrl",
        resolve: {
            auth: function ($q, authenticationSvc) {
                var userInfo = authenticationSvc.getUserInfo();
                if (userInfo) {
                    return $q.when(userInfo);
                } else {
                    return $q.reject({ authenticated: false });
                }
            }
        }
    })
    .when("/food-coupons/export", {
        title: 'sD Assistance Portal - Export',
        templateUrl: "partials/export.html",
        controller: "ExportCtrl",
        resolve: {
            auth: function ($q, authenticationSvc) {
                var userInfo = authenticationSvc.getUserInfo();
                if (userInfo) {
                    return $q.when(userInfo);
                } else {
                    return $q.reject({ authenticated: false });
                }
            }
        }
    })
    .when("/login", { title: 'Portal - Login', templateUrl: "partials/login.html", controller: "LoginCtrl"});
  }]);