<?php
//
// Tests for the CampReactionWennbergTunneling clas
//
include("../../CampReactionWennbergTunneling.php");

function testCampReactionWennbergTunneling( ) {

    print "Running tests for CampReactionWennbergTunneling\n";

    $reactants = array( "FOO" => array( "qty" => 1 ),
                        "BAR" => array( "qty" => 3 ) );
    $products = array( "FOOBAR" => array( "yield" => null ),
                       "BAR" => array( "yield" => 1.5 ),
                       "BAZ" => array( "yield" => 0.5 ) );

    $rxn = CampReactionWennbergTunneling::builder( )->build( );

    $expected_string = <<<'EOD'
{
  "type": "WENNBERG_TUNNELING",
  "A": 1,
  "B": 0,
  "C": 0,
  "reactants": {

  },
  "products": {

  }
}
EOD;

    assert($rxn->getCampConfiguration( ) == $expected_string);

    $expected_string = <<<'EOD'
    {
      "type": "WENNBERG_TUNNELING",
      "A": 1,
      "B": 0,
      "C": 0,
      "reactants": {

      },
      "products": {

      }
    }
EOD;

    assert($rxn->getCampConfiguration( 4 ) == $expected_string);

    $rxn = CampReactionWennbergTunneling::builder( )
               ->reactants( $reactants )
               ->products( $products )
               ->A( 2.5e-23 )
               ->B( 3.2 )
               ->C( 3 )
               ->build( );

    $expected_string = <<<'EOD'
{
  "type": "WENNBERG_TUNNELING",
  "A": 2.5e-23,
  "B": 3.2,
  "C": 3,
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
testCampReactionWennbergTunneling( );

?>
