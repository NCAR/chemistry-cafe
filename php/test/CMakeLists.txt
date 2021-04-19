cmake_minimum_required(VERSION 2.6.4)
project(CUSTOM_RATE_TESTS Fortran)

set(PACKAGE_NAME "Custom rate constant tests")

######################################################################
# copy dirs

add_custom_target(copy_tests ALL ${CMAKE_COMMAND} -E copy_directory ${CMAKE_SOURCE_DIR}/test_src ${CMAKE_BINARY_DIR})

######################################################################
# tests

enable_testing( )
add_test(test_arrhenius                   ${CMAKE_BINARY_DIR}/TestCampReactionArrhenius.sh)
add_test(test_troe                        ${CMAKE_BINARY_DIR}/TestCampReactionTroe.sh)
add_test(test_ternary_chemical_activation ${CMAKE_BINARY_DIR}/TestCampReactionTernaryChemicalActivation.sh)

######################################################################
