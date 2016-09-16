app.controller('familyController', ['$scope', '$http', '$log', function ($scope, $http, $log) {

/* Initialize */

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();
    $scope.purpose ="display";

    /* get molecules, branches, and all species from database for use in page */
    get_families = function(){
        $http.get("/php/families.php?action=get_families").success(function(data) {
            $scope.families = data;
            $log.log('families');
        });
    }

    get_families();

    $scope.sort_by = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };

    $scope.reset = function() {
        $scope.purpose = "display";
        $scope.id = null;
        $scope.name= null;
        $scope.description= null;
        $scope.ordering= null;
    }



/* updates */

    $scope.populateEditFamily = function(family) {
      $http.post('/php/families.php?action=get_family_by_id',
        {
            'id'   : family.id
        })
        .success(function (data, status, headers, config) {
          $scope.purpose = 'editFamily';
          $scope.id = data.id;
          $scope.name = data.name;
          $scope.description = data.description;
          $scope.ordering = data.ordering;
        })
        .error(function(data, status, headers, config){
          alert('error');
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }

    $scope.create_family = function() {
        $http.post('/php/families.php?action=add_family',
            {
                'name'  : $scope.name,
                'description'  : $scope.description
            })
            .success(function (data, status, headers, config) {
                alert(data);
                $scope.reset();
                get_families();
            });

    }

    $scope.modify_family = function() {
        $http.post('/php/families.php?action=mod_family',
            {
                'id'  : $scope.id,
                'name'  : $scope.name,
                'description' : $scope.description
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_families();
            });

    }

}]);
