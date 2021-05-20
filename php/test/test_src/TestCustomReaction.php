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
                                'usr_CO_OH_b', 'usr_ISOPZD1O2', 'usr_TERPAPAN_M',
                                'usr_TERPA2PAN_M', 'usr_TERPA3PAN_M', 'usr_ISOPZD4O2',
                                'usr_XOOH_OH', 'usr_OA_O2', 'usr_XNO2NO3_M',
                                'usr_NO2XNO3_M', 'usr_XHNO3_OH', 'usr_XHO2NO2_M',
                                'usr_XPAN_M', 'usr_XMPAN_M', 'usr_C2O3_NO2',
                                'usr_C2H4_OH', 'usr_C2O3_XNO2', 'usr_CLm_H2O_M',
                                'usr_CLm_HCL_M', 'usr_oh_co', 'usr_COhc_OH', 'usr_COme_OH',
                                'usr_CO01_OH', 'usr_CO02_OH', 'usr_CO03_OH', 'usr_CO04_OH',
                                'usr_CO05_OH', 'usr_CO06_OH', 'usr_CO07_OH', 'usr_CO08_OH',
                                'usr_CO09_OH', 'usr_CO10_OH',
                                'usr_CO11_OH', 'usr_CO12_OH', 'usr_CO13_OH', 'usr_CO14_OH',
                                'usr_CO15_OH', 'usr_CO16_OH', 'usr_CO17_OH', 'usr_CO18_OH',
                                'usr_CO19_OH', 'usr_CO20_OH',
                                'usr_CO21_OH', 'usr_CO22_OH', 'usr_CO23_OH', 'usr_CO24_OH',
                                'usr_CO25_OH', 'usr_CO26_OH', 'usr_CO27_OH', 'usr_CO28_OH',
                                'usr_CO29_OH', 'usr_CO30_OH',
                                'usr_CO31_OH', 'usr_CO32_OH', 'usr_CO33_OH', 'usr_CO34_OH',
                                'usr_CO35_OH', 'usr_CO36_OH', 'usr_CO37_OH', 'usr_CO38_OH',
                                'usr_CO39_OH', 'usr_CO40_OH', 'usr_CO41_OH', 'usr_CO42_OH' ];
    $stratosphere_reactions = array( );
    $file_dict = loadDictionaryFromCsvFile( 'out/original_rate_constants.csv' );

    foreach( $troposphere_reactions  as $name ) test_troposphere_reaction(  $name, $file_dict );
    foreach( $stratosphere_reactions as $name ) test_stratosphere_reaction( $name, $file_dict );

    // reactions with specific rate comparisons
    test_troposphere_reaction( 'usr_ISOPB1O2_NOn',    $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPB1O2_NOa',    $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPB4O2_NOn',    $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPB4O2_NOa',    $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPED1O2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPED1O2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPED4O2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPED4O2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPZD1O2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPZD1O2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPZD4O2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPZD4O2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPNO3_NOn',     $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPNO3_NOa',     $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_MVKO2_NOn',       $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_MVKO2_NOa',       $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_MACRO2_NOn',      $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_MACRO2_NOa',      $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPN1DO2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPN1DO2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPN2BO2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPN2BO2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPN3BO2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPN3BO2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPN4DO2_NOn',   $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPN4DO2_NOa',   $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPNBNO3O2_NOn', $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPNBNO3O2_NOa', $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPNOOHBO2_NOn', $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPNOOHBO2_NOa', $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_ISOPNOOHDO2_NOn', $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_ISOPNOOHDO2_NOa', $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_NC4CHOO2_NOn',    $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_NC4CHOO2_NOa',    $file_dict, 'alkoxy'  );
    test_troposphere_reaction( 'usr_IEPOXOO_NOn',     $file_dict, 'nitrate' );
    test_troposphere_reaction( 'usr_IEPOXOO_NOa',     $file_dict, 'alkoxy'  );

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
