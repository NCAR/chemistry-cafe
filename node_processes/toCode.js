'use strict'

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.use(bodyParser.json());

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

  let vmrToNumberDensityCount = arrayOfVmr.length + (troeTerm ? 1 : 0);
  let vmrToNumberDensityConversion = number_density_string[vmrToNumberDensityCount];
  let rateConstString = "rateConstant(" +(idxReaction + indexOffset)+")";

  let vmrStringArray =[];
  for(let iVmr = 0; iVmr < arrayOfVmr.length; iVmr++){
    vmrStringArray.push("vmr("+ moleculeIndex[arrayOfVmr[iVmr]]   +")");
  }

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

  let arrayOfVmrString="";
  let termString = ""
  if (arrayOfVmr.length > 0) {
    arrayOfVmrString = arrayOfVmr.join(" * ") + " * " + vmrToNumberDensityConversion;
    termString = tendencyString + " * " + arrayOfVmrString;
  } else {
    termString = tendencyString;
  }

  return termString;
}

app.post('/toCode', function(req, res) {

  // collect data from request
  var content = req.body;
  var reorderedMolecules = content.reorderedMolecules

  // find index for molecules, as reordered by pivot
  var moleculeIndex =reorderedIndex(reorderedMolecules);


  let init_jac = content.init_jac;
  //console.log(JSON.stringify(init_jac));

  // code to initialize jacobian
  init_jac.toCode = function(indexOffset=0){
    let init_jac_code_string = "\n";
    init_jac_code_string += 'subroutine init_jacobian(LU, number_density_air)\n';
    init_jac_code_string += '  real(r8), intent(inout) :: LU(:)\n';
    init_jac_code_string += '  real(r8), intent(in) :: number_density_air\n';
    init_jac_code_string += '  LU(:) = 0\n';
    init_jac_code_string += '  number_density_air_squared = number_density_air * number_density_air\n'
    init_jac_code_string += '  number_density_air_cubed = number_density_air_squared * number_density_air\n'
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

  let indexOffset = 1; //convert to fortran
  let init_jac_fortran = init_jac.toCode(indexOffset);

  res.json({
    "init_jac_code_string":init_jac_fortran
  });
});


http.listen(8082, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

