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


function Jacobian() {

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
          k++
          this.map[row][col] = k;
          if( row == col ) this.diag[col]=k;
        }
      }
    }
    this.numberSparseFactorElements=k;
  }

}

const jacobian = new Jacobian();

let m = new Array(3);
m[0] = new Array(3);
m[1] = new Array(3);
m[2] = new Array(3);

m[0][0] = 2;
//m[1][0] = 1;
//m[2][0] = -3;

//m[0][1] = 2;
m[1][1] = 4;
//m[2][1] = -2;

//m[0][2] = -2;
//m[1][2] = -7;
m[2][2] = 2;

jacobian.init(m) 

//jacobian.matrix[0][0] = m[0][0];
//jacobian.matrix[1][0] = m[1][0];
//jacobian.matrix[2][0] = m[2][0];

//jacobian.matrix[0][1] = m[0][1];
//jacobian.matrix[1][1] = m[1][1];
//jacobian.matrix[2][1] = m[2][1];

//jacobian.matrix[0][2] = m[0][2];
//jacobian.matrix[1][2] = m[1][2];
//jacobian.matrix[2][2] = m[2][2];

console.log('init');
console.log(JSON.stringify(jacobian.matrix));
console.log('run');

/*
jacobian.matrix[0][3] = ['03'];
jacobian.matrix[0][2] = ['02'];
jacobian.matrix[1][0] = ['10'];
jacobian.matrix[1][2] = ['12'];
jacobian.matrix[2][0] = ['20'];
jacobian.matrix[2][3] = ['23'];
*/

console.log('printMatrix');
jacobian.printMatrix(jacobian.matrix);
console.log('pivot');

for (let i = 0; i < jacobian.size ; i++){
  console.log('row: '+i);
  let minLoc = jacobian.interactionIndexArray(i);
  console.log('Pivot: '+ i + " and " + minLoc);
  jacobian.switchColAndRow(i, minLoc);
  jacobian.printMatrix(jacobian.matrix);
  jacobian.LUFillIn(i)
  console.log('After fillin');
  jacobian.printMatrix(jacobian.matrix);
}

console.log('Mapping');
jacobian.linearArrayMapping();
jacobian.printMatrix(jacobian.map);

const accumulatedFortanLUFactorization = [];

for (var rankIndex = 0; rankIndex < jacobian.size; rankIndex++){
  accumulatedFortanLUFactorization.push('LU('+jacobian.diag[rankIndex]+') = 1./LU('+jacobian.diag[rankIndex]+')');
  if( rankIndex < jacobian.size-1 ){
    for (var row = rankIndex + 1; row < jacobian.size; row++){
      if( jacobian.matrix[row][rankIndex]){
        accumulatedFortanLUFactorization.push('LU('+jacobian.map[row][rankIndex]+') = LU('+jacobian.map[row][rankIndex]+')*LU('+jacobian.diag[rankIndex]+')');
      }
    }
    for (var col = rankIndex + 1; col < jacobian.size; col++){
      if(jacobian.matrix[rankIndex][col]){
        for ( var row = rankIndex + 1; row < jacobian.size; row++){
          if(jacobian.matrix[row][rankIndex]){
            if(jacobian.matrix[row][col] && jacobian.matrix[row][col] !== true ){
              let indx=jacobian.map[row][col];
              let indx1=jacobian.map[row][rankIndex];
              let indx2=jacobian.map[rankIndex][col];
              accumulatedFortanLUFactorization.push('LU('+indx+') = LU('+indx+') - LU('+indx1+')*LU('+indx2+')');
            }else{
              let indx=jacobian.map[row][col];
              let indx1=jacobian.map[row][rankIndex];
              let indx2=jacobian.map[rankIndex][col];
              jacobian.matrix[row][col]=true;
              accumulatedFortanLUFactorization.push('LU('+indx+') = -LU('+indx1+')*LU('+indx2+')');
            }
          }
        }
      }
    }
  }
}

console.log('fortran factor');
console.log(JSON.stringify(accumulatedFortanLUFactorization, null, 2));

console.log('fortran init');
for (var col = 0; col < jacobian.size; col++){
  for (var row = 0; row < jacobian.size; row++){
    if(jacobian.matrix[row][col] && (jacobian.matrix[row][col] !== true)){
      console.log('LU('+jacobian.map[row][col]+') = '+jacobian.matrix[row][col]);
    }
  }
}




// write some fortran to test things


console.log('subroutine construct_LU_map(Map)');
console.log('  integer :: Map(:,:)');
for (var col = 0; col < jacobian.matrix.length; col++){
  let fortran_col = col+1
  for (var row = 0; row < jacobian.matrix.length; row++){
    let fortran_row = row+1
    if(jacobian.map[row][col]){
      console.log('  Map('+fortran_row+','+fortran_col+') = '+jacobian.map[row][col]);
    }
  }
}
console.log('end subroutine construct_LU_map\n\n\n');


