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

// Number density string is indexed by the number of reactants
//  it is attached to any reaction rate string and jacobian strin
//  number of reactants( 'O2 -> O + O1D' ) = 1
//  number of reactants( 'O + O2 + M -> O3 + M' ) = 3
var number_density_string = ["", " * number_density_air"," * number_density_air_squared", " * number_density_air_cubed"];

// Collect all molecule names and assign an associative array
// to index them
const moleculeIndexer = function(molecules){
  this.moleculeAssociation = [];
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
}


// Collect all reaction (raw) labels.  
// If label has been used before, count number of times that label has appeared.
// Return the count of that label.
const labelCollector = function() {
  this.collection = [];
  this.add = function(rawLabel)
  {
    let position = this.collection.map(function(e) { return e.rawLabel; }).indexOf(rawLabel);
    if(position > -1) {
      this.collection[position].count ++;
      return this.collection[position].count;
    } else {
      this.collection.push({rawLabel:rawLabel,count:1});
      return 1;
    }
  }

  this.print = function() {
    console.log('Labels count: '+this.collection.length);
    console.dir(this.collection);
  }
}

// Store data to be converted to code
// Code will be netTendency*rateConstant(rateConstantIndex)*product_of_vmr_array*M
//   I.E., 0.6*rateConstant(22)*vmr(8)*vmr(3)*M
//   or 0.6*rateConstant(22)*vmr(8)*vmr(3)*numberDensity^3
// arrayOfVmr is array of vmr's by label.  
//
// Rendering takes place later, using the pivot array from the LU factorization routine
function term(rateConstantIndex, arrayOfVmr, troeTerm=false, netTendency=1.0){
  this.rateConstantIndex=rateConstantIndex;
  this.arrayOfVmr=arrayOfVmr;
  this.troeTerm=troeTerm;
  this.netTendency=netTendency;
}


// This should be part of the database!
// Decorates the reaction with a "raw label"
// label is constructed as
//   'reactant1'_'reactant2'_M_a_count]
//   i.e., O2_O3_M_a_1
//     or  O_O2_M_a_2
//   where count is an index separating reactions having same reactants and same branch
//   "a" or "b" indicates a branch of a reaction
const label = function(labelCollection, reaction, idxReaction) {
  let rawLabel = "";
  if(reaction.reactants.length == 0){
    rawLabel = "None";
  }else{
    rawLabel = reaction.reactants.sort().join("_");
  }
  if (reaction.troe) {rawLabel += "_M" };
  if (reaction.reactionBranch) { rawLabel += "_" + reaction.reactionBranch };
  reaction.rawLabel = rawLabel;
  reaction.label = reaction.rawLabel+"_"+labelCollection.add(rawLabel);
  reaction.idxReaction = idxReaction;
}



// Decorate each reaction with an array of net stoichiometric tendencies for the molecules
const stoichiometricTendencies = function(reaction, molecules) {
  let tendency = []; // tendency array for this reaction
  let tendencyCount = 0;
  reaction.reactants.forEach( function(reactant){
    let indexOfReactant = molecules.map(function(e) { return e.moleculename; }).indexOf(reactant);
    tendency[tendencyCount] = {idxConstituent:indexOfReactant, constituent:reactant,netTendency:-1};
    tendencyCount ++;
  });
  reaction.products.forEach( function(product){
    let position = tendency.map(function(e) { return e.constituent; }).indexOf(product.molecule);
    let indexOfReactant = molecules.map(function(e) { return e.moleculename; }).indexOf(product.molecule);
    if( position < 0 ){ // if this product was not in the list of reactants
      tendency.push({idxConstituent:indexOfReactant, constituent:product.molecule, netTendency:product.coefficient});
    } else { // if this product is in the list of reactants
      tendency[position].netTendency += product.coefficient;
      tendencyCount ++;
    }
  });
  // remove terms with roundoff-level-zero stoichiometric coefficients
  var tendency_nonzero = [];
  for( var i = 0; i < tendency.length; i++){
    if(Math.abs(tendency[i].netTendency) > zero_equivalent_stoichometry_limit ){ 
      tendency_nonzero.push(tendency[i]);
    }
  }
  // reaction.tendencies = [ {idxConstituent:22, constituent:'O2', netTendency:-0.5}, ...]
  reaction.tendencies = tendency_nonzero;

}

