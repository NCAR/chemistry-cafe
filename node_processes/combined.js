'use strict'

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var crypto = require('crypto');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());

// get git version hash of this git checkout
const revision = require('child_process').execSync('git rev-parse HEAD').toString().trim()
const git_remote = require('child_process').execSync('git config --get remote.origin.url').toString().trim()

// Set forcing to zero for any net stoichiometric tendency smaller 
//   (in absolute value) than this.
const zero_equivalent_stoichometry_limit = 0.000001

//   Compute checksum of a string
function generateChecksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

// Collect all molecule names and assign an associative array
// to index them
const moleculeIndexer = function(molecules){
  this.moleculeAssociation = {};
  let i = 0;
  for (i = 0; i < molecules.length; i++){
    //console.log(molecules[i].moleculename);
    this.moleculeAssociation[molecules[i].moleculename]=i;
    molecules[i].idxMoleculeAssocation = i;
  }
  this.numberOfMolecules = i
  this.print = function(){
    console.log(this.moleculeAssociation);
  }
  this.getMoleculeIndex = function() {return (this.moleculeAssociation);}
}



// Data type to be converted to code
// Code will be netTendency*rateConstant(idxReaction)*product_of_vmr_array*M
//   I.E., 0.6*rateConstant(22)*vmr(8)*vmr(3)*M
//      or 0.6*rateConstant(22)*vmr(8)*vmr(3)*numberDensity^3
// arrayOfVmr is array of vmr's by label.  
//
// Rendering takes place later, using the pivot array from the LU factorization routine
function term(idxReaction, arrayOfVmr, troeTerm=false, netTendency=1, reactionString = ""){
  this.idxReaction=idxReaction;
  this.arrayOfVmr=arrayOfVmr;
  this.troeTerm=troeTerm;
  this.netTendency=netTendency;
  this.reactionString=reactionString;
}


// This should be part of the database!
// Decorates the reaction with a "raw label"
// label is constructed as
//   'reactant1'_'reactant2'_M_a_count
//   i.e., O2_O3_M_a_1
//     or  O_O2_M_a_2
//   where count is an index separating reactions having same reactants and same branch
//   "a" or "b" indicates a branch of a reaction
const labelor = function() {
  //
  // global index into list of all types of reactions
  let idxReaction = 0;

  // array of how often a rawLabel appears
  let collection = []; 

  this.add = function(reaction, reactionTypeIndex, reactionType){
    let rawLabel ="";

    if(reaction.reactants.length == 0){
      rawLabel = "None";
    } else {
      rawLabel = reaction.reactants.sort().join("_");
    }

    if (reaction.reactionBranch) { 
      rawLabel += "_" + reaction.reactionBranch;
    }

    if (reaction.troe) {
      rawLabel += "_M"; 
    }

    // figure out if this rawLabel is already present
    let position = collection.map(function(e) { return e.rawLabel; }).indexOf(rawLabel);
    let count = 0;
    if(position > -1) {
      collection[position].count ++;
      count = collection[position].count;
    } else {
      collection.push({rawLabel:rawLabel,count:1});
      count = 1;
    }

    // Add reaction string {j,k} : (troe? M, : "")  reactants -> products
    let reactionString = "";
    reactionString = (reactionType == "reaction") ? "k_"+rawLabel+"_"+count+": ":reactionString;
    reactionString = (reactionType == "photoDecomp") ? "j_"+rawLabel+"_"+count+": ":reactionString;
    reactionString = reactionString + (reaction.troe ? "M, " : "");
    reactionString = reactionString + reaction.reactants.join(" + ");
    reactionString = reactionString + " -> ";
    reactionString = reactionString + reaction.products.map(function(elem){return parseFloat(elem.coefficient)+"*"+elem.molecule}).join(" + ");

    // decorate reaction
    reaction.rawLabel = rawLabel;
    reaction.label = reaction.rawLabel+"_"+count;
    reaction.reactionTypeIndex = reactionTypeIndex;
    reaction.reactionType = reactionType;
    reaction.idxReaction = idxReaction;
    reaction.reactionString = reactionString;
    idxReaction ++;
  }

  this.printCollection = function() {
    console.log('Number of raw Labels: '+collection.length);
    console.log('Number of times each rawLabel appears');
    console.dir(this.collection);
  }

  this.getCollection = function(){
    return collection;
  }

}



// Iterate through the list of reactants and products to create a net stoichiometric tendency
//   of each molecule in the given reaction.
// If net tendency is smaller than a limit, eliminate it from the array of tendencies
// Decorate each reaction with an array of net stoichiometric tendencies for the molecules
const stoichiometricTendencies = function(reaction, molecules) {

  let tendency = []; // tendency array for this reaction
  let tendencyCount = 0;

  reaction.reactants.forEach( function(reactant){
    let indexOfReactant = molecules.map(function(e) { return e.moleculename; }).indexOf(reactant);
    tendency[tendencyCount] = {idxConstituent:indexOfReactant, constituent:reactant, netTendency:-1};
    tendencyCount ++;
  });

  reaction.products.forEach( function(product){
    let position = tendency.map(function(e) { return e.constituent; }).indexOf(product.molecule);
    let indexOfReactant = molecules.map(function(e) { return e.moleculename; }).indexOf(product.molecule);
    if( position < 0 ){ 
      // This product is not in the list of reactants
      tendency.push({idxConstituent:indexOfReactant, constituent:product.molecule, netTendency:product.coefficient});
    } else { 
      // This product is in the list of reactants, so accumulate net tendency
      tendency[position].netTendency += product.coefficient;
      tendencyCount ++;
    }
  });

  // Remove terms with roundoff-level-zero stoichiometric coefficients
  var tendency_nonzero = [];
  for( var i = 0; i < tendency.length; i++){
    if(Math.abs(tendency[i].netTendency) > zero_equivalent_stoichometry_limit ){ 
      tendency_nonzero.push(tendency[i]);
    }
  }

  // Decorate the reaction with the tendencies
  //   reaction.tendencies = [ {idxConstituent:22, constituent:'O2', netTendency:-0.5}, ...]
  reaction.tendencies = tendency_nonzero;

}




