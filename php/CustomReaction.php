<?php

include_once('CampReactionArrhenius.php');
include_once('CampReactionTernaryChemicalActivation.php');
include_once('CampReactionTroe.php');
include_once('CampReactionWennbergNoRo2.php');
include_once('CampReactionWennbergTunneling.php');

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
            case "usr_OA_O2":
                $reactions = $this->getReactionsOO2( );
                break;
            case "usr_N2O5_M":
            case "usr_XNO2NO3_M":
            case "usr_NO2XNO3_M":
                $reactions = $this->getReactionsN2o5M( );
                break;
            case "usr_HO2NO2_M":
            case "usr_XHO2NO2_M":
                $reactions = $this->getReactionsHo2no2M( );
                break;
            case "usr_HO2_HO2":
                $reactions = $this->getReactionsHo2Ho2( );
                break;
            case "usr_MPAN_M":
            case "usr_XMPAN_M":
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
            case "usr_XPAN_M":
                $reactions = $this->getReactionsPanM( );
                break;
            case "usr_HNO3_OH":
            case "usr_XHNO3_OH":
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
            case "usr_COhc_OH":
            case "usr_COme_OH":
            case "usr_CO01_OH":
            case "usr_CO02_OH":
            case "usr_CO03_OH":
            case "usr_CO04_OH":
            case "usr_CO05_OH":
            case "usr_CO06_OH":
            case "usr_CO07_OH":
            case "usr_CO08_OH":
            case "usr_CO09_OH":
            case "usr_CO10_OH":
            case "usr_CO11_OH":
            case "usr_CO12_OH":
            case "usr_CO13_OH":
            case "usr_CO14_OH":
            case "usr_CO15_OH":
            case "usr_CO16_OH":
            case "usr_CO17_OH":
            case "usr_CO18_OH":
            case "usr_CO19_OH":
            case "usr_CO20_OH":
            case "usr_CO21_OH":
            case "usr_CO22_OH":
            case "usr_CO23_OH":
            case "usr_CO24_OH":
            case "usr_CO25_OH":
            case "usr_CO26_OH":
            case "usr_CO27_OH":
            case "usr_CO28_OH":
            case "usr_CO29_OH":
            case "usr_CO30_OH":
            case "usr_CO31_OH":
            case "usr_CO32_OH":
            case "usr_CO33_OH":
            case "usr_CO34_OH":
            case "usr_CO35_OH":
            case "usr_CO36_OH":
            case "usr_CO37_OH":
            case "usr_CO38_OH":
            case "usr_CO39_OH":
            case "usr_CO40_OH":
            case "usr_CO41_OH":
            case "usr_CO42_OH":
                $reactions = $this->getReactionsCoOhB( );
                break;
            case "usr_ISOPB1O2_NOa":
                $reactions = $this->getReactionsIsopb1o2NoA( );
                break;
            case "usr_ISOPB1O2_NOn":
                $reactions = $this->getReactionsIsopb1o2NoN( );
                break;
            case "usr_ISOPB4O2_NOa":
                $reactions = $this->getReactionsIsopb4o2NoA( );
                break;
            case "usr_ISOPB4O2_NOn":
                $reactions = $this->getReactionsIsopb4o2NoN( );
                break;
            case "usr_ISOPED1O2_NOa":
                $reactions = $this->getReactionsIsoped1o2NoA( );
                break;
            case "usr_ISOPED1O2_NOn":
                $reactions = $this->getReactionsIsoped1o2NoN( );
                break;
            case "usr_ISOPED4O2_NOa":
                $reactions = $this->getReactionsIsoped4o2NoA( );
                break;
            case "usr_ISOPED4O2_NOn":
                $reactions = $this->getReactionsIsoped4o2NoN( );
                break;
            case "usr_ISOPZD1O2_NOa":
                $reactions = $this->getReactionsIsopzd1o2NoA( );
                break;
            case "usr_ISOPZD1O2_NOn":
                $reactions = $this->getReactionsIsopzd1o2NoN( );
                break;
            case "usr_ISOPZD4O2_NOa":
                $reactions = $this->getReactionsIsopzd4o2NoA( );
                break;
            case "usr_ISOPZD4O2_NOn":
                $reactions = $this->getReactionsIsopzd4o2NoN( );
                break;
            case "usr_ISOPNO3_NOa":
                $reactions = $this->getReactionsIsopno3NoA( );
                break;
            case "usr_ISOPNO3_NOn":
                $reactions = $this->getReactionsIsopno3NoN( );
                break;
            case "usr_MVKO2_NOa":
                $reactions = $this->getReactionsMvko2NoA( );
                break;
            case "usr_MVKO2_NOn":
                $reactions = $this->getReactionsMvko2NoN( );
                break;
            case "usr_MACRO2_NOa":
                $reactions = $this->getReactionsMacro2NoA( );
                break;
            case "usr_MACRO2_NOn":
                $reactions = $this->getReactionsMacro2NoN( );
                break;
            case "usr_IEPOXOO_NOa":
                $reactions = $this->getReactionsIepoxooNoA( );
                break;
            case "usr_IEPOXOO_NOn":
                $reactions = $this->getReactionsIepoxooNoN( );
                break;
            case "usr_ISOPN1DO2_NOa":
                $reactions = $this->getReactionsIsopn1do2NoA( );
                break;
            case "usr_ISOPN1DO2_NOn":
                $reactions = $this->getReactionsIsopn1do2NoN( );
                break;
            case "usr_ISOPN2BO2_NOa":
                $reactions = $this->getReactionsIsopn2bo2NoA( );
                break;
            case "usr_ISOPN2BO2_NOn":
                $reactions = $this->getReactionsIsopn2bo2NoN( );
                break;
            case "usr_ISOPN3BO2_NOa":
                $reactions = $this->getReactionsIsopn3bo2NoA( );
                break;
            case "usr_ISOPN3BO2_NOn":
                $reactions = $this->getReactionsIsopn3bo2NoN( );
                break;
            case "usr_ISOPN4DO2_NOa":
                $reactions = $this->getReactionsIsopn4do2NoA( );
                break;
            case "usr_ISOPN4DO2_NOn":
                $reactions = $this->getReactionsIsopn4do2NoN( );
                break;
            case "usr_ISOPNBNO3O2_NOa":
                $reactions = $this->getReactionsIsopnbno3o2NoA( );
                break;
            case "usr_ISOPNBNO3O2_NOn":
                $reactions = $this->getReactionsIsopnbno3o2NoN( );
                break;
            case "usr_ISOPNOOHBO2_NOa":
                $reactions = $this->getReactionsIsopnoohbo2NoA( );
                break;
            case "usr_ISOPNOOHBO2_NOn":
                $reactions = $this->getReactionsIsopnoohbo2NoN( );
                break;
            case "usr_ISOPNOOHDO2_NOa":
                $reactions = $this->getReactionsIsopnoohdo2NoA( );
                break;
            case "usr_ISOPNOOHDO2_NOn":
                $reactions = $this->getReactionsIsopnoohdo2NoN( );
                break;
            case "usr_NC4CHOO2_NOa":
                $reactions = $this->getReactionsNc4choo2NoA( );
                break;
            case "usr_NC4CHOO2_NOn":
                $reactions = $this->getReactionsNc4choo2NoN( );
                break;
            case "usr_ISOPZD1O2":
                $reactions = $this->getReactionsIsopzd1o2( );
                break;
            case "usr_TERPAPAN_M":
                $reactions = $this->getReactionsTerpapanM( );
                break;
            case "usr_TERPA2PAN_M":
                $reactions = $this->getReactionsTerpa2panM( );
                break;
            case "usr_TERPA3PAN_M":
                $reactions = $this->getReactionsTerpa3panM( );
                break;
            case "usr_ISOPZD4O2":
                $reactions = $this->getReactionsIsopzd4o2( );
                break;
            case "usr_XOOH_OH":
                $reactions = $this->getReactionsXoohOh( );
                break;
            case "usr_C2O3_NO2":
                $reactions = $this->getReactionsC2o3No2( );
                break;
            case "usr_C2H4_OH":
                $reactions = $this->getReactionsC2h4Oh( );
                break;
            case "usr_C2O3_XNO2":
                $reactions = $this->getReactionsC2o3Xno2( );
                break;
            case "usr_CLm_H2O_M":
                $reactions = $this->getReactionsClmH2oM( );
                break;
            case "usr_CLm_HCL_M":
                $reactions = $this->getReactionsClmHclM( );
                break;
            case "usr_oh_co":
                $reactions = $this->getReactionsOhCo( );
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
                          ->kinf_A( 4e-12 / ( 2.1e-27 ) )
                          ->kinf_C( -10900 )
                          ->N( 0.3 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_HO2_HO2
    //
    private function getReactionsHo2Ho2( ) {
        $r2_reactants = array_merge( $this->original_reactants_, ['M'   => [ 'qty' => 1 ]]);
        $r3_reactants = array_merge( $this->original_reactants_, ['H2O' => [ 'qty' => 1 ]]);
        $r4_reactants = array_merge( $this->original_reactants_, ['M'   => [ 'qty' => 1 ],
                                                                  'H2O' => [ 'qty' => 1 ]]);
        $r2_products  = array_merge( $this->original_products_,  ['M'   => []]);
        $r3_products  = array_merge( $this->original_products_,  ['H2O' => []]);
        $r4_products  = array_merge( $this->original_products_,  ['M'   => [], 'H2O' => []]);
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
        $r2_reactants = array_merge( $this->original_reactants_, ['M' => [ 'qty' => 1 ]]);
        $r2_products  = array_merge( $this->original_products_,  ['M' => [ ]]);
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
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 2.4e-14 )
                          ->C( 460 )
                          ->build( ),
                      CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 6.5e-34 )
                          ->k0_C( 1335 )
                          ->kinf_A( 2.7e-17 )
                          ->kinf_C( 2199 )
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
                          ->A( 3e-11 / 2.16e-27 )
                          ->C( 2450 - 8537 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_SO3_H2O
    //
    private function getReactionsSo3H2o( ) {
        $reactants = array_merge( $this->original_reactants_, ['H2O' => [ 'qty' => 1 ]]);
        $products  = array_merge( $this->original_products_,  ['H2O' => []]);
        return array( CampReactionArrhenius::builder( )
                         ->reactants( $reactants )
                         ->products(  $products  )
                         ->A( 8.5e-41 )
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
                          ->k0_A( 1.5e-13 )
                          ->kinf_A( 2.1e9 )
                          ->kinf_B( 6.1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPB1O2_NOa
    //
    private function getReactionsIsopb1o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.14 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPB1O2_NOn
    //
    private function getReactionsIsopb1o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.14 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPB4O2_NOa
    //
    private function getReactionsIsopb4o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.13 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPB4O2_NOn
    //
    private function getReactionsIsopb4o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.13 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPED1O2_NOa
    //
    private function getReactionsIsoped1o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPED1O2_NOn
    //
    private function getReactionsIsoped1o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPED4O2_NOa
    //
    private function getReactionsIsoped4o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPED4O2_NOn
    //
    private function getReactionsIsoped4o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPZD1O2_NOa
    //
    private function getReactionsIsopzd1o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPZD1O2_NOn
    //
    private function getReactionsIsopzd1o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPZD4O2_NOa
    //
    private function getReactionsIsopzd4o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPZD4O2_NOn
    //
    private function getReactionsIsopzd4o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.12 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNO3_NOa
    //
    private function getReactionsIsopno3NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.135 )
                          ->n( 9 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNO3_NOn
    //
    private function getReactionsIsopno3NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.135 )
                          ->n( 9 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_MVKO2_NOa
    //
    private function getReactionsMvko2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.04 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_MVKO2_NOn
    //
    private function getReactionsMvko2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.04 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_MACRO2_NOa
    //
    private function getReactionsMacro2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.06 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_MACRO2_NOn
    //
    private function getReactionsMacro2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.06 )
                          ->n( 6 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_IEPOXOO_NOa
    //
    private function getReactionsIepoxooNoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.025 )
                          ->n( 8 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_IEPOXOO_NOn
    //
    private function getReactionsIepoxooNoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.025 )
                          ->n( 8 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN1DO2_NOa
    //
    private function getReactionsIsopn1do2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.084 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN1DO2_NOn
    //
    private function getReactionsIsopn1do2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.084 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN2BO2_NOa
    //
    private function getReactionsIsopn2bo2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.065 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN2BO2_NOn
    //
    private function getReactionsIsopn2bo2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.065 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN3BO2_NOa
    //
    private function getReactionsIsopn3bo2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.053 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN3BO2_NOn
    //
    private function getReactionsIsopn3bo2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.053 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN4DO2_NOa
    //
    private function getReactionsIsopn4do2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.165 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPN4DO2_NOn
    //
    private function getReactionsIsopn4do2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.165 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNBNO3O2_NOa
    //
    private function getReactionsIsopnbno3o2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.203 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNBNO3O2_NOn
    //
    private function getReactionsIsopnbno3o2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.203 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNOOHBO2_NOa
    //
    private function getReactionsIsopnoohbo2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.141 )
                          ->n( 12 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNOOHBO2_NOn
    //
    private function getReactionsIsopnoohbo2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.141 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNOOHDO2_NOa
    //
    private function getReactionsIsopnoohdo2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.045 )
                          ->n( 12 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPNOOHDO2_NOn
    //
    private function getReactionsIsopnoohdo2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.045 )
                          ->n( 12 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_NC4CHOO2_NOa
    //
    private function getReactionsNc4choo2NoA( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(       $this->original_reactants_ )
                          ->alkoxy_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.021 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_NC4CHOO2_NOn
    //
    private function getReactionsNc4choo2NoN( ) {
        return array( CampReactionWennbergNoRo2::builder( )
                          ->reactants(        $this->original_reactants_ )
                          ->nitrate_products( $this->original_products_  )
                          ->X( 2.7e-12 )
                          ->Y( -360 )
                          ->a0( 0.021 )
                          ->n( 11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPZD1O2
    //
    private function getReactionsIsopzd1o2( ) {
        return array( CampReactionWennbergTunneling::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 5.05e15 )
                          ->B( 12200 )
                          ->C( 1e8 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_TERPAPAN_M
    //
    private function getReactionsTerpapanM( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 9.7e-29 * 1.111e28 )
                          ->k0_B( -5.6 )
                          ->k0_C( -14000 )
                          ->kinf_A( 9.3e-12 * 1.111e28 )
                          ->kinf_C( -14000 )
                          ->Fc( 0.6 )
                          ->N( 1.5 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_TERPA2PAN_M
    //
    private function getReactionsTerpa2panM( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 9.7e-29 * 1.111e28 )
                          ->k0_B( -5.6 )
                          ->k0_C( -14000 )
                          ->kinf_A( 9.3e-12 * 1.111e28 )
                          ->kinf_C( -14000 )
                          ->Fc( 0.6 )
                          ->N( 1.5 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_TERPA3PAN_M
    //
    private function getReactionsTerpa3panM( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 9.7e-29 * 1.111e28 )
                          ->k0_B( -5.6 )
                          ->k0_C( -14000 )
                          ->kinf_A( 9.3e-12 * 1.111e28 )
                          ->kinf_C( -14000 )
                          ->Fc( 0.6 )
                          ->N( 1.5 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_ISOPZD4O2
    //
    private function getReactionsIsopzd4o2( ) {
        return array( CampReactionWennbergTunneling::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 2.22e9 )
                          ->B( 7160 )
                          ->C( 1e8 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_XOOH_OH
    //
    private function getReactionsXoohOh( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 7.69e-17 )
                          ->B( 2 )
                          ->C( 253 )
                          ->D( 1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_C2O3_NO2
    //
    private function getReactionsC2o3No2( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 2.6e-28 )
                          ->kinf_A( 1.2e-11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_C2H4_OH
    //
    private function getReactionsC2h4Oh( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 1.0e-28 )
                          ->kinf_A( 8.8e-12 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_C2O3_XNO2
    //
    private function getReactionsC2o3Xno2( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 2.6e-28 )
                          ->kinf_A( 1.2e-11 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_CLm_H2O_M
    //
    private function getReactionsClmH2oM( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 2e-8 )
                          ->C( -6600 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_CLm_HCL_M
    //
    private function getReactionsClmHclM( ) {
        return array( CampReactionArrhenius::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->A( 1 )
                          ->B( -1 )
                          ->C( -11926 )
                          ->D( 1 )
                          ->build( ) );
    }

    // Returns a set of CAMP reactions for the custom rate constant function:
    //
    //   usr_oh_co
    //
    private function getReactionsOhCo( ) {
        return array( CampReactionTroe::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 5.9e-33 )
                          ->k0_B( -1.4 )
                          ->kinf_A( 1.1e-12 )
                          ->kinf_B( 1.3 )
                          ->build( ),
                       CampReactionTernaryChemicalActivation::builder( )
                          ->reactants( $this->original_reactants_ )
                          ->products(  $this->original_products_  )
                          ->k0_A( 1.5e-13 )
                          ->k0_B( 0.6 )
                          ->kinf_A( 2.1e9 )
                          ->kinf_B( 6.1 )
                          ->build( ) );
    }

}
?>
