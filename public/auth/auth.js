'use strict';
angular.module('authModule', ['ngRoute'])

    .controller('authController', function($scope, $http, $location, Logged) {
        if(Logged.get())
            $location.path('/map_ppm')
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
                method: 'POST',
                url: '/api/authenticate',
                data: data
            }).then(function successCallback(response) {
                if (response.data.success) {
                    $scope.entering = false;
                    $scope.user.username = '';
                    $scope.user.password = '';
                    Logged.set(true);
                    $location.path('/map_ppm');
                }
            }, function errorCallback(response) {
                if (!response.data.success) {
                    Logged.set(false);
                    $scope.entering = false;
                    $scope.user.password = '';
                    $scope.message = data.message;
                    console.log('authentication error');
                }
            });
        };
    });