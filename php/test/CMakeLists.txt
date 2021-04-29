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
add_test(test_wennberg_no_ro2             ${CMAKE_BINARY_DIR}/TestCampReactionWennbergNoRo2.sh)
add_test(test_wennberg_tunneling          ${CMAKE_BINARY_DIR}/TestCampReactionWennbergTunneling.sh)
add_test(test_custom_reaction             ${CMAKE_BINARY_DIR}/TestCustomReaction.sh)

######################################################################
# custom reactions test

set(CUSTOM_REACTION_SRC test_src/CAM/cam_module_stubs.F90
                        test_src/CAM/driver.F90
                        test_src/CAM/mo_usrrxt.F90)

add_executable(calculate_custom_rate_constants ${CUSTOM_REACTION_SRC})

######################################################################