// Collect forcing for each molecule.  This is the 
// right hand side of the differential equation for
// each molecule.  It may be useful to compute forcing
// for each reaction and apply it to each molecule, Or
// One can use this collection to compute forcing for each
// molecule using a number of rates.
// Also construct the jacobian of the forcing, i.e. the
// sensitivity of the forcing to the concentrations of each constituent
// Also construct logical jacobian for forcing, i.e. whether or not
// the forcing is sensitive to the concentrations of each constituent
const forceCollector = function(molecules){

  var force = [];
  var logicalJacobian = [];
  var jacobian = [];

  let count = molecules.length;

  for(let iMolecule = 0; iMolecule < count; iMolecule++){

    force[iMolecule] = {};
    force[iMolecule].constituent = molecules[iMolecule].moleculename;
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
  
  this.printForce = function(){
    force.forEach( function(f){
       console.log(f.constituent);
       console.log(f.tendency);
    });
  }



  this.constructForcingFromTendencies = function(reaction, moleculeIndex){
    let rate=new term(reaction.idxReaction, reaction.reactants, reaction.troe);
    //console.log("reaction number  "+rate.idxReaction);
    //console.log("reaction.tendencies "+JSON.stringify(reaction.tendencies));
    //console.log("reaction.reactants "+JSON.stringify(reaction.reactants));
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
          // Jacobian is net stoichiometry term for molecule * rate.
          // For the derivitive w.r.t. each reactant, construct 
          //   tendency * rate_constant * [product of reactant_array without the sensitivity molecule] * M (if troe)

          // Construct reactant array without each sensitivity molecule
          let remainingTerms = reaction.reactants.slice(0); // replicate
          remainingTerms.splice(i,1); // remove this term

          // jacTerm = {rateConstantIndex:idxReaction, arrayOfVmr:['O2'], troeTerm:reaction.troe, netTendency:-0.25]}
          let jacTerm = new term(reaction.idxReaction, remainingTerms, reaction.troe, tendency.netTendency);
          jacobian[forcedMoleculeIndex][sensitivityIndex].push(jacTerm);
        }
    }
  }

  this.getLength = force.length

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

  this.getLogicalJacobian = function(){
    return logicalJacobian ;
  }

  this.printJacobian = function(){
    console.log(' ---- Jacobian ---- ');
    for(let i = 0; i < molecules.length; i++){
      for(let j = 0; j < molecules.length; j++){
        let jacstring = "";
        //jacobian[i][j].forEach( (term) => {jacstring += "\n"+JSON.stringify(term)});
        //console.log('fi si ' + i + ":" + j);
        console.log(molecules[i].moleculename + ' ' +molecules[j].moleculename) //+ " = " + jacstring); 
        console.dir(jacobian[i][j])
      }
    }
  }

  this.getJacobian = function(){
    return jacobian ;
  }

  this.getForce = function(){
    return force ;
  }

}


app.post('/phpcallback', function(req, res) {
// needs to do photolysis as well
  var content = req.body;
  console.log('constructing Jacobian, forcing, rates, rateConstants and Logical Jacobian for mechanism: ');
  console.log(content.mechanism.tag_info.given_name);
  let molecules = content.mechanism.molecules;
  let reactions = content.mechanism.reactions;
  let photodecomps = content.mechanism.photolysis
  var labelCollection = new labelCollector();
  var moleculeIndex = new moleculeIndexer(molecules);
  //moleculeIndex.print();
  var forceCollection = new forceCollector(molecules);
  //forceCollection.printForce();
  reactions.forEach(function(reaction,index){
    label(labelCollection, reaction, index)});
  reactions.forEach(function(reaction){
    stoichiometricTendencies(reaction, molecules)});
  //moleculeIndex.print();
  reactions.forEach(function(reaction){
    forceCollection.constructForcingFromTendencies(reaction, moleculeIndex)});
  let logicalJacobian = forceCollection.getLogicalJacobian();
  let jacobian = forceCollection.getJacobian();
  let force = forceCollection.getForce();
  //forceCollection.printLogicalJacobian();
  //forceCollection.printJacobian();
  res.json({
    "molecules": molecules, 
    "reactions":reactions, 
    "photodecomps":photodecomps, 
    "labelCollection":labelCollection,
    "logicalJacobian":logicalJacobian, 
    "jacobian":jacobian, 
    "moleculeIndex":moleculeIndex, 
    "force":force});
});



http.listen(8080, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

