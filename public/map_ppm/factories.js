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

    // .factory('Logged', function(){
    //     var factory = { isLogged: false };
    //     return factory;
    // })
    .service('MapData', ['$http', function($http) {
        var mapData;
        this.getData =  function() {
            if (!this.mapData) {
                this.mapData = $http({
                    method: 'GET',
                    url: '/resourses/storage_list.json'
                });
            }
            return this.mapData;
        };

    }]);