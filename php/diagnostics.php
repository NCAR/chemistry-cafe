<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_reactions_and_diag_coeffs')  {
    case 'get_all_diagnostics' :
            get_all_diagnostics();
            break;

    case 'get_sdiag' :
            get_sdiag();
            break;

    case 'ins_sdiag' :
            ins_sdiag();
            break;

    case 'mod_sdiag' :
            mod_sdiag();
            break;

    case 'get_rdiag' :
            get_rdiag();
            break;

    case 'ins_rdiag' :
            ins_rdiag();
            break;

    case 'mod_rdiag' :
            mod_rdiag();
            break;

    case 'get_reactions_and_diag_coeffs' :
            get_reactions_and_diag_coeffs();
            break;

    case 'get_photolysis_and_diag_coeffs' :
           get_photolysis_and_diag_coeffs();
           break;

    case 'set_kinetic_rdiag_coeff' :
           set_kinetic_rdiag_coeff();
           break;

    case 'set_photolysis_rdiag_coeff' :
           set_photolysis_rdiag_coeff();
           break;
}


function IsEmptyString($val){
    if (trim($val) === ''){$val = NULL;}
    return $val;
}


function get_all_diagnostics() {
    global $con;

    $diags['sdiags'] = array();

    /**  Species-level diagnostics such as VOC + OH **/
    $sql_q="
        SELECT sd.id, sd.name, sd.species_id, sd.family_id, sd.species_id2, sd.family_id2,
               sp1.name as sp1name, fm1.name as fm1name, sp2.name as sp2name, fm2.name as fm2name
        FROM sdiags AS sd
        LEFT JOIN molecules AS sp1
        ON sp1.id=sd.species_id
        LEFT JOIN molecules AS sp2
        ON sp2.id=sd.species_id2
        LEFT JOIN families AS fm1
        ON fm1.id=sd.family_id
        LEFT JOIN families AS fm2
        ON fm2.id=sd.family_id2
        ";

    $sdiags = pg_query($con, $sql_q);

    while($diag = pg_fetch_assoc($sdiags))
    {
       $diags['sdiags'][] = $diag;
    }

    /** Reaction-level diagnostics **/
    $sql_q="
        SELECT rd.id, rd.name, rd.cesm_namelist, rd.formula
        FROM rdiags AS rd
        ";
    $rdiags = pg_query($con, $sql_q);

    $diags['rdiags'] = array();
    while($diag = pg_fetch_assoc($rdiags))
    {
        $diags['rdiags'][] = $diag;
    }

    print_r(json_encode($diags));
    return json_encode($diags);
}

/**  Function to populate the form so that this diagnostics can be edited**/
/**  get a diagnostics by name **/
function get_sdiag() {    
    global $con;

    $data = json_decode(file_get_contents("php://input"));     
    $id = $data->id;

    $sql_q="
        SELECT sd.id, sd.name, sd.species_id, sd.family_id, sd.species_id2, sd.family_id2,
               sp1.name as sp1name, fm1.name as fm1name, sp2.name as sp2name, fm2.name as fm2name
        FROM sdiags AS sd
        LEFT JOIN molecules AS sp1
        ON sp1.id=sd.species_id
        LEFT JOIN molecules AS sp2
        ON sp2.id=sd.species_id2
        LEFT JOIN families AS fm1
        ON fm1.id=sd.family_id
        LEFT JOIN families AS fm2
        ON fm2.id=sd.family_id2
        WHERE sd.id=$1
        ";

    $qry = pg_query_params($con, $sql_q ,array($id));
    $res = array();
    if($row = pg_fetch_assoc($qry))
    {
        $res = $row;
    }

    print_r(json_encode($res));
    return json_encode($res);  
}

function ins_sdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $species_id = IsEmptyString($data->species_id);
    $family_id = IsEmptyString($data->family_id);
    $species_id2 = IsEmptyString($data->species_id2);
    $family_id2 = IsEmptyString($data->family_id2);

    $sql_q="
        INSERT INTO sdiags (name, species_id, family_id, species_id2, family_id2)
        VALUES ($1,$2,$3,$4,$5) 
        RETURNING id";

    $vals = array($name, $species_id, $family_id, $species_id2, $family_id2);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}

function mod_sdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $species_id = IsEmptyString($data->species_id);
    $family_id = IsEmptyString($data->family_id);
    $species_id2 = IsEmptyString($data->species_id2);
    $family_id2 = IsEmptyString($data->family_id2);

    $sql_q="
        UPDATE sdiags
        SET name=$1,species_id=$2,family_id=$3,species_id2=$4,family_id2=$5
        WHERE id=$6";

    $vals = array($name, $species_id, $family_id, $species_id2, $family_id2,$id);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}



