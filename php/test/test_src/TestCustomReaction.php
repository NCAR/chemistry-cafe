<?php
//
// Tests for the CustomReaction class
//
include("../../CustomReaction.php");
include("TestUtilities.php");

function testCustomReaction( ) {

    $reactants = array( );
    $products  = array( );
    $rxn = new CustomReaction( 'usr_DMS_OH', $reactants, $products );
    $camp_rxns = $rxn->getCampReactions( );

    $file_dict = loadDictionaryFromCsvFile( 'out/original_rate_constants.csv' );

    $troposphere_environment  = extract_environment_data( $file_dict[ 0 ] );
    $stratosphere_environment = extract_environment_data( $file_dict[ 2 ] );

    print "\nPassed!\n\n";
}

// Extract environmental data from a file dictionary converting to CAMP names and units
function extract_environment_data( $dict ) {
    $environment = array( );
    $environment['M']           = $dict['m'];                   // [# cm-3]
    $environment['H2O']         = $dict['h2ovmr'] * $dict['m']; // [# cm-3]
    $environment['temperature'] = $dict['temperature'];         // [K]
    $environment['pressure']    = $dict['pmid'];                // [Pa]
    return $environment;
}

// Run the tests
testCustomReaction( );

?>
