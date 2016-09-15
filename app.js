var app = angular.module('ChemApp', ['ngRoute', 'ngResource', 'ui.bootstrap', 'angularFileUpload']);

app.config(function ($routeProvider) {

        $routeProvider.when("/Photolysis", {
            controller: "photolysisController",
            templateUrl: "/photolysis/photolysis.html"
        });

        $routeProvider.when("/Chemistry", {
            controller: "chemistryController",
            templateUrl: "/chemistry/chemistry.html"
        });

        $routeProvider.when("/Species", {
            controller: "speciesController",
            templateUrl: "/species/species.html"
        });

        $routeProvider.when("/Families", {
            controller: "familyController",
            templateUrl: "/families/family.html"
        });

        $routeProvider.when("/References", {
            controller: "referenceController",
            templateUrl: "/references/reference.html"
        });

        $routeProvider.when("/Tags", {
            controller: "tagsController",
            templateUrl: "/tags/tags.html"
        });

        $routeProvider.when("/Compare", {
            controller: "compareController",
            templateUrl: "/compare/compare.html"
        });

        $routeProvider.when("/Group", {
            controller: "groupController",
            templateUrl: "/group/group.html"
        });

        $routeProvider.when("/Help", {
            controller: "helpController",
            templateUrl: "/help/help.html"
        });

        $routeProvider.otherwise({ redirectTo: "/Tags" });
    
});

app.controller('loginController',function ($scope){

    getCookie = function(c_name) {
        var c_value = " " + document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) {
            c_value = null;
        }
        else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start,c_end));
        }
        return c_value;
    }

    $scope.username = getCookie('chemdb_id');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.dbversioni = "img/caution.png";

    $scope.loggedIn = function(){
        $scope.dbversioni = "img/cafmol.png";
        return( document.cookie.indexOf("chemdb_id") >= 0) ;
    }

    $scope.check_login = function(){
        if(document.cookie.indexOf("chemdb_id") < 0){
            window.location.replace("/login/login.php");
        }
    }

   $scope.machineName = document.location.host;
   $scope.productionMachine = ( document.location.host.indexOf("devel") == -1);

});


