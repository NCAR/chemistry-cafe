app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.controller('groupController', ['$scope', '$http', '$window', function ($scope, $http, $window) {

/* Initialize */

    /* get molecules, branches, and all reactions from database for use in page */
    get_reaction_groups = function(){
        $http.get("/php/groups.php?action=get_reaction_groups").success(function(data) {
            $scope.reactionGroups = data;
        });
    }

    get_photolysis_groups = function(){
        $http.get("/php/groups.php?action=get_photolysis_groups").success(function(data) {
            $scope.photolysisGroups = data;
        });
    }

    get_reaction_groups();
    get_photolysis_groups();

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    $scope.sort_by = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };

/* Default: Why is the user using this page? */
    $scope.purpose ="masterEdit";

/* updates */

    $scope.populateEditPhotolysisGroup = function(photolysisGroup) {
      $http.post('/php/groups.php?action=get_photolysis_group_by_id',
        {
            'id'   : photolysisGroup.id
        })
        .success(function (data, status, headers, config) {
          $scope.purpose = 'editPhotolysisGroup';
          $scope.editId = data.id;
          $scope.edescription = data.description;
          $scope.previousDescription = data.description;
        })
        .error(function(data, status, headers, config){
          alert('error');
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }

    $scope.populateEditReactionGroup = function(reactionGroup) {  
      $http.post('/php/groups.php?action=get_reaction_group_by_id', 
        {
            'id'   : reactionGroup.id
        })      
        .success(function (data, status, headers, config) {    
          $scope.purpose = 'editReactionGroup';
          $scope.editId = data.id;
          $scope.edescription = data.description;
          $scope.previousDescription = data.description;
        })
        .error(function(data, status, headers, config){
          alert('error');
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }

    $scope.reset = function() {
        $scope.purpose = "masterEdit";
        $scope.editId = null;
        $scope.previousDescription= null;
        $scope.edescription= null;
    }

    /**  update database with form data **/
    $scope.create_reaction_group = function() {
        $http.post('/php/groups.php?action=add_reaction_group',
            {
                'edescription'  : $scope.edescription
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_reaction_groups();
            });

    }

    $scope.create_photolysis_group = function() {
        $http.post('/php/groups.php?action=add_photolysis_group',
            {
                'edescription'  : $scope.edescription
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_photolysis_groups();
            });

    }

    $scope.modify_reaction_group = function() {
        $http.post('/php/groups.php?action=mod_reaction_group',
            {
                'id'  : $scope.editId,
                'edescription'  : $scope.edescription
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_reaction_groups();
            });

    }

    $scope.modify_photolysis_group = function() {
        $http.post('/php/groups.php?action=mod_photolysis_group',
            {
                'id'  : $scope.editId,
                'edescription'  : $scope.edescription
            })
            .success(function (data, status, headers, config) {
                $scope.reset();
                get_photolysis_groups();
            });

    }

}]);
