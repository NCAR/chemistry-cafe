<?php

include_once("CampReactionTroe.php");

//
// Generator of CAMP configuration data for ternary chemical activation reactions
//
//   k = k0 / ( 1 + k0 [M] / kinf ) Fc^( 1 + ( 1/N ( log10( k0 [M] / kinf ) )^2 )^-1 )
//
//   k0 = k0_A * exp( k0_C / T ) * ( T / 300 )^k0_B
//
//   kinf = kinf_A * exp( kinf_C / T ) * ( T / 300 )^kinf_B
//
// The rate constant parameter are the same as for Troe reactins.
//
class CampReactionTernaryChemicalActivation extends CampReactionTroe
{
    protected function __construct(array $reactants, array $products, $k0_A,
        $k0_B, $k0_C, $kinf_A, $kinf_B, $kinf_C, $Fc, $N) {
        parent::__construct($reactants, $products, $k0_A,
            $k0_B, $k0_C, $kinf_A, $kinf_B, $kinf_C, $Fc, $N);
    }

    // Concrete builder
    public static function builder( ): CampReactionTroeBuilder {
        return new class extends CampReactionTernaryChemicalActivationBuilder {
            public function __construct( ) {
                parent::__construct( );
            }
        };
    }

    // Music box reaction name
    protected function getReactionType( ): string {
        return "TERNARY_CHEMICAL_ACTIVATION";
    }

    // Returns the rate for the reaction under given conditions
    public function getRate($environment, string $label = '') {
        $kinf =$this->kinf_A_ *
               exp( $this->kinf_C_ / $environment[ 'temperature' ] ) *
               pow( $environment[ 'temperature' ] / 300.0, $this->kinf_B_ );
        $k0 =  $this->k0_A_ *
               exp( $this->k0_C_ / $environment[ 'temperature' ] ) *
               pow( $environment[ 'temperature' ] / 300.0, $this->k0_B_ );
        $rate = $k0 /
               ( 1 + $k0 * $environment[ 'M' ] / $kinf ) *
               pow( $this->Fc_, pow( 1 + 1 / $this->N_ *
                     pow( log10( $k0 * $environment[ 'M' ] / $kinf ), 2), -1 ) );
        foreach($this->reactants_ as $reactant => $props) {
            for($i = 0; $i < $props['qty']; ++$i) {
                $rate *= $environment[ $reactant ];
            }
        }
        return $rate;
    }

}

// Abstract builder
abstract class CampReactionTernaryChemicalActivationBuilder extends
    CampReactionTroeBuilder
{
    protected function __construct( ){ parent::__construct( ); }

    public function build( ): CampReactionTroe {
        return new class($this->reactants_, $this->products_, $this->k0_A_,
            $this->k0_B_, $this->k0_C_, $this->kinf_A_, $this->kinf_B_,
            $this->kinf_C_, $this->Fc_, $this->N_) extends
            CampReactionTernaryChemicalActivation {
            public function __construct(array $reactants, array $products,
                $k0_A, $k0_B, $k0_C, $kinf_A, $kinf_B, $kinf_C, $Fc, $N) {
                parent::__construct($reactants, $products, $k0_A, $k0_B, $k0_C,
                    $kinf_A, $kinf_B, $kinf_C, $Fc, $N);
            }
        };
    }
}
?>
