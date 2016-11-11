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
 * Controls the Other Page
 */
app.controller('PageCtrl', function ( $scope, $rootScope, $location, $window, auth, Data) {
  console.log("Page Controller reporting for duty.");
  $scope.userInfo = auth;
  $rootScope.userName = $scope.userInfo.userName;
  if($scope.userInfo != null) { $rootScope.isLoggedIn = true; } else { $rootScope.isLoggedIn = false; }
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
 * Controller For Coupons Page .
 */
app.controller('CouponsCtrl', function ($scope, $rootScope, $location, $http, $window, $filter, auth, Data) {
    
    $scope.order = {};
    $scope.order.orderItems = {};
    $scope.foodCoupons = {};

    // Retrieve all coupons
    Data.get('products').then(function(data){
        $scope.foodCoupons = data.data;
        $scope.foodCouponsInit = angular.copy($scope.foodCoupons);// Initialize to different object as we need to refresh after save
    });

    $scope.orders = []; //Get All Orders
    $scope.pageSize = 5; // Set Page Size

    Data.get('orders').then(function(data){
        $scope.orders = data.data;
    });
    
    $scope.getTotal = function(){ //Original Working Method
      var total = 0;
      $scope.order.orderItems = angular.copy($scope.foodCoupons);
      for(var i = 0; i < $scope.order.orderItems.length; i++){
          var product = $scope.order.orderItems[i];
          var qty = (product.qty!=null)?product.qty:0;
          product.subtotal = product.price * qty;
          total += (product.price * qty);
      }
      return total;
    }

    $scope.deleteOrder = function(order){
        if(confirm("Are you sure to remove the order")){
            Data.delete("orders/"+order.order_id).then(function(result){
                $scope.orders = _.without($scope.orders, _.findWhere($scope.orders, {order_id:order.order_id}));
            });
        }
    };
    $scope.saveOrder = function () {
        $scope.order.order_amt = $scope.getTotal();
          if ($scope.orderForm.$valid) {
            Data.post("orders", $scope.order).then(function(result){
              if(result.status == 'success') {
                $scope.submitStatusSuccess = true;
                $scope.submitStatusError = false;
                $scope.message = result.message;
                $scope.orders.push(result.data);
                $scope.orders = $filter('orderBy')($scope.orders, 'order_id', 'reverse');
                // Set Order & Order form to it's initial state
                $scope.order = {};
                $scope.foodCoupons = angular.copy($scope.foodCouponsInit);/*Reassign object to this */
                $scope.orderForm.$setPristine();
              } else {
                $scope.submitStatusSuccess = false;
                $scope.submitStatusError = true;
                $scope.message = result.message;
              }
            });
          }
    };
    //To Show Order Grid
    $scope.gridColumns = [
        {text:"#Id",predicate:"id",sortable:true,dataType:"number"},
        {text:"Issued To",predicate:"issuedTo",sortable:true},
        {text:"Items",predicate:"",sortable:false},
        {text:"Order Total",predicate:"total",sortable:true},
        {text:"Issued By",predicate:"issuedBy",sortable:true},
        {text:"Created At",predicate:"created_at",sortable:true},
        {text:"Action",predicate:"",sortable:false}
    ];

    $scope.userInfo = auth;
    $rootScope.userName = $scope.userInfo.userName;
    if($scope.userInfo != null) { $rootScope.isLoggedIn = true; } else { $rootScope.isLoggedIn = false; }

});

/**
 * Controls the Blog
 */
app.controller('RechargeCtrl', function ( $scope, $rootScope, $location, $window, auth, Data) {
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
        console.log($scope.quote.cellNo);
        Data.post("validateno", $scope.quote).then(function(result){
          if(result.status == 'success') {
            $scope.message = result.validate;
            $scope.errorValidNumber = false;
            $scope.order.serviceNumber = $scope.quote.cellNo;
          } else {
            $scope.quoteForm.cellNo.$invalid= true;
            $scope.quoteForm.$invalid = true;
            $scope.errorValidNumber = 'Invalid Number';
          }
        });
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

  $scope.userInfo = auth;
  $rootScope.userName = $scope.userInfo.userName;
  if($scope.userInfo != null) { $rootScope.isLoggedIn = true; } else { $rootScope.isLoggedIn = false; }
});

// ------ https://gist.github.com/kmaida/06d01f6b878777e2ea34 -- Not working because it's having old bootstrap tpls

/*Below Controller : Deprecated*/
app.controller('ExportCtrl', function ($scope, $rootScope, $sce, auth, Data, alertService) {
    $scope.years = [
                      {id:"2016",name:"2016"}
                    ];
    $scope.months = [
                      {id:"1",name:"January"},
                      {id:"2",name:"February"},
                      {id:"3",name:"March"},
                      {id:"4",name:"April"},
                      {id:"5",name:"May"},
                      {id:"6",name:"June"},
                      {id:"7",name:"July"},
                      {id:"8",name:"August"},
                      {id:"9",name:"September"},
                      {id:"10",name:"October"},
                      {id:"11",name:"November"},
                      {id:"12",name:"December"}
                    ];
    console.log("Export Controller reporting for duty.");
    //alertService.alert.msg = '';
    alertService.hide();
    $scope.submitExportForm = function() {
      Data.post('exportOrders',$scope.export).then(function(result){
        if(result.status == 'success') {
          alertService.success(result.message);
          var link_html = '<a class="btn btn-primary" target="_blank" href="'+result.file+'" role="button"><i class="fa fa-download" aria-hidden="true"></i> Download</a>';
          $scope.fileDownloadLink = $sce.trustAsHtml(link_html);
          $scope.message = result.message;
          $scope.export = {};
        } else {
          $scope.fileDownloadLink = '';
          alertService.danger(result.message);
          //$scope.message = result.message;
        }
      });
    }

    $scope.userInfo = auth;
    $rootScope.userName = $scope.userInfo.userName;
    if($scope.userInfo != null) { $rootScope.isLoggedIn = true; } else { $rootScope.isLoggedIn = false; }
});

app.controller('productsCtrl', function ($scope, $modal, $filter, Data) {
    $scope.product = {};
    Data.get('products').then(function(data){
        $scope.products = data.data;
    });
    $scope.changeProductStatus = function(product){
        product.status = (product.status=="Active" ? "Inactive" : "Active");
        Data.put("products/"+product.id,{status:product.status});
    };
    $scope.deleteProduct = function(product){
        if(confirm("Are you sure to remove the product")){
            Data.delete("products/"+product.id).then(function(result){
                $scope.products = _.without($scope.products, _.findWhere($scope.products, {id:product.id}));
            });
        }
    };
    $scope.open = function (p,size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/productEdit.html',
          controller: 'productEditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
            if(selectedObject.save == "insert"){
                $scope.products.push(selectedObject);
                $scope.products = $filter('orderBy')($scope.products, 'id', 'reverse');
            }else if(selectedObject.save == "update"){
                p.description = selectedObject.description;
                p.price = selectedObject.price;
                p.stock = selectedObject.stock;
                p.packing = selectedObject.packing;
            }
        });
    };
    
 $scope.columns = [
                    {text:"ID",predicate:"id",sortable:true,dataType:"number"},
                    {text:"Name",predicate:"name",sortable:true},
                    {text:"Price",predicate:"price",sortable:true},
                    {text:"Stock",predicate:"stock",sortable:true},
                    {text:"Packing",predicate:"packing",reverse:true,sortable:true,dataType:"number"},
                    {text:"Description",predicate:"description",sortable:true},
                    {text:"Status",predicate:"status",sortable:true},
                    {text:"Action",predicate:"",sortable:false}
                ];

});


app.controller('productEditCtrl', function ($scope, $modalInstance, item, Data) {

  $scope.product = angular.copy(item);
        
        $scope.cancel = function () {
            $modalInstance.dismiss('Close');
        };
        $scope.title = (item.id > 0) ? 'Edit Product' : 'Add Product';
        $scope.buttonText = (item.id > 0) ? 'Update Product' : 'Add New Product';

        var original = item;
        $scope.isClean = function() {
            return angular.equals(original, $scope.product);
        }
        $scope.saveProduct = function (product) {
            product.uid = $scope.uid;
            if(product.id > 0){
                Data.put('products/'+product.id, product).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(product);
                        x.save = 'update';
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }else{
                product.status = 'Active';
                Data.post('products', product).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(product);
                        x.save = 'insert';
                        x.id = result.data;
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }
        };
});