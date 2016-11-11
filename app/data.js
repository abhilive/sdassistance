app.factory("Data", ['$http', '$location',
    function ($http, $q, $location) {

        var serviceBase = 'api/v1/index.php/';

        var obj = {};

        obj.get = function (q) {
            return $http.get(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        obj.post = function (q, object) {
            return $http.post(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.put = function (q, object) {
            return $http.put(serviceBase + q, object).then(function (results) {
                return results.data;
            });
        };
        obj.delete = function (q) {
            return $http.delete(serviceBase + q).then(function (results) {
                return results.data;
            });
        };
        return obj;
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
                console.log(result);
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
/*Service for alert directive*/
app.service('alertService', function() {
  var me = this;
  me.alertObj = {
    show: false,
    msg: '',
    type: 'alert-success'
  };
  me.alertShow = false;
  me.alertTypes = ['alert-success', 'alert-info', 'alert-warning', 'alert-danger'];
  me.alert = function(type, msg) {
    me.alertObj.msg = msg;
    me.alertObj.type = me.alertTypes[type];
    me.alertObj.show = true;
  };
  me.success = function(msg) {
    me.alert(0, msg);
  };
  me.info = function(msg) {
    me.alert(1, msg);
  };
  me.warning = function(msg) {
    me.alert(2, msg);
  };
  me.danger = function(msg) {
    me.alert(3, msg);
  };
  me.hide = function() {
    console.log('hiding');
    me.alertObj.show = false;
  };
  return this;
});