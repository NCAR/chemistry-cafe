app.controller('externalsController', ['$scope', '$http', '$log', function ($scope, $http, $log) {

/* Initialize */

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();
    $scope.purpose ="display";

    /* get molecules, branches, and all species from database for use in page */
    get_externals = function(){
        $http.get("/php/externals.php?action=get_externals").success(function(data) {
            $scope.externals = data;
            $log.log('externals');
        });
    }

    get_externals();

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

    $scope.populateEditExternal = function(external) {
      $http.post('/php/externals.php?action=get_external_by_id',
        {
            'id'   : external.id
        })
        .success(function (data, status, headers, config) {
          $scope.purpose = 'editExternal';
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

    $scope.create_external = function() {
        $http.post('/php/externals.php?action=add_external',
            {
                'name'  : $scope.name,
                'description'  : $scope.description
            })
            .success(function (data, status, headers, config) {
                //alert(data);
                $scope.reset();
                get_externals();
            });

    }

    $scope.modify_external = function() {
        $http.post('/php/externals.php?action=mod_external',
            {
                'id'  : $scope.id,
                'name'  : $scope.name,
                'description' : $scope.description
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_externals();
            });
    }

    $scope.getSpeciesExternalList=function(external){
        $scope.externalSelection=external;
        $http.post('/php/externals.php?action=get_species_in_external',
            {
                'external_id'  : external.id
            })
            .success(function (data, status, headers, config) {
                $scope.purpose='assignExternal';
                $scope.speciesExternalList=data;
            });
    }

    $scope.toggleIncludeInExternal=function(specie){
        //alert(specie.id);
        //alert($scope.externalSelection.id);
        if(specie.inexternal=='T'){
          $http.post('/php/externals.php?action=add_species_in_external',
            {
                'externals_id'  : $scope.externalSelection.id,
                'species_id' : specie.id
            })
            .success(function (data, status, headers, config) {
                //alert(data);
            })
        } else {
          $http.post('/php/externals.php?action=del_species_in_external',
            {
                'externals_id'  : $scope.externalSelection.id,
                'species_id' : specie.id
            })
            .success(function (data, status, headers, config) {
                //alert(data);
            })}
        };


}]);
