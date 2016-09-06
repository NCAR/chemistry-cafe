app.controller('speciesGroupController', ['$scope', '$http', function ($scope, $http) {

/* Initialize */

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();
    $scope.purpose ="display";

    /* get molecules, branches, and all species from database for use in page */
    get_groups = function(){
        $http.get("/php/species_groups.php?action=get_groups").success(function(data) {
            $scope.speciesGroups = data;
        });
    }

    get_groups();

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

    $scope.populateEditGroup = function(group) {
      $http.post('/php/species_groups.php?action=get_group_by_id',
        {
            'id'   : group.id
        })
        .success(function (data, status, headers, config) {
          $scope.purpose = 'editGroup';
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

    $scope.create_group = function() {
        $http.post('/php/species_groups.php?action=add_group',
            {
                'name'  : $scope.name,
                'description'  : $scope.description
            })
            .success(function (data, status, headers, config) {
                alert(data);
                $scope.reset();
                get_groups();
            });

    }

    $scope.modify_group = function() {
        $http.post('/php/species_groups.php?action=mod_group',
            {
                'id'  : $scope.id,
                'name'  : $scope.name,
                'description' : $scope.description
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_groups();
            });

    }

}]);
