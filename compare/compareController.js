app.controller('compareController',['$scope','$http','$window', function ($scope, $http, $window) {

    $scope.selections = [];
    $scope.numberSelected = 0;
    $scope.selectId = 0;

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

    get_all_reactions = function(){
        $http.post("/php/chemistry.php?action=get_all_reactions").success(function(data) {
            $scope.reactions = data;
        });
    };
    get_all_reactions();

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    $scope.selectTag = function(tag){
        $scope.selections[$scope.selectId] = {"type":"TAG","tag":tag,"name":tag.given_name}
        $scope.numberSelected += 1;
        $scope.selectId = ($scope.numberSelected)%2;
        if($scope.numberSelected>=2) {$scope.compare()};
    }

    $scope.selectBranch = function(branch){
        $scope.selections[$scope.selectId] = {"type":"BRANCH","branch":branch,"name":branch.name}
        $scope.numberSelected += 1;
        $scope.selectId = ($scope.numberSelected)%2;
        if($scope.numberSelected>=2) {$scope.compare()};
    }

// Branch vs Branch
    function both_bb(reaction){
        return reaction.branchIdArray.indexOf($scope.selections[0].branch.id) != -1 && 
               reaction.branchIdArray.indexOf($scope.selections[1].branch.id) != -1;
    }

    function left_bb(reaction){
        return reaction.branchIdArray.indexOf($scope.selections[0].branch.id) != -1 && 
               reaction.branchIdArray.indexOf($scope.selections[1].branch.id) == -1;
    }

    function rght_bb(reaction){
        return reaction.branchIdArray.indexOf($scope.selections[0].branch.id) == -1 && 
               reaction.branchIdArray.indexOf($scope.selections[1].branch.id) != -1;
    }

// Tag vs Tag
    function both_tt(reaction){
        return reaction.tagIdArray.indexOf($scope.selections[0].tag.id) != -1 &&
               reaction.tagIdArray.indexOf($scope.selections[1].tag.id) != -1;
    }

    function left_tt(reaction){
        return reaction.tagIdArray.indexOf($scope.selections[0].tag.id) != -1 &&
               reaction.tagIdArray.indexOf($scope.selections[1].tag.id) == -1;
    }

    function rght_tt(reaction){ 
        return reaction.tagIdArray.indexOf($scope.selections[0].tag.id) == -1 &&
               reaction.tagIdArray.indexOf($scope.selections[1].tag.id) != -1;
    }

// Branch vs Tag
    function both_bt(reaction){
        return reaction.branchIdArray.indexOf($scope.selections[0].branch.id) != -1 &&
               reaction.tagIdArray.indexOf($scope.selections[1].tag.id) != -1;
    }

    function left_bt(reaction){
        return reaction.branchIdArray.indexOf($scope.selections[0].branch.id) != -1 &&
               reaction.tagIdArray.indexOf($scope.selections[1].tag.id) == -1;
    }

    function rght_bt(reaction){
        return reaction.branchIdArray.indexOf($scope.selections[0].branch.id) == -1 &&
               reaction.tagIdArray.indexOf($scope.selections[1].tag.id) != -1;
    }

// Tag vs Branch
    function both_tb(reaction){
        return reaction.tagIdArray.indexOf($scope.selections[0].tag.id) != -1 &&
               reaction.branchIdArray.indexOf($scope.selections[1].branch.id) != -1;
    }

    function left_tb(reaction){
        return reaction.tagIdArray.indexOf($scope.selections[0].tag.id) != -1 &&
               reaction.branchIdArray.indexOf($scope.selections[1].branch.id) == -1;
    }

    function rght_tb(reaction){
        return reaction.tagIdArray.indexOf($scope.selections[0].tag.id) == -1 &&
               reaction.branchIdArray.indexOf($scope.selections[1].branch.id) != -1;
    }



    $scope.compare = function(reactions) {
        if( $scope.selections[0].type == "BRANCH" && $scope.selections[1].type == "BRANCH") {
            $scope.cs = "br vs br";
            $scope.reactions_both = $scope.reactions.filter(both_bb);
            $scope.reactions_left = $scope.reactions.filter(left_bb);
            $scope.reactions_rght = $scope.reactions.filter(rght_bb);
         } else if ( $scope.selections[0].type == "BRANCH" && $scope.selections[1].type == "TAG"){
            $scope.cs = "br vs tag";
            $scope.reactions_both = $scope.reactions.filter(both_bt);
            $scope.reactions_left = $scope.reactions.filter(left_bt);
            $scope.reactions_rght = $scope.reactions.filter(rght_bt);
         } else if ( $scope.selections[0].type == "TAG" && $scope.selections[1].type == "BRANCH"){
            $scope.cs = "tag vs br";
            $scope.reactions_both = $scope.reactions.filter(both_tb);
            $scope.reactions_left = $scope.reactions.filter(left_tb);
            $scope.reactions_rght = $scope.reactions.filter(rght_tb);
         } else if ( $scope.selections[0].type == "TAG" && $scope.selections[1].type == "TAG"){
            $scope.cs = "tag vs tag";
            $scope.reactions_both = $scope.reactions.filter(both_tt);
            $scope.reactions_left = $scope.reactions.filter(left_tt);
            $scope.reactions_rght = $scope.reactions.filter(rght_tt);
         } ; 

    }; 

}]);

