<?php

include_once('CampReactionArrhenius.php');
include_once('CampReactionTernaryChemicalActivation.php');
include_once('CampReactionTroe.php');

//
// Generator of CAMP reaction objects for custom rate constant function
// names in CAM or other models. This is quite fragile as the rate constant
// functions could change at any time, and may be inconsistent across models.
//
// Be sure to run the tests with your current version of `mo_usrrxt.F90` to
// ensure the generated functions are consistent with your version of CAM.
// For other models, use this script at your own risk.
//
class CustomReaction
{
    protected $custom_rate_constant_name_ = '';
    protected $original_reactants_ = array( );
    protected $original_products_ = array( );
    protected const kBoltzmannErgK = 1.38065E-16; // [erg K-1]

    public function __construct($name, $reactants, $products) {
        $this->custom_rate_constant_name_ = $name;
        $this->original_reactants_        = $reactants;
        $this->original_products_         = $products;
    }

    // Returns a set of CAMP reaction objects that correspond to the original
    // custom rate constant function, or an empty array for an unsupported
    // custom rate constant function.
    public function getCampReactions( ) {
        $reactions = array( );
        switch($this->custom_rate_constant_name_) {
            case "usr_DMS_OH":
                $reactions = $this->getReactionsDmsOh( );
                break;
            case "usr_PBZNIT_M":
                $reactions = $this->getReactionsPbznitM( );
                break;
            case "usr_O_O2":
                $reactions = $this->getReactionsOO2( );
                break;
            case "usr_N2O5_M":
                $reactions = $this->getReactionsN2o5M( );
                break;
            case "usr_HO2NO2_M":
                $reactions = $this->getReactionsHo2no2M( );
                break;
            case "usr_HO2_HO2":
                $reactions = $this->getReactionsHo2Ho2( );
                break;
            case "usr_MPAN_M":
                $reactions = $this->getReactionsMpanM( );
                break;
            case "usr_SO2_OH":
                $reactions = $this->getReactionsSo2Oh( );
                break;
            case "usr_CO_OH_a":
                $reactions = $this->getReactionsCoOhA( );
                break;
            case "usr_O_O":
                $reactions = $this->getReactionsOO( );
                break;
            case "usr_PAN_M":
                $reactions = $this->getReactionsPanM( );
                break;
            case "usr_HNO3_OH":
                $reactions = $this->getReactionsHno3Oh( );
                break;
            case "usr_MCO3_NO2":
                $reactions = $this->getReactionsMco3No2( );
                break;
            case "usr_CH3COCH3_OH":
                $reactions = $this->getReactionsCh3coch3Oh( );
                break;
            case "usr_CL2O2_M":
                $reactions = $this->getReactionsCl2o2M( );
                break;
            case "usr_SO3_H2O":
                $reactions = $this->getReactionsSo3H2o( );
                break;
            case "usr_CO_OH_b":
                $reactions = $this->getReactionsCoOhB( );
                break;
            default:
                print "\nWarning: Custom function $this->custom_rate_constant_name_ is unsupported.";
                break;
        }
        return $reactions;
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_DMS_OH
    //
    private function getReactionsDmsOh( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 0.21 * 1.7e-42 )
                          ->k0_C( 7810 )
                          ->kinf_A( 1.7e-42 / ( 5.5e-31 ) )
                          ->kinf_C( 7810 - 7460 )
                          ->Fc( 1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_PBZNIT_M
    //
    private function getReactionsPbznitM( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 9.7e-29 * 1.111e28 )
                          ->k0_B( -5.6 )
                          ->k0_C( -14000 )
                          ->kinf_A( 9.3e-12 * 1.111e28 )
                          ->kinf_C( -14000 )
                          ->N( 1.5 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_O_O2
    //
    private function getReactionsOO2( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 6.0e-34 )
                          ->B( -2.4 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_N2O5_M
    //
    private function getReactionsN2o5M( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 2.4e-30 * 1.724138e26 )
                          ->k0_B( -3 )
                          ->k0_C( -10840 )
                          ->kinf_A( 1.6e-12 * 1.724138e26 )
                          ->kinf_C( -10840 )
                          ->N( -0.1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_HO2NO2_M
    //
    private function getReactionsHo2no2M( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 1.9e-31 / ( 2.1e-27 ) )
                          ->k0_B( -3.4 )
                          ->k0_C( -10900 )
                          ->k0_A( 4e-12 / ( 2.1e-27 ) )
                          ->k0_C( -10900 )
                          ->N( 0.3 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_HO2_HO2
    //
    private function getReactionsHo2Ho2( ) {
        $r2_reactants = array_merge( $this->original_reactants_, ['M' => []]);
        $r3_reactants = array_merge( $this->original_reactants_, ['H2O' => []]);
        $r4_reactants = array_merge( $this->original_reactants_, ['M' => [], 'H2O' => []]);
        $r2_products  = array_merge( $this->original_products_,  ['M' => []]);
        $r3_products  = array_merge( $this->original_products_,  ['H2O' => []]);
        $r4_products  = array_merge( $this->original_products_,  ['M' => [], 'H2O' => []]);
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 3.0e-13 )
                          ->C( 460 )
                          ->build( ),
                      CampReactionArrhenius::builder( )
                          ->reactants( $r2_reactants )
                          ->products(  $r2_products  )
                          ->A( 2.1e-33 )
                          ->C( 920 )
                          ->build( ),
                      CampReactionArrhenius::builder( )
                          ->reactants( $r3_reactants )
                          ->products(  $r3_products  )
                          ->A( 3e-13 * 1.4e-21 )
                          ->C( 2660 )
                          ->build( ),
                      CampReactionArrhenius::builder( )
                          ->reactants( $r4_reactants )
                          ->products(  $r4_products  )
                          ->A( 2.1e-33 * 1.4e-21 )
                          ->C( 3120 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_MPAN_M
    //
    private function getReactionsMPanM( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 9.7e-29 * 1.111e28 )
                          ->k0_B( -5.6 )
                          ->k0_C( -14000 )
                          ->kinf_A( 9.3e-12 * 1.111e28 )
                          ->kinf_C( -14000 )
                          ->N( 1.5 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_SO2_OH
    //
    private function getReactionsSo2Oh( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 3e-31 )
                          ->k0_B( -3.3 )
                          ->kinf_A( 1.5e-12 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_CO_OH_a
    //
    private function getReactionsCoOhA( ) {
        $r2_reactants = array_merge( $this->original_reactants_, ['M' => []]);
        $r2_products  = array_merge( $this->original_products_,  ['M' => []]);
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 1.5e-13 )
                          ->build( ),
                      CampReactionArrhenius::builder( )
                          ->reactants( $r2_reactants )
                          ->products(  $r2_products  )
                          ->A( 1.5e-13 * 6e-7 * self::kBoltzmannErgK )
                          ->B( 1 )
                          ->D( 1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_O_O
    //
    private function getReactionsOO( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 2.76e-34 )
                          ->C( 720 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_PAN_M
    //
    private function getReactionsPanM( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 9.7e-29 * 1.111e28 )
                          ->k0_B( -5.6 )
                          ->k0_C( -14000 )
                          ->kinf_A( 9.3e-12 * 1.111e28 )
                          ->kinf_C( -14000 )
                          ->N( 1.5 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_HNO3_OH
    //
    private function getReactionsHno3Oh( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 6.5e-34 )
                          ->k0_C( 1335 )
                          ->k0_A( 2.7e-17 )
                          ->k0_C( 2199 )
                          ->Fc( 1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //    usr_HNO3_OH
    //
    private function getReactionsMco3No2( ) {
        $reactants = $this->original_reactants_;
        $products  = $this->original_products_;
        unset( $reactants['M'] );
        unset(  $products['M'] );
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $reactants )
                          ->products(  $products  )
                          ->A( 1.1e-11 )
                          ->B( -1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_CH3COCH3_OH
    //
    private function getReactionsCh3coch3Oh( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 3.82e-11 )
                          ->C( -2000 )
                          ->build( ),
                      CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 1.33e-13 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_CL2O2_M
    //
    private function getReactionsCl2o2M( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 3e-11 * 2.16e-27 )
                          ->C( 2450 + 8537 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_SO3_H2O
    //
    private function getReactionsSo3H2o( ) {
        $reactants = array_merge( $this->original_reactants_, ['H2O' => []]);
        $products  = array_merge( $this->original_products_,  ['H2O' => []]);
        return array( CampReactionArrhenius::builder( )
                         ->reactants( $reactants )
                         ->products(  $products  )
                         ->A( 8.5e-21 )
                         ->C( 6540 )
                         ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_CO_OH_b
    //
    private function getReactionsCoOhB( ) {
        return array( CampReactionTernaryChemicalActivation::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 1.5e13 )
                          ->kinf_A( 2.1e9 )
                          ->kinf_B( 6.1 )
                          ->build( ) );
    }
}
?>
