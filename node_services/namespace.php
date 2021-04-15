<?php

include('../php/config.php'); 

    global $con;
 
    $namespace["comment"]=array();
    array_push($namespace["comment"],"Some of the namespaces used in chemistry");
    array_push($namespace["comment"],"species are also known as molecules or constituents");
    array_push($namespace["comment"],"units for species inside chemistry will be molecules/cm^3");
    array_push($namespace["comment"],"photoDecomposition has prefix of j_ or jr_ and postfixes of _a, _b, _c etc");
    array_push($namespace["comment"],"reactionLabel has prefix of k_ or kr_ and postfixes of _a, _b, _c etc");
    array_push($namespace["comment"],"families namespaces are a combination of any two of the names listed (or Ox) joined with an '_' and and IRR_ as a prefix");

    $result = pg_prepare($con, "get_all_species_names",
            "select name,description from molecules;");

    $species = pg_execute($con, "get_all_species_names", array());
    $species_list = array();
    while ($specie = pg_fetch_array($species, NULL, PGSQL_ASSOC))
    {
        $row_array =  $specie;
        array_push($species_list, $row_array);
    }
    $namespace["species"]=$species_list;
    
    $result = pg_prepare($con, "photolysis", "select distinct moleculename from photolysis;");
    $photodecompmolecules = pg_execute($con,"photolysis", array());
    $decomp_list = array();
    while ($decomp = pg_fetch_array($photodecompmolecules, NULL, PGSQL_ASSOC))
    {
        array_push($decomp_list,$decomp["moleculename"]);
    }
    $namespace["photoDecomposition"]=$decomp_list;


    $result = pg_prepare($con, "reactionReactants", "select moleculename from reactionreactants where reaction_id = $1");

    $result = pg_prepare($con, "reactions", "select id from reactions");
    $reaction_result = pg_execute($con,"reactions", array());
    $reaction_label=array();
    while ($reaction_id = pg_fetch_array($reaction_result, NULL, PGSQL_ASSOC))
    {
      $id = $reaction_id["id"];
      $reactant_result = pg_execute($con,"reactionReactants", array($id));
      $rr = array();
      $troe = false;
      while($reactants = pg_fetch_array($reactant_result)){
        $r = $reactants["moleculename"];
        if($r != "M") {
            array_push($rr, $r);
        } else {
            $troe = true;
        }
      }
      sort($rr);
      $string = implode("_",$rr);
      if(  $troe ){ $string = $string . "_M"; };
      if( strlen($string) > 0){
        array_push($reaction_label,$string);
      }
    } 
    $namespace["reactionLabel"]=$reaction_label;

    $result = pg_prepare($con, "families", "select name,description from families");
    $families = pg_execute($con,"families", array());
    $family_array = array();
    while ($family = pg_fetch_array($families, NULL, PGSQL_ASSOC))
    {
      $name=$family["name"];
      $description=$family["description"];
      array_push($family_array,$family);

    }
    $namespace["families"]=$family_array;


    print json_encode($namespace,JSON_PRETTY_PRINT);
