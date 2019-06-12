'use strict'

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());

// Set forcing to zero for any net stoichiometric tendency smaller 
//   (in absolute value) than this.
const zero_equivalent_stoichometry_limit = 0.000001

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

    let rate=new term(reaction.idxReaction, reaction.reactants, reaction.troe, reaction.reactionString);

    let nTends = reaction.tendencies.length;

    for (let iTend = 0; iTend < nTends; iTend++){
      let tendency = reaction.tendencies[iTend];
      let forcedMoleculeIndex = tendency.idxConstituent;
      if (forcedMoleculeIndex == -1 ) break;  // molecule not in the list of molecules-> don't consider it.
      force[forcedMoleculeIndex].tendency.push({tendency:tendency.netTendency, rate:rate});
        
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
  console.dir(content.mechanism.tag_info);

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
    "molecules": molecules, 
    "reactions":reactions, 
    "photoDecomps":photoDecomps, 
    "labelCollection":labelCollection,
    "logicalJacobian":logicalJacobian, 
    "jacobian":jacobian, 
    "moleculeIndex":mIndex,
    "force":force});
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

  var logicalFactorization = new logicalFactorize();
  
  // Compute factorization fill-in
  logicalFactorization.init(content.logicalJacobian) ;
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
  

  //console.log('fortran factor');
  //console.log(JSON.stringify(accumulatedFortanLUFactorization, null, 2));

  // true jacobian (as opposed to logicalJacobian)
  let jacobian = content.jacobian;
  let molecules = content.molecules;

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
  factor_LU_fortran += '  real(r8) LU(:)\n';

  var alt_factor = function(LUFactorization){

    diagInv.prototype.toCode = function(iOffset=0) {
      let targetI = iOffset + parseInt(this.targetIndex);
      let fortranString = 'LU('+ targetI +') = 1./LU('+ targetI +')\n';
      return fortranString;
    }

    leftEliminate.prototype.toCode = function(iOffset=0) {
      let targetI = iOffset + parseInt(this.targetIndex);
      let diagI = iOffset + parseInt(this.diagonalIndex);
      let fortranString = 'LU(' + targetI + ') = LU(' + targetI + ') * LU(' + diagI + ')\n';
      return fortranString;
    }

    update.prototype.toCode = function(iOffset=0) {
      let targetI = iOffset + parseInt(this.targetIndex);
      let prodI0 = iOffset + parseInt(this.productTerms[0]);
      let prodI1 = iOffset + parseInt(this.productTerms[1]);
      let fortranString = 'LU('+ targetI +') = LU('+ targetI +') - LU('+ prodI0 +')*LU('+ prodI1 +')\n';
      return fortranString;
    }

    fill.prototype.toCode = function(iOffset=0){ 
      let targetI = iOffset + parseInt(this.targetIndex);
      let prodI0 = iOffset + parseInt(this.productTerms[0]);
      let prodI1 = iOffset + parseInt(this.productTerms[1]);
      let fortranString = 'LU('+ targetI +') = -LU('+ prodI0 +')*LU('+ prodI1 +')\n';
      return fortranString;
    }


    var fortranOffset = 1;

    let fortranCodeArray = LUFactorization.map( 
      (step) => {
        return step.toCode(fortranOffset);
      } 
    );

    factor_LU_fortran += fortranCodeArray.join("");

    factor_LU_fortran += 'end subroutine factor\n';
    return factor_LU_fortran;
  }


  var backsolve_L_y_eq_b_fortran = "\n";
  backsolve_L_y_eq_b_fortran += 'subroutine backsolve_L_y_eq_b(LU,b,y)\n';
  backsolve_L_y_eq_b_fortran += '  real(r8) LU(:)\n';
  backsolve_L_y_eq_b_fortran += '  real(r8) b(:)\n';
  backsolve_L_y_eq_b_fortran += '  real(r8) y(:)\n';
  for(var row = 0; row < logicalFactorization.size; row++){
    let fortran_row = row + 1;
    backsolve_L_y_eq_b_fortran += '  y('+fortran_row+') = b('+fortran_row+')\n';
    for(var col = 0; col < row; col++){
      let fortran_col = col + 1;
      if(logicalFactorization.map[row][col]){
        backsolve_L_y_eq_b_fortran +='  y('+fortran_row+') = y('+fortran_row+') - LU('+logicalFactorization.map[row][col]+') * y('+fortran_col+')\n'
      }
    }
  }
  backsolve_L_y_eq_b_fortran +='end subroutine backsolve_L_y_eq_b\n\n\n';
  //console.log(backsolve_L_y_eq_b_fortran);


  var backsolve_u_x_eq_y_fortran = '\nsubroutine backsolve_U_x_eq_y(LU,y,x)\n';
  backsolve_u_x_eq_y_fortran +='   real(r8) LU(:)\n'
  backsolve_u_x_eq_y_fortran +='  real(r8) y(:)\n'
  backsolve_u_x_eq_y_fortran +='  real(r8) x(:)\n'
  backsolve_u_x_eq_y_fortran +='  real(r8) temporary\n'
  for(var row = logicalFactorization.size-1; row > -1; row--){
    let fortran_row = row + 1;
    backsolve_u_x_eq_y_fortran +='  temporary = y('+fortran_row+')\n'
    for(var col = row+1; col < logicalFactorization.size; col++){
      let fortran_col = col + 1;
      if(logicalFactorization.map[row][col]){
        backsolve_u_x_eq_y_fortran +='  temporary = temporary - LU('+logicalFactorization.map[row][col]+') * x('+fortran_col+')\n'
      }
    }
    backsolve_u_x_eq_y_fortran +='  x('+fortran_row+') = LU('+logicalFactorization.map[row][row]+') * temporary\n';
  }
  backsolve_u_x_eq_y_fortran +='end subroutine backsolve_U_x_eq_y\n';
  //console.log(backsolve_u_x_eq_y_fortran);


  var reorderedMolecules = [];
  for(let i = 0; i< molecules.length; i++){
    reorderedMolecules[i]=molecules[logicalFactorization.pivot[i]];
  }
  //console.log(reorderedMolecules);

  var pivot = logicalFactorization.pivot;
 
  let alt_fortranFactor = alt_factor(LUFactorization);

  res.json({
    "reorderedMolecules":reorderedMolecules,
    "backsolve_L_y_eq_b_fortran":backsolve_L_y_eq_b_fortran,
    "backsolve_U_x_eq_y_fortran":backsolve_u_x_eq_y_fortran,
    "factor_LU_fortran":factor_LU_fortran,
    "pivot":pivot,
    "init_jac":init_jac});

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