// Collect forcing for each molecule.  This is the 
//   right hand side of the differential equation for
//   each molecule.  It may be useful to compute forcing
//   for each reaction and apply it to each molecule, Or
// One can use this collection to compute forcing for each
//   molecule using a number of rates.
// Also construct the jacobian of the forcing, i.e. the
//   sensitivity of the forcing to the concentrations of each constituent
// Also construct logical jacobian for forcing, i.e. whether or not
//   the forcing is sensitive to the concentrations of each constituent
const forceCollector = function(molecules){

  // forcing (i.e., rate of change) of each molecule
  var force = [];
  // jacobian d(force)/dMolecule
  var jacobian = [];
  // matrix of Boolean.  Entries are true if the jacobian has an entry, or if it is filled in by pivoting
  var logicalJacobian = []; 

  // Compute number of molecules in the mechanism
  let count = molecules.length;

  // Initialize storage for forcing, jacobian, and logicalJacobian
  for(let iMolecule = 0; iMolecule < count; iMolecule++){
    force[iMolecule] = {};
    force[iMolecule].constituentName = molecules[iMolecule].moleculename;
    force[iMolecule].idxConstituent = iMolecule;
    // net stoichiometric tendency of every constituent in the reaction
    force[iMolecule].tendency = [];
    // each jacobian element is an array of terms
    jacobian[iMolecule] = [];
    for(let jMolecule = 0; jMolecule < count; jMolecule++){
      jacobian[iMolecule][jMolecule] = [];
    }
    // each logicalJacobian element is true/false
    logicalJacobian[iMolecule] = [];
    for(let jMolecule = 0; jMolecule < count; jMolecule++){
      logicalJacobian[iMolecule][jMolecule] = false;
    }
  }
  

  // construct forcing, logicalJacobian, and jacobian from each reaction
  this.constructForcingFromTendencies = function(reaction, moleculeIndex){

    //let rate=new term(reaction.idxReaction, reaction.reactants, reaction.troe, 1, reaction.reactionString);

    let nTends = reaction.tendencies.length;

    for (let iTend = 0; iTend < nTends; iTend++){
      let tendency = reaction.tendencies[iTend];
      let forcedMoleculeIndex = tendency.idxConstituent;
      if (forcedMoleculeIndex == -1 ) break;  // molecule not in the list of molecules-> don't consider it.
      
      force[forcedMoleculeIndex].tendency.push(new term(reaction.idxReaction, reaction.reactants, reaction.troe, tendency.netTendency, reaction.reactionString));
      //force[forcedMoleculeIndex].tendency.push({tendency:tendency.netTendency, rate:rate});
        
      // jacobian: derivative of forcing[tendency.constituent] w/r/t each tendency in the reaction list
      for(let i = 0; i < reaction.reactants.length; i++){

        //console.log("derivative of "+ tendency.constituent+ " w/r/t/ "+reaction.reactants[i]);
        let sensitivityIndex = moleculeIndex.moleculeAssociation[reaction.reactants[i]];
        logicalJacobian[forcedMoleculeIndex][sensitivityIndex] = true;

        // Jacobian terms.  Rate is tendency * rate_constant * [product of reactant_array] * M (if troe)
        // Jacobian is (net stoichiometry term for molecule) * rate.
        // For the derivitive w.r.t. each reactant, construct 
        //   tendency * rate_constant * [product of reactant_array without the sensitivity molecule] * M (if troe)

        // Construct reactant array without each sensitivity molecule
        let remainingTerms = reaction.reactants.slice(0); // replicate
        remainingTerms.splice(i,1); // remove this term

        // jacTerm = {rateConstantIndex:idxReaction, arrayOfVmr:['O2'], troeTerm:reaction.troe, netTendency:-0.25]}
        let jacTerm = new term(reaction.idxReaction, remainingTerms, reaction.troe, tendency.netTendency, reaction.reactionString);
        jacobian[forcedMoleculeIndex][sensitivityIndex].push(jacTerm);
      }

    }

  }


  this.printForce = function(){
    force.forEach( function(f){
       console.log(f.constituent);
       console.log(f.tendency);
    });
  }

  this.printForcing = function(){
    for(let i = 0; i < molecules.length; i++){
      if(force[i].tendency.length > 0) {
        console.log('forcing of molecule '+molecules[i].moleculename)
        for( let j = 0; j < force[i].tendency.length; j++){
          console.log(force[i].tendency[j])
        }
      }
    }
  }

  this.printLogicalJacobian = function(){
    console.log(' ---- Logical Jacobian ---- ');
    for(let i = 0; i < force.length; i++){
      console.log(molecules[i].moleculename);
      console.log(logicalJacobian[i]);
    }
  }

  this.printJacobian = function(){
    console.log(' ---- Jacobian ---- ');
    for(let i = 0; i < molecules.length; i++){
      for(let j = 0; j < molecules.length; j++){
        let jacstring = "";
        console.log(molecules[i].moleculename + ',' +molecules[j].moleculename) 
        console.dir(jacobian[i][j])
      }
    }
  }



  this.getLogicalJacobian = function(){
    return logicalJacobian ;
  }

  this.getJacobian = function(){
    return jacobian ;
  }

  this.getForce = function(){
    return force ;
  }

}


