app.controller('reactController', ['$scope', '$http', '$window', function ($scope,$http,$window) {

/* Initialize */

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    get_reaction_class = function(){
        $http.get("/php/react.php?action=get_all_reaction_classes").success(function(data) {

            $scope.reactionClass = data;

            for(let i=0; i<$scope.reactionClass.length; i++){
                $img_file_path = data[i].formula_img_url;
                $scope.reactionClass[i].img_file_path = $img_file_path;
             }

        });
    } 

    get_reaction_class();

}]);
