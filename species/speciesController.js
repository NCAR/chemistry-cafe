app.controller('speciesController', function ($scope,$http) {

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    /* Initial purpose of the visit? */
    $scope.purpose = 'masterEdit';

    /* paging and filtering of Species */
    $scope.filteredItems =  [];
    $scope.speciesList  =  [];
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

    /** get all species in db (sorted by name) in all mechanisms **/
    get_all_species = function(){
        $http.post("/php/species.php?action=get_all_species").success(function(data) {
            $scope.speciesList = data;    
            $scope.filteredItems = $scope.speciesList.length; //Initially for no filter  
            $scope.totalItems = $scope.speciesList.length;
        });
    }
    get_all_species();

    get_all_families = function(){
        $http.post("/php/families.php?action=get_families").success(function(data) {
            $scope.families = data;
        });
    }
    get_all_families();


/* CREATE TYPE transport AS ENUM ('transported','not-transported'); */
/* select enum_range(null::transport) */
/* CREATE TYPE source AS ENUM ('emitted','LBC','none') */
/* CREATE TYPE solve_type AS ENUM ('explicit','implicit') */
//$scope.transportChoices = [{choice:'transported'},{choice:'not-transported'}];
//$scope.sourceChoices = [{'emitted'},{'LBC'},{'none'}];
//$scope.solve_typeChoices = [{'explicit'},{'implicit'}];

    /** Edit species details php **/
    $scope.populateEditForm = function(species) {  
      $scope.purpose = 'editSpecies';
      $http.post('/php/species.php?action=get_species', 
        {
            'name'   : species.name
        })      
        .success(function (data, status, headers, config) {    
            $scope.form = data;
        })
        .error(function(data, status, headers, config){
            alert("species was not found");
        });
    }

    /** Create species from form input by inserting in database **/
    $scope.create_species = function() {
        $http.post('/php/species.php?action=insert_species',
            {
                'speciesname'   : $scope.form.name,
                'formula'       : $scope.form.formula,
                'edescription'  : $scope.form.description,
                'source'        : $scope.form.source,
                'transport'     : $scope.form.transport,
                'aerosol'       : $scope.form.aerosol,
                'solve'         : $scope.form.solve,
                'henry'         : $scope.form.henry,
                'wet_dep'       : $scope.form.wet_dep,
                'dry_dep'       : $scope.form.dry_dep
            })
            .success(function (data, status, headers, config) {
                //alert(JSON.stringify(data));
                get_all_species();
                $scope.reset_form();
            })
            .error(function(data, status, headers, config){
                alert("Server did not respond. Update failed.");
            });
    }


    /** Modify species details from form input by updating database **/
    $scope.modify_species = function() {
        $http.post('/php/species.php?action=update_species', 
            {
                'speciesname'   : $scope.form.name,
                'formula'       : $scope.form.formula,
                'edescription'  : $scope.form.description,
                'source'        : $scope.form.source,
                'transport'     : $scope.form.transport,
                'aerosol'       : $scope.form.aerosol,
                'solve'         : $scope.form.solve,
                'henry'         : $scope.form.henry,
                'wet_dep'       : $scope.form.wet_dep,
                'dry_dep'       : $scope.form.dry_dep
            })
            .success(function (data, status, headers, config) {                 
                    //alert(JSON.stringify(data));
                    get_all_species();
                    $scope.reset_form();
            })
            .error(function(data, status, headers, config){
                alert("Database Server Unavailable");
            });
    }

});
