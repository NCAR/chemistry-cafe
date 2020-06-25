app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.filter('showFilteredGroup', function() {
      return function(reactions, group_filter){
          if (group_filter) {
              var output = [];
              for(var i=0, len = reactions.length; i < len; ++i){
                  var reaction = reactions[i];
                  if ( reaction.group_id==group_filter.id ) output.push(reaction);
              }
          } else {
              output = reactions;
          };
          return output;
      }
});

app.filter('showFilteredBranch', function() {
      return function(reactions, branch_filter){
          if (branch_filter) {
              var output = [];
              for(var i=0, len = reactions.length; i < len; ++i){
                  var reaction = reactions[i];
                  if ( reaction.branchArray.indexOf(branch_filter.name) > -1) output.push(reaction);
              }
          } else {
              output = reactions;
          };
          return output;
      }
});


app.filter('hideIrrelevant', function() {
    return function (reactions, purpose){
        if(!purpose || !reactions) return reactions;
        var output = [];
        var reaction;
        var len = reactions.length;
        var i;
        if(purpose==='masterEdit' || purpose==='showReferences' || purpose==='branchSelect' || purpose==='groupSelect' || purpose==='editPhotolysis') {  
            for(i=0; i < len; ++i){
                reaction = reactions[i];
                if (!reaction.obsolete) output.push(reaction);
            };
        } else if (purpose==='addReaction') { // all
              output = reactions;
        } else if (purpose==='markObsolete'){ // reactions.branchArray.length==0
            for(i=0; i < len; ++i){
                reaction = reactions[i];
                if (reaction.branchArray.length == 0) output.push(reaction);
            };
        };
        return output;
    }
});

