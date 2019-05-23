curl -X POST -d @$1 http://cafe-devel.acom.ucar.edu:8080/constructJacobian --header "Content-Type:application/json" | python -m json.tool > $1.jac
curl -X POST -d @$1.jac http://cafe-devel.acom.ucar.edu:8080/constructSparseLUFactor --header "Content-Type:application/json" | python -m json.tool > $1.LU
curl -X POST -d @$1.LU http://cafe-devel.acom.ucar.edu:8080/toCode --header "Content-Type:application/json" | python -m json.tool > $1.jac.init
python -c 'import sys, json; print json.load(sys.stdin)["init_jac_code_string"]' < $1.jac.init > jacobian_init.F90
python -c 'import sys, json; print json.load(sys.stdin)["init_kinetics"]' < $1.jac.init > kinetics_init.F90

