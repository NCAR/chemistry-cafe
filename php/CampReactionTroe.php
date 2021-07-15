<?php

include_once("CampReaction.php");

//
// Generator of CAMP configuration data for Troe reactions
//
//   k = k0 [M] / ( 1 + k0 [M] / kinf ) Fc^( 1 + ( 1/N ( log10( k0 [M] / kinf ) )^2 )^-1 )
//
//   k0 = k0_A * exp( k0_C / T ) * ( T / 300 )^k0_B
//
//   kinf = kinf_A * exp( kinf_C / T ) * ( T / 300 )^kinf_B
//
class CampReactionTroe extends CampReaction
{
    protected $reactants_;
    protected $products_;
    protected $k0_A_;
    protected $k0_B_;
    protected $k0_C_;
    protected $kinf_A_;
    protected $kinf_B_;
    protected $kinf_C_;
    protected $Fc_;
    protected $N_;

    protected function __construct(array $reactants, array $products, $k0_A,
        $k0_B, $k0_C, $kinf_A, $kinf_B, $kinf_C, $Fc, $N) {
        $this->reactants_ = $reactants;
        $this->products_  = $products;
        $this->k0_A_      = $k0_A;
        $this->k0_B_      = $k0_B;
        $this->k0_C_      = $k0_C;
        $this->kinf_A_    = $kinf_A;
        $this->kinf_B_    = $kinf_B;
        $this->kinf_C_    = $kinf_C;
        $this->Fc_        = $Fc;
        $this->N_         = $N;
    }

    // Concrete builder
    public static function builder( ): CampReactionTroeBuilder {
        return new class extends CampReactionTroeBuilder {
            public function __construct( ) {
                parent::__construct( );
            }
        };
    }

    // Music box reaction name
    protected function getReactionType( ): string {
        return "TROE";
    }

    // Returns the CAMP configuration json object for the reaction
    // as a string with the specified indent.
    public function getCampConfiguration(int $indent = 0): string {
        $prefix = "";
        for($i = 0; $i < $indent; ++$i) $prefix .= " ";
        $config  = $prefix."{\n";
        $config .= $prefix."  \"type\": \"".$this->getReactionType( )."\",\n";
        if($this->k0_A_    != 1)   $config .= $prefix."  \"k0_A\": ".  sprintf( '%lg', $this->k0_A_ ).  ",\n";
        if($this->k0_B_    != 0)   $config .= $prefix."  \"k0_B\": ".  sprintf( '%lg', $this->k0_B_ ).  ",\n";
        if($this->k0_C_    != 0)   $config .= $prefix."  \"k0_C\": ".  sprintf( '%lg', $this->k0_C_ ).  ",\n";
        if($this->kinf_A_  != 1)   $config .= $prefix."  \"kinf_A\": ".sprintf( '%lg', $this->kinf_A_ ).",\n";
        if($this->kinf_B_  != 0)   $config .= $prefix."  \"kinf_B\": ".sprintf( '%lg', $this->kinf_B_ ).",\n";
        if($this->kinf_C_  != 0)   $config .= $prefix."  \"kinf_C\": ".sprintf( '%lg', $this->kinf_C_ ).",\n";
        if($this->Fc_      != 0.6) $config .= $prefix."  \"Fc\": ".    sprintf( '%lg', $this->Fc_ ).    ",\n";
        if($this->N_       != 1)   $config .= $prefix."  \"N\": ".     sprintf( '%lg', $this->N_ ).     ",\n";
        $config .= $prefix."  \"reactants\": {\n";
        $reactant_strings = array( );
        foreach($this->reactants_ as $name => $props) {
            if($props['qty'] == 1) {
                $reactant_strings[] = $prefix."    \"".$name."\": { }";
            } else {
                $reactant_strings[] = $prefix."    \"".$name."\": { \"qty\": "
                                      .$props['qty']." }";
            }
        }
        $config .= implode(",\n", $reactant_strings);
        $config .= "\n".$prefix."  },\n";
        $config .= $prefix."  \"products\": {\n";
        $product_strings = array( );
        foreach($this->products_ as $name => $props) {
            if($props['yield'] == 1) {
                $product_strings[] = $prefix."    \"".$name."\": { }";
            } else {
                $product_strings[] = $prefix."    \"".$name."\": { \"yield\": "
                                      .$props['yield']." }";
            }
        }
        $config .= implode(",\n", $product_strings);
        $config .= "\n".$prefix."  }\n";
        $config .= $prefix."}";
        return $config;
    }

