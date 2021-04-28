<?php

include_once("CampReaction.php");

//
// Generator of CAMP configuration data for Wennberg tunneling reactions.
// See eq (12) in:
// Paul O. Wennberg et al. “Gas-Phase Reactions of Isoprene and Its Major
//    Oxidation Products”. In: Chemical Reviews 118.7 (2018). PMID: 29522327,
//    pp. 3337–3390. doi: 10.1021/acs.chemrev.7b00439.
//    eprint: https://doi.org/10.1021/acs.chemrev.7b00439.
//    url: https://doi.org/10.1021/acs.chemrev.7b00439.
//
//   k_tunneling = A * exp( -B / T ) * exp( C / T^3 )
//
class CampReactionWennbergTunneling extends CampReaction
{
    protected const kBoltzmann_ = 1.380649e-23; // Boltzmann constant [J/K]
    private $reactants_;
    private $products_;
    private $A_;
    private $B_;
    private $C_;

    protected function __construct(array $reactants, array $products, $A,
        $B, $C) {
        $this->reactants_ = $reactants;
        $this->products_  = $products;
        $this->A_         = $A;
        $this->B_         = $B;
        $this->C_         = $C;
    }

    // Concrete builder
    public static function builder( ): CampReactionWennbergTunnelingBuilder {
        return new class extends CampReactionWennbergTunnelingBuilder {
            public function __construct( ) {
                parent::__construct( );
            }
        };
    }

    // Returns the CAMP configuration json object for the reaction
    // as a string with the specified indent.
    public function getCampConfiguration(int $indent = 0): string {
        $prefix = "";
        for($i = 0; $i < $indent; ++$i) $prefix .= " ";
        $config  = $prefix."{\n";
        $config .= $prefix."  \"type\": \"WENNBERG_TUNNELING\",\n";
        $config .= $prefix."  \"A\": ". $this->A_. ",\n";
        $config .= $prefix."  \"B\": ". $this->B_. ",\n";
        $config .= $prefix."  \"C\": ". $this->C_. ",\n";
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
        $rate = $this->A_ *
            exp( -$this->B_ / $environment[ 'temperature' ] ) *
            exp(  $this->C_ / pow( $environment[ 'temperature' ], 3 ) );
        foreach($this->reactants_ as $reactant => $props) {
            for($i = 0; $i < $props['qty']; ++$i) {
                $rate *= $environment[ $reactant ];
            }
        }
        return $rate;
    }
}

// Abstract builder
abstract class CampReactionWennbergTunnelingBuilder
{
    protected const kBoltzmann_ = 1.380649e-23; // Boltzmann constant [J/K]
    protected $reactants_ = array( );
    protected $products_ = array( );
    protected $A_ = 1.0;
    protected $B_ = 0.0;
    protected $C_ = 0.0;

    protected function __construct( ){ }

    public function reactants(array $reactants): CampReactionWennbergTunnelingBuilder {
        $this->reactants_ = $reactants;
        foreach($this->reactants_ as $reactant => $props) {
            if(!array_key_exists('qty', $props) || is_null($props['qty'])) {
                $this->reactants_[$reactant]['qty'] = 1;
            }
        }
        return $this;
    }

    public function products(array $products): CampReactionWennbergTunnelingBuilder {
        $this->products_ = $products;
        foreach($this->products_ as $product => $props) {
            if(!array_key_exists('yield', $props) || is_null($props['yield'])) {
                $this->products_[$product]['yield'] = 1;
            }
        }
        return $this;
    }

    public function A($A): CampReactionWennbergTunnelingBuilder {
        $this->A_ = $A;
        return $this;
    }

    public function B($B): CampReactionWennbergTunnelingBuilder {
        $this->B_ = $B;
        return $this;
    }

    public function C($C): CampReactionWennbergTunnelingBuilder {
        $this->C_ = $C;
        return $this;
    }

    public function build( ): CampReactionWennbergTunneling {
        return new class($this->reactants_, $this->products_, $this->A_,
            $this->B_, $this->C_) extends CampReactionWennbergTunneling {
            public function __construct(array $reactants, array $products,
                $A, $B, $C) {
                parent::__construct($reactants, $products, $A, $B, $C);
            }
        };
    }
}
?>
