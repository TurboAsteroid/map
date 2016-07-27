'use strict';
angular.module('authController', ['ngRoute'])

    .controller('authController', function($scope, $http, $location, User) {
        $scope.user = User.get();
        $scope.login = function () {
            $scope.message = '';
            $scope.entering = true;
            var data = {
                'Content-Type': 'application/json;charset=UTF-8',
                'username': $scope.user.username,
                'password': $scope.user.password
            };
            $http({
                method  : 'POST',
                url     : '/api/authenticate',
                data    : data
            })
                .success(function (data, status, headers, config) {
                    if(data.success) {
                        $scope.entering = false;
                        $scope.user.username = '';
                        $scope.user.password = '';
                        var user_var = {
                            'username' : null,
                            'password' : null,
                            'tokenUser' : data.tokenUser,
                            'tokenPassword' : data.tokenPassword
                        };
                        User.set(user_var);
                        $location.path('/map_ppm')
                    }
                    else {
                        $scope.user.password = '';
                        $scope.message = data.message;
                    }
                })
                .error(function (data, status, header, config) {
                    $scope.entering = false;
                    $scope.user.password = '';
                    $scope.message = data.message;
                });
        };
    });