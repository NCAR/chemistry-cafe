<?php
//
// Tests for the CustomReaction class
//
include("../../CustomReaction.php");
include("TestUtilities.php");

function testCustomReaction( ) {

    $troposphere_reactions  = [ 'usr_DMS_OH', 'usr_PBZNIT_M', 'usr_O_O2', 'usr_N2O5_M',
                                'usr_HO2NO2_M', 'usr_HO2_HO2', 'usr_MPAN_M', 'usr_SO2_OH',
                                'usr_CO_OH_a', 'usr_O_O', 'usr_PAN_M', 'usr_HNO3_OH',
                                'usr_CH3COCH3_OH', 'usr_CL2O2_M', 'usr_SO3_H2O',
                                'usr_CO_OH_b' ];
    $stratosphere_reactions = array( );
    $file_dict = loadDictionaryFromCsvFile( 'out/original_rate_constants.csv' );

    foreach( $troposphere_reactions  as $name ) test_troposphere_reaction(  $name, $file_dict );
    foreach( $stratosphere_reactions as $name ) test_stratosphere_reaction( $name, $file_dict );

    // reactions with specific rate comparisons
    test_troposphere_reaction( 'usr_ISOPNO3_NOn', $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPNO3_NOa', $file_dict, 'alkoxy'  );

    print "\nPassed!\n\n";
}

// Test a custom rate constant refactoring under Tropospheric conditions
function test_troposphere_reaction( $name, $file_dict, string $rate_label = '' ) {
    $reactants = array( );
    $products  = array( );
    $environment = extract_environment_data( $file_dict[ 0 ] );
    $rxn = new CustomReaction( $name, $reactants, $products );
    $camp_rxns = $rxn->getCampReactions( );
    echo "\n", $name, ' ', $rate_label;
    assert_equal_rates( $camp_rxns, $file_dict[ 0 ][ "REACTION:".$name ], $environment,
                        $rate_label );
}

// Test a custom rate constant refactoring under Stratospheric conditions
function test_stratosphere_reaction( $name, $file_dict, string $rate_label = '' ) {
    $reactants = array( );
    $products  = array( );
    $environment = extract_environment_data( $file_dict[ 2 ] );
    $rxn = new CustomReaction( $name, $reactants, $products );
    $camp_rxns = $rxn->getCampReactions( );
    echo "\n", $name, ' ', $rate_label;
    assert_equal_rates( $camp_rxns, $file_dict[ 2 ][ "REACTION:".$name ], $environment,
                        $rate_label );
}

// Extract environmental data from a file dictionary converting to CAMP names and units
function extract_environment_data( $dict ) {
    $environment = array( );
    $environment['M']           = (double)$dict['m'];                   // [# cm-3]
    $environment['H2O']         = (double)$dict['h2ovmr'] * $dict['m']; // [# cm-3]
    $environment['temperature'] = (double)$dict['temperature'];         // [K]
    $environment['pressure']    = (double)$dict['pmid'];                // [Pa]
    return $environment;
}

// Assert that the original and refactored reactions result in the same rate constant
function assert_equal_rates( $refactored_reactions, $original_rate_constant, $environment,
                             string $rate_label = '') {
    $rate = 0;
    foreach( $refactored_reactions as $reaction ) {
        $rate += $reaction->getRate( $environment, $rate_label );
    }
    echo "\nComparing: ", $rate, " to ", $original_rate_constant, "\n";
    assert_almost_equal( $rate, $original_rate_constant );
}

// Run the tests
testCustomReaction( );

?>