app.post('/constructJacobian', function(req, res) {

  // Only use the body of the request.
  // Ignore header data.
  var content = req.body;
  var checksum = generateChecksum(JSON.stringify(content));

  var tag_info = content.mechanism.tag_info;
  tag_info.tagDescription = "This code is generated from tag "+tag_info.id+" of the mechanism, "+tag_info.branchname+ ".  It is named "+tag_info.given_name;
  tag_info.tagStats = "This tag was created on "+tag_info.date+" by "+tag_info.initials+" and is marked as "+(tag_info.buggy?"buggy ":"not buggy");
  

  // Extract relevant data from the request.
  let molecules = content.mechanism.molecules;
  let reactions = content.mechanism.reactions;
  let photoDecomps = content.mechanism.photolysis
  //console.log(molecules);

  // Labelling should be done in the database.
  // For now, do the labelling here.
  var label = new labelor();

  // Construct an index into the molecule array
  // I.E., moleculeIndex.moleculeAssociation[molecules[i].moleculename]=i;
  var moleculeIndex = new moleculeIndexer(molecules);

  // Initialize the forceCollection to store relevant
  //   forcing, jacobian, and logicalJacobian
  var forceCollection = new forceCollector(molecules);
 
  // Label each reaction
  // Decorate each reaction with 
  //   a label, 
  //   a global index into list of all reactions, 
  //   the reactionType, 
  //   and an index into that reaction typelist
  reactions.forEach(function(reaction, index){
    label.add(reaction, index, "reaction")});
  photoDecomps.forEach(function(reaction, index){
    label.add(reaction, index, "photoDecomp")});

  // Compute tendency of molecules due to each reaction
  reactions.forEach(function(reaction){
    stoichiometricTendencies(reaction, molecules)});
  photoDecomps.forEach(function(reaction){
    stoichiometricTendencies(reaction, molecules)});

  // Construct force, jacobian and logicalJacobian for each reaction
  reactions.forEach(function(reaction){
    forceCollection.constructForcingFromTendencies(reaction, moleculeIndex)});
  photoDecomps.forEach(function(reaction){
    forceCollection.constructForcingFromTendencies(reaction, moleculeIndex)});

  // Get these from the forceCollection
  let logicalJacobian = forceCollection.getLogicalJacobian();
  let jacobian = forceCollection.getJacobian();
  let force = forceCollection.getForce();
  let labelCollection = label.getCollection();
  //forceCollection.printLogicalJacobian();
  //forceCollection.printJacobian();
  
  let mIndex = moleculeIndex.getMoleculeIndex();
  //console.log(mIndex);
  //
  // Send result back to host
  res.json({
    "preprocessorVersion": revision, 
    "tagDescription":tag_info.tagDescription,
    "tagStats":tag_info.tagStats,
    "molecules": molecules, 
    "reactions":reactions, 
    "photoDecomps":photoDecomps, 
    "labelCollection":labelCollection,
    "logicalJacobian":logicalJacobian, 
    "jacobian":jacobian, 
    "moleculeIndex":mIndex,
    "force":force
    });
});



function getMinLoc(arr, subMatrixIndex) {
  // find min and max of arr starting at "subMatrixIndex"
  let minLoc = subMatrixIndex;
  let min = arr[minLoc];

  let j = arr.length;

  for (let i = subMatrixIndex; i < j; i++ ) {
    minLoc = arr[i] < min ? i : minLoc;
  }
  return minLoc;
}


function logicalFactorize() {

  this.init = function(sourceMatrix) {
  
    
    this.size = sourceMatrix.length;
    // Create an array filled with false and with true down the diagonal
    // Initial pivot array is simple increasing index
    this.pivot = Array.from(Array(this.size), (x, index) => index);

    this.matrix = new Array(this.size);
    for (var i = 0; i < this.size; i++) {
      this.matrix[i]= sourceMatrix[i].slice(); // replicate row to each row of matrix
    }

    // Put elements down the diagonal
    for (var i = 0; i < this.size; i++) {
       this.matrix[i][i] =  true;
    }
  }
 
  this.switchColAndRow = function(subMatrixIndex, pivotPoint){
    if(subMatrixIndex == pivotPoint) return;
    // Pivot matrix Rows and Columns, exchanging subMatrixIndex and pivotPoint

    // Store pivot choice in pivot array
    var temp = this.pivot[pivotPoint];
    this.pivot[pivotPoint] = this.pivot[subMatrixIndex];
    this.pivot[subMatrixIndex] = temp;

    // Switch the whole column, include the part above
    let leftColumn = this.matrix[subMatrixIndex].slice(); // extract the current left Column
    this.matrix[subMatrixIndex]=this.matrix[pivotPoint].slice();
    this.matrix[pivotPoint]=leftColumn;
 
    // Switch both rows, including part to the left
    for (let diagonalIndex = 0; diagonalIndex < this.size ; diagonalIndex ++) {
      let upperElement = this.matrix[diagonalIndex][pivotPoint]; // future upper element
      this.matrix[diagonalIndex][pivotPoint] = this.matrix[diagonalIndex][subMatrixIndex];
      this.matrix[diagonalIndex][subMatrixIndex] = upperElement;
    }
  }

  this.interactionIndexArray = function(subMatrixIndex) {
    // Compute interaction indicies of submatrix starting at index = subMatrixIndex

    // Number of entries in the row
    let rowCount = new Array(this.size).fill(0);
    // Number of entries in the column
    let colCount = new Array(this.size).fill(0);

    for (let i = subMatrixIndex; i < this.size; i++){
      for (let j = subMatrixIndex; j < this.size; j++){
        if(this.matrix[i][j] && (i != j) ) {  // remove counts for diagonal elements
          rowCount[i] ++;
          colCount[j] ++;
        }
      }
    }

    // compute the "interaction" which is the element-by-element product of these arrays
    let interaction = rowCount.map( (e,i)=> e * colCount[i] );
    //console.log("interaction "+interaction);
    let pivotLoc =  getMinLoc(interaction, subMatrixIndex);
    //console.log("pivot location: " + pivotLoc);
    return(pivotLoc);
  }

  this.printMatrix = function(matrix) {
    for (let i = 0; i < matrix.length ; i++){
      let string = "";
      for (let j = 0; j < matrix.length ; j++){
        string += String("                    "+JSON.stringify(matrix[i][j])).slice(-15);
      }
      console.log(string);
    }
  }
  
  this.LUFillIn = function(eliminatingRowIndex) {
  // Place a "true" entry in every element which will be filled in as a result of elimination from row.
  // subMatrix is the matrix below and to the right of the eliminatingRow
    for (let row = eliminatingRowIndex+1; row < this.size; row++){
      for (let col = eliminatingRowIndex+1; col < this.size; col++){
        if( !(this.matrix[row][col]) ) {
           if( (this.matrix[row][eliminatingRowIndex]) && (this.matrix[eliminatingRowIndex][col]) ) {
             this.matrix[row][col] = true;
           }
        }
      }
    }
  }

  this.linearArrayMapping = function() {
  // Compute mapping between a linear array containing LU factorization elements and [row][col] dense representation of matrix
    var k = 0;
    this.map = [];
    this.diag = [];
    for (let col = 0; col < this.size; col++){
      this.map[col]=[];
    }
    for (let col = 0; col < this.size; col++){
      for (let row = 0; row < this.size; row++){
        if(this.matrix[row][col]) {
          this.map[row][col] = k;
          if( row == col ) this.diag[col]=k;
          k++
        }
      }
    }
    this.numberSparseFactorElements=k;
  }

  this.getPivot = function(){ 
    return this.pivot;
  }

  this.getDiagIndices = function(){ 
    return this.diag;
  }

}