let number_density_string = ["", "number_density_air","number_density_air_squared", "number_density_air_cubed"];

// convert terms to code:
//   netTendency * product of reactants * conversion to number_density * rateConstant
function termToCode (term, moleculeIndex, indexOffset) {
  let idxReaction = term.idxReaction;
  let arrayOfVmr = term.arrayOfVmr;
  let troeTerm = term.troeTerm;
  let netTendency = term.netTendency;

  //let vmrToNumberDensityCount = arrayOfVmr.length + (troeTerm ? 1 : 0);
  //let vmrToNumberDensityConversion = number_density_string[vmrToNumberDensityCount];
  let rateConstString = "rateConstant(" +(idxReaction + indexOffset)+")";
  let troeDensityCount = (troeTerm ? 1 : 0);
  let troeDensityConversion = number_density_string[troeDensityCount];

  //let vmrStringArray =[];
  //for(let iVmr = 0; iVmr < arrayOfVmr.length; iVmr++){
    //vmrStringArray.push("vmr("+ moleculeIndex[arrayOfVmr[iVmr]]   +")");
  //}

  let numberDensityArray =[];
  for(let iVmr = 0; iVmr < arrayOfVmr.length; iVmr++){
    numberDensityArray.push("numberDensity("+ moleculeIndex[arrayOfVmr[iVmr]]   +")");
  }
  if(troeTerm) {numberDensityArray.push(number_density_string[1]);}

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

  //let arrayOfVmrString="";
  //let termString = ""
  //if (arrayOfVmr.length > 0) {
    //arrayOfVmrString = arrayOfVmr.join(" * ") + " * " + vmrToNumberDensityConversion;
    //termString = tendencyString + " * " + arrayOfVmrString;
  //} else {
    //termString = tendencyString;
  //}
  
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
  var content = req.body;
  var reorderedMolecules = content.reorderedMolecules
  console.log("reorderedMolecules");
  console.log(reorderedMolecules);

  // find index for molecules, as reordered by pivot
  var moleculeIndex =reorderedIndex(reorderedMolecules);

  let kinetics_init = reorderedMolecules;
  kinetics_init.toCode = function(indexOffset=0){
    let init_kinetics_string ="\nsubroutine kinetics_init(";
    init_kinetics_string += reorderedMolecules.map((elem) =>{return elem.moleculename;}).join(",");
    init_kinetics_string += ",number_density_array,number_density_air";
    init_kinetics_string += ")\n";
    init_kinetics_string += "\n real(r8),intent(in) :: ";
    init_kinetics_string += reorderedMolecules.map((elem) =>{return elem.moleculename;}).join(",");
    init_kinetics_string += "\n real(r8), intent(out):: number_density_array("+reorderedMolecules.length+")";
    init_kinetics_string += "\n real(r8), intent(in) :: number_density_air";
    // for every molecule in the reordered array, convert vmr to number density
    let initStringArray = reorderedMolecules.map((elem,index) =>{return "numberDensityArray("+(index+indexOffset)+")="+elem.moleculename+"*numberDensityOfAir";});
    init_kinetics_string += "\n " + initStringArray.join("\n ");
    init_kinetics_string += "\n\n"+"end subroutine kinetics_init";
    return init_kinetics_string;
  }

  let init_jac = content.init_jac;

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
    init_jac_code_string += 'end subroutine init_jacobian\n';
    return init_jac_code_string;
  }

  
  //construct_factored_h_minus_jac.toCode = function(indexOffset=0) {
    //console.log(indexOffset);
  // input alpha_over_dt
  // input dFdy
  // construct new matrix, alpha_over_dt_minus_jac
  // factor new matrix
  // output LU
  //}

  //solve_LU_times_x_equals_y_toCode = function(indexOffset=0) {
    //console.log(indexOffset);
  // input y, factored G
  //} 

  //jacobian_times_vector_toCode = function(indexOffset=0){
    //console.log(indexOffset);
  //input dFdY
  //input vector
  //output result
  //}

  let indexOffset = 1; //convert to fortran
  let init_jac_fortran = init_jac.toCode(indexOffset);
  let init_kinetics_fortran = kinetics_init.toCode(indexOffset);

  res.json({
    "init_jac_code_string":init_jac_fortran,
    "init_kinetics":init_kinetics_fortran
  });
});


http.listen(8080, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

