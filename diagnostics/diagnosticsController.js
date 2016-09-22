app.controller('diagnosticsController', ['$scope', '$location', '$anchorScroll', '$http', '$log', function ($scope, $location, $anchorScroll, $http, $log) {

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    /* Initial purpose of the visit? */
    $scope.purpose = 'masterEdit';

    /* paging and filtering of Species */
    $scope.filteredItems =  [];
    $scope.sdiagnosticsList  =  [];
    $scope.rdiagnosticsList  =  [];

    /* Input form at top of page varies, depending on create/mod/delete function */
    $scope.reset_form = function() {
        $scope.form = null ;
        $scope.purpose = 'masterEdit';
    }

    /** get all species-level diagnostics in db (sorted by name) in all mechanisms **/
    get_all_diagnostics = function(){
        $http.post("/php/diagnostics.php?action=get_all_diagnostics").success(function(data) {
            $log.log(data);
            $scope.sdiagnosticsList = data.sdiags;
            $log.log($scope.sdiagnosticsList);
            $scope.rdiagnosticsList = data.rdiags;
            $log.log($scope.rdiagnosticsList);
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
      $scope.purpose = 'editSDiagnostics';
      $location.hash('top');
      $anchorScroll();
      $http.post('/php/diagnostics.php?action=get_sdiag', 
        {
            'id'   : id
        })      
        .success(function (data, status, headers, config) {    
            $scope.form = data;
            $log.log(data);
        })
        .error(function(data, status, headers, config){
            alert("diagnostic was not found");
        });
    }

    /** Create diagnostics from form input by inserting in database **/
    $scope.create_sdiag = function() {
        $http.post('/php/diagnostics.php?action=ins_sdiag',
            {
                'name'          : $scope.form.name,
                'species_id'    : $scope.form.species_id,
                'family_id'     : $scope.form.family_id,
                'species_id2'   : $scope.form.species_id2,
                'family_id2'    : $scope.form.family_id2
            })
            .success(function (data, status, headers, config) {
                $log.log(data);
                get_all_diagnostics();
                $scope.reset_form();
            })
            .error(function(data, status, headers, config){
                alert("Server did not respond. Update failed.");
            });
    }


    /** Modify diagnostics details from form input by updating database **/
    $scope.modify_sdiag = function() {
        $http.post('/php/diagnostics.php?action=mod_sdiag', 
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
 
    /*  editing rdiags */
    $scope.populateEditFormR = function(id) {
      $scope.purpose = 'editRDiagnostics';
      $location.hash('top');
      $anchorScroll();
      $http.post('/php/diagnostics.php?action=get_rdiag',
        {
            'id'   : id
        })
        .success(function (data, status, headers, config) {
            $scope.form = data;
            $log.log(data);
        })
        .error(function(data, status, headers, config){
            alert("diagnostic was not found");
        });
    }

    $scope.create_rdiag = function() {
        $http.post('/php/diagnostics.php?action=ins_rdiag',
            {
                'name'          : $scope.form.name,
                'cesm_namelist' : $scope.form.cesm_namelist
            })
            .success(function (data, status, headers, config) {
                $log.log(data);
                get_all_diagnostics();
                $scope.reset_form();
            })
            .error(function(data, status, headers, config){
                alert("Server did not respond. Update failed.");
            });
    }

    $scope.modify_rdiag = function() {
        $http.post('/php/diagnostics.php?action=mod_rdiag',
            {
                'id'            : $scope.form.id,
                'name'          : $scope.form.name,
                'cesm_namelist' : $scope.form.cesm_namelist
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

    $scope.assignKineticCoeffs = function(rdiagnostic){
        $scope.selectedDiagnostic = rdiagnostic;
        $http.post('/php/diagnostics.php?action=get_reactions_and_diag_coeffs',
            {
                'rdiag_id'            : rdiagnostic.id
            })
            .success(function (data, status, headers, config) {
                $scope.purpose="editRKDiags";
                $scope.kineticsCoeffList=data;
                //alert(data);
            })
    }

    $scope.commitKCoeff = function(rdiag,kinetic){
        $http.post('/php/diagnostics.php?action=set_kinetic_rdiag_coeff',{
   
                'rdiags_id'      : rdiag.id,
                'coefficient'    : kinetic.coefficient,
                'reaction_id'    : kinetic.id
            })
            .success(function (data, status, headers, config) {
                //alert(data);
                kinetic.coefficient = data;
            })
    }

    $scope.assignPhotolysisCoeffs = function(rdiagnostic){
        $scope.selectedDiagnostic = rdiagnostic;
        $http.post('/php/diagnostics.php?action=get_photolysis_and_diag_coeffs',
            {
                'rdiag_id'            : rdiagnostic.id
            })
            .success(function (data, status, headers, config) {
                $scope.purpose="editPKDiags";
                $scope.photolysisCoeffList=data;
                //alert(data);
            })
    }

    $scope.commitPCoeff = function(rdiag,photolysis){
        $http.post('/php/diagnostics.php?action=set_photolysis_rdiag_coeff',{

                'rdiags_id'      : rdiag.id,
                'coefficient'    : photolysis.coefficient,
                'photolysis_id'  : photolysis.id
            })
            .success(function (data, status, headers, config) {
                photolysis.coefficient = data;
            })
    }

                

}]);