function get_rdiag() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $sql_q="
        SELECT rd.id, rd.name, rd.cesm_namelist, rd.formula
        FROM rdiags AS rd
        WHERE rd.id=$1
        ";

    $qry = pg_query_params($con, $sql_q ,array($id));
    $res = array();
    if($row = pg_fetch_assoc($qry))
    {
        $res = $row;
    }

    print_r(json_encode($res));
    return json_encode($res);
}

function ins_rdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $cesm_namelist = $data->cesm_namelist;
    $formula = $data->formula;

    $sql_q="
        INSERT INTO rdiags (name, cesm_namelist, formula)
        VALUES ($1,$2,$3)
        RETURNING id";

    $vals = array($name, $cesm_namelist);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}

function mod_rdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $cesm_namelist = $data->cesm_namelist;
    $formula = $data->formula;

    $sql_q="
        UPDATE rdiags
        SET name=$1,cesm_namelist=$2, formula=$3
        WHERE id=$4";

    $vals = array($name, $cesm_namelist, $formula,$id);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}


function get_photolysis_and_diag_coeffs(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $rdiag_id = $data->rdiag_id;

    $result = pg_prepare($con, "get_all_photolysis",
           "SELECT p.id, pr.coefficient, p.rate, p.moleculename, p.obsolete, p.group_id, g.ordering
            FROM photolysis AS p 
            LEFT JOIN photolysis_rdiags as pr ON pr.photolysis_id=p.id AND pr.rdiags_id=$1
            INNER JOIN photolysis_groups AS g 
            ON g.id=p.group_id 
            WHERE p.obsolete is false
            ORDER BY g.ordering ASC, p.moleculename ASC;");

    $result = pg_prepare($con, "get_photolysis_products", 
           "SELECT pp.moleculename, pp.coefficient FROM photolysisproducts pp WHERE pp.photolysisid = $1;");

    $json_response = array();

    // list of reactions
    $photolysisreactions = pg_execute($con, "get_all_photolysis", array($rdiag_id));
    while ($reaction = pg_fetch_array($photolysisreactions)) {
      $row_array['id'] = $reaction['id'];
      $row_array['rate'] = $reaction['rate'];
      $row_array['molecule'] = $reaction['moleculename'];
      $row_array['productArray'] = array();
      $row_array['productString'] = '';
      $row_array['group_id'] = $reaction['group_id'];
      $row_array['coefficient'] = $reaction['coefficient'];

      // products and coefficients for each reaction
      $photolysisproducts = pg_execute($con, "get_photolysis_products", array($reaction['id']));

      while ($product = pg_fetch_array($photolysisproducts)) {
          array_push($row_array['productArray'],($product['coefficient']." ".$product['moleculename']));
      }

      $row_array['productString']=implode(' + ',$row_array['productArray']) ;

      array_push($json_response,$row_array);
   }
   echo json_encode($json_response);

}

function get_reactions_and_diag_coeffs(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $rdiag_id = $data->rdiag_id;

    // get all reactions that are not obsolete and then attach coefficient field for this particular diag
    $result = pg_prepare($con, "get_all_reactions",
            "SELECT r.id, rr.coefficient, r.label, r.cph, r.r1, r.r2, r.r3, r.r4, r.r5, r.obsolete, r.group_id, g.ordering, g.description as section, r.wrf_custom_rate_id
            FROM reactions AS r
            INNER JOIN reaction_groups AS g ON g.id=r.group_id 
            LEFT JOIN reaction_rdiags as rr ON rr.reaction_id=r.id AND rr.rdiags_id=$1
            WHERE r.obsolete is false 
            ORDER BY ordering, label ;");

    $result = pg_prepare($con, "get_reactions_products",
            "SELECT pp.moleculename, pp.coefficient FROM reactionproducts pp WHERE pp.reaction_id = $1;");

    $result = pg_prepare($con, "get_reactions_reactants",
            "SELECT moleculename FROM reactionreactants WHERE reaction_id = $1;");

    $result = pg_prepare($con, "get_branches_for_reaction",
            "SELECT br.name, br.id FROM branchreactions AS p, branches AS br WHERE br.id = p.branch_id AND p.reaction_id = $1 ORDER BY br.name;");

    $result = pg_prepare($con, "get_tags_for_reaction",
            "SELECT t.given_name, t.id FROM tag_reactions AS tr, tags AS t WHERE t.id = tr.tag_id AND tr.reaction_id = $1 ORDER BY t.id;");

    $json_response = array();

    // list of reactions
    $chemistryreactions = pg_execute($con, "get_all_reactions", array($rdiag_id));
    while ($reaction = pg_fetch_array($chemistryreactions, NULL, PGSQL_ASSOC)) {
      $row_array['id'] = $reaction['id'];
      $row_array['label'] = $reaction['label'];
      $row_array['cph'] = $reaction['cph'];
      $row_array['r1'] = $reaction['r1'];
      $row_array['r2'] = $reaction['r2'];
      $row_array['r3'] = $reaction['r3'];
      $row_array['r4'] = $reaction['r4'];
      $row_array['r5'] = $reaction['r5'];
      $row_array['wrf_custom_rate_id'] = $reaction['wrf_custom_rate_id'];
      $row_array['rateString'] = '';
      $row_array['reactantArray'] = array();
      $row_array['reactantString'] = '';
      $row_array['productArray'] = array();
      $row_array['productString'] = '';
      $row_array['coefficient'] = $reaction['coefficient'];

      // construct rateString from rates  (filter out null values)
      $row_array['rateString'] = implode(", ",array_filter( array($reaction['r1'], $reaction['r2'], $reaction['r3'], $reaction['r4'], $reaction['r5']), 'strlen' ) );
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
   print_r( json_encode($json_response));

}

function set_kinetic_rdiag_coeff(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $rdiags_id = $data->rdiags_id;
    $coefficient = IsEmptyString($data->coefficient);
    $reaction_id = $data->reaction_id;


    // check if reaction has coefficient
    // if it does:set it to this value
    // if it doesns:insert this value
    $resultSet = pg_query_params($con, ' SELECT rr.id from reaction_rdiags AS rr where reaction_id = $1 and rdiags_id =$2 ',array($reaction_id,$rdiags_id));
    if( pg_num_rows($resultSet) > 0 )  {
        if ( $coefficient > 0 ){
            $res= pg_query_params($con, 'UPDATE reaction_rdiags SET coefficient=$3 WHERE reaction_id=$1 and rdiags_id=$2;',array($reaction_id,$rdiags_id,$coefficient));
            //print_r("updated");
        } else {
            $res= pg_query_params($con, 'DELETE FROM reaction_rdiags WHERE reaction_id= $1 and rdiags_id = $2;',array($reaction_id,$rdiags_id));
            //print_r("deleted");
       }
    } else {
        if( $coefficient > 0){
            $res= pg_query_params($con, 'INSERT INTO reaction_rdiags (coefficient,reaction_id, rdiags_id) VALUES ($3, $1, $2);',array($reaction_id,$rdiags_id,$coefficient));
            //print_r("added");
        } else { 
            //print_r("Nothing Done");
        }
    }
    $result = pg_query_params($con,
            "SELECT rr.coefficient
            FROM reactions AS r
            LEFT JOIN reaction_rdiags as rr ON rr.reaction_id=r.id AND rr.rdiags_id=$1
            WHERE r.id = $2;"
            , array($rdiags_id,$reaction_id));
   if($row = pg_fetch_array($result)) {
       print_r( $row['coefficient']);
   } else {
       print_r( 'error' );
   }


}

function set_photolysis_rdiag_coeff(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $rdiags_id = $data->rdiags_id;
    $coefficient = IsEmptyString($data->coefficient);
    $photolysis_id = $data->photolysis_id;


    // check if reaction has coefficient
    // if it does:set it to this value
    // if it doesns:insert this value
    $resultSet = pg_query_params($con, ' SELECT pr.id from photolysis_rdiags AS pr where photolysis_id = $1 and rdiags_id =$2 ',array($photolysis_id,$rdiags_id));
    if( pg_num_rows($resultSet) > 0 )  {
        if ( $coefficient > 0 ){
            $res= pg_query_params($con, 'UPDATE photolysis_rdiags SET coefficient=$3 WHERE photolysis_id=$1 and rdiags_id=$2;',array($photolysis_id,$rdiags_id,$coefficient));
            //print_r("updated");
        } else {
            $res= pg_query_params($con, 'DELETE FROM photolysis_rdiags WHERE photolysis_id= $1 and rdiags_id = $2;',array($photolysis_id,$rdiags_id));
            //print_r("deleted");
       }
    } else {
        if( $coefficient > 0){
            $res= pg_query_params($con, 'INSERT INTO photolysis_rdiags (coefficient,photolysis_id, rdiags_id) VALUES ($3, $1, $2);',array($photolysis_id,$rdiags_id,$coefficient));
            //print_r("added");
        } else { 
            //print_r("Nothing Done");
        }
    }
    $result = pg_query_params($con,
            "SELECT pr.coefficient
            FROM photolysis AS p
            LEFT JOIN photolysis_rdiags as pr ON pr.photolysis_id=p.id AND pr.rdiags_id=$1
            WHERE p.id = $2;"
            , array($rdiags_id,$photolysis_id));
   if($row = pg_fetch_array($result)) {
       print_r( $row['coefficient']);
   } else {
       print_r( 'error' );
   }


}


?>