    // Returns the rate for the reaction under given conditions
    public function getRate($environment, string $label = '') {
        $kinf =$this->kinf_A_ *
               exp( $this->kinf_C_ / $environment[ 'temperature' ] ) *
               pow( $environment[ 'temperature' ] / 300.0, $this->kinf_B_ );
        $k0 =  $this->k0_A_ *
               exp( $this->k0_C_ / $environment[ 'temperature' ] ) *
               pow( $environment[ 'temperature' ] / 300.0, $this->k0_B_ );
        $rate = $k0 * $environment[ 'M' ] /
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
abstract class CampReactionTroeBuilder
{
    protected const kBoltzmann_ = 1.380649e-23; // Boltzmann constant [J/K]
    protected $reactants_ = array( );
    protected $products_  = array( );
    protected $k0_A_      = 1.0;
    protected $k0_B_      = 0.0;
    protected $k0_C_      = 0.0;
    protected $kinf_A_    = 1.0;
    protected $kinf_B_    = 0.0;
    protected $kinf_C_    = 0.0;
    protected $Fc_        = 0.6;
    protected $N_         = 1.0;

    protected function __construct( ){ }

    public function reactants(array $reactants): CampReactionTroeBuilder {
        $this->reactants_ = $reactants;
        foreach($this->reactants_ as $reactant => $props) {
            if(!array_key_exists('qty', $props) || is_null($props['qty'])) {
                $this->reactants_[$reactant]['qty'] = 1;
            }
        }
        // The CAM preprocessor appears to ignore 'M'
        // unset($this->reactants_['M']);
        return $this;
    }

    public function products(array $products): CampReactionTroeBuilder {
        $this->products_ = $products;
        foreach($this->products_ as $product => $props) {
            if(!array_key_exists('yield', $props) || is_null($props['yield'])) {
                $this->products_[$product]['yield'] = 1;
            }
        }
        // The CAM preprocessor appears to ignore 'M' as a species
        // unset($this->products_['M']);
        return $this;
    }

    public function k0_A($k0_A): CampReactionTroeBuilder {
        $this->k0_A_ = $k0_A;
        return $this;
    }

    public function k0_B($k0_B): CampReactionTroeBuilder {
        $this->k0_B_ = $k0_B;
        return $this;
    }

    public function k0_C($k0_C): CampReactionTroeBuilder {
        $this->k0_C_ = $k0_C;
        return $this;
    }

    public function kinf_A($kinf_A): CampReactionTroeBuilder {
        $this->kinf_A_ = $kinf_A;
        return $this;
    }

    public function kinf_B($kinf_B): CampReactionTroeBuilder {
        $this->kinf_B_ = $kinf_B;
        return $this;
    }

    public function kinf_C($kinf_C): CampReactionTroeBuilder {
        $this->kinf_C_ = $kinf_C;
        return $this;
    }

    public function Fc($Fc): CampReactionTroeBuilder {
        $this->Fc_ = $Fc;
        return $this;
    }

    public function N($N): CampReactionTroeBuilder {
        $this->N_ = $N;
        return $this;
    }

    public function build( ): CampReactionTroe {
        return new class($this->reactants_, $this->products_, $this->k0_A_,
            $this->k0_B_, $this->k0_C_, $this->kinf_A_, $this->kinf_B_,
            $this->kinf_C_, $this->Fc_, $this->N_) extends CampReactionTroe {
            public function __construct(array $reactants, array $products,
                $k0_A, $k0_B, $k0_C, $kinf_A, $kinf_B, $kinf_C, $Fc, $N) {
                parent::__construct($reactants, $products, $k0_A, $k0_B, $k0_C,
                    $kinf_A, $kinf_B, $kinf_C, $Fc, $N);
            }
        };
    }
}
?>
