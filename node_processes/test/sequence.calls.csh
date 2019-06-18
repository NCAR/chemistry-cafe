#!/bin/bash
echo $1
musica_preprocessor_web_address="http://localhost:8080"
echo $musica_preprocessor_web_address
curl -X POST -d @$1 $musica_preprocessor_web_address/constructJacobian --header "Content-Type:application/json" | python -m json.tool > $1.jac
curl -X POST -d @$1.jac $musica_preprocessor_web_address/constructSparseLUFactor --header "Content-Type:application/json" | python -m json.tool > $1.LU
curl -X POST -d @$1.LU $musica_preprocessor_web_address/toCode --header "Content-Type:application/json" | python -m json.tool > $1.jac.init
python -c 'import sys, json; print json.load(sys.stdin)["init_jac_code_string"]' < $1.jac.init > jacobian_init.F90
python -c 'import sys, json; print json.load(sys.stdin)["backsolve_L_y_eq_b_fortran"]' < $1.LU > backsolve_L_y_eq_b.F90
python -c 'import sys, json; print json.load(sys.stdin)["backsolve_U_x_eq_y_fortran"]' < $1.LU > backsolve_U_x_eq_y.F90
python -c 'import sys, json; print json.load(sys.stdin)["factor_LU_fortran"]' < $1.LU > factor.F90
python -c 'import sys, json; print json.load(sys.stdin)["init_kinetics"]' < $1.jac.init > kinetics_init.F90
python -c 'import sys, json; print json.load(sys.stdin)["force"]' < $1.jac.init > force.F90
python -c 'import sys, json; print json.load(sys.stdin)["factored_alpha_minus_jac"]' < $1.jac.init > factored_alpha_minus_jac.F90

