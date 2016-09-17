app.controller('diagnosticsController', ['$scope', '$location', '$anchorScroll', '$http', '$log', function ($scope, $location, $anchorScroll, $http, $log) {

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    /* Initial purpose of the visit? */
    $scope.purpose = 'masterEdit';

    /* paging and filtering of Species */
    $scope.filteredItems =  [];
    $scope.diagnosticsList  =  [];

    /* Input form at top of page varies, depending on create/mod/delete function */
    $scope.reset_form = function() {
        $scope.form = null ;
        $scope.purpose = 'masterEdit';
    }

    /** get all diagnostics in db (sorted by name) in all mechanisms **/
    get_all_diagnostics = function(){
        $http.post("/php/diagnostics.php?action=get_all_diagnostics").success(function(data) {
            $log.log(data);
            $scope.sdiagnosticsList = data.sdiags;
            $log.log($scope.sdiagnosticsList);
            $scope.rdiagnosticsList = data.rdiags;
        });
    }

    get_all_families = function(){
        $http.post("/php/families.php?action=get_families").success(function(data) {
            $scope.families = data;
        });
    }

    get_all_species = function(){
        $http.post("/php/species.php?action=get_all_species").success(function(data) {
            $scope.species = data;
        });
    }

    get_all_diagnostics();
    get_all_families();
    get_all_species();

    /** Edit diagnostics details php **/
    $scope.populateEditForm = function(id) {  
      $scope.purpose = 'editSpecies';
      $location.hash('top');
      $anchorScroll();
      $http.post('/php/diagnostics.php?action=get_diagnostics', 
        {
            'id'   : id
        })      
        .success(function (data, status, headers, config) {    
            $scope.form = data;
            $log.log(data);
        })
        .error(function(data, status, headers, config){
            alert("diagnostics was not found");
        });
    }

    /** Create diagnostics from form input by inserting in database **/
    $scope.create_diagnostics = function() {
        $http.post('/php/diagnostics.php?action=insert_diagnostics',
            {
                'name'          : $scope.form.name,
                'species_id'    : $scope.form.species_id,
                'family_id'     : $scope.form.family_id,
                'species_id2'   : $scope.form.species_id2,
                'family_id2'    : $scope.form.family_id2
            })
            .success(function (data, status, headers, config) {
                //$new_id = data.id;
                $log.log(data);
                get_all_diagnostics();
                $scope.reset_form();
            })
            .error(function(data, status, headers, config){
                alert("Server did not respond. Update failed.");
            });
    }


    /** Modify diagnostics details from form input by updating database **/
    $scope.modify_diagnostics = function() {
        $http.post('/php/diagnostics.php?action=update_diagnostics', 
            {
                'id'            : $scope.form.id,
                'name'          : $scope.form.name,
                'species_id'    : $scope.form.species_id,
                'family_id'     : $scope.form.family_id,
                'species_id2'   : $scope.form.species_id2,
                'family_id2'    : $scope.form.family_id2
            })
            .success(function (data, status, headers, config) {                 
                    $log.log(data)
                    get_all_diagnostics();
                    $scope.reset_form();
            })
            .error(function(data, status, headers, config){
                alert("Database Server Unavailable");
            });
    }

}]);