function diagInv (targetIndex) {
  // LU(targetIndex) = 1/LU(targetIndex)
  this.targetIndex = targetIndex;
}

function leftEliminate (targetIndex, diagonalIndex) {
  // LU(targetIndex) = LU(targetIndex) * LU(diagonalIndex)
  this.targetIndex = targetIndex;
  this.diagonalIndex = diagonalIndex
}

function update (targetIndex, productTerm1, productTerm2) {
  // LU(targetIndex) = LU(targetIndex) - LU(productTerm1)*LU(productTerm2)
  this.targetIndex = targetIndex;
  this.productTerms = [productTerm1, productTerm2];
}

function fill (targetIndex, productTerm1, productTerm2){
  // LU(targetIndex) = -LU(productTerm1)*LU(productTerm2)
  this.targetIndex = targetIndex;
  this.productTerms = [productTerm1, productTerm2];
}

// Given molecules and logical matrix, construct sparse LU factorization
// with corresponding pivoting of molecules and LU backsolves
app.post('/ConstructSparseLUFactor', function(req, res) {

  // collect data from request
  var content = req.body;
  var logicalJacobian = content.logicalJacobian;
  let jacobian = content.jacobian;
  let molecules = content.molecules;
  let force = content.force;

  var logicalFactorization = new logicalFactorize();
  
  // Compute factorization fill-in
  logicalFactorization.init(logicalJacobian) ;
  for (let i = 0; i < logicalFactorization.size ; i++){
    //console.log('row: '+i);
    let minLoc = logicalFactorization.interactionIndexArray(i);
    //console.log('Pivot: '+ i + " and " + minLoc);
    logicalFactorization.switchColAndRow(i, minLoc);
    logicalFactorization.LUFillIn(i)
  }
  
  // Compute mapping from [i,j] to linear array of LU(:)
  logicalFactorization.linearArrayMapping();

  const accumulatedFortanLUFactorization = [];
  const LUFactorization = [];

  // generate Fortran
  for (let rankIndex = 0; rankIndex < logicalFactorization.size; rankIndex++){
    LUFactorization.push(new diagInv(logicalFactorization.diag[rankIndex]));
    accumulatedFortanLUFactorization.push('LU('+logicalFactorization.diag[rankIndex]+') = 1./LU('+logicalFactorization.diag[rankIndex]+')');
    if( rankIndex < logicalFactorization.size-1 ){
      for (let row = rankIndex + 1; row < logicalFactorization.size; row++){
        if( logicalFactorization.matrix[row][rankIndex]){
          LUFactorization.push(new leftEliminate(logicalFactorization.map[row][rankIndex],logicalFactorization.diag[rankIndex]));
          let fortranString = 'LU('+logicalFactorization.map[row][rankIndex] + ')';
          fortranString += ' = LU('+logicalFactorization.map[row][rankIndex]+')*LU('+logicalFactorization.diag[rankIndex]+')';
          accumulatedFortanLUFactorization.push(fortranString);
        }
      }
      for (var col = rankIndex + 1; col < logicalFactorization.size; col++){
        if(logicalFactorization.matrix[rankIndex][col]){
          for ( var row = rankIndex + 1; row < logicalFactorization.size; row++){
            if(logicalFactorization.matrix[row][rankIndex]){
// THIS IS A WRONG:
              if(logicalFactorization.matrix[row][col] ){
                LUFactorization.push( new update(logicalFactorization.map[row][col],logicalFactorization.map[row][rankIndex], logicalFactorization.map[rankIndex][col]));
                let indx=logicalFactorization.map[row][col];
                let indx1=logicalFactorization.map[row][rankIndex];
                let indx2=logicalFactorization.map[rankIndex][col];
                let fortranString = 'LU('+indx+') = LU('+indx+') - LU('+indx1+')*LU('+indx2+')';
                accumulatedFortanLUFactorization.push(fortranString);
              }else{
                let indx=logicalFactorization.map[row][col];
                let indx1=logicalFactorization.map[row][rankIndex];
                let indx2=logicalFactorization.map[rankIndex][col];
                LUFactorization.push(new fill(logicalFactorization.map[row][col],logicalFactorization.map[row][rankIndex], logicalFactorization.map[rankIndex][col]));
                logicalFactorization.matrix[row][col]=true;
                let fortranString = 'LU('+indx+') = -LU('+indx1+')*LU('+indx2+')';
                accumulatedFortanLUFactorization.push(fortranString);
              }
            }
          }
        }
      }
    }
  }
  

  var init_jac = [];
  for (var col = 0; col < logicalFactorization.matrix.length; col++){
    for (var row = 0; row < logicalFactorization.matrix.length; row++){
      if(jacobian[row][col].length > 0 ){ 
        let iRow = logicalFactorization.pivot.indexOf(row);
        let iCol = logicalFactorization.pivot.indexOf(col);
        init_jac.push({
          "forcedMolecule":molecules[row].moleculename ,
          "sensitivityMolecule": molecules[col].moleculename,
          "LUArrayIndex":logicalFactorization.map[iRow][iCol],
          "jacobianTerms":jacobian[row][col],
          "LUFactorization":LUFactorization,
          "diagonalIndices":logicalFactorization.getDiagIndices()
        });
      }
    }
  }

  var factor_LU_fortran = "\n";
  factor_LU_fortran += 'subroutine factor(LU)\n';
  factor_LU_fortran += '\n\n';
  factor_LU_fortran += '  real(r8), intent(inout) :: LU(:)\n';
  factor_LU_fortran += '\n\n';

  var alt_factor = function(LUFactorization){

    diagInv.prototype.toCode = function(iOffset=0) {
      let targetI = iOffset + parseInt(this.targetIndex);
      let fortranString = '  LU('+ targetI +') = 1./LU('+ targetI +')\n';
      return fortranString;
    }

    leftEliminate.prototype.toCode = function(iOffset=0) {
      let targetI = iOffset + parseInt(this.targetIndex);
      let diagI = iOffset + parseInt(this.diagonalIndex);
      let fortranString = '  LU(' + targetI + ') = LU(' + targetI + ') * LU(' + diagI + ')\n';
      return fortranString;
    }

    update.prototype.toCode = function(iOffset=0) {
      let targetI = iOffset + parseInt(this.targetIndex);
      let prodI0 = iOffset + parseInt(this.productTerms[0]);
      let prodI1 = iOffset + parseInt(this.productTerms[1]);
      let fortranString = '  LU('+ targetI +') = LU('+ targetI +') - LU('+ prodI0 +')*LU('+ prodI1 +')\n';
      return fortranString;
    }

    fill.prototype.toCode = function(iOffset=0){ 
      let targetI = iOffset + parseInt(this.targetIndex);
      let prodI0 = iOffset + parseInt(this.productTerms[0]);
      let prodI1 = iOffset + parseInt(this.productTerms[1]);
      let fortranString = '  LU('+ targetI +') = -LU('+ prodI0 +')*LU('+ prodI1 +')\n';
      return fortranString;
    }


    var fortranOffset = 1;

    let fortranCodeArray = LUFactorization.map( 
      (step) => {
        return step.toCode(fortranOffset);
      } 
    );

    factor_LU_fortran += fortranCodeArray.join("");

    factor_LU_fortran += '\n\n';
    factor_LU_fortran += 'end subroutine factor\n';
    return factor_LU_fortran;
  }


  var backsolve_L_y_eq_b_fortran = "\n";
  backsolve_L_y_eq_b_fortran += 'subroutine backsolve_L_y_eq_b(LU,b,y)\n';
  backsolve_L_y_eq_b_fortran +='\n\n'
  backsolve_L_y_eq_b_fortran += '  real(r8), intent(in) :: LU(:)\n';
  backsolve_L_y_eq_b_fortran += '  real(r8), intent(in) :: b(:)\n';
  backsolve_L_y_eq_b_fortran += '  real(r8), intent(out) :: y(:)\n';
  backsolve_L_y_eq_b_fortran +='\n\n'
  for(var row = 0; row < logicalFactorization.size; row++){
    let fortran_row = row + 1;
    backsolve_L_y_eq_b_fortran += '  y('+fortran_row+') = b('+fortran_row+')\n';
    for(var col = 0; col < row; col++){
      let fortran_col = col + 1;
      let LUIndex = logicalFactorization.map[row][col] + 1;
      if(logicalFactorization.map[row][col]){
        backsolve_L_y_eq_b_fortran +='  y('+fortran_row+') = y('+fortran_row+') - LU('+LUIndex+') * y('+fortran_col+')\n'
      }
    }
  }
  backsolve_L_y_eq_b_fortran +='\n\n'
  backsolve_L_y_eq_b_fortran +='end subroutine backsolve_L_y_eq_b\n\n\n';
  //console.log(backsolve_L_y_eq_b_fortran);


  var backsolve_U_x_eq_y_fortran = '\nsubroutine backsolve_U_x_eq_y(LU,y,x)\n';
  backsolve_U_x_eq_y_fortran +='\n\n'
  backsolve_U_x_eq_y_fortran +='  real(r8), intent(in) :: LU(:)\n'
  backsolve_U_x_eq_y_fortran +='  real(r8), intent(in) :: y(:)\n'
  backsolve_U_x_eq_y_fortran +='  real(r8), intent(out) :: x(:)\n'
  backsolve_U_x_eq_y_fortran +='  real(r8) :: temporary\n'
  backsolve_U_x_eq_y_fortran +='\n\n'
  for(var row = logicalFactorization.size-1; row > -1; row--){
    let fortran_row = row + 1;
    backsolve_U_x_eq_y_fortran +='  temporary = y('+fortran_row+')\n'
    for(var col = row+1; col < logicalFactorization.size; col++){
      let fortran_col = col + 1;
      let LUIndex = logicalFactorization.map[row][col] + 1;
      if(logicalFactorization.map[row][col]){
        backsolve_U_x_eq_y_fortran +='  temporary = temporary - LU('+LUIndex+') * x('+fortran_col+')\n'
      }
    }
    let LUIndex = logicalFactorization.map[row][row] + 1;
    backsolve_U_x_eq_y_fortran +='  x('+fortran_row+') = LU('+LUIndex+') * temporary\n';
  }
  backsolve_U_x_eq_y_fortran +='\n\n'
  backsolve_U_x_eq_y_fortran +='end subroutine backsolve_U_x_eq_y\n';
  //console.log(backsolve_u_x_eq_y_fortran);

  let solve_string = "\n";
  solve_string += "subroutine solve(LU, x, b) \n\n";
  solve_string += "  real(r8), intent(in) :: LU(:), b(:) ! solve LU * x = b \n";
  solve_string += "  real(r8), intent(out) :: x(:) \n";
  solve_string += "  real(r8) :: y(size(b)) \n\n";
  solve_string += "  call backsolve_L_y_eq_b(LU, b, y)\n";
  solve_string += "  call backsolve_U_x_eq_y(LU, y, x)\n";
  solve_string += "\nend subroutine solve \n\n";

  var reorderedMolecules = [];
  for(let i = 0; i< molecules.length; i++){
    reorderedMolecules[i]=molecules[logicalFactorization.pivot[i]];
    reorderedMolecules[i].postPivotIndex=logicalFactorization.pivot[i];
  }
  //console.log(reorderedMolecules);

  var reorderedForcing = [];
  for(let i = 0; i< molecules.length; i++){
    reorderedForcing[i]=force[logicalFactorization.pivot[i]];
  }

  var pivot = logicalFactorization.pivot;
 
  let alt_fortranFactor = alt_factor(LUFactorization);

  let indexOffset = 1; //convert to fortran
  let module = "module factor_solve_utilities\n\n";
  module += "use ccpp_kinds, only: r8 => kind_phys \n\n"
  module += "! This code was generated by Preprocessor revision "+revision+"\n"
  module += "! Preprocessor source "+git_remote+"\n\n"
  module += "! "+content.tagDescription+"\n";
  module += "! "+content.tagStats+"\n\n";
  module += "  implicit none\n\n";
  module += "  integer, parameter :: number_sparse_factor_elements = "+logicalFactorization.numberSparseFactorElements+"\n\n";
  module += "  public :: factor, solve \n\n"
  module += "  contains\n\n";
  module += backsolve_L_y_eq_b_fortran;
  module += backsolve_U_x_eq_y_fortran;
  module += factor_LU_fortran;
  module += solve_string;
  module += "\nend module factor_solve_utilities\n";


  res.json({
    "preprocessorVersion": revision, 
    "tagDescription":content.tagDescription,
    "tagStats":content.tagStats,
    "reorderedMolecules":reorderedMolecules,
    "backsolve_L_y_eq_b_fortran":backsolve_L_y_eq_b_fortran,
    "backsolve_U_x_eq_y_fortran":backsolve_U_x_eq_y_fortran,
    "solve":solve_string,
    "factor_LU_fortran":factor_LU_fortran,
    "pivot":pivot,
    "reorderedForcing":reorderedForcing,
    "init_jac":init_jac,
    "module":module
    });

});





