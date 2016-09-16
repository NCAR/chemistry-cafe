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
    $scope.predicate = 'name';

    $scope.sort_by = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };

    /* Input form at top of page varies, depending on create/mod/delete function */
    $scope.reset_form = function() {
        $scope.form = null ;
        $scope.purpose = 'masterEdit';
    }

    /** get all diagnostics in db (sorted by name) in all mechanisms **/
    get_all_diagnostics = function(){
        $http.post("/php/diagnostics.php?action=get_all_diagnostics").success(function(data) {
            $scope.diagnosticsList = data;    
            $scope.filteredItems = $scope.diagnosticsList.length; //Initially for no filter  
            $scope.totalItems = $scope.diagnosticsList.length;
            $log.log('diagnostics');
        });
    }

    get_all_families = function(){
        $http.post("/php/families.php?action=get_families").success(function(data) {
            $scope.families = data;
        });
    }

    get_all_diagnostics();
    get_all_families();



/* CREATE TYPE transport AS ENUM ('transported','not-transported'); */
/* select enum_range(null::transport) */
/* CREATE TYPE source AS ENUM ('emitted','LBC','none') */
/* CREATE TYPE solve_type AS ENUM ('explicit','implicit') */
//$scope.transportChoices = [{choice:'transported'},{choice:'not-transported'}];
//$scope.sourceChoices = [{'emitted'},{'LBC'},{'none'}];
//$scope.solve_typeChoices = [{'explicit'},{'implicit'}];

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
                'diagnosticsname'   : $scope.form.name,
                'formula'       : $scope.form.formula,
                'edescription'  : $scope.form.description,
                'source'        : $scope.form.source,
                'transport'     : $scope.form.transport,
                'aerosol'       : $scope.form.aerosol,
                'solve'         : $scope.form.solve,
                'henry'         : $scope.form.henry,
                'wet_dep'       : $scope.form.wet_dep,
                'dry_dep'       : $scope.form.dry_dep,
                'selectedFamilyIds' : $scope.form.selectedFamilyIds
            })
            .success(function (data, status, headers, config) {
                $log.log(data)
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
                'diagnosticsname'   : $scope.form.name,
                'formula'       : $scope.form.formula,
                'edescription'  : $scope.form.description,
                'source'        : $scope.form.source,
                'transport'     : $scope.form.transport,
                'aerosol'       : $scope.form.aerosol,
                'solve'         : $scope.form.solve,
                'henry'         : $scope.form.henry,
                'wet_dep'       : $scope.form.wet_dep,
                'dry_dep'       : $scope.form.dry_dep,
                'selectedFamilyIds' : $scope.form.selectedFamilyIds
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
