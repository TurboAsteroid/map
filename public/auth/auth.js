'use strict';
angular.module('authModule', ['ngRoute'])

    .controller('authController', function($scope, $http, $location) {
        $scope.user = {
            username: "gs2",
            password: "gs2-1"
        };

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