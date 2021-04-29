<?php
//
// Tests for the CampReactionArrhenius class
//
include("../../CampReactionArrhenius.php");

function testCampReactionArrhenius( ) {

    print "Running tests for CampReactionArrhenius\n";

    $reactants = array( "FOO" => array( "qty" => 1 ),
                        "BAR" => array( "qty" => 3 ) );
    $products  = array( "FOOBAR" => array( "yield" => null ),
                        "BAR" => array( "yield" => 1.5 ),
                        "BAZ" => array( "yield" => 0.5 ) );

    $rxn = CampReactionArrhenius::builder( )->build( );

    $expected_string = <<<'EOD'
{
  "type": "ARRHENIUS",
  "reactants": {

  },
  "products": {

  }
}
EOD;
    assert($rxn->getCampConfiguration( ) == $expected_string);

    $expected_string = <<<'EOD'
    {
      "type": "ARRHENIUS",
      "reactants": {

      },
      "products": {

      }
    }
EOD;
    assert($rxn->getCampConfiguration( 4 ) == $expected_string);

    $rxn = CampReactionArrhenius::builder( )
              ->reactants( $reactants )
              ->products( $products )
              ->A( 12.5e-23 )
              ->B( 3.2 )
              ->D( 301 )
              ->E( 92034.2 )
              ->Ea( 12.4e-19 )
              ->build( );

    $expected_string = <<<'EOD'
{
  "type": "ARRHENIUS",
  "A": 1.25e-22,
  "B": 3.2,
  "D": 301,
  "E": 92034.2,
  "Ea": 1.24e-18,
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

    print "\nPassed!\n\n";
}

// Run the tests
testCampReactionArrhenius( );

?>
