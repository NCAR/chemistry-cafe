app.controller('tagsController',['$scope','$http','$window', function ($scope, $http, $window) {

    $scope.branchArray =  [];
    $scope.selectedBranch  =  [];
    $scope.selectedTag = []; 
    $scope.purpose ="exportTag";
    $scope.sourceTag = null;

    get_all_branches = function(){
        $http.post("/php/tags.php?action=get_all_branches").success(function(data) {
            $scope.branchArray = data;
        });
    };
    get_all_branches();
    

    get_all_tags = function(){
        $http.post("/php/tags.php?action=get_all_tags").success(function(data) {
            $scope.tagArray = data;
        });
    };
    get_all_tags();

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    /* Populate forms with data from table */
    $scope.populateBranchFromTagForm = function(tag) {
       $scope.sourceTag = tag;
    }

    $scope.reset = function(){
        $scope.sourceTag = null;
        $scope.buggy = null;
        $scope.newTagName = null;
        $scope.purpose = 'exportTag';
    }

    $scope.createTag = function() {
        // write mechanism file and store file name and user description in database.
        if(!$scope.selectedBranch.name || !$scope.exportName || !$scope.exportComment ){
            alert('Please select a branch, type a tag name, and provide a comment.');
            return;
        }
        $http.post("/php/tags.php?action=create_tag",
             {
                 'branch_id': $scope.selectedBranch.id,
                 'branch_name': $scope.selectedBranch.name,
                 'given_name': $scope.exportName,
                 'comment': $scope.exportComment
             }) 
             .success( function (data ) {
                 get_all_tags();
                 $scope.purpose='exportTag';   
             });
    }

    $scope.exportTag = function(tag_id) {
        // Save mechanism file to desktop
        //alert('exporting tag with id : '+tag_id);
        $window.open('/php/tags.php?action=export_tag&id='+tag_id);
    }

    $scope.createBranchFromTag = function(tag_id) {
        //alert('creating Branch from Tag : '+tag_id);
        //alert('New Branch : '+$scope.newBranchName);
        if(!$scope.newBranchName){
            alert('Please enter a name for the new branch');
            return;
        }
        $http.post("/php/tags.php?action=create_branch_from_tag",
            {
                'new_branch_name': $scope.newBranchName,
                'tag_id': tag_id
            })
            .success( function (data ) {
                //alert(data);
                get_all_tags();
                $scope.purpose='createTag';
            });

    }

    $scope.createBranchFromBranch = function() {
        alert('Not implemented');
        alert('creating Branch from Branch name: '+ $scope.sourceBranch.name);
        alert('creating Branch from Branch id: '+ $scope.sourceBranch.id);
        alert('New Branch : '+$scope.newBranchName);
    }

    $scope.populateEditTagForm = function(tag){
       $scope.sourceTag = tag;
       $scope.buggy = $scope.sourceTag.buggy;
       $scope.givenName = $scope.sourceTag.given_name;
       $scope.newComment = "";
       $scope.previousComments = $scope.sourceTag.previousComments;
    }

    $scope.modifyTag = function() {
        $http.post("/php/tags.php?action=update_user_tag_info",
             {
                 'tag_id': $scope.sourceTag.id,
                 'given_name': $scope.givenName,
                 'buggy': $scope.buggy,
                 'comment': $scope.newComment
             })
             .success( function ( data ) {
                 get_all_tags();
                 $scope.purpose='exportTag';
                 $scope.sourceTag=[];
             });
    }

}]);

