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
 * Controller For Coupons Page .
 */
app.controller('CouponsCtrl', function ($scope, $rootScope, $location, $http, $window, filterFilter, auth, Data) {
    
    $scope.order = {};
    $scope.order.orderItems = {};
    $scope.foodCoupons = {};

    // create empty search model (object) to trigger $watch on update
    $scope.filterOrder = '';
    $scope.resetFilters = function () {
      // needs to be a function or it won't trigger a $watch
      $scope.filterOrder = {};
    };

    // Retrieve all coupons
    Data.get('products').then(function(data){
        $scope.foodCoupons = data.data;
        $scope.foodCouponsInit = angular.copy($scope.foodCoupons);// Initialize to different object as we need to refresh after save
    });

    // Retrieve all orders
    $scope.orders = []; //Get All Orders
    $scope.currentPage = 1;
    //$scope.totalItems = $scope.orders.length; //added
    $scope.entryLimit = 5; // items per page - added
    //$scope.pageSize = 10; // -commented

    Data.get('orders').then(function(data){
        $scope.orders = data.data;
        $scope.totalItems = $scope.orders.length; //added
        $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
        console.log($scope.noOfPages);
    });

    console.log($scope.orders);

    // ------ https://gist.github.com/kmaida/06d01f6b878777e2ea34

    //$scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit); //added
    // $watch search to update pagination - added
    $scope.$watch('filterOrder', function (newVal, oldVal) {
      $scope.filtered = filterFilter($scope.orders, newVal);
      $scope.totalItems = $scope.filtered.length;
      $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
      console.log('test');
      console.log($scope.noOfPages);
      $scope.currentPage = 1;
    }, true);

    /*$scope.setCurrentPage = function(currentPage) {
        $scope.currentPage = currentPage;
    }*/

    $scope.getNumberOfPages=function(){
        console.log($scope.noOfPages);
        return Math.ceil($scope.orders.length/$scope.entryLimit);                
    }

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
