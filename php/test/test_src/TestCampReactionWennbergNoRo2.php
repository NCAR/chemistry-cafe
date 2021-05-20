<?php
//
// Tests for the CampReactionWennbergNoRo2 clas
//
include("../../CampReactionWennbergNoRo2.php");

function testCampReactionWennbergNoRo2( ) {

    print "Running tests for CampReactionWennbergNoRo2\n";

    $reactants = array( "FOO" => array( "qty" => 1 ),
                        "BAR" => array( "qty" => 3 ) );
    $nitrate_products = array( "FOOBAR" => array( "yield" => null ),
                               "BAR" => array( "yield" => 1.5 ),
                               "BAZ" => array( "yield" => 0.5 ) );
    $alkoxy_products =  array( "BAR" => array( "yield" => null ) );

    $rxn = CampReactionWennbergNoRo2::builder( )->build( );

    $expected_string = <<<'EOD'
{
  "type": "WENNBERG_NO_RO2",
  "X": 1,
  "Y": 0,
  "a0": 1,
  "n": 1,
  "reactants": {

  },
  "nitrate products": {

  },
  "alkoxy products": {

  }
}
EOD;

    assert($rxn->getCampConfiguration( ) == $expected_string);

    $expected_string = <<<'EOD'
    {
      "type": "WENNBERG_NO_RO2",
      "X": 1,
      "Y": 0,
      "a0": 1,
      "n": 1,
      "reactants": {

      },
      "nitrate products": {

      },
      "alkoxy products": {

      }
    }
EOD;

    assert($rxn->getCampConfiguration( 4 ) == $expected_string);

    $rxn = CampReactionWennbergNoRo2::builder( )
               ->reactants( $reactants )
               ->nitrate_products( $nitrate_products )
               ->alkoxy_products( $alkoxy_products )
               ->X( 2.5e-23 )
               ->Y( 3.2 )
               ->a0( 2.4e-10 )
               ->n( 3 )
               ->build( );

    $expected_string = <<<'EOD'
{
  "type": "WENNBERG_NO_RO2",
  "X": 2.5e-23,
  "Y": 3.2,
  "a0": 2.4e-10,
  "n": 3,
  "reactants": {
    "FOO": { },
    "BAR": { "qty": 3 }
  },
  "nitrate products": {
    "FOOBAR": { },
    "BAR": { "yield": 1.5 },
    "BAZ": { "yield": 0.5 }
  },
  "alkoxy products": {
    "BAR": { }
  }
}
EOD;

    assert($rxn->getCampConfiguration( ) == $expected_string);

    print "\nPassed!\n";
}

// Run the tests
testCampReactionWennbergNoRo2( );

?>
