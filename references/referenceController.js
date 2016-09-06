app.controller('referenceController', ['$scope','$upload','$http','$window',function ($scope, $upload, $http, $window) {

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();
    $scope.label = null;
    $scope.doi = null;

    $scope.filteredItems =  [];
    $scope.referencelist  =  [];

    $scope.get_all_references = function(){
        $http.post("/php/references.php?action=get_all_references").success(function(data) {
            $scope.referencelist = data;
            $scope.filteredItems = $scope.referencelist.length; //Initially for no filter  
            $scope.totalItems = $scope.referencelist.length; 
        });
    };

    /* Why is the user using this page? */
    $scope.purpose ="";

    $scope.addReference = function() {
        $scope.purpose = "addReference";
        $scope.editStatus = "createReference";
        $scope.showModifyForm = false;
        $scope.showCreateForm = true;
    }

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.addRefNoFile = function() {
        $http.post("/php/references.php?action=add_ref_no_file",
             {
                'label'  : $scope.label,
                'http'  : $scope.http,
                'doi' : $scope.doi,
                'detail'  : $scope.detail,
                'citation'  : $scope.citation
             }
        ).success(function(data) {
            alert(data);
            $scope.doi="";
            $scope.citation="";
            $scope.label="";
            $scope.http="";
            $scope.detail="";
            $scope.purpose ="";
            $scope.showCreateForm = true;
            $scope.get_all_references();
        });
    }

    $scope.upload = function (files) {
        var doi = $scope.doi;
        if(files && files.length && !$scope.label){
            alert("Please Enter The Reference Name (with more than 3 characters)");
            return;
        }
        if(files && files.length && !$scope.doi){
            var x = confirm("Do you want to save this file without a DOI?");
            if (!x) return;
            $scope.doi = "";
        }
        if (files && files.length) {
            //for (var i = 0; i < files.length; i++) {
                var file = files[0];
                $upload.upload(
                    {
                    url: '/php/references.php?action=upload_reference',
                    fields: {'label':$scope.label, 'http':$scope.http, 'doi':$scope.doi, 'detail':$scope.detail, 'citation':$scope.citation},
                    headers: {'Content-Type': file.type, 'type':file.type},
                    file: file,
                    filename: file.name 
                    }
                ).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    //console.log('file ' + config.file.name + 'uploaded. \n Response: \n ' + data);
                    console.log(data);
                    $scope.purpose ="";
                    $scope.showCreateForm = false;
                    $scope.get_all_references();
                });
            //}
        }
    };

    $scope.fileshow = function(id,filename){
        $window.open('/reference_materials/' + id + "_" + filename);
    };

}]);

