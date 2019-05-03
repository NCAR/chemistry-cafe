'use strict'

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.use(bodyParser.json());

//  number density string is indexed by the number of reactants
//  it is attached to any reaction rate string and jacobian strin
//  number of reactants( 'O2 -> O + O1D' ) = 1
//  number of reactants( 'O + O2 + M -> O3 + M' ) = 3
const zero_equivalent_stoichometry_limit = 0.000001
var number_density_string = [];
number_density_string[1] = "";
number_density_string[2] = " * number_density_air";
number_density_string[3] = " * number_density_air_squared";
number_density_string[4] = " * number_density_air_cubed";

// Collect all molecule names and assign an associative array
// to index them
const moleculeIndexer = function(molecules){
  this.moleculeAssociation = new Array();
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
    tendency[tendencyCount] = {constituent:reactant,tendency:-1};
    tendency[tendencyCount] = {idxConstituent:indexOfReactant, constituent:reactant,tendency:-1};
    tendencyCount ++;
  });
  reaction.products.forEach( function(product){
    let position = tendency.map(function(e) { return e.constituent; }).indexOf(product.molecule);
    let indexOfReactant = molecules.map(function(e) { return e.moleculename; }).indexOf(product.molecule);
    if( position < 0 ){
      tendency.push({idxConstituent:indexOfReactant, constituent:product.molecule, tendency:product.coefficient});
    } else {
      tendency[position].tendency += product.coefficient;
      tendencyCount ++;
    }
  });
  // remove terms with roundoff-level-zero stoichiometric coefficients
  var tendency_nonzero = [];
  for( var i = 0; i < tendency.length; i++){
    if(Math.abs(tendency[i].tendency) > zero_equivalent_stoichometry_limit ){ 
      tendency_nonzero.push(tendency[i]);
    }
  }
  reaction.tendencies = tendency_nonzero;

  //this.print = function(){
    //console.dir('Final molecular stoichiometric tendencies');
    //console.dir(tendency_nonzero);
  //}
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
    let rate={idxReaction: reaction.idxReaction, rateConstant:reaction.rate, reactants:reaction.reactants, troe:reaction.troe};
    //console.log("reaction number  "+rate.idxReaction);
    //console.log("reaction.tendencies "+JSON.stringify(reaction.tendencies));
    //console.log("reaction.reactants "+JSON.stringify(reaction.reactants));
    let nTends = reaction.tendencies.length;
    for (let iTend = 0; iTend < nTends; iTend++){
        let tendency = reaction.tendencies[iTend];
        let forcedMoleculeIndex = tendency.idxConstituent;
        if (forcedMoleculeIndex == -1 ) break;
        force[forcedMoleculeIndex].tendency.push({tendency:tendency.tendency, rate:rate});
        
        // jacobian: derivative of forcing[tendency.constituent] w/r/t each tendency in the reaction list
        for(let i = 0; i < reaction.reactants.length; i++){

          //console.log("derivative of "+ tendency.constituent+ " w/r/t/ "+reaction.reactants[i]);
          let sensitivityIndex = moleculeIndex.moleculeAssociation[reaction.reactants[i]];
          logicalJacobian[forcedMoleculeIndex][sensitivityIndex] = true;

          // Jacobian terms.  Rate is rate_constant * [product of reactant_array] * M (if troe)
          // Jacobian is net stoichiometry term for molecule * rate.
          // For the derivitive w.r.t. each reactant, construct 
          //   rate*constant * [product of reactant_array without the sensitivity molecule] * M (if troe)

          // Construct reactant array without [the first instance of] each sensitivity molecule
          // this block should be rewritten
          let remainingTerms = [];
          let searching = true
          for (let j = 0; j < reaction.reactants.length; j++){ 
            if( searching && (i==j) ) {searching = false; continue;}
            remainingTerms.push(reaction.reactants[j]);
          }
          /*  debugging 
          console.log('remaining terms '+remainingTerms);
          console.log("idxReaction: "+reaction.idxReaction + " remainTerms " + remainingTerms + " troe " + reaction.troe + " tend "+ tendency.tendency );
          let tempstring = ((tendency.tendency != 1)? (tendency.tendency + "*") : "")+"rateConstant("+reaction.idxReaction+")";
          let tma = remainingTerms.slice(0); // copy array
          (reaction.troe) ? tma.push("M") : tma=tma ;
          let reactstring = tma.join("*");
          (reactstring.length > 0) ? tma = tma + "*" + reactstring: tma=tma ;
          (tma.length > 0) ? tempstring = tempstring + "*" +reactstring : tempstring = tempstring ;
          console.log(tempstring);
          let fisi = "fi si "+forcedMoleculeIndex+":"+sensitivityIndex;
          console.log("fi si "+forcedMoleculeIndex+":"+sensitivityIndex);
          /* end debugging */

          let jac = {};
          jac.idxReaction = reaction.idxReaction;
          jac.reactants = remainingTerms;
          jac.troe  = reaction.troe;
          jac.tendency =  tendency.tendency;
          //console.log('i = ' +forcedMoleculeIndex + ' j = ' + sensitivityIndex + ' jac = ' +JSON.stringify(jac));
          jacobian[forcedMoleculeIndex][sensitivityIndex].push(jac);

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

}


app.post('/phpcallback', function(req, res) {
// needs to do photolysis as well
  var content = req.body;
  console.log('message received from php: ')
  let molecules = content.mechanism.molecules;
  let reactions = content.mechanism.reactions;
  let photodecomps = content.mechanism.photolysis
  var labelCollection = new labelCollector();
  var moleculeIndex = new moleculeIndexer(molecules);
  moleculeIndex.print();
  var forceCollection = new forceCollector(molecules);
  forceCollection.printForce();
  reactions.forEach(function(reaction,index){
    label(labelCollection, reaction, index)});
  reactions.forEach(function(reaction){
    stoichiometricTendencies(reaction, molecules)});
  console.log('before reactions');
  moleculeIndex.print();
  reactions.forEach(function(reaction){
    forceCollection.constructForcingFromTendencies(reaction, moleculeIndex)});
  let logicalJacobian = forceCollection.getLogicalJacobian();
  forceCollection.printLogicalJacobian();
  res.json({"nMolecules": molecules.length, "nReactions":reactions.length, "nPhotodecomps":photodecomps.length, "logicalJacobian":logicalJacobian});
});



http.listen(8080, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

