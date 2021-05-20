<?php

include_once("CampReaction.php");

//
// Generator of CAMP configuration data for Wennberg NO + RO2  reactions
//
//   A(T,[M],n) = 2e-22 exp(n) [M] / ( 1 + 2e-22 exp(n) [M] / (0.43 (T/298)^-8) )
//                 * 0.41^( 1 + ( 1/N ( log10( 2e-22 exp(n) [M] / (0.43 (T/298)^-8) ) )^2 )^-1 )
//
//   Z( a_0, n ) = A( 293 K, 2.45e19 #/cc, n ) * ( 1 - a_0 ) / a_0
//
//   k_nitrate = X exp(-Y/T) ( A(T,[M],n) / ( A(T,[M],n) + Z ) )
//   k_alkoxy  = X exp(-Y/T) ( Z / ( Z + A(T,[M],n) ) )
//
class CampReactionWennbergNoRo2 extends CampReaction
{
    protected $reactants_;
    protected $nitrate_products_;
    protected $alkoxy_products_;
    protected $X_;
    protected $Y_;
    protected $a0_;
    protected $n_;

    protected function __construct(array $reactants, array $nitrate_products,
        $alkoxy_products, $X, $Y, $a0, $n) {
        $this->reactants_         = $reactants;
        $this->nitrate_products_  = $nitrate_products;
        $this->alkoxy_products_   = $alkoxy_products;
        $this->X_                 = $X;
        $this->Y_                 = $Y;
        $this->a0_                = $a0;
        $this->n_                 = $n;
    }

    // Concrete builder
    public static function builder( ): CampReactionWennbergNoRo2Builder {
        return new class extends CampReactionWennbergNoRo2Builder {
            public function __construct( ) {
                parent::__construct( );
            }
        };
    }

    // Music box reaction name
    protected function getReactionType( ): string {
        return "WENNBERG_NO_RO2";
    }

    // Returns the CAMP configuration json object for the reaction
    // as a string with the specified indent.
    public function getCampConfiguration(int $indent = 0): string {
        $prefix = "";
        for($i = 0; $i < $indent; ++$i) $prefix .= " ";
        $config  = $prefix."{\n";
        $config .= $prefix."  \"type\": \"".$this->getReactionType( )."\",\n";
        $config .= $prefix."  \"X\": ". sprintf( '%lg', $this->X_ ). ",\n";
        $config .= $prefix."  \"Y\": ". sprintf( '%lg', $this->Y_ ). ",\n";
        $config .= $prefix."  \"a0\": ".sprintf( '%lg', $this->a0_ ).",\n";
        $config .= $prefix."  \"n\": ". sprintf( '%lg', $this->n_ ). ",\n";
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
        $config .= $prefix."  \"nitrate products\": {\n";
        $product_strings = array( );
        foreach($this->nitrate_products_ as $name => $props) {
            if($props['yield'] == 1) {
                $product_strings[] = $prefix."    \"".$name."\": { }";
            } else {
                $product_strings[] = $prefix."    \"".$name."\": { \"yield\": "
                                      .$props['yield']." }";
            }
        }
        $config .= implode(",\n", $product_strings);
        $config .= "\n".$prefix."  },\n";
        $config .= $prefix."  \"alkoxy products\": {\n";
        $product_strings = array( );
        foreach($this->alkoxy_products_ as $name => $props) {
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
        $T = $environment[ 'temperature' ];
        $M = $environment[ 'M' ];
        $base_rate = $this->X_ * exp( -$this->Y_ / $T );
        $A = $this->getA( $T, $M, $this->n_ );
        $Z = $this->getA( 293.0, 2.45e19, $this->n_ ) * (1.0 - $this->a0_) / $this->a0_;
        if( $label == '' ) {
            return $base_rate;
        } else if( $label == 'nitrate' ) {
            return $base_rate * $A / ($A + $Z);
        } else if( $label == 'alkoxy' ) {
            return $base_rate * $Z / ($Z + $A);
        }
        echo "Unknown Wennberg NO RO2 rate label: '".$label."'";
        assert( false );
    }

    // Returns A(T,[M],n)
    private function getA($T, $M, $n) {
        $k0M = 2e-22 * exp($n) * $M;
        $kinf = 0.43 * pow( ($T/298.0), -8 );
        return $k0M / (1.0 + $k0M/$kinf) * pow( 0.41, 1.0 / ( 1.0 + pow( log10($k0M/$kinf), 2 ) ) );
    }
}

// Abstract builder
abstract class CampReactionWennbergNoRo2Builder
{
    protected const kBoltzmann_ = 1.380649e-23; // Boltzmann constant [J/K]
    protected $reactants_        = array( );
    protected $nitrate_products_ = array( );
    protected $alkoxy_products_  = array( );
    protected $X_                = 1.0;
    protected $Y_                = 0.0;
    protected $a0_               = 1.0;
    protected $n_                = 1.0;

    protected function __construct( ){ }

    public function reactants(array $reactants): CampReactionWennbergNoRo2Builder {
        $this->reactants_ = $reactants;
        foreach($this->reactants_ as $reactant => $props) {
            if(!array_key_exists('qty', $props) || is_null($props['qty'])) {
                $this->reactants_[$reactant]['qty'] = 1;
            }
        }
        return $this;
    }

    public function nitrate_products(array $products): CampReactionWennbergNoRo2Builder {
        $this->nitrate_products_ = $products;
        foreach($this->nitrate_products_ as $product => $props) {
            if(!array_key_exists('yield', $props) || is_null($props['yield'])) {
                $this->nitrate_products_[$product]['yield'] = 1;
            }
        }
        return $this;
    }

    public function alkoxy_products(array $products): CampReactionWennbergNoRo2Builder {
        $this->alkoxy_products_ = $products;
        foreach($this->alkoxy_products_ as $product => $props) {
            if(!array_key_exists('yield', $props) || is_null($props['yield'])) {
                $this->alkoxy_products_[$product]['yield'] = 1;
            }
        }
        return $this;
    }

    public function X($X): CampReactionWennbergNoRo2Builder {
        $this->X_ = $X;
        return $this;
    }

    public function Y($Y): CampReactionWennbergNoRo2Builder {
        $this->Y_ = $Y;
        return $this;
    }

    public function a0($a0): CampReactionWennbergNoRo2Builder {
        $this->a0_ = $a0;
        return $this;
    }

    public function n($n): CampReactionWennbergNoRo2Builder {
        $this->n_ = $n;
        return $this;
    }

    public function build( ): CampReactionWennbergNoRo2 {
        return new class($this->reactants_, $this->nitrate_products_,
            $this->alkoxy_products_, $this->X_, $this->Y_, $this->a0_,
            $this->n_) extends CampReactionWennbergNoRo2 {
            public function __construct(array $reactants, array $nitrate_products,
                $alkoxy_products, $X, $Y, $a0, $n) {
                    parent::__construct($reactants, $nitrate_products,
                        $alkoxy_products, $X, $Y, $a0, $n);
            }
        };
    }
}
?>
