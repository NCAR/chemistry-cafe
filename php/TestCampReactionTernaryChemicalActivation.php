<?php
//
// Tests for the CampReactionTernaryChemicalActivation clas
//
include("CampReactionTernaryChemicalActivation.php");

function testCampReactionTernaryChemicalActivation( ) {

    print "Running tests for CampReactionTernaryChemicalActivation\n";

    $reactants = array( "FOO" => array( "qty" => 1 ),
                        "BAR" => array( "qty" => 3 ) );
    $products  = array( "FOOBAR" => array( "yield" => null ),
                        "BAR" => array( "yield" => 1.5 ),
                        "BAZ" => array( "yield" => 0.5 ) );

    $rxn = CampReactionTernaryChemicalActivation::builder( )->build( );

    $expected_string = <<<'EOD'
{
  "type": "TERNARY_CHEMICAL_ACTIVATION",
  "reactants": {

  },
  "products": {

  }
}
EOD;

    assert($rxn->getCampConfiguration( ) == $expected_string);

    $expected_string = <<<'EOD'
    {
      "type": "TERNARY_CHEMICAL_ACTIVATION",
      "reactants": {

      },
      "products": {

      }
    }
EOD;

    assert($rxn->getCampConfiguration( 4 ) == $expected_string);

    $rxn = CampReactionTernaryChemicalActivation::builder( )
               ->reactants( $reactants )
               ->products( $products )
               ->k0_A( 2.5e-23 )
               ->k0_B( 3.2 )
               ->k0_C( 2.4e-10 )
               ->kinf_A( 5.2e-22 )
               ->kinf_B( 4.3 )
               ->kinf_C( 4.2e-9 )
               ->Fc( 0.9 )
               ->N( 1.6 )
               ->build( );

    $expected_string = <<<'EOD'
{
  "type": "TERNARY_CHEMICAL_ACTIVATION",
  "k0_A": 2.5E-23,
  "k0_B": 3.2,
  "k0_C": 2.4E-10,
  "kinf_A": 5.2E-22,
  "kinf_B": 4.3,
  "kinf_C": 4.2E-9,
  "Fc": 0.9,
  "N": 1.6,
  "reactants": {
    "FOO": { },
    "BAR": { "qty": 3 }
  },
  "products": {
    "FOOBAR": { },
    "BAR": { "yield": 1.5 },
    "BAZ": { "yield": 0.5 }
  }
}
EOD;

    assert($rxn->getCampConfiguration( ) == $expected_string);

    print "\nPassed!\n";
}

// Run the tests
testCampReactionTernaryChemicalActivation( );

?>
