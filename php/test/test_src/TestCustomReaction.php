<?php
//
// Tests for the CustomReaction class
//
include("../../CustomReaction.php");
include("TestUtilities.php");

function testCustomReaction( ) {

    $reactants = array( );
    $products  = array( );
    $file_dict = loadDictionaryFromCsvFile( 'out/original_rate_constants.csv' );
    $troposphere_environment  = extract_environment_data( $file_dict[ 0 ] );
    $stratosphere_environment = extract_environment_data( $file_dict[ 2 ] );

    $rxn = new CustomReaction( 'usr_DMS_OH', $reactants, $products );
    $camp_rxns = $rxn->getCampReactions( );
    assert_equal_rates( $camp_rxns, $file_dict[ 0 ][ "REACTION:usr_DMS_OH" ],
                        $troposphere_environment );

    print "\nPassed!\n\n";
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
function assert_equal_rates( $refactored_reactions, $original_rate_constant, $environment ) {
    $rate = 0;
    foreach( $refactored_reactions as $reaction ) {
        $rate += $reaction->getRate( $environment );
    }
    assert_almost_equal( $rate, $original_rate_constant );
}

// Run the tests
testCustomReaction( );

?>
