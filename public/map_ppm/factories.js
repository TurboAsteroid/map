angular.module('factoriesModule', [])
    .factory('Zoom', function() {
        var zoom = {
            zoom_obj: false,
            transform: {
                x: 0,
                y: 0,
                k: 1
            }
        };
        return {
            set: function(tmp) {
                zoom = $.extend(zoom, tmp);
            },
            get: function(key) {
                return key ? zoom[key] : zoom;
            }
        };
    })
    .factory('User', function() {
        var user_var = {
            'username' : null,
            'password' : null
        };
        return {
            set: function(new_user_var) {
                user_var = new_user_var;
            },
            get: function() {
                return user_var;
            },
            reset: function() {
                user_var = {
                    'username' : null,
                    'password' : null
                };
                return true;
            }
        };
    })
    .factory('Logged', function() {
        var l = false;
        return {
            set: function(new_l) {
                l = new_l;
            },
            get: function() {
                return l;
            }
        };
    })
    .factory('TableData', function() {
        var table_data = {};
        return {
            set: function(new_table_data) {
                table_data = new_table_data;
            },
            get: function() {
                return table_data;
            }
        };
    })

    .service('MapData', function($http, $rootScope, $location, $routeParams) {
        var mapData;
        this.getData =  function() {
            if (!this.mapData) {
                this.mapData= $http({
                    method: 'GET',
                    url: '/api/map_legend',
                    data: {date: $routeParams.date}
                }).then(function (response) {

                    return response;
                }, function(response) {
                    if (!response.data.success) {
                        $rootScope.load = false;
                        console.log('data request error');
                    }
                    $location.path('/');
                });
            }
            return this.mapData;
        };
    });