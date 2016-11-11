/**
 * AngularJS Implementation
 * @author Abhishek Srivastava <abhishek.srivastava@smartdatainc.net>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('ngWebApp', [
  'ngRoute', 'ngAnimate', 'ui.bootstrap'
]);

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
 * Factory Method For Login Authentication
 */
app.factory("authenticationSvc", ["$http","$q","$window",function ($http, $q, $window) {
    var userInfo;

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post("bin/login.php", { userName: userName, password: password })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.access_token,
                    userName: result.data.userName
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();

        $http({
            method: "POST",
            url: "bin/logout.php",
            headers: {
                "access_token": userInfo.accessToken
            }
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getUserInfo() {
        return userInfo;
    }

    function init() {
        if ($window.sessionStorage["userInfo"]) {
            userInfo = JSON.parse($window.sessionStorage["userInfo"]);
        }
    }
    init();

    return {
        login: login,
        logout: logout,
        getUserInfo: getUserInfo
    };
}]);

/**
  * Factory For FoodCoupons Items
  */
app.factory("ngWebAppFactory", ["$http","$q","$window", function ($http, $q, $window) {
  return {
      getFoodCoupons: function () {
        var deferred = $q.defer(),
          httpPromise = $http.get('/abhisheks/angular_project/chargeIt/bin/read_products.php');
 
        httpPromise.success(function (components) {
          deferred.resolve(components);
        })
          .error(function (error) {
            console.error('Error: ' + error);
          });
 
        return deferred.promise;
      },
      getAllOrders: function () {
        var deferred = $q.defer(),
          httpPromise = $http.get('/abhisheks/angular_project/chargeIt/bin/read_orders.php');
 
        httpPromise.success(function (components) {
          deferred.resolve(components);
        })
          .error(function (error) {
            console.error('Error: ' + error);
          });
 
        return deferred.promise;
      }
    };
}]);
/**
 * Configure the Routes
 */
app.config(['$routeProvider','$locationProvider', function ($routeProvider, $locationProvider){

  $routeProvider
    .when("/", {
        title: 'Portal',
        templateUrl: "partials/about.html",
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
        title: 'Portal - Recharge',
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
    .when("/foodcoupons", {
        title: 'Portal - Food Coupons',
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
    .when("/login", { title: 'Portal - Login', templateUrl: "partials/login.html", controller: "LoginCtrl"});
}]);

/**
 * Main Controller : Controls the handling of main content
 */
app.controller('MainCtrl', function ($scope, $rootScope, $location, $window, authenticationSvc) {
    console.log("Main Controller reporting for duty.");

    var userInfo = authenticationSvc.getUserInfo();
    if(userInfo != null) { $rootScope.isLoggedIn=true; } else { $rootScope.isLoggedIn = false; }

    $scope.logout = function () {
        authenticationSvc.logout()
            .then(function (result) {
                $scope.userInfo = null;
                $rootScope.isLoggedIn = false;//Added For check
                $location.path("/login");
            }, function (error) {
                console.log(error);
            });
    };
});

/**
 *
 */
app.controller("LoginCtrl", function ($scope, $rootScope, $location, $window, authenticationSvc) {
    $scope.userInfo = null;
    $scope.login = function () {
        authenticationSvc.login($scope.userName, $scope.password)
            .then(function (result) {
                $scope.userInfo = result;
                //$rootScope.loggedIn = result; //Added By Abhishek to move scope returns to another variables
                $scope.isLoggedIn = true;
                $rootScope.userInfo = result; //Send Data From One Controller to another
                //console.log($rootScope.userName);
                $location.path("/");
            }, function (error) {
                $window.alert("Invalid credentials");
                console.log(error);
            });
    };

    $scope.cancel = function () {
        $scope.userName = "";
        $scope.password = "";
    };
});

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ($scope, $rootScope, $location, $http, $window, authenticationSvc, auth) {
    console.log("Page Controller reporting for duty.");

    $scope.userInfo = auth;
    $rootScope.userName = $scope.userInfo.userName;
    console.log($scope.userName);
    if($scope.userInfo != null) { $rootScope.isLoggedIn = true; } else { $rootScope.isLoggedIn = false; }

});

/**
 * Controller For Coupons Page .
 */
app.controller('CouponsCtrl', function ($scope, $rootScope, $location, $http, $window, $filter, ngWebAppFactory, auth, Data) {
    
    $scope.order = {};
    $scope.order.orderItems = {};
    $scope.foodCoupons = {};
    //Call Factory Method for retrieving Coupons
    ngWebAppFactory.getFoodCoupons()
      .then(function(components) {
          $scope.foodCoupons = components.records;
      }, function(error) { 
          console.log(error);
      });

    $scope.getTotal = function(){
      var total = 0;
      for(var i = 0; i < $scope.foodCoupons.length; i++){
          var product = $scope.foodCoupons[i];
          product.subtotal = product.price * product.qty;
          total += (product.price * product.qty);
          $scope.order.orderItems[i] = product;
      }
      return total;
    }
    $scope.deleteOrder = function(order){
        if(confirm("Are you sure to remove the order")){
            Data.delete("orders/"+order.id).then(function(result){
                $scope.orders = _.without($scope.orders, _.findWhere($scope.orders, {id:order.id}));
            });
        }
    };
    $scope.saveOrder = function () {
          $scope.order.total = $scope.getTotal();
          if ($scope.orderForm.$valid) {
            $http({
                method  : 'POST',
                url     : 'bin/create_order.php',
                data    : $scope.order, //form quote object
                headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
              })
              .success(function(data) {
                  if (data.status) {
                      $scope.submitStatusSuccess = true;
                      $scope.submitStatusError = false;
                      $scope.message = data.message;
                      $scope.orders.push(data.order);
                      $scope.orders = $filter('orderBy')($scope.orders, 'id', 'reverse');
                      console.log($scope.orders);
                  } else {
                      // Showing errors.
                      $scope.submitStatusSuccess = false;
                      $scope.submitStatusError = true;
                      $scope.message =data.message;
                  }
              });
          }
      };

      $scope.orders = {}; //Get All Orders
      ngWebAppFactory.getAllOrders()
        .then(function(components) {
            console.log(components.records);
            $scope.orders = components.records;
        }, function(error) { 
            console.log(error);
      });
      //To Show Order Grid
      $scope.gridColumns = [
                    {text:"#ID",predicate:"id",sortable:true,dataType:"number"},
                    {text:"Issued To",predicate:"issuedTo",sortable:true},
                    {text:"Items",predicate:"",sortable:false},
                    {text:"Order Total",predicate:"total",sortable:true},
                    {text:"Issued By",predicate:"issuedBy",sortable:true},
                    {text:"Created At",predicate:"created_at",sortable:true},
                    {text:"Action",predicate:"",sortable:false}
                ];
      //

    $scope.userInfo = auth;
    $rootScope.userName = $scope.userInfo.userName;
    if($scope.userInfo != null) { $rootScope.isLoggedIn = true; } else { $rootScope.isLoggedIn = false; }

});

/**
  * Controller for recharge page
**/
app.controller('RechargeCtrl', function( $scope, $rootScope, $location, $http, $window, authenticationSvc, auth) {
    console.log("Recharge Controller reporting for duty.");

    $scope.steps = ['serviceNumber', 'serviceType', 'serviceOperator', 'amount', 'thanks'];
    $scope.selection = $scope.steps[0]; // Set step 0 as default

    $scope.quote = {};
    $scope.order = {};

    $scope.quote.serviceType = {
      availableOptions: [
        {name:"Prepaid", value:'prepaid'},
        {name:"Postpaid", value:'postpaid'}
      ],
      selectedOption: {name:"Prepaid", value:'prepaid'}
    };

    $scope.quote.operators = {
      availableOptions: [
                          {name:'BSNL', value:'bsnl'},
                          {name:'IDEA', value:'idea'},
                          {name:'Reliance CDMA', value:'reliance_cdma'},
                          {name:'Tata Docomo',value:'tata_docomo'},
                          {name:'Airtel',value:'airtel'},
                          {name:'Vodafone',value:'vodafone'}
                        ],
      selectedOption: {name:'BSNL',value:'bsnl'}
    };

    // Disable button if not a valid quote
    $scope.validQuote = function() {
      var stepIndex = $scope.getCurrentStep();
        if ($scope.quoteForm.$valid) {
          return true;
        } else {
          return false;
        }
    };

    // Get Current Step
    $scope.getCurrentStep = function() {
        // Get the index of the current step given selection
        return _.indexOf($scope.steps, $scope.selection);
    };

    // Previous Step
    $scope.hasPreviousEnabled = function() {
        var stepIndex = $scope.getCurrentStep();
        var previousStep = stepIndex - 1;
        // Return true if there is a next step, false if not
        return !_.isUndefined($scope.steps[previousStep]);
    };

    // Next Step
    $scope.hasNextEnabled = function() {
        var stepIndex = $scope.getCurrentStep();
        var previousStep = stepIndex + 1;
        // Return true if there is a next step, false if not
        return !_.isUndefined($scope.steps[previousStep]);
    };

    //Go Previous
    $scope.goPrevious = function() {
        if ( $scope.hasPreviousEnabled() ) {
          var stepIndex = $scope.getCurrentStep();
          var nextStep = stepIndex - 1;
          $scope.selection = $scope.steps[nextStep];
        }
    }

    //validate every steps
    $scope.validateStep = function() {
      var currentStepIndex = $scope.getCurrentStep();
      if(currentStepIndex == 0) { //Validate Service Number
        if ($scope.quoteForm.$valid) {
          $http({
              method  : 'POST',
              url     : 'bin/validateNo.php',
              data    : $scope.quote, //form quote object
              headers : {'Content-Type': 'application/x-www-form-urlencoded'} 
            })
            .success(function(data) {
                if (data.validate) {
                    $scope.message = data.validate;
                    $scope.errorValidNumber = false;
                    $scope.order.serviceNumber = $scope.quote.cellNo;
                    //$scope.selection = $scope.steps[1];
                } else {
                    // Showing errors.
                    $scope.quoteForm.cellNo.$invalid= true;
                    $scope.quoteForm.$invalid = true;
                    $scope.errorValidNumber = 'Invalid Number';
                }
            });
        }
      }
      if(currentStepIndex == 1) {
        $scope.order.serviceType = $scope.quote.serviceType.selectedOption.value;
      }
      if(currentStepIndex == 2) {
        $scope.order.operator = $scope.quote.operators.selectedOption.value;
      }
      if(currentStepIndex == 3) {
        $scope.order.amount = $scope.quote.amount;
      }
      console.log($scope.order);
      return true;
    }

    // Go Next
    $scope.goNext = function() {
        //console.log($scope.quote);
        if ( $scope.hasNextEnabled() && $scope.validateStep() ) {
          var stepIndex = $scope.getCurrentStep();
          var nextStep = stepIndex + 1;
          $scope.selection = $scope.steps[nextStep];
        }
    };
});

app.directive('validNumber', function() {
    return{
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl){
            return;
          }

          ngModelCtrl.$parsers.push(function (val) {
            if(angular.isUndefined(val)) {
               var val = '';
            }
            var clean = val.replace(/[^0-9]+/g, '');
            if( val !== clean ) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });

          element.bind('keypress', function(event){
            if(event.keyCode==32) {
              event.preventDefault();
            }
          });

        }
    };
});

/*End Of Functionality Recharge*/
/*
**
*/