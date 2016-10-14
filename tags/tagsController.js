app.controller('tagsController',['$scope','$http','$window', function ($scope, $http, $window) {

    $scope.branchArray =  [];
    $scope.selectedBranch  =  "";
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

    $scope.choseBranchOptions = function(branch) {
       $scope.editPackages='F'; 
       $scope.editSDiags='F'
       $scope.editRDiags='F'
       $scope.editFixed='F'
       $scope.editNottransported='F'
       $scope.editExtforcing='F'
       $http.post("/php/mechanism_associated.php?action=get_all_associated",
             {
                 'mechanism_id': $scope.selectedBranch.id
             })
             .success( function (data ) {
                 $scope.associated = data;
             });
    }

    $scope.toggleIncludeInExternal = function(external){
       if(external.externals=='T'){
           $http.post("/php/mechanism_associated.php?action=add_external",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'external_id': external.external_id
               })
               .success( function (data) {
                 external.externals = data;
               });
       } else {
           $http.post("/php/mechanism_associated.php?action=del_external",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'external_id': external.external_id
               })
               .success( function (data) {
                   external.externals = data;
               });
       }

    }

    $scope.toggleIncludeSDiag = function(sdiag){
       if(sdiag.sdiags=='T'){
           $http.post("/php/mechanism_associated.php?action=add_sdiag",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'sdiag_id': sdiag.sdiag_id
               })
               .success( function (data) {
                 sdiag.sdiags = data;
               });
       } else {
           $http.post("/php/mechanism_associated.php?action=del_sdiag",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'sdiag_id': sdiag.sdiag_id
               })
               .success( function (data) {
                 sdiag.sdiags = data;
               });
       }

    }

    $scope.toggleIncludeWrfSDiag = function(sdiag){
       if(sdiag.wrf_sdiags=='T'){
           $http.post("/php/mechanism_associated.php?action=add_wrf_sdiag",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'sdiag_id': sdiag.sdiag_id
               })
               .success( function (data) {
                 sdiag.wrf_sdiags = data;
               });
       } else {
           $http.post("/php/mechanism_associated.php?action=del_wrf_sdiag",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'sdiag_id': sdiag.sdiag_id
               })
               .success( function (data) {
                 sdiag.wrf_sdiags = data;
               });
       }

    }

    $scope.toggleIncludeRDiag = function(rdiag){
       if(rdiag.rdiags=='T'){
           $http.post("/php/mechanism_associated.php?action=add_rdiag",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'rdiag_id': rdiag.rdiag_id
               })
               .success( function (data) {
                 rdiag.rdiags = data;
               });
       } else {  
           $http.post("/php/mechanism_associated.php?action=del_rdiag",
               { 
                 'mechanism_id': $scope.selectedBranch.id,
                 'rdiag_id': rdiag.rdiag_id
               })
               .success( function (data) {
                 rdiag.rdiags = data;
               });
       }

    }

    $scope.toggleFixed = function(specie){
       if(specie.fixed=='T'){
           $http.post("/php/mechanism_associated.php?action=add_fixed",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'specie_id': specie.species_id
               })
               .success( function (data) {
                 specie.fixed = data;
               });
       } else {
           $http.post("/php/mechanism_associated.php?action=del_fixed",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'specie_id': specie.species_id
               })
               .success( function (data) {
                 specie.fixed = data;
               });
       }

    }

    $scope.toggleNottransported = function(specie){
       if(specie.nottransported=='T'){
           $http.post("/php/mechanism_associated.php?action=add_nottransported",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'specie_id': specie.species_id
               })
               .success( function (data) {
                 specie.nottransported = data;
               });
       } else {
           $http.post("/php/mechanism_associated.php?action=del_nottransported",
               {
                 'mechanism_id': $scope.selectedBranch.id,
                 'specie_id': specie.species_id
               })
               .success( function (data) {
                 specie.nottransported = data;
               });
       }

    }

    $scope.toggleExtforcing = function(specie){
       $http.post("/php/mechanism_associated.php?action=mod_extforcing",
           {
             'mechanism_id': $scope.selectedBranch.id,
             'specie_id': specie.species_id,
             'extforcing':specie.forcing
           })
           .success( function (data) {
             specie.forcing = data;
           });

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
        //alert('creating Mechanism from Tag : '+tag_id);
        //alert('New Mechanism : '+$scope.newBranchName);
        if(!$scope.newBranchName){
            alert('Please enter a name for the new mechanism');
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
        alert('creating Mechanism from Mechanism name: '+ $scope.sourceBranch.name);
        alert('creating Mechanism from Mechanism id: '+ $scope.sourceBranch.id);
        alert('New Mechanism : '+$scope.newBranchName);
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

