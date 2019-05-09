'use strict'

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


app.use(bodyParser.json());

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

    let rowCount = new Array(this.size).fill(0);
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

}

app.post('/getLUFactor', function(req, res) {

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
  for (var rankIndex = 0; rankIndex < logicalFactorization.size; rankIndex++){
    LUFactorization.push({
      "type":"diagInv",
      "targetIndex":logicalFactorization.diag[rankIndex],
      "sourceIndex":[logicalFactorization.diag[rankIndex]]
    });
    accumulatedFortanLUFactorization.push('LU('+logicalFactorization.diag[rankIndex]+') = 1./LU('+logicalFactorization.diag[rankIndex]+')');
    if( rankIndex < logicalFactorization.size-1 ){
      for (var row = rankIndex + 1; row < logicalFactorization.size; row++){
        if( logicalFactorization.matrix[row][rankIndex]){
          LUFactorization.push({
            "type":"leftEliminate",
            "targetIndex":logicalFactorization.map[row][rankIndex],
            "sourceIndex":[logicalFactorization.map[row][rankIndex],logicalFactorization.diag[rankIndex]]
          });
          let fortranString = 'LU('+logicalFactorization.map[row][rankIndex] + ')';
          fortranString += ' = LU('+logicalFactorization.map[row][rankIndex]+')*LU('+logicalFactorization.diag[rankIndex]+')';
          accumulatedFortanLUFactorization.push(fortranString);
        }
      }
      for (var col = rankIndex + 1; col < logicalFactorization.size; col++){
        if(logicalFactorization.matrix[rankIndex][col]){
          for ( var row = rankIndex + 1; row < logicalFactorization.size; row++){
            if(logicalFactorization.matrix[row][rankIndex]){
              if(logicalFactorization.matrix[row][col] && logicalFactorization.matrix[row][col] !== true ){
                LUFactorization.push({
                  "type":"Update",
                  "targetIndex":logicalFactorization.map[row][col],
                  "sourceIndex":[
                    logicalFactorization.map[row][col],
                    logicalFactorization.map[row][rankIndex],
                    logicalFactorization.map[rankIndex][col]
                    ]
                });
                let indx=logicalFactorization.map[row][col];
                let indx1=logicalFactorization.map[row][rankIndex];
                let indx2=logicalFactorization.map[rankIndex][col];
                let fortranString = 'LU('+indx+') = LU('+indx+') - LU('+indx1+')*LU('+indx2+')';
                accumulatedFortanLUFactorization.push(fortranString);
              }else{
                LUFactorization.push({
                  "type":"Fill",
                  "targetIndex":logicalFactorization.map[row][col],
                  "sourceIndex":[
                    logicalFactorization.map[row][rankIndex],
                    logicalFactorization.map[rankIndex][col]
                    ]
                });
                let indx=logicalFactorization.map[row][col];
                let indx1=logicalFactorization.map[row][rankIndex];
                let indx2=logicalFactorization.map[rankIndex][col];
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

  var init_jac_fortran = "\n";
  var init_jac = [];
  init_jac_fortran += 'subroutine init_jacobian(LU)\n';
  init_jac_fortran += '  real(r8), intent(inout) :: LU(:)\n';
  init_jac_fortran += '  LU(:) = 0\n';
  for (var col = 0; col < logicalFactorization.matrix.length; col++){
    for (var row = 0; row < logicalFactorization.matrix.length; row++){
      if(jacobian[row][col].length > 0 ){ //&& (jacobian.matrix[row][col] !== true)){
        let iRow = logicalFactorization.pivot.indexOf(row);
        let iCol = logicalFactorization.pivot.indexOf(col);
        init_jac.push({
          "forcedMolecule":molecules[row].moleculename ,
          "sensitivityMolecule": molecules[col].moleculename,
          "LUArrayIndex":logicalFactorization.map[iRow][iCol],
          "jacobianTerms":jacobian[row][col]
        });
        init_jac_fortran += '  ! df(molecule)/d(molecule)';
        init_jac_fortran += '  LU('+logicalFactorization.map[iRow][iCol]+') = '+JSON.stringify(jacobian[row][col])+ '\n';
      }
    }
  }
  init_jac_fortran += 'end subroutine init_jacobian\n';
  //console.log(init_jac_fortran);

  // write some fortran to test things
  var construct_LU_map_fortran = "\n";
  construct_LU_map_fortran += 'subroutine construct_LU_map(Map)\n';
  construct_LU_map_fortran += '  integer :: Map(:,:)\n';
  for (var col = 0; col < logicalFactorization.matrix.length; col++){
    let fortran_col = col+1
    for (var row = 0; row < logicalFactorization.matrix.length; row++){
      let fortran_row = row+1
      if(logicalFactorization.map[row][col]){
        construct_LU_map_fortran += '  Map('+fortran_row+','+fortran_col+') = '+logicalFactorization.map[row][col]+'\n';
      }
    }
  }
  construct_LU_map_fortran += 'end subroutine construct_LU_map\n\n\n'
  //console.log(construct_LU_map_fortran);


  var factor_LU_fortran = "\n";
  factor_LU_fortran += 'subroutine factor(LU)\n';
  factor_LU_fortran += '  real(r8) LU(:)\n';
  for (var entries = 0; entries < accumulatedFortanLUFactorization.length; entries++){
    factor_LU_fortran += '  '+accumulatedFortanLUFactorization[entries]+'\n';
  }
  factor_LU_fortran += 'end subroutine factor\n';
  //console.log(factor_LU_fortran);


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


  let pivotFortran = '\n\n\nsubroutine construct_pivot(pivot)\n';
  pivotFortran +='  integer :: pivot(:)\n';
  for (var col = 0; col < logicalFactorization.size; col++){
    let fortran_col = col+1
    // +1 to convert to 1-offset for fortran
    pivotFortran += '  pivot('+fortran_col+') = '+(logicalFactorization.pivot[col]+1)+'\n';
  }
  pivotFortran += 'end subroutine construct_pivot';
  //console.log(pivotFortran);

  var reorderedMolecules = [];
  for(let i = 0; i< molecules.length; i++){
    reorderedMolecules[i]=molecules[logicalFactorization.pivot[i]];
  }
  //console.log(reorderedMolecules);

  res.json({
    "pivotFortran":pivotFortran, 
    "pivot":logicalFactorization.pivot,
    "reorderedMolecules":reorderedMolecules,
    "backsolve_L_y_eq_b_fortran":backsolve_L_y_eq_b_fortran,
    "backsolve_U_x_eq_y_fortran":backsolve_u_x_eq_y_fortran,
    "factor_LU_fortran":factor_LU_fortran,
    "construct_LU_map_fortran":construct_LU_map_fortran,
    "init_jac_fortran":init_jac_fortran,
    "init_jac":init_jac});

});


http.listen(8081, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

