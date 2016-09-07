app.controller('helpController', ['$scope','$window', '$http',function ($scope, $window, $http) {

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();
    $scope.label = null;
    $scope.doi = null;

    $scope.suggestionList  =  [];

    $scope.get_all_suggestions = function(){
        $http.post("/php/suggestions.php?action=get_all_suggestions").success(function(data) {
            $scope.suggestionList = data;
        });
    };

    /* Why is the user using this page? */
    $scope.purpose ="";

    $scope.addSuggestion = function() {
        $scope.purpose = "addSuggestion";
    }

    $scope.saveSuggestion = function() {
        $http.post("/php/suggestions.php?action=put_suggestion",
             {
                'today'  : $scope.today,
                'username'  : $scope.username,
                'suggestion' : $scope.suggestion
             }
        ).success(function(data) {
            alert(data);
            $scope.get_all_suggestions();
        });
        $scope.purpose = "";
    }


    $scope.viewSummary = function(){
        $window.open('help/Mechanisms.pdf');
    };

}]);

