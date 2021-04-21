<?php
//
// Generator of CAMP configuration data for a support reaction type
//
abstract class CampReaction
{
    // Returns the CAMP configuration json object for the reaction
    // as a string with the specified indent.
    abstract protected function getCampConfiguration(int $indent = 0): string;

    // Returns the rate for the reaction under given conditions
    abstract protected function getRate($environment);
}
?>