app.controller('photolysisController', ['$scope', '$http', '$window', function ($scope, $http, $window) {

/* Initialize */

    /* get molecules, branches, and all reactions from database for use in page */
    get_photolysis_groups = function(){
        $http.get("/php/groups.php?action=get_photolysis_groups").success(function(data) {
            $scope.photolysisGroups = data;
        });
    }

    load_all_molecules = function(){
        $http.get("/php/species.php?action=get_all_species").success(function(data) {
            $scope.moleculearray = data;
        });
    }

    load_all_branches = function(){
        $http.get("/php/tags.php?action=get_all_branches").success(function(data) {
            $scope.branchArray = data;
            $scope.selectedBranch = []; //$scope.branchArray[0]; 
        });
    }

    load_all_photolysis = function () {
        $http.get("/php/photolysis.php?action=get_all_photolysis").success(function(data) {
            for (var i=0; i < data.length; i++){
                data[i].productString = productArrayToString(data[i].productArray);
                data[i].rateDescription = "";
                data[i].rateDescription = data[i].rateDescription.concat(data[i].micm_js_coeff," ",data[i].label);
            }
            $scope.pagedItems = data;
            $scope.filteredItems = $scope.pagedItems.length; //Initially for no filter  
            $scope.totalItems = $scope.pagedItems.length;
        });
    }

    get_all_wrf_rates = function(){
        $http.get("/php/photolysis.php?action=get_all_wrf_rates").success(function(data) {
            $scope.wrfRates = data;
        });
    }

   get_all_micm_rates = function(){
        $http.get("/php/photolysis.php?action=get_all_micm_rates").success(function(data) {
            $scope.micmRates = data;
            for (let rate in $scope.micmRates){
                $scope.micmRates[rate].description = "";
                $scope.micmRates[rate].description = $scope.micmRates[rate].description.concat($scope.micmRates[rate].reaction," : ",$scope.micmRates[rate].label);
            }
        });
   }

    get_all_references = function () {
        $http.get("/php/references.php?action=get_all_references").success(function(data) {
            $scope.allReferences = data;
            $scope.selectedReference = [];
        });
    }

    get_photolysis_groups();
    load_all_molecules();
    load_all_branches();
    load_all_photolysis();
    get_all_wrf_rates();
    get_all_micm_rates();
    get_all_references();

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    $scope.molecule_filter = "";
    $scope.product_filter = "";
    $scope.group_filter = null;
    $scope.branch_filter = null;

    $scope.formData = [];

    /* variables for what is visible */
    $scope.name_input_disabled = false;

/* Default: Why is the user using this page? */
    $scope.purpose ="masterEdit";
    $scope.selectedReference = [];


// Display array of coefficients and molecules as a string that looks like chemical product of reaction
    productArrayToString = function(productArray) {
        var productString = "";
        if (productArray.length > 0) {
            if(productArray[0][0]){
                productString += productArray[0][0] + '*' + productArray[0][1];
            } else {
                productString += productArray[0][1];
            }
        }
        for (var i=1; i < productArray.length; i++ ){
            if(productArray[i][0]){
                productString += ' + ' + productArray[i][0] + '*' + productArray[i][1];
            } else {
                productString += ' + ' + productArray[i][1];
            }
        }
        return productString;
    }

    // Parse the product string to identify coefficients and molecules
    productStringToArray = function(productString) {
        var cmarray = productString.split("+"); // each element contains coeff and molecule
        var coeff = "";
        var molecule = "";
        var notAcceptableMoleculeName = "";
        var prodarray = [];
        var present ;
        for (i = 0; i < cmarray.length; i++) {
            var parts = cmarray[i].trim().split("*");
            if (parts.length == 1){
                coeff = null;
                molecule = parts[0].match(/[A-Za-z][A-Za-z0-9_]*/)[0]; // extract (first) thing that look like molecule names
            } else {
                coeff = parts[0].match(/[-+]?[0-9]*\.?[0-9]+/)[0]; // extract numbers in each product
                molecule = parts[1].match(/[A-Za-z][A-Za-z0-9_]*/)[0]; // extract (first) thing that look like molecule names
            }
            if (! molecule_in_database(molecule)) {
                alert("Please review product list");
            }
            if ( !(parseFloat(coeff) > 0) && coeff){
                alert("Coefficient " + coeff + " is not bigger than zero.");
                break;
            } else {
                prodarray.push ( [coeff, molecule] );
            }
        }
        if (prodarray.length !== cmarray.length) {
            alert("Product string can not be parsed.  Please input valid string");
            return false;
        }
        return prodarray;
    }


    /** Is reaction in the branch? **/
    $scope.reactiononbranch = function(photolysis) {
        if($scope.selectedBranch){
            return (photolysis.branchArray.indexOf($scope.selectedBranch.name) > -1);
        } else {
            return false;
        }
    }


    /** toggle presence of reaction in branch **/
    $scope.togglephotolysisinbranch= function(photolysis){
        if ( photolysis.obsolete && (photolysis.branchArray.indexOf($scope.selectedBranch.name) > -1) ) { // obsolete and in branch
            alert('Caution!  Wierd State: This is obsolete and on a branch.  Removing from branch: ' + $scope.selectedBranch.name);
            $http.post('/php/photolysis.php?action=del_branchreaction', 
                 {
                    'photolysis_id' : photolysis.id,
                    'branch_name'     : $scope.selectedBranch.name
                 }
            ).success(function (data, status, headers, config) {
                get_photolysis_by_id(photolysis);
            }
            ).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            });
        } else if ( !photolysis.obsolete  && (photolysis.branchArray.indexOf($scope.selectedBranch.name) > -1) ) { // not obsolete and in branch
            $http.post('/php/photolysis.php?action=del_branchreaction', 
                 {   
                    'photolysis_id' : photolysis.id,
                    'photolysis'    : photolysis,
                    'branch_name'     : $scope.selectedBranch.name
                 }   
            ).success(function (data, status, headers, config) {
                get_photolysis_by_id(photolysis);
            }).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            }); 
        } else if ( photolysis.obsolete  && (photolysis.branchArray.indexOf($scope.selectedBranch.name) == -1) ) { // obsolete and not in branch
            alert('Deprecated.  Can not add to branch');
            get_photolysis_by_id(photolysis);
        } else if ( !photolysis.obsolete && (photolysis.branchArray.indexOf($scope.selectedBranch.name) == -1) ) { // not obsolete and not in branch
            $http.post('/php/photolysis.php?action=add_branchreaction',
                 {
                    'photolysis_id' : photolysis.id,
                    'photolysis'    : photolysis,
                    'branch_name'     : $scope.selectedBranch.name
                 }
            ).success(function (data, status, headers, config) {
                get_photolysis_by_id(photolysis);
            }).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            });
        }
    }

    /** sometimes we wish to simply update one line of the view, after the db has been modified **/
    get_photolysis_by_id = function(photolysis){
        $http.post(
            "/php/photolysis.php?action=get_photolysis_by_id",
            {
               'id'   : photolysis.id
            }
        ).success(function (data, status, headers, config) {
            photolysis.rate = data.rate;
            photolysis.molecule = data.molecule;
            photolysis.obsolete = data.obsolete;
            photolysis.productArray = data.productArray;
            photolysis.productString = productArrayToString(data.productArray);
            photolysis.branchArray = data.branchArray;
            photolysis.branchString = data.branchString;
        }).error(function (data, status, headers, config) {
            alert('error triggered.  data:' + data);
        });
    };


    /** function to toggle if a reaction is obsolete **/
    $scope.toggleDeprecatedPhotolysis = function(photolysis) {  
        if (!photolysis.obsolete){ // If new value is not obsolete...
            // deprecate reaction
            if (photolysis.branchArray.length > 0){
                alert('Cannot Deprecate.  Reaction is in branches '+photolysis.branchArray.toString()); 
                get_photolysis_by_id(photolysis);
            } else {
                $http.post('/php/photolysis.php?action=un_deprecate_photolysis', 
                    {
                        'photolysis_id'   : photolysis.id,
                    }
                )      
                .success(function (data, status, headers, config) {
                    get_photolysis_by_id(photolysis);
                }).error(function (data, status, headers, config) {
                    if(status == 419) {
                        alert("Please Log In");
                        window.location.replace("/login/login.php");
                    }
                });
            }
        } else {
            // undeprecate reaction
            $http.post('/php/photolysis.php?action=deprecate_photolysis',
                {
                    'photolysis_id'   : photolysis.id,
                }
            )
            .success(function (data, status, headers, config) {
                get_photolysis_by_id(photolysis);
            })
            .error(function(data, status, headers, config){
                 alert("Database server unavailable");
            }).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            });
        }
    }

    function commentArrayToString (commentArray){
        var html = "";
        if(commentArray){
            for(var i = 0; i< commentArray.length; i++){
                html += commentArray[i] + "<br>";
            }
            html = html.replace(/\n/g,'<br>');
        }
        return html;
    }

    /** Populate Edit form for particular reaction **/
    $scope.populateEditForm = function(photolysis) {  
      $http.post('/php/photolysis.php?action=get_photolysis_by_id', 
        {
            'id'   : photolysis.id,
        })      
        .success(function (data, status, headers, config) {    
          $scope.purpose = 'editPhotolysis';

          $scope.branchArrayEdit = data.branchArray;
          $scope.branchStringEdit = data.branchString;
          $scope.formData.group_id = data.group_id;
          $scope.formData.rate = data.rate;
          $scope.formData.micmRateCoeffEdit = data.micm_js_coeff;
          $scope.formData.micmRateId = data.selectedMicmRateId;
          $scope.formData.wrfRateCoeffEdit = data.wrf_photo_rates_coeff;
          $scope.formData.wrfRateId = data.selectedWrfRateId;
          $scope.formData.molecule = data.molecule;
          $scope.productArrayEdit = data.productArray;
          $scope.productStringEdit = productArrayToString(data.productArray);
          $scope.commentEdit = "";

          $scope.previous_photolysis_id = data.id;
          $scope.previousMolecule = data.molecule;
          $scope.previousRate = data.rate;
          $scope.previousProductString = productArrayToString(data.productArray);

          $scope.previousCommentsFormatted = commentArrayToString(data.previousComments);

        })
        .error(function(data, status, headers, config){
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }

    $scope.createDefault = function() {
          $scope.formData.group_id = "7";
          $scope.formData.rate = "";
          $scope.formData.micmRateCoeffEdit = 1;
          $scope.formData.micmRateId = "95";
          $scope.formData.wrfRateCoeffEdit = 1;
          $scope.formData.wrfRateId = "95";
          $scope.formData.molecule = "";
          $scope.productArrayEdit = "";
          $scope.productStringEdit = "";
          $scope.commentEdit = "";
    }

    $scope.cloneToCreate = function(photolysis) {
      $http.post('/php/photolysis.php?action=get_photolysis_by_id',
        {
            'id'   : photolysis.id,
        })
        .success(function (data, status, headers, config) {
          $scope.purpose = 'addReaction';

          $scope.branchArrayEdit = data.branchArray;
          $scope.branchStringEdit = data.branchString;
          $scope.formData.group_id = data.group_id;
          $scope.formData.rate = data.rate;
          $scope.formData.micmRateCoeffEdit = data.micm_photo_rates_coeff;
          $scope.formData.micmRateId = data.selectedMicmfRateId;
          $scope.formData.wrfRateCoeffEdit = data.wrf_photo_rates_coeff;
          $scope.formData.wrfRateId = data.selectedWrfRateId;
          $scope.formData.molecule = data.molecule;
          $scope.productArrayEdit = data.productArray;
          $scope.productStringEdit = productArrayToString(data.productArray);
          $scope.commentEdit = "";

          $scope.previous_photolysis_id = "";
        })
        .error(function(data, status, headers, config){
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }


    /** is molecule in moleculeArray?,  is branch in branchArray? **/
    function isValueInArray(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return true;
            }
        }
        return false; 
    }

    /** is molecule in moleculeArray? **/
    molecule_in_database = function(molecule){
       var present = isValueInArray($scope.moleculearray, "name", molecule);
       if(!present) alert("CAUTION: \nThe molecule, "+molecule+" is not in the database. \nIt will not be solved, unless you add it");
       return present;
    }

    /** validate products of reactions and construct Description of new reaction **/
    $scope.validate = function() {
        var okProduct = validateProduct();
        var okMolecule = molecule_in_database($scope.formData.molecule);
        var okComment = validateComment();
        return (okMolecule && okProduct && okComment);
    }

    /** validate product of reactions as specified in Edit box **/
    validateProduct = function() {
        if($scope.productStringEdit.trim()){
            var parsedArrayEdit = productStringToArray($scope.productStringEdit);
            if(parsedArrayEdit){
                $scope.productStringEdit = productArrayToString(parsedArrayEdit);
                $scope.productArrayEdit = parsedArrayEdit;
                return true;
            } else {
                // leave bad string in place
                $scope.productArrayEdit = [];
                return false;
            }
        } else {
            // no products is acceptable
            $scope.productArrayEdit = [];
            return true;
        }
    }

    /** this should be done as well **/
    validateRate  = function() {
        return ($scope.formData.rate.trim());
    }

    validateComment  = function() {
        if (!$scope.commentEdit) {
            alert("Please enter a comment with more than 5 characters!");
            return false;
        } else {
            return true;
        }
    }

    $scope.reset_new_reaction_form = function() {
        $scope.purpose = "masterEdit";
        $scope.branchArrayEdit = null;
        $scope.branchStringEdit = '';
        $scope.formData = [];
        $scope.productArrayEdit = null;
        $scope.productStringEdit = '';
        $scope.commentEdit = '';
    }

    /** After some commits/edits form should be reset **/
    $scope.reset_modify_form = function() {
        $scope.purpose = "masterEdit";
        $scope.branchArrayEdit = null;
        $scope.branchStringEdit = '';
        $scope.formData = [];
        $scope.productArrayEdit = null;
        $scope.productStringEdit = '';
        $scope.commentEdit = '';
    }

    /**  update database with form data **/
    $scope.create_photolysis = function() {

        // validate
        var newmole = $scope.formData.molecule;
        if (!molecule_in_database(newmole)) {
            alert("Photodissociating Molecule is not in database.\nReaction will not be added.");
            return;
        }
        if (!validateProduct()) {
            alert("Please enter a valid product string.");
            return;
        }
        if (!validateRate()){
            alert("Please enter a valid rate string.");
            return;
        }
        if (!validateComment()){
            alert("Please enter a valid rate string.");
            return;
        }
        // modify photolysis
        $http.post('/php/photolysis.php?action=add_photolysis_and_products',
            {
                //'branchArray'  : $scope.branchArrayEdit,
                'group_id'     : $scope.formData.group_id,
                'rate'         : $scope.formData.rate,
                'molecule'     : $scope.formData.molecule,
                'micm_js_id' : $scope.formData.micmRateId,
                'micm_js_coeff' : $scope.formData.micmRateCoeffEdit,
                'wrf_photo_rates_id' : $scope.formData.wrfRateId,
                'wrf_photo_rates_coeff' : $scope.formData.wrfRateCoeffEdit,
                'productArray' : $scope.productArrayEdit,
                'newComment'   : $scope.commentEdit
            })
            .success(function (data, status, headers, config) {
                if(data == "Committed") {
                    alert(data);
                    $scope.reset_new_reaction_form();
                    load_all_photolysis();
                } else {
                    alert(data);
                }
  
            });

    }
    /**  update database with form data **/
    $scope.modify_photolysis = function() {

        // validate
        var newmole = $scope.formData.molecule;
        if (!molecule_in_database(newmole)) {
            alert("Photodissociating Molecule is not in database.\nReaction will not be added.");
            return;
        }
        if (!validateProduct()) {
            alert("Please enter a valid product string.");
            return;
        }
        if (!validateRate()){
            alert("Please enter a valid rate string.");
            return;
        }
        if (!validateComment()){
            alert("Please enter a valid rate string.");
            return;
        }
        // modify photolysis
        $http.post('/php/photolysis.php?action=mod_photolysis',
            {
                'oldpid'       : $scope.previous_photolysis_id,
                'group_id'     : $scope.formData.group_id,
                'rate'         : $scope.formData.rate,
                'molecule'     : $scope.formData.molecule,
                'micm_js_id' : $scope.formData.micmRateId,
                'micm_js_coeff' : $scope.formData.micmRateCoeffEdit,
                'wrf_photo_rates_id' : $scope.formData.wrfRateId,
                'wrf_photo_rates_coeff' : $scope.formData.wrfRateCoeffEdit,
                'productArray' : $scope.productArrayEdit,
                'branchArray'  : $scope.branchArrayEdit,
                'newComment'   : $scope.commentEdit
            })
            .success(function (data, status, headers, config) {
                alert(data);
                $scope.reset_modify_form();
                load_all_photolysis();
            });

    }
   
    get_references_by_id = function(pid){
        $http.post('/php/photolysis.php?action=get_references_by_id', {'id': pid })
        .success(function (data, status, headers, config) {
            $scope.phReferences =  data;
        });

    }

    /* populate form to edit references */
    $scope.editReferences = function(photolysis){
        $scope.purpose = 'editReferences';
        $scope.pid =  photolysis.id;
        get_references_by_id(photolysis.id);
        $scope.rate = photolysis.rate;
        $scope.molecule = photolysis.molecule;
        $scope.productString = productArrayToString(photolysis.productArray);
        $scope.branchString = photolysis.branchString;
     }

    $scope.addReference = function(){
        $http.post('/php/photolysis.php?action=add_photolysis_reference',
        {
           'ref_id'  : $scope.selectedReference.id,
           'photolysis_id'  : $scope.pid
        })
        .success(function (data, status, headers, config) {
           get_references_by_id($scope.pid)
           $scope.selectedReference = [];
        });
    }

    $scope.deletePhotolysisReference = function(rid,pid){
        $http.post('/php/photolysis.php?action=del_photolysis_reference',
        {
           'ref_id'  : rid,
           'photolysis_id'  : pid
        })
        .success(function (data, status, headers, config) {
           get_references_by_id($scope.pid)
           $scope.selectedReference = [];
        });
    }


    $scope.changeGroup = function(photolysis){
         //alert('photo_id:'+photolysis.id+" gid:"+photolysis.group_id);
         $http.post('/php/photolysis.php?action=update_photolysis_group',
        {
           'id'  : photolysis.id,
           'group_id' : photolysis.group_id
        })
        .success(function (data, status, headers, config) {
            get_photolysis_by_id(photolysis);
        });

    }

    $scope.fileshow = function(id,filename){
        $window.open('/reference_materials/' + id + "_" + filename);
    };

}]);
