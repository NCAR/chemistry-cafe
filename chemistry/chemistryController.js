app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.controller('chemistryController', ['$scope', '$http', '$window', function ($scope,$http,$window) {

/* Initialize */

    /* get species, branches, and all reactions from database for use in page */
    get_reaction_groups = function(){
        $http.get("/php/groups.php?action=get_reaction_groups").success(function(data) {
            $scope.reactionGroups = data;
        });
    }

    load_all_chemistry = function () {
        $http.get("/php/chemistry.php?action=get_all_reactions").success(function(data) {
            $scope.pagedItems = data;
            $scope.filteredItems = $scope.pagedItems.length; 
            $scope.totalItems = $scope.pagedItems.length;
        });
    }

    load_all_species = function(){
        $http.get("/php/species.php?action=get_all_species").success(function(data) {
            $scope.speciesarray = data;
        });
    }

    load_all_branches = function(){
        $http.get("/php/tags.php?action=get_all_branches").success(function(data) {
            $scope.branchArray = data;
            $scope.selectedBranch = []; 
        });
    }

    get_all_references = function () {
        $http.get("/php/references.php?action=get_all_references").success(function(data) {
            $scope.allReferences = data;
            $scope.selectedReference = [];
        });
    }
    get_wrf_rates = function(){
        $http.get("/php/rates.php?action=get_all_rates").success(function(data) {
            $scope.wrfRates = data;
        });
    }

    get_reaction_groups();
    load_all_chemistry();
    load_all_species();
    load_all_branches();
    get_all_references();
    get_wrf_rates();

    $scope.username = getCookie('chemdb_id');
    $scope.initials = getCookie('chemdb_initials');
    $scope.editp = getCookie('chemdb_prmn');
    $scope.today = new Date();

    $scope.reactant_filter = "";
    $scope.product_filter = "";
    $scope.group_filter = null;
    $scope.branch_filter = null;
    $scope.formData = [];
    //$scope.formData.group_id = 12;

    /* variables for what is visible */
    $scope.name_input_disabled = false;

/* Default: Why is the user using this page? */
    $scope.purpose ="masterEdit";
    $scope.selectedReference = []; 

/* Display Filtering */
    $scope.showFilteredGroup = function(chemistry){
        if ($scope.group_filter) {
            return($scope.group_filter.id == chemistry.group_id);
        } else {
            return( true );
        }
    }

    $scope.showFilteredProduct = function(chemistry){
        if($scope.product_filter){
            if(chemistry.productString){
                return(chemistry.productString.indexOf($scope.product_filter) > -1)
            } else {
                return(false)
            }
        } else {
            return( true );
        }
    }

    $scope.showFilteredReactant = function(chemistry){
        if ($scope.reactant_filter) {
            return( chemistry.reactantArray.indexOf($scope.reactant_filter) > -1)
        } else {
            return( true );
        }
    }

    $scope.showFilteredBranch = function(chemistry){
        if($scope.branch_filter) {
            //return(reactiononbranch(chemistry,$scope.branch_filter));
            return(chemistry.branchArray.indexOf($scope.branch_filter.name) > -1)
        } else {
            return(true);
        }
   }
    // Filter to show only those reactions appropriate to purpose 
    $scope.hideIrrelevant = function(chemistry){
        if ($scope.purpose ==='masterEdit') { // those reactions not obsolete
            return( !chemistry.obsolete );

        } else if ($scope.purpose ==='markObsolete') {  // those reactions not in a branch
            return( chemistry.branchArray.length === 0); 

        } else if ($scope.purpose ==='addReaction') {  // those reactions not obsolete
            return( true ); 

        } else if ($scope.purpose ==='showReferences' || $scope.purpose ==='branchSelect' || $scope.purpose ==='groupSelect' || $scope.purpose==='editReaction' || $scope.purpose ==='wrfSelect' || $scope.purpose === 'addDiags') {
            return( !chemistry.obsolete ); 

        }
    }

    // Display array of coefficients and species as a string that looks like chemical product of reaction
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

    // Parse the product string to identify coefficients and species
    productStringToArray = function(productString) {
        var cmarray = productString.split("+"); // each element contains coeff and species
        var coeff = "";
        var species = "";
        var notAcceptableSpeciesName = "";
        var prodarray = [];
        var present ;
        for (i = 0; i < cmarray.length; i++) {
            var parts = cmarray[i].trim().split("*");
            if (parts.length == 1){
                coeff = null;
                species = parts[0].match(/[A-Za-z][A-Za-z0-9_]*/)[0]; // extract (first) thing that look like species names
            } else {
                coeff = parts[0].match(/[-+]?[0-9]*\.?[0-9]+/)[0]; // extract numbers in each product
                species = parts[1].match(/[A-Za-z][A-Za-z0-9_]*/)[0]; // extract (first) thing that look like species names
            }
            if (! species_in_database(species)) {
                alert("Please review product list");
            }
            if ( !(parseFloat(coeff) > 0) && coeff){
                alert("Coefficient " + coeff + " is not bigger than zero.");
                break;
            } else {
                prodarray.push( [coeff, species]);
            }
        }
        if (prodarray.length !== cmarray.length) {
            alert("Product string can not be parsed.  Please input valid string");
            return false;
        }
        return prodarray;
    }


    /** Is reaction in the branch? **/
    $scope.reactiononbranch = function(chemistry) {
        if($scope.selectedBranch){
            return (chemistry.branchArray.indexOf($scope.selectedBranch.name) > -1);
        } else {
            return false;
        }
    }

    /** toggle presence of reaction in branch **/
    $scope.toggleChemistryInBranch= function(chemistry){
        if ( chemistry.obsolete && (chemistry.branchArray.indexOf($scope.selectedBranch.name) > -1) ) { // obsolete and in branch
            alert('Caution!  Wierd State: This reaction is obsolete and on a branch.  Removing from branch: ' + $scope.selectedBranch.name);
            $http.post('/php/chemistry.php?action=del_branchreaction', 
                 {
                    'reaction_id' : chemistry.id,
                    'branch_name'  : $scope.selectedBranch.name
                 }
            ).success(function (data, status, headers, config) {
                get_reaction_by_id(chemistry);
            }
            ).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            });
      } else if ( !chemistry.obsolete  && (chemistry.branchArray.indexOf($scope.selectedBranch.name) > -1) ) { // not obsolete and in branch
            $http.post('/php/chemistry.php?action=del_branchreaction', 
                 {   
                    'reaction_id' : chemistry.id,
                    'reaction' : chemistry,
                    'branch_name'  : $scope.selectedBranch.name
                 }   
            ).success(function (data, status, headers, config) {
                get_reaction_by_id(chemistry);
            }).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            }); 
        } else if ( chemistry.obsolete  && (chemistry.branchArray.indexOf($scope.selectedBranch.name) == -1) ) { // obsolete and not in branch
            alert('Deprecated.  Can not add to branch');
            get_reaction_by_id(chemistry);
        } else if ( !chemistry.obsolete && (chemistry.branchArray.indexOf($scope.selectedBranch.name) == -1) ) { // not obsolete and not in branch
            $http.post('/php/chemistry.php?action=add_branchreaction',
                 {
                    'reaction_id' : chemistry.id,
                    'reaction' : chemistry,
                    'branch_name'  : $scope.selectedBranch.name
                 }
            ).success(function (data, status, headers, config) {
                get_reaction_by_id(chemistry);
            }).error(function (data, status, headers, config) {
                if(status == 419) {
                    alert("Please Log In");
                    window.location.replace("/login/login.php");
                }
            });
        }
    }

    /** sometimes we wish to simply update one line of the view, after the db has been modified **/
    get_reaction_by_id = function(chemistry){
        $http.post(
            "/php/chemistry.php?action=get_reaction_by_id",
            {
               'id'   : chemistry.id
            }
        ).success(function (data, status, headers, config) {
             chemistry.label = data.label;
             chemistry.cph = data.cph;
             chemistry.r1 = data.r1;
             chemistry.r2 = data.r2;
             chemistry.r3 = data.r3;
             chemistry.r4 = data.r4;
             chemistry.r5 = data.r5;
             chemistry.rateString = data.rateString;
             chemistry.obsolete = data.obsolete;
             chemistry.reactantArray = data.reactantArray;
             chemistry.reactantString = data.reactantString;
             chemistry.productArray = data.productArray;
             chemistry.productString = data.productString;
             chemistry.branchArray = data.branchArray;
             chemistry.branchString = data.branchString;
        }).error(function (data, status, headers, config) {
            alert('error triggered.  data:' + data);
        });
    };


    /** function to toggle if a reaction is obsolete **/
    $scope.toggleDeprecatedChemistry = function(chemistry) {  
        if (!chemistry.obsolete){ // If new values is not obsolete
            // deprecate reaction
            if (chemistry.branchArray.length > 0){
                alert('Cannot Deprecate.  Reaction is in branches '+chemistry.branchArray.toString()); 
                get_reaction_by_id(chemistry);
            } else {
                $http.post('/php/chemistry.php?action=un_deprecate_reactions', 
                    {
                        'reaction_id'   : chemistry.id,
                    }
                )      
                .success(function (data, status, headers, config) {
                    get_reaction_by_id(chemistry);
                }).error(function (data, status, headers, config) {
                    if(status == 419) {
                        alert("Please Log In");
                        window.location.replace("/login/login.php");
                    }
                });
            }
        } else {
            // deprecate reaction
            $http.post('/php/chemistry.php?action=deprecate_reactions',
                {
                    'reaction_id'   : chemistry.id,
                }
            )
            .success(function (data, status, headers, config) {
                get_reaction_by_id(chemistry);
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
    $scope.populateEditForm = function(chemistry) {  
      $http.post('/php/chemistry.php?action=get_reaction_by_id', 
        {
            'id'   : chemistry.id,
        })      
        .success(function (data, status, headers, config) {    
          // easiest way to copy object in javascript?
          $scope.purpose = 'editReaction';
          $scope.sourceData = data;
          $scope.sourceData.wrf_present = ($scope.sourceData.wcrid >> 0);
          $scope.formData = data;
          $scope.formData.comment = '';
          $scope.previousCommentsFormatted = commentArrayToString(data.previousComments);
        })
        .error(function(data, status, headers, config){
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }

    $scope.cloneToCreate = function(chemistry) {
      $http.post('/php/chemistry.php?action=get_reaction_by_id',
        {
            'id'   : chemistry.id,
        })
        .success(function (data, status, headers, config) {
          // easiest way to copy object in javascript?
          $scope.purpose = 'addReaction';
          $scope.formData = data;
          $scope.formData.comment = '';
          $scope.previousCommentsFormatted = commentArrayToString(data.previousComments);
        })
        .error(function(data, status, headers, config){
            if(status == 419) {
                alert("Please Log In");
                window.location.replace("/login/login.php");
            }
        });
    }


    /** is species in speciesArray?,  is branch in branchArray? **/
    function isValueInArray(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return true;
            }
        }
        return false; 
    }

    /** is species in speciesArray? **/
    species_in_database = function(species){
       var present = (isValueInArray($scope.speciesarray, "name", species) || (species == 'M'));
       if(!present) alert("CAUTION: \nThe species, "+species+" is not in the database. \nIt will not be solved, unless you add it");
       return present;
    }

    /** validate products of reactions and construct Description of new reaction **/
    $scope.validate = function() {
        var okLabel = validateLabel();
        var okRate = validateRate();
        var okReactant = validateReactants();
        var okProduct = validateProduct();
        var okComment = validateComment();
        //alert('labelok:'+okLabel+' okRate:'+okRate+' okReactant:'+okReactant+' okProduct:'+okProduct+' okComment:'+okComment);
        return (okReactant && okProduct && okRate && okComment && okLabel);
    }

    validateLabel = function() {
        //alert('label:'+$scope.formData.label);
        if($scope.formData.label && $scope.formData.label.length > 0 && $scope.formData.label.length < 33) {
            return(true)
        } else {
            alert('Please add a label of 16 or fewer characters')
            return(false)
        }
    }
    /** validate product of reactions as specified in Edit form.  Repopulate form with parsed data. **/
    validateProduct = function() {
        //alert('unprocessed product:'+$scope.formData.productString);
        if($scope.formData.productString === undefined){
            $scope.formData.productArray = [];
            $scope.formData.productString = '';
            return true;
        }
        if($scope.formData.productString.trim()){
            var parsedArrayEdit = productStringToArray($scope.formData.productString);
            if(parsedArrayEdit){
                $scope.formData.productString = productArrayToString(parsedArrayEdit);
                $scope.formData.productArray = parsedArrayEdit;
                return true;
            } else {
                // leave bad string in place
                return false;
            }
        } else {
            // no products is acceptable
            $scope.formData.productArray = [];
            $scope.formData.productString = '';
            return true;
        }
    }

    validateReactants  = function() {
	if(!$scope.formData.reactantString) {alert('Please add Reactant(s)')}
        var rString = $scope.formData.reactantString.trim();
        var rArray = rString.split('+');
        var i;
	if(rString.length < 1) {alert('Please add Reactant(s)')}
        for(i=0; i<rArray.length; i++){
            rArray[i] = rArray[i].trim();
            if(!species_in_database(rArray[i]) && rArray[i] != "M"){
                alert('Reactant '+rArray[i]+' is not a valid species.  Please modify Reactants');
                return false;
            }
        }
        rString = rArray.join(" + ");
        $scope.formData.reactantString = rString;
        $scope.formData.reactantArray = rArray;
        //alert('processed reactants:'+$scope.formData.reactantString);
        return true;
    }

    validateRate  = function() {
        var rString ;
        var rArray;
        var i;
        var len ;
	if($scope.formData.label.indexOf('usr_') == -1  && !$scope.formData.rateString) {
            alert('Please confirm that you want no rate'); 
            $scope.formData.r1 = null;
            $scope.formData.r2 = null;
            $scope.formData.r3 = null;
            $scope.formData.r4 = null;
            $scope.formData.r5 = null;
            return true;
            }
        rString = $scope.formData.rateString.trim();
        rArray = rString.split(',');
        len = rArray.length;
	if($scope.formData.label.indexOf('usr_') != -1  && len > 1) {alert('Only 1 parameter allowed for usr_ type reactions'); return false;}
        $scope.formData.r1 = null;
        $scope.formData.r2 = null;
        $scope.formData.r3 = null;
        $scope.formData.r4 = null;
        $scope.formData.r5 = null;
        if( len > 6 ){
            alert('Please review rate specification');
            return false;
        }
        for(i=0; i<len; i++){
            rArray[i] = rArray[i].trim();
            //alert('Rate validation, element'+i+'rArray[i]'+ rArray[i]+':length'+rArray[i].length);
            if(rArray[i].length > 0) {
                if(i==0) $scope.formData.r1=rArray[i];
                if(i==1) $scope.formData.r2=rArray[i];
                if(i==2) $scope.formData.r3=rArray[i];
                if(i==3) $scope.formData.r4=rArray[i];
                if(i==4) $scope.formData.r5=rArray[i];
            }
        }
        rString = rArray.join(", ");
        $scope.formData.rateString = rString;
        $scope.formData.rateArray = rArray;
        return true;
    }

    validateComment  = function() {
        if (!$scope.formData.comment) {
            alert("Please enter a comment with more than 5 characters!");
            return false;
        } else {
            return true;
        }
    }

    /** After some commits/edits form should be reset **/
    $scope.reset_form = function() {
        $scope.purpose = 'masterEdit';
        $scope.sourceData = null;
        $scope.formData = null;
        //$scope.formData.group_id = 12;
    }

    /**  update database with form data **/
    $scope.create_chemistry = function() {

        // validate
        if ($scope.formData.label.indexOf('usr_') != -1){
            //alert("Setting CESM Rate to be a usr_() function");
            $scope.formData.rateString = "";
            $scope.formData.r1 = "";
            $scope.formData.r2 = "";
            $scope.formData.r3 = "";
            $scope.formData.r4 = "";
            $scope.formData.r5 = "";
        }
        if (!validateReactants()) {
            alert("Please enter valid reactant string.");
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
        if (!validateLabel()){
            alert("Please enter a label between 1 and 16 characters.");
            return;
        }
        if (!validateComment()){
            alert("Please enter a valid Comment.");
            return;
        }
        // set default group to undefined 
        if(!$scope.formData.group_id){$scope.formData.group_id = 12}
        // add chemistry reaction
        $http.post('/php/chemistry.php?action=add_reaction',
            {
                'group_id'     : $scope.formData.group_id,
                'label'        : $scope.formData.label,
                'r1'           : $scope.formData.r1,
                'r2'           : $scope.formData.r2,
                'r3'           : $scope.formData.r3,
                'r4'           : $scope.formData.r4,
                'r5'           : $scope.formData.r5,
                'wrf_custom_rate_id' : $scope.formData.wrf_custom_rate_id,
                'cph'          : $scope.formData.cph,
                'reactantArray': $scope.formData.reactantArray,
                'productArray' : $scope.formData.productArray,
                'newComment'   : $scope.formData.comment
            })
            .success(function (data, status, headers, config) {
                alert(data);
                $scope.reset_form();
                load_all_chemistry();
            });

    }
    /**  update database with form data **/
    $scope.modify_chemistry = function() {

        // validate
        if ($scope.formData.label.indexOf('usr_') != -1){
            alert("Setting CESM Rate to be a usr_() function");
            $scope.formData.rateString = "";
            $scope.formData.r1 = "";
            $scope.formData.r2 = "";
            $scope.formData.r3 = "";
            $scope.formData.r4 = "";
            $scope.formData.r5 = "";
        }
        if (!validateReactants()) {
            return;
        }
        if (!validateProduct()) {
            alert("Please enter a valid product string.");
            return;
        }
        if (!validateRate()){
            alert("Please enter valid rates.");
            return;
        }
        if (!validateComment()){
            alert("Please enter a valid Comment.");
            return;
        }
        // database modify chemistry
        $http.post('/php/chemistry.php?action=mod_reaction',
            {
                'oldpid'       : $scope.sourceData.id,
                'branchArray'  : $scope.formData.branchArray,
                'group_id'     : $scope.formData.group_id,
                'label'        : $scope.formData.label,
                'r1'           : $scope.formData.r1,
                'r2'           : $scope.formData.r2,
                'r3'           : $scope.formData.r3,
                'r4'           : $scope.formData.r4,
                'r5'           : $scope.formData.r5,
                'wrf_custom_rate_id' : $scope.formData.wrf_custom_rate_id,
                'cph'          : $scope.formData.cph,
                'reactantArray': $scope.formData.reactantArray,
                'productArray' : $scope.formData.productArray,
                'newComment'   : $scope.formData.comment
            })
            .success(function (data, status, headers, config) {
                alert(data);
                $scope.reset_form();
                load_all_chemistry();
            });

    }
   
    get_references_by_id = function(pid){
        $http.post('/php/chemistry.php?action=get_references_by_id', {'id': pid })
        .success(function (data, status, headers, config) {
            $scope.reactionReferences =  data;
        });

    }

    /* populate form to edit references */
    $scope.editReferences = function(reaction){
        $scope.purpose = 'editReferences';
        $scope.pid =  reaction.id;
        $scope.formData.rateString = reaction.r1+", "+reaction.r2+", "+reaction.r3+", "+reaction.r4+", "+reaction.r5;
        $scope.species = reaction.molecule;
        $scope.reactantString = reaction.reactantString;
        $scope.productString = reaction.productString;
        $scope.branchString = reaction.branchString;
        get_references_by_id(reaction.id);
     }

    $scope.addReference = function(){
        $http.post('/php/chemistry.php?action=add_reaction_reference',
        {
           'ref_id'  : $scope.selectedReference.id,
           'reaction_id'  : $scope.pid
        })
        .success(function (data, status, headers, config) {
           get_references_by_id($scope.pid)
           $scope.selectedReference = [];
        });
    }

    $scope.deleteChemistryReference = function(rid,pid){
        $http.post('/php/chemistry.php?action=del_reaction_reference',
        {
           'ref_id'  : rid,
           'reaction_id'  : pid
        })
        .success(function (data, status, headers, config) {
           get_references_by_id($scope.pid)
           $scope.selectedReference = [];
        });
    }

    $scope.changeGroup = function(chemistry){
         //alert('chem_id:'+chemistry.id+" gid:"+chemistry.group_id);
        $http.post('/php/chemistry.php?action=update_chemistry_group',
        {
           'id'  : chemistry.id,
           'reaction'  : chemistry,
           'group_id' : chemistry.group_id
        })
        .success(function (data, status, headers, config) {
            get_reaction_by_id(chemistry);
        });

    }
    $scope.changeWRFRate = function(chemistry){
         //alert('chem_id:'+chemistry.id+" gid:"+chemistry.group_id);
         $http.post('/php/chemistry.php?action=update_wrf_rate',
        {
           'id'  : chemistry.id,
           'reaction'  : chemistry,
           'wrf_custom_rate_id' : chemistry.wrf_custom_rate_id
        })
        .success(function (data, status, headers, config) {
            get_reaction_by_id(chemistry);
        });

    }



    $scope.fileshow = function(id,filename){
        $window.open('/reference_materials/' + id + "_" + filename);
    };


}]);
