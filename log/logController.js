app.controller('logController', ['$scope','$window', '$http',function ($scope, $window, $http) {

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();
    $scope.label = null;
    $scope.doi = null;

    $scope.suggestionList  =  [];

    $scope.get_all_logs = function(){
        $http.post("/php/logs.php?action=get_all_logs").success(function(data) {
            $scope.logList = data;
        });
    };

}]);