console.log('subroutine init(LU, map)');
console.log('  real(r8) LU(:)\n');
console.log('  integer map(:,:)\n');
for (var col = 0; col < jacobian.size; col++){
  let fortran_col = col+1
  for (var row = 0; row < jacobian.size; row++){
    let fortran_row = row+1
    if(jacobian.matrix[row][col] && (jacobian.matrix[row][col] !== true)){
      console.log('  LU( map('+fortran_row+','+fortran_col+') ) = '+jacobian.matrix[row][col]);
    }
  }
}
console.log('end subroutine init\n\n\n');

console.log('subroutine factor(LU)');
console.log('  real(r8) LU(:)\n');
for (var entries = 0; entries < accumulatedFortanLUFactorization.length; entries++){
  console.log('  '+accumulatedFortanLUFactorization[entries]);
}
console.log('end subroutine factor\n\n');

console.log('subroutine backsolve_L_y_eq_b(LU,b,y)');
console.log('  real(r8) LU(:)');
console.log('  real(r8) b(:)');
console.log('  real(r8) y(:)');
console.log('\n');
for(var row = 0; row < jacobian.size; row++){
  let fortran_row = row + 1;
  console.log('  y('+fortran_row+') = b('+fortran_row+')');
  for(var col = 0; col < row; col++){
    let fortran_col = col + 1;
    if(jacobian.map[row][col]){
      console.log('  y('+fortran_row+') = y('+fortran_row+') - LU('+jacobian.map[row][col]+') * y('+fortran_col+')');
    }
  }
}
console.log('end subroutine backsolve_L_y_eq_b\n\n\n');


console.log('subroutine backsolve_U_x_eq_y(LU,y,x)');
console.log('  real(r8) LU(:)');
console.log('  real(r8) y(:)');
console.log('  real(r8) x(:)');
console.log('  real(r8) temporary');
console.log('\n');
for(var row = jacobian.size-1; row > -1; row--){
  let fortran_row = row + 1;
  console.log('  temporary = y('+fortran_row+')');
  for(var col = row+1; col < jacobian.size; col++){
    let fortran_col = col + 1;
    if(jacobian.map[row][col]){
      console.log('  temporary = temporary - LU('+jacobian.map[row][col]+') * x('+fortran_col+')');
    }
  }
  console.log('  x('+fortran_row+') = LU('+jacobian.map[row][row]+') * temporary' );
}
console.log('end subroutine backsolve_U_x_eq_y');

console.log('\n\n\nsubroutine construct_pivot(pivot)');
console.log('  integer :: pivot(:)');
for (var col = 0; col < jacobian.size; col++){
  let fortran_col = col+1
  // +1 to convert to 1-offset for fortran
  console.log('  pivot('+fortran_col+') = '+(jacobian.pivot[col]+1))
}
console.log('end subroutine construct_pivot');

