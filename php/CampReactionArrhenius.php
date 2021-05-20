<?php

include_once("CampReaction.php");

//
// Generator of CAMP configuration data for Arrhenius reactions
//
//   k = A * exp( -E_a / ( k_B * T ) ) * ( T / D )^B * ( 1 + E * P )
//
class CampReactionArrhenius extends CampReaction
{
    protected const kBoltzmann_ = 1.380649e-23; // Boltzmann constant [J/K]
    private $reactants_;
    private $products_;
    private $A_;
    private $B_;
    private $D_;
    private $E_;
    private $Ea_;

    protected function __construct(array $reactants, array $products, $A,
        $B, $D, $E, $Ea) {
        $this->reactants_ = $reactants;
        $this->products_  = $products;
        $this->A_         = $A;
        $this->B_         = $B;
        $this->D_         = $D;
        $this->E_         = $E;
        $this->Ea_        = $Ea;
    }

    // Concrete builder
    public static function builder( ): CampReactionArrheniusBuilder {
        return new class extends CampReactionArrheniusBuilder {
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
        $config .= $prefix."  \"type\": \"ARRHENIUS\",\n";
        if($this->A_  != 1)   $config .= $prefix."  \"A\": ". sprintf( '%lg', $this->A_ ).",\n";
        if($this->B_  != 0)   $config .= $prefix."  \"B\": ". sprintf( '%lg', $this->B_ ).",\n";
        if($this->D_  != 300) $config .= $prefix."  \"D\": ". sprintf( '%lg', $this->D_ ).",\n";
        if($this->E_  != 0)   $config .= $prefix."  \"E\": ". sprintf( '%lg', $this->E_ ).",\n";
        if($this->Ea_ != 0)   $config .= $prefix."  \"Ea\": ".sprintf( '%lg', $this->Ea_).",\n";
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
            exp( -$this->Ea_ / ( self::kBoltzmann_ *
                                 $environment[ 'temperature' ] ) ) *
               pow( $environment[ 'temperature' ] / $this->D_, $this->B_ ) *
               ( 1 + $this->E_ * $environment[ 'pressure' ] );
        foreach($this->reactants_ as $reactant => $props) {
            for($i = 0; $i < $props['qty']; ++$i) {
                $rate *= $environment[ $reactant ];
            }
        }
        return $rate;
    }
}

// Abstract builder
abstract class CampReactionArrheniusBuilder
{
    protected const kBoltzmann_ = 1.380649e-23; // Boltzmann constant [J/K]
    protected $reactants_ = array( );
    protected $products_ = array( );
    protected $A_ = 1.0;
    protected $B_ = 0.0;
    protected $D_ = 300.0;
    protected $E_ = 0.0;
    protected $Ea_ = 0.0;

    protected function __construct( ){ }

    public function reactants(array $reactants): CampReactionArrheniusBuilder {
        $this->reactants_ = $reactants;
        foreach($this->reactants_ as $reactant => $props) {
            if(!array_key_exists('qty', $props) || is_null($props['qty'])) {
                $this->reactants_[$reactant]['qty'] = 1;
            }
        }
        return $this;
    }

    public function products(array $products): CampReactionArrheniusBuilder {
        $this->products_ = $products;
        foreach($this->products_ as $product => $props) {
            if(!array_key_exists('yield', $props) || is_null($props['yield'])) {
                $this->products_[$product]['yield'] = 1;
            }
        }
        return $this;
    }

    public function A($A): CampReactionArrheniusBuilder {
        $this->A_ = $A;
        return $this;
    }

    public function B($B): CampReactionArrheniusBuilder {
        $this->B_ = $B;
        return $this;
    }

    public function C($C): CampReactionArrheniusBuilder {
        $this->Ea_ = - $C * self::kBoltzmann_;
        return $this;
    }

    public function D($D): CampReactionArrheniusBuilder {
        $this->D_ = $D;
        return $this;
    }

    public function E($E): CampReactionArrheniusBuilder {
        $this->E_ = $E;
        return $this;
    }

    public function Ea($Ea): CampReactionArrheniusBuilder {
        $this->Ea_ = $Ea;
        return $this;
    }

    public function build( ): CampReactionArrhenius {
        return new class($this->reactants_, $this->products_, $this->A_,
            $this->B_, $this->D_, $this->E_, $this->Ea_) extends
            CampReactionArrhenius {
            public function __construct(array $reactants, array $products,
                $A, $B, $D, $E, $Ea) {
                parent::__construct($reactants, $products, $A, $B, $D, $E, $Ea);
            }
        };
    }
}
?>