function reorderedIndex (reorderedMolecules){
  // caution:  modifies reorderedMolecules
  let index = {};
  for (let i = 0; i < reorderedMolecules.length; i++){
    index[reorderedMolecules[i].moleculename]=i;
    reorderedMolecules[i].idxMoleculeAssocation = i;
  }
  return index;
}


// convert terms to code
// expressions are of the following form:
//   netTendency * product of reactants * conversion to number_density * rateConstant
function termToCode (term, moleculeIndex, indexOffset) {
  let idxReaction = term.idxReaction;
  let arrayOfVmr = term.arrayOfVmr;
  let troeTerm = term.troeTerm;
  let netTendency = term.netTendency;
  let reactionString = term.reactionString;

  let rateConstString = "rate_constant(" +(parseInt(idxReaction) + parseInt(indexOffset))+")";
  let troeDensityCount = (troeTerm ? 1 : 0);
  let troeDensityConversion = (troeTerm ? "number_density_air" : "");


  let numberDensityArray =[];
  for(let iVmr = 0; iVmr < arrayOfVmr.length; iVmr++){
    numberDensityArray.push("number_density("+ (parseInt(indexOffset) + parseInt(moleculeIndex[arrayOfVmr[iVmr]])) +")");
  }
  if(troeTerm) {numberDensityArray.push(troeDensityConversion);}

  let tendencyString =""; 
  if (netTendency > 0) {
    if (netTendency != 1){
      tendencyString = "+ "+netTendency+"*" +rateConstString;
    } else {
      tendencyString = "+ "+rateConstString;
    }
  } else {
    if (netTendency != -1){
      tendencyString = "- "+Math.abs(netTendency)+"*" +rateConstString;
    } else {
      tendencyString = "- "+rateConstString;
    }
  }

  let arrayOfNumberDensityString = "";
  let termString = "";
  if (arrayOfVmr.length > 0) {
    arrayOfNumberDensityString = numberDensityArray.join(" * ") 
    termString = tendencyString + " * " + arrayOfNumberDensityString;
  } else {
    termString = tendencyString;
  }

  return termString;
}

