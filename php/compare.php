<?php 


include('config.php');

switch($_GET['action'])  {
//switch('compare_branch_branch')  { // testing :  php < thisfile.php
    case 'compare_branch_branch' :
            compare_branch_branch();
            break;

}

function compare_branch_branch() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $branch_0_id          = 19;
    $branch_1_id          = 21;
    //$branch_0_id          = $data->branch_0_id;  
    //$branch_1_id          = $data->branch_1_id;  

    $result = pg_prepare($con, "get_reaction_ids_unique_to_0", 
            "SELECT br.reaction_id, r.branch_id
            FROM branchreactions AS br
            WHERE br.branch_id = $1
            WHERE br.branch_id <>$2 ; ");
    $unique_to_0 = pg_execute($con,"get_reaction_ids_unique_to_0",array($branch_0_id,$branch_1_id));

    while ($reaction = pg_fetch_array($unique_to_0,NULL, PGSQL_ASSOC)) {
      $row_array['branch_id'] = $reaction['branch_id'];
      $row_array['branch_id'] = $reaction['branch_id'];


}

function rest_of_comparison(){

    $result = pg_prepare($con, "get_all_reactions_unique_to_0", 
            "SELECT r.id, r.label, r.cph, r.r1, r.r2, r.r3, r.r4, r.r5, r.obsolete, r.group_id, g.ordering 
            FROM reactions AS r
            INNER JOIN reaction_groups AS g 
            INNER JOIN branchreactions AS br
            ON br.reaction_id=r.id
            ON g.id=r.group_id ORDER BY ordering, label 
            WHERE br.reaction_id = $1 ;");

    $result = pg_prepare($con, "get_reactions_products", 
            "SELECT pp.moleculename, pp.coefficient FROM reactionproducts pp WHERE pp.reaction_id = $1;");

    $result = pg_prepare($con, "get_reactions_reactants", 
            "SELECT moleculename FROM reactionreactants WHERE reaction_id = $1;");

    $result = pg_prepare($con, "get_branches_for_reaction", 
            "SELECT br.name FROM branchreactions AS p, branches AS br WHERE br.id = p.branch_id AND p.reaction_id = $1 ORDER BY br.name;");

    $json_response = array();

    // list of reactions
    $chemistryreactions = pg_execute($con, "get_all_reactions_unique_to_0", array($branch_0_id));
    while ($reaction = pg_fetch_array($chemistryreactions,NULL, PGSQL_ASSOC)) {
      $row_array['id'] = $reaction['id'];
      $row_array['label'] = $reaction['label'];
      $row_array['cph'] = $reaction['cph'];
      $row_array['r1'] = $reaction['r1'];
      $row_array['r2'] = $reaction['r2'];
      $row_array['r3'] = $reaction['r3'];
      $row_array['r4'] = $reaction['r4'];
      $row_array['r5'] = $reaction['r5'];
      $row_array['rateString'] = '';
      $row_array['obsolete'] = ($reaction['obsolete'] === 't') ;
      $row_array['reactantArray'] = array();
      $row_array['reactantString'] = '';
      $row_array['productArray'] = array();
      $row_array['productString'] = '';
      $row_array['branchArray'] = array();
      $row_array['branchString'] = '';
      $row_array['group_id'] = $reaction['group_id'];

      // construct rateString from rates  (filter out null values)
      $row_array['rateString'] = implode(", ",array_filter( array($reaction['r1'], $reaction['r2'], $reaction['r3'], $reaction['r4'], $reaction['r5']) ) );
      
      // list of branches for a given reaction
      $branchlist = pg_execute($con, "get_branches_for_reaction", array($reaction['id']));
      while ($branch = pg_fetch_array($branchlist)) {
          array_push($row_array['branchArray'] ,$branch[0]);
      }
      $row_array['branchString'] = implode(" ",$row_array['branchArray']);

      // reactants for each reaction -- for cesm there are no coefficients
      $reactionreactants = pg_execute($con, "get_reactions_reactants", array($reaction['id']));
      while ($reactant = pg_fetch_array($reactionreactants)) {
          array_push($row_array['reactantArray'],$reactant['moleculename']);
      }
      $row_array['reactantString']= implode(' + ',$row_array['reactantArray']);

      // products and coefficients for each reaction
      $reactionproducts = pg_execute($con, "get_reactions_products", array($reaction['id']));
      $cumul_string = [];
      while ($product = pg_fetch_array($reactionproducts)) {
          array_push($row_array['productArray'],array($product['coefficient'],$product['moleculename']));
          if ($product['coefficient']) {
              $cumul_string[] = $product['coefficient']."*".$product['moleculename'];
          } else {
              $cumul_string[] = $product['moleculename'];
          }
      }
      $row_array['productString']= implode(' + ',$cumul_string) ;

      array_push($json_response,$row_array);
   }
   echo json_encode($json_response);
}


?>