app.post('/getLUFactor', function(req, res) {
// needs to do photolysis as well
  var content = req.body;
  console.log('What I got : '+JSON.stringify(content.logicalJacobian));
  console.log('is it an array: '+Array.isArray(content.logicalJacobian));
  console.log('Factoring matrix of size : '+content.logicalJacobian.length)
  jacobian.init(content.logicalJacobian) 
  for (let i = 0; i < jacobian.size ; i++){
    //console.log('row: '+i);
    let minLoc = jacobian.interactionIndexArray(i);
    //console.log('Pivot: '+ i + " and " + minLoc);
    jacobian.switchColAndRow(i, minLoc);
    //jacobian.printMatrix(jacobian.matrix);
    jacobian.LUFillIn(i)
    //console.log('After fillin');
  }
  //jacobian.printMatrix(jacobian.matrix);
  jacobian.linearArrayMapping();
  //jacobian.printMatrix(jacobian.map);

  const accumulatedFortanLUFactorization = [];

  for (var rankIndex = 0; rankIndex < jacobian.size; rankIndex++){
    accumulatedFortanLUFactorization.push('LU('+jacobian.diag[rankIndex]+') = 1./LU('+jacobian.diag[rankIndex]+')');
    if( rankIndex < jacobian.size-1 ){
      for (var row = rankIndex + 1; row < jacobian.size; row++){
        if( jacobian.matrix[row][rankIndex]){
          accumulatedFortanLUFactorization.push('LU('+jacobian.map[row][rankIndex]+') = LU('+jacobian.map[row][rankIndex]+')*LU('+jacobian.diag[rankIndex]+')');
        }
      }
      for (var col = rankIndex + 1; col < jacobian.size; col++){
        if(jacobian.matrix[rankIndex][col]){
          for ( var row = rankIndex + 1; row < jacobian.size; row++){
            if(jacobian.matrix[row][rankIndex]){
              if(jacobian.matrix[row][col] && jacobian.matrix[row][col] !== true ){
                let indx=jacobian.map[row][col];
                let indx1=jacobian.map[row][rankIndex];
                let indx2=jacobian.map[rankIndex][col];
                accumulatedFortanLUFactorization.push('LU('+indx+') = LU('+indx+') - LU('+indx1+')*LU('+indx2+')');
              }else{
                let indx=jacobian.map[row][col];
                let indx1=jacobian.map[row][rankIndex];
                let indx2=jacobian.map[rankIndex][col];
                jacobian.matrix[row][col]=true;
                accumulatedFortanLUFactorization.push('LU('+indx+') = -LU('+indx1+')*LU('+indx2+')');
              }
            }
          }
        }
      }
    }
  }

  //console.log('fortran factor');
  //console.log(JSON.stringify(accumulatedFortanLUFactorization, null, 2));

  console.log('fortran init');
  for (var col = 0; col < jacobian.size; col++){
    for (var row = 0; row < jacobian.size; row++){
      if(jacobian.matrix[row][col] && (jacobian.matrix[row][col] !== true)){
        console.log('LU('+jacobian.map[row][col]+') = '+jacobian.matrix[row][col]);
      }
    }
  }

  // write some fortran to test things
  console.log('subroutine construct_LU_map(Map)');
  console.log('  integer :: Map(:,:)');
  for (var col = 0; col < jacobian.matrix.length; col++){
    let fortran_col = col+1
    for (var row = 0; row < jacobian.matrix.length; row++){
      let fortran_row = row+1
      if(jacobian.map[row][col]){
        console.log('  Map('+fortran_row+','+fortran_col+') = '+jacobian.map[row][col]);
      }
    }
  }
  console.log('end subroutine construct_LU_map\n\n\n');


  console.log('subroutine init(LU, map)');
  console.log('  real(r8) LU(:)\n');
  console.log('  integer map(:,:)\n');
  for (var col = 0; col < jacobian.size; col++){
    let fortran_col = col+1
    for (var row = 0; row < jacobian.size; row++){
      let fortran_row = row+1
      if(jacobian.matrix[row][col] && (jacobian.matrix[row][col] !== true)){
        console.log('  LU( map('+fortran_row+','+fortran_col+') ) = '+jacobian.matrix[row][col]);
      }
    }
  }
  console.log('end subroutine init\n\n\n');
  
  console.log('subroutine factor(LU)');
  console.log('  real(r8) LU(:)\n');
  for (var entries = 0; entries < accumulatedFortanLUFactorization.length; entries++){
    console.log('  '+accumulatedFortanLUFactorization[entries]);
  }
  console.log('end subroutine factor\n\n');

  console.log('subroutine backsolve_L_y_eq_b(LU,b,y)');
  console.log('  real(r8) LU(:)');
  console.log('  real(r8) b(:)');
  console.log('  real(r8) y(:)');
  console.log('\n');
  for(var row = 0; row < jacobian.size; row++){
    let fortran_row = row + 1;
    console.log('  y('+fortran_row+') = b('+fortran_row+')');
    for(var col = 0; col < row; col++){
      let fortran_col = col + 1;
      if(jacobian.map[row][col]){
        console.log('  y('+fortran_row+') = y('+fortran_row+') - LU('+jacobian.map[row][col]+') * y('+fortran_col+')');
      }
    }
  }
  console.log('end subroutine backsolve_L_y_eq_b\n\n\n');


  console.log('subroutine backsolve_U_x_eq_y(LU,y,x)');
  console.log('  real(r8) LU(:)');
  console.log('  real(r8) y(:)');
  console.log('  real(r8) x(:)');
  console.log('  real(r8) temporary');
  console.log('\n');
  for(var row = jacobian.size-1; row > -1; row--){
    let fortran_row = row + 1;
    console.log('  temporary = y('+fortran_row+')');
    for(var col = row+1; col < jacobian.size; col++){
      let fortran_col = col + 1;
      if(jacobian.map[row][col]){
        console.log('  temporary = temporary - LU('+jacobian.map[row][col]+') * x('+fortran_col+')');
      }
    }
    console.log('  x('+fortran_row+') = LU('+jacobian.map[row][row]+') * temporary' );
  }
  console.log('end subroutine backsolve_U_x_eq_y');

  let pivotFortran = '\n\n\nsubroutine construct_pivot(pivot)';
  pivotFortran +='  integer :: pivot(:)';
  for (var col = 0; col < jacobian.size; col++){
    let fortran_col = col+1
    // +1 to convert to 1-offset for fortran
    pivotFortran += '  pivot('+fortran_col+') = '+(jacobian.pivot[col]+1);
  }
  pivotFortran += 'end subroutine construct_pivot';


  res.json({"pivot":pivotFortran});

});


app.get('/hiToAndrew', (req, res) => res.send('Hello World!'));

http.listen(8081, function(){
    var addr = http.address();
    console.log('app listening on ' + addr.address + ':' + addr.port);
});