app.post('/toCode', function(req, res) {

  // collect data from request
  let content = req.body;
  let reorderedMolecules = content.reorderedMolecules;
  let init_jac = content.init_jac;
  let force = content.reorderedForcing;

  // find index for molecules, as reordered by pivot
  var moleculeIndex =reorderedIndex(reorderedMolecules);

  // clone molecules
  let kinetics_init = JSON.parse(JSON.stringify(reorderedMolecules));
  kinetics_init.toCode = function(indexOffset=0){
    let init_kinetics_string ="\nsubroutine kinetics_init(";
    //init_kinetics_string += reorderedMolecules.map((elem) =>{return elem.moleculename;}).join(", ");
    init_kinetics_string += "vmr";
    init_kinetics_string += ", number_density, number_density_air";
    init_kinetics_string += ")\n";
    init_kinetics_string += "\n real(r8), intent(in) :: ";
    //init_kinetics_string += reorderedMolecules.map((elem) =>{return elem.moleculename;}).join(", ");
    init_kinetics_string += "vmr(:)";
    init_kinetics_string += "\n real(r8), intent(out):: number_density("+reorderedMolecules.length+")";
    init_kinetics_string += "\n real(r8), intent(in) :: number_density_air";
    init_kinetics_string += "\n\n";
    // for every molecule in the reordered array, convert vmr to number density
    let initStringArray = reorderedMolecules.map(
        (elem,index) =>{
          return "number_density("+(elem.postPivotIndex+indexOffset)+") = vmr("+(index + indexOffset)+") * number_density_air" + " ! "+elem.moleculename;
        }
      );
    init_kinetics_string += "\n " + initStringArray.join("\n ");
    init_kinetics_string += "\n\n"+"end subroutine kinetics_init\n\n";
    return init_kinetics_string;
  }

  
  //clone molecules
  let kinetics_final = JSON.parse(JSON.stringify(reorderedMolecules));
  kinetics_final.toCode = function(indexOffset=0){
    let final_kinetics_string ="\nsubroutine kinetics_final(";
    //final_kinetics_string += reorderedMolecules.map((elem) =>{return elem.moleculename;}).join(", ");
    final_kinetics_string += "vmr";
    final_kinetics_string += ", number_density, number_density_air";
    final_kinetics_string += ")\n";
    final_kinetics_string += "\n real(r8), intent(out) :: ";
    //final_kinetics_string += reorderedMolecules.map((elem) =>{return elem.moleculename;}).join(", ");
    final_kinetics_string += "vmr(:)";
    final_kinetics_string += "\n real(r8), intent(in) :: number_density("+reorderedMolecules.length+")";
    final_kinetics_string += "\n real(r8), intent(in) :: number_density_air";
    final_kinetics_string += "\n\n";
    // for every molecule in the reordered array, convert vmr to number density
    let initStringArray = reorderedMolecules.map(
        (elem,index) =>{
          return "vmr("+(index + indexOffset)+") = number_density("+(elem.postPivotIndex + indexOffset)+") / number_density_air" + " ! "+elem.moleculename;
        }
      );
    final_kinetics_string += "\n " + initStringArray.join("\n ");
    final_kinetics_string += "\n\n"+"end subroutine kinetics_final\n\n";
    return final_kinetics_string;
  }



  // code to initialize jacobian
  init_jac.toCode = function(indexOffset=0){
    let init_jac_code_string = "\n";
    init_jac_code_string += '\nsubroutine dforce_dy(LU, rate_constant, number_density, number_density_air)\n';
    init_jac_code_string += "\n  ! Compute the derivative of the Forcing w.r.t. each chemical";
    init_jac_code_string += "\n  ! Also known as the Jacobian";
    init_jac_code_string += '\n  real(r8), intent(out) :: LU(:)\n';
    init_jac_code_string += '  real(r8), intent(in) :: rate_constant(:)\n';
    init_jac_code_string += '  real(r8), intent(in) :: number_density(:)\n';
    init_jac_code_string += '  real(r8), intent(in) :: number_density_air\n\n';
    init_jac_code_string += '  LU(:) = 0\n';
    init_jac_code_string += '\n';
    for (let ijac = 0; ijac < init_jac.length; ijac++){
      let element = init_jac[ijac];
      init_jac_code_string += '\n  ! df_'+element.forcedMolecule+'/d('+element.sensitivityMolecule+')\n';
      let LUElement = 'LU('+(element.LUArrayIndex+indexOffset)+') '
      for(let iterm = 0; iterm < element.jacobianTerms.length; iterm ++){
        init_jac_code_string += '    !  '+element.jacobianTerms[iterm].reactionString+'\n';
        init_jac_code_string += '    '+LUElement+'= '+LUElement+termToCode(element.jacobianTerms[iterm], moleculeIndex, indexOffset) +'\n\n' ;
      }
    }
    init_jac_code_string += 'end subroutine dforce_dy\n';
    return init_jac_code_string;
  }

  
  init_jac.factored_alpha_minus_jac = function(indexOffset=0) {
    // Construct unfactored LU = alpha * I - jacobian, then call factorization routine on unfactored LU
    let diagonalIndices = init_jac[0].diagonalIndices;
    let factored_alpha_minus_jac_string  = '\nsubroutine factored_alpha_minus_jac(LU, alpha, dforce_dy)\n';
    factored_alpha_minus_jac_string += '  !compute LU decomposition of [\alpha * I - dforce_dy]\n';
    factored_alpha_minus_jac_string += '\n';
    factored_alpha_minus_jac_string += '  real(r8), intent(in) :: dforce_dy(:)\n';
    factored_alpha_minus_jac_string += '  real(r8), intent(in) :: alpha\n';
    factored_alpha_minus_jac_string += '  real(r8), intent(out) :: LU(:)\n';
    factored_alpha_minus_jac_string += '\n';
    factored_alpha_minus_jac_string += '  LU(:) = -dforce_dy(:)\n';
    factored_alpha_minus_jac_string += '\n';

    // Add alpha to diagonal elements
    factored_alpha_minus_jac_string += '! add alpha to diagonal elements\n';
    factored_alpha_minus_jac_string += '\n';
    for(let iRank = 0; iRank < diagonalIndices.length; iRank++){
      let diag = diagonalIndices[iRank] + indexOffset;
      factored_alpha_minus_jac_string += '  LU('+ diag + ') = -dforce_dy('+ diag + ') + alpha \n';
    }

    factored_alpha_minus_jac_string += '\n';
    factored_alpha_minus_jac_string += '  call factor(LU) \n';
    factored_alpha_minus_jac_string += '\n';
    factored_alpha_minus_jac_string += 'end subroutine factored_alpha_minus_jac\n';

    return factored_alpha_minus_jac_string;
  }

  init_jac.solve_LU_times_x_equals_y_toCode = function(indexOffset=0) {
    //console.log(indexOffset);
  // input y, factored G
  } 

  init_jac.dforce_dy_times_vector_string = function(indexOffset=0){
  // Construct code for dF/dy * vector
    let dforce_dy_times_vector_string  = '\npure subroutine dforce_dy_times_vector(dforce_dy, vector, cummulative_product)\n';
    dforce_dy_times_vector_string += '\n  !  Compute product of [ dforce_dy * vector ]';
    dforce_dy_times_vector_string += '\n  !  Commonly used to compute time-truncation errors [dforce_dy * force ]\n\n';
    dforce_dy_times_vector_string += '  real(r8), intent(in) :: dforce_dy(:) ! Jacobian of forcing\n';
    dforce_dy_times_vector_string += '  real(r8), intent(in) :: vector(:)    ! Vector ordered as the order of number density in dy\n';
    dforce_dy_times_vector_string += '  real(r8), intent(out) :: cummulative_product(:)  ! Product of jacobian with vector\n';
    dforce_dy_times_vector_string += '\n';
    dforce_dy_times_vector_string += '  cummulative_product(:) = 0\n\n';

    for (let ijac = 0; ijac < init_jac.length; ijac++){
      let element = init_jac[ijac];
      dforce_dy_times_vector_string += '\n  ! df_'+element.forcedMolecule+'/d('+element.sensitivityMolecule+') * '+element.sensitivityMolecule+'_temporary\n';
      let LUElement = 'dforce_dy('+(element.LUArrayIndex+indexOffset)+')'
      let forceIndex = moleculeIndex[element.forcedMolecule]+ indexOffset;
      let sensitivityIndex = moleculeIndex[element.sensitivityMolecule]+ indexOffset;
      dforce_dy_times_vector_string += '  cummulative_product('+forceIndex+') = cummulative_product('+forceIndex+') + ';
      dforce_dy_times_vector_string += LUElement+' * vector('+sensitivityIndex+')\n\n' ;
    }
    dforce_dy_times_vector_string  += '\nend subroutine dforce_dy_times_vector\n';
    return dforce_dy_times_vector_string;
  }

  force.toCode = function(indexOffset=0) {

    let force_code_string = "\n";
    force_code_string +="subroutine p_force(rate_constant, number_density, number_density_air, force)\n";
    force_code_string +="  ! Compute force function for all molecules\n";
    force_code_string +="\n";
    force_code_string +="  real(r8), intent(in) :: rate_constant(:)\n";
    force_code_string +="  real(r8), intent(in) :: number_density(:)\n";
    force_code_string +="  real(r8), intent(in) :: number_density_air\n";
    force_code_string +="  real(r8), intent(out) :: force(:)\n";
    force_code_string +="\n";

    for(let iMolecule = 0; iMolecule < force.length; iMolecule++ ){
      let forceString = "force("+(iMolecule+indexOffset)+")";
      force_code_string +="\n\n! "+force[iMolecule].constituentName+"\n";
      force_code_string +="  "+forceString+" = 0\n";

      let nTendency = force[iMolecule].tendency.length;
      for (let iTendency = 0; iTendency < nTendency; iTendency ++){
        let termCode = termToCode(force[iMolecule].tendency[iTendency], moleculeIndex, indexOffset);
        force_code_string +="\n  ! "+ force[iMolecule].tendency[iTendency].reactionString+"\n";
        force_code_string +="  "+forceString+" = "+forceString +" "+ termCode+"\n";
      }
    }

    force_code_string +="\n";
    force_code_string +="end subroutine p_force\n";

    return force_code_string;

  }

  let indexOffset = 1; //convert to fortran
  let module = "module kinetics_utilities\n";
  module += "use ccpp_kinds, only: r8 => kind_phys\n\n";
  module += "! This code was generated by Preprocessor revision "+revision+"\n"
  module += "! Preprocessor source "+git_remote+"\n\n"
  module += "! "+content.tagDescription+"\n";
  module += "! "+content.tagStats+"\n\n";
  module += "  use factor_solve_utilities, only:  factor \n\n"
  module += "  implicit none\n\n";
  module += "  public :: dforce_dy_times_vector, factored_alpha_minus_jac, p_force, dforce_dy, kinetics_init, kinetics_final \n";
  module += "  contains\n\n";
  module += init_jac.toCode(indexOffset);
  module += kinetics_init.toCode(indexOffset);
  module += kinetics_final.toCode(indexOffset);
  module += init_jac.factored_alpha_minus_jac(indexOffset);
  module += force.toCode(indexOffset);
  module += init_jac.dforce_dy_times_vector_string(indexOffset);
  module += "\nend module kinetics_utilities\n";


  let init_jac_fortran = init_jac.toCode(indexOffset);
  let init_kinetics_fortran = kinetics_init.toCode(indexOffset);
  let final_kinetics_fortran = kinetics_final.toCode(indexOffset);
  let factored_alpha_minus_jac = init_jac.factored_alpha_minus_jac(indexOffset);
  let force_fortran = force.toCode(indexOffset);
  let dforce_dy_times_vector_string = init_jac.dforce_dy_times_vector_string(indexOffset);

  res.json({
    "preprocessorVersion": revision, 
    "init_jac_code_string":init_jac_fortran,
    "init_kinetics":init_kinetics_fortran,
    "final_kinetics":final_kinetics_fortran,
    "factored_alpha_minus_jac":factored_alpha_minus_jac,
    "force":force_fortran,
    "dforce_dy_times_vector":dforce_dy_times_vector_string, 
    "module" : module
  });
});


http.listen(8080, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

