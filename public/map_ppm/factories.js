angular.module('factoriesModule', [])
    .factory('Transform', function() {
        var transform_var = {
            x : 0,
            y : 0,
            k : 1
        };
        return {
            set: function(new_transform_var) {
                transform_var = new_transform_var;
            },
            get: function() {
                return transform_var;
            }
        };
    })
    .factory('User', function() {
        var user_var = {
            'username' : null,
            'password' : null,
            'tokenUser' : null,
            'tokenPassword' : null
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
                    'password' : null,
                    'tokenUser' : null,
                    'tokenPassword' : null
                };
                return true;
            }
        };
    });