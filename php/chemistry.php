<?php 


include('config.php');

switch($_GET['action'])  {
//switch('get_all_reactions')  { // testing :  php < thisfile.php
    case 'get_all_reactions' :
            get_all_reactions();
            break;

    case 'get_reaction_by_id' :
            get_reaction_by_id();
            break;

    case 'get_references_by_id' :
            get_references_by_id();
            break;

    case 'add_reaction' :
            add_reaction();
            break;

    case 'mod_reaction' :
            mod_reaction();
            break;

    case 'deprecate_reactions' :
            deprecate_reactions();
            break;

    case 'un_deprecate_reactions' :
            un_deprecate_reactions();
            break;

    case 'add_branchreaction' :
            add_branchreaction();  
            break;

    case 'del_branchreaction' :
            del_branchreaction();  
            break;

    case 'add_reaction_reference' :
            add_reaction_reference();
            break;

    case 'del_reaction_reference' :
            del_reaction_reference();
            break;

    case 'update_chemistry_group' :
            update_chemistry_group();
            break;

    case 'update_wrf_rate' :
            update_wrf_rate();
            break;

}

function productArrayToString($reactionproducts){
      $cumul_string = [];
      foreach($reactionproducts as $coeffproduct){
          if ($coeffproduct[0]) {
              $cumul_string[] = $coeffproduct[0]."*".$coeffproduct[1];
          } else {
              $cumul_string[] = $coeffproduct[1];
          }
      }
      return implode(' + ',$cumul_string) ;
}

function get_all_comments_for_reactions_id($id){
    global $con;
    $comments = pg_query($con, 
        "SELECT (u.initials || ' : ' || date(c.date - interval '7 hours') || ' : ' || c.note ) AS comment 
            FROM comments AS c 
            INNER JOIN users AS u 
            ON u.id=user_id 
            INNER JOIN reactioncomments AS pc
            ON pc.comment_id=c.id
            WHERE pc.reaction_id = ".$id.
            "ORDER BY c.date DESC;" );

    while($row = pg_fetch_array($comments))
    {
        $commentarray[]= $row['comment'];
    }
    return $commentarray;
}

function get_all_reactions() {

    //$data        = json_decode(file_get_contents("php://input"));
    //$nonobsolete = $data->nonobsolete;

    global $con;

    $result = pg_prepare($con, "get_all_reactions", 
           "SELECT r.id, r.label, r.cph, r.r1, r.r2, r.r3, r.r4, r.r5, r.obsolete, r.group_id, g.ordering, g.description as section, r.wrf_custom_rate_id, reaction_products(r.id) as productstring
            FROM reactions AS r
            INNER JOIN reaction_groups AS g 
            ON g.id=r.group_id 
            WHERE not r.obsolete
            ORDER BY ordering, label 
            ;");

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
    $chemistryreactions = pg_execute($con, "get_all_reactions", array());
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
      $row_array['obsolete'] = ($reaction['obsolete'] === 't') ;
      $row_array['reactantArray'] = array();
      $row_array['reactantString'] = '';
      $row_array['productString'] = $reaction['productstring'];
      $row_array['branchArray'] = array();
      $row_array['branchString'] = '';
      $row_array['branchIdArray'] = array();
      $row_array['tagIdArray'] = array();
      $row_array['section'] = $reaction['section'];
      $row_array['group_id'] = $reaction['group_id'];

      // construct rateString from rates  (filter out null values)
      $row_array['rateString'] = implode(", ",array_filter( array($reaction['r1'], $reaction['r2'], $reaction['r3'], $reaction['r4'], $reaction['r5']), 'strlen' ) );
      
      // list of branches for a given reaction
      $branchlist = pg_execute($con, "get_branches_for_reaction", array($reaction['id']));
      while ($branch = pg_fetch_array($branchlist)) {
          array_push($row_array['branchArray'] ,$branch['name']);
          array_push($row_array['branchIdArray'] ,$branch['id']);
      }
      $row_array['branchString'] = implode(" ",$row_array['branchArray']);

      $taglist = pg_execute($con, "get_tags_for_reaction", array($reaction['id']));
      while ($tag = pg_fetch_array($taglist)) {
          array_push($row_array['tagIdArray'] ,$tag['id']);
      }

      // reactants for each reaction -- for cesm there are no coefficients
      $reactionreactants = pg_execute($con, "get_reactions_reactants", array($reaction['id']));
      while ($reactant = pg_fetch_array($reactionreactants)) {
          array_push($row_array['reactantArray'],$reactant['moleculename']);
      }
      $row_array['reactantString']= implode(' + ',$row_array['reactantArray']);

      array_push($json_response,$row_array);
   }
   echo json_encode($json_response);
}


function get_reaction_by_id() {

    $data = json_decode(file_get_contents("php://input"));
    $id          = $data->id;  
    //$id          = 7945;

    global $con;

    $result = pg_prepare($con, "get_reactions_by_id", 
            "SELECT r.id, r.label, r.cph, r.r1, r.r2, r.r3, r.r4, r.r5, r.obsolete, r.group_id, g.ordering, g.description as section, r.wrf_custom_rate_id, reaction_products(r.id) as productstring
             FROM reactions AS r
             INNER JOIN reaction_groups AS g 
             ON g.id=r.group_id 
             WHERE r.id = $1;");
 
    $result = pg_prepare($con, "get_wrf_custom_rates_by_id", 
            "SELECT id, name, version, deprecated, code
             FROM wrf_custom_rates
             WHERE id = $1;");

    $result = pg_prepare($con, "get_reactions_products",
            "SELECT pp.moleculename, pp.coefficient FROM reactionproducts pp WHERE pp.reaction_id = $1;");

    $result = pg_prepare($con, "get_reactions_reactants",
            "SELECT moleculename FROM reactionreactants WHERE reaction_id = $1;");

    $result = pg_prepare($con, "get_branches_for_reaction",
            "SELECT br.name FROM branchreactions AS p, branches AS br WHERE br.id = p.branch_id AND p.reaction_id = $1 ORDER BY br.name;");

    // list of reactions
    $chemistryreactions = pg_execute($con, "get_reactions_by_id", array($id));

    while ($reaction = pg_fetch_array($chemistryreactions)) {
      $row_array['id'] = $reaction['id'];
      $row_array['label'] = $reaction['label'];
      $row_array['cph'] = $reaction['cph'];
      $row_array['r1'] = $reaction['r1'];
      $row_array['r2'] = $reaction['r2'];
      $row_array['r3'] = $reaction['r3'];
      $row_array['r4'] = $reaction['r4'];
      $row_array['r5'] = $reaction['r5'];
      $row_array['wrf_custom_rate_id'] = $reaction['wrf_custom_rate_id'];
      $row_array['section'] = $reaction['section'];
      $row_array['group_id'] = $reaction['group_id'];
      $row_array['rateString'] = '';
      $row_array['obsolete'] = ($reaction['obsolete'] === 't') ;
      $row_array['reactantArray'] = array();
      $row_array['reactantString'] = '';
      $row_array['productString'] = $reaction['productstring'];
      $row_array['branchArray'] = array();
      $row_array['branchString'] = '';

      $wcrlist = pg_execute($con, "get_wrf_custom_rates_by_id", array($row_array['wrf_custom_rate_id']));
      if ($wcr = pg_fetch_array($wcrlist)) {
          $row_array['wcrid'] =$wcr['id'];
          $row_array['wcrname'] =$wcr['name'];
          $row_array['wcrversion'] =$wcr['version'];
          $row_array['wcrdeprecated'] =$wcr['deprecated'];
          $row_array['wcrcode'] =$wcr['code'];
      }

      // construct rateString from rates
      $row_array['rateString'] = '';
      if (!is_null($row_array['r1'])) $row_array['rateString'] .= $row_array['r1'];
      if (!is_null($row_array['r2'])) $row_array['rateString'] .= ", ".$row_array['r2'];
      if (!is_null($row_array['r3'])) $row_array['rateString'] .= ", ".$row_array['r3'];
      if (!is_null($row_array['r4'])) $row_array['rateString'] .= ", ".$row_array['r4'];
      if (!is_null($row_array['r5'])) $row_array['rateString'] .= ", ".$row_array['r5'];


      // list of branches for a given reaction
      $branchlist = pg_execute($con, "get_branches_for_reaction", array($reaction['id']));
      if($branch = pg_fetch_array($branchlist)) {
          array_push($row_array['branchArray'] ,$branch[0]);
          $row_array['branchString'] = $branch[0];
      }
      while ($branch = pg_fetch_array($branchlist)) {
          array_push($row_array['branchArray'] ,$branch[0]);
          $row_array['branchString'] .= ' ' . $branch[0];
      }

      // reactants for each reaction -- for cesm there are no coefficients
      $reactionreactants = pg_execute($con, "get_reactions_reactants", array($reaction['id']));
      while ($reactant = pg_fetch_array($reactionreactants)) {
          array_push($row_array['reactantArray'],$reactant['moleculename']);
      }
      $row_array['reactantString']= implode(' + ',$row_array['reactantArray']);

      $row_array['previousComments'] = get_all_comments_for_reaction_id($reaction['id']);
   }
   echo json_encode($row_array);
}

function get_references_by_id(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $reaction_id  = $data->id;

    $references = array();

    $result = pg_query($con,
            "SELECT r.id, r.original_name, u.initials, r.doi, r.citation, r.detail, r.label, r.http FROM ref_files as r
             INNER JOIN users AS u ON u.id=r.user_id
             INNER JOIN reactions_references AS rr ON rr.reference_id=r.id
             WHERE rr.reaction_id=".$reaction_id."
             ORDER BY date DESC;" );

    while ($row = pg_fetch_array($result)) {
        $ref['id']=$row['id'];
        $ref['filename']=$row['original_name'];
        $ref['initials']=$row['initials'];
        $ref['doi']=$row['doi'];
        $ref['citation']=$row['citation'];
        $ref['label']=$row['label'];
        $ref['detail']=$row['detail'];
        $ref['http']=$row['http'];
        array_push($references, $ref);
    }

    echo json_encode($references);
}

function get_all_comments_for_reaction_id($id){
    global $con;
    $comments = pg_query($con,
        "SELECT (u.initials || ' : ' || date(c.date - interval '7 hours') || ' : ' || c.note ) AS comment 
            FROM comments AS c 
            INNER JOIN users AS u 
            ON u.id=user_id 
            INNER JOIN reactioncomments AS rc
            ON rc.comment_id=c.id
            WHERE rc.reaction_id = ".$id.
            "ORDER BY c.date DESC;" );

    while($row = pg_fetch_array($comments))
    {
        $commentarray[]= $row['comment'];
    }
    return $commentarray;
}


function mod_reaction  (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;

    $result = pg_prepare($con, "add_reaction", 
            "INSERT INTO reactions (label, cph, r1, r2, r3, r4, r5, group_id, wrf_custom_rate_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;"); 

    $result = pg_prepare($con, "add_reaction_reactant", 
            "INSERT INTO reactionreactants (reaction_id, moleculename) VALUES ($1, $2);");

    $result = pg_prepare($con, "add_reaction_product", 
            "INSERT INTO reactionproducts (reaction_id, moleculename, coefficient) VALUES ($1, $2, $3);");

    $result = pg_prepare($con, "add_branchreaction", 
            "INSERT INTO branchreactions (branch_id, reaction_id) SELECT id,$2 FROM branches WHERE name= $1;");

    $result = pg_prepare($con, "del_branchreaction", 
            "DELETE FROM branchreactions WHERE branch_id IN (SELECT id FROM branches WHERE name= $1) AND branchreactions.reaction_id = $2;");

    $result = pg_prepare($con, "add_reaction_comment", "INSERT INTO reactioncomments (reaction_id, comment_id) VALUES ($1, $2);");

    $data = json_decode(file_get_contents("php://input"));
    $oldpid        = $data ->oldpid;
    $branchArray   = $data ->branchArray;
    $group_id      = $data ->group_id;
    $label         = $data ->label;
    $r1            = $data ->r1;
    $r2            = $data ->r2;
    $r3            = $data ->r3;
    $r4            = $data ->r4;
    $r5            = $data ->r5;
    $wrf_custom_rate_id = $data ->wrf_custom_rate_id;
    $cph           = $data ->cph;
    $reactantArray = $data ->reactantArray;
    $productArray  = $data ->productArray;
    $newComment    = $data ->newComment;


    // prepare for transaction
    $safe_to_commit = true; 

    pg_query($con, "BEGIN;") or die("Could not start transaction\n");
    $out = "Begin Transaction, safe:".$safe_to_commit."\n";

    // add chemistry
    $out = $out . "label".$label." cph:".$cph." r1:".$r1." r2:".$r2." r3:".$r3." r4:".$r4." r5:".$r5."\n";
    //$out = $out . "add_reaction argument".json_encode(array($label, $cph, $r1, $r2, $r3, $r4, $r5))."\n";
    $result = pg_execute($con, "add_reaction", array($label, $cph, $r1, $r2, $r3, $r4, $r5, $group_id, $wrf_custom_rate_id));
    $new_reaction_id = pg_fetch_array($result)[0];
    //$new_reaction_id = $new_reaction[0];
    $safe_to_commit = $safe_to_commit && ($new_reaction_id > 0);
    //$out = $out . "safe".$safe_to_commit." new reaction with pid ".$new_reaction_id."\n";
    $out = $out . "safe".$safe_to_commit." new reaction with pid ".$new_reaction_id."\n";

    // add new comment
    $result = pg_prepare($con, "add_comment", "INSERT INTO comments (note, user_id) SELECT $1, id FROM users WHERE username = $2 RETURNING id;");
    $result = pg_execute($con, "add_comment", array($newComment, $_COOKIE['chemdb_id']) );
    $new_comment_id = pg_fetch_array($result)[0];
    //$new_comment_id = $new_comment_r[0];
    $safe_to_commit = $safe_to_commit && ($new_comment_id > 0);
    $out = $out . "safe".$safe_to_commit." new comment with id ".$new_comment_id."\n";

    // link new comment to new reaction_id
    $result = pg_execute($con, "add_reaction_comment", array($new_reaction_id, $new_comment_id));
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." comment added to new reaction \n";

    // link all previous comments to this new reaction
    $result = pg_prepare($con, "link_prev_comment", "INSERT INTO reactioncomments (reaction_id, comment_id) SELECT $1, comment_id FROM reactioncomments WHERE reaction_id = $2;");
    $result = pg_execute($con, "link_prev_comment", array($new_reaction_id, $oldpid));
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." old comments added to new reaction \n";

    // add reactionreactants
    $out = $out . "reactarr:".json_encode($reactantArray)."\n";
    foreach($reactantArray as $molecule){
        // add reactant
        $res = pg_execute ($con, "add_reaction_reactant", array($new_reaction_id, $molecule));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit." new reactant:".$reactant. ":\n";
    }

    // add reactionproducts
    $out = $out . "prodarr:".json_encode($productArray)."\n";
    foreach($productArray as $coeffproduct){
        // add photoproducts
        $res = pg_execute ($con, "add_reaction_product", array($new_reaction_id, $coeffproduct[1], $coeffproduct[0]));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit." new products, coeff:".$coeffproduct[0].":prod:".$coeffproduct[1]. ":\n";
    }

    foreach($branchArray as $branch){
        // add new reaction to branches
        $res = pg_execute($con, "add_branchreaction", array($branch,$new_reaction_id));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit."Add reaction ".$new_reaction_id." to branch ".$branch."\n";

        // remove old reaction from branches
        $res = pg_execute($con, "del_branchreaction", array($branch,$oldpid));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out ."safe".$safe_to_commit. "Removing reaction ".$oldpid." from branch ".$branch."\n";
    }

    //$safe_to_commit = false;
    if ($safe_to_commit){

        pg_query($con, "COMMIT") or die("Transaction commit failed\n");
        $out = "Commiting transaction\n". $out;

        // prepare data to log result
        $reactantString = implode('+',$reactantArray);
        $rate = " rates(".$r1.", ".$r2.", ".$r3.", ".$r4.", ".$r5.") ";
        $productString = productArrayToString($productArray);
        $change = "Mod [".$label."]  cph:".$cph." ,".$rate.$reactantString."->".$productString." Branches:".implode(' ',$branchArray);
        $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
        $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

    } else {
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
        $out = "ROLLBACK  transaction\n". $out;
    }
    echo json_encode($out);
}

function deprecate_reactions (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "mod_reaction_deprecate", 
            "UPDATE reactions SET obsolete=TRUE where id = $1;");

    $data = json_decode(file_get_contents("php://input"));
    $id= $data->reaction_id;

    $out = "deprecating id:".$id;
    $res = pg_execute ($con,"mod_reaction_deprecate", array($id));
    echo  $out;
}

function un_deprecate_reactions (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "mod_reaction_un_deprecate", 
            "UPDATE reactions SET obsolete=FALSE where id = $1;");

    $data = json_decode(file_get_contents("php://input"));
    $id= $data->reaction_id;

    $out = "undeprecating id:".$id;
    $res = pg_execute ($con,"mod_reaction_un_deprecate", array($id));
    echo  $out;
}


function add_reaction (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;

    $result = pg_prepare($con, "add_reaction",
            "INSERT INTO reactions (label, cph, r1, r2, r3, r4, r5, group_id, wrf_custom_rate_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;"); 

    $result = pg_prepare($con, "add_reaction_reactant",
            "INSERT INTO reactionreactants (reaction_id, moleculename) VALUES ($1, $2);");

    $result = pg_prepare($con, "add_reaction_product",
            "INSERT INTO reactionproducts (reaction_id, moleculename, coefficient) VALUES ($1, $2, $3);");

    $result = pg_prepare($con, "add_reaction_comment", "INSERT INTO reactioncomments (reaction_id, comment_id) VALUES ($1, $2);");


    $data = json_decode(file_get_contents("php://input"));
    $group_id      = $data ->group_id;
    $label         = $data ->label;
    $r1            = $data ->r1;
    $r2            = $data ->r2;
    $r3            = $data ->r3;
    $r4            = $data ->r4;
    $r5            = $data ->r5;
    $wrf_custom_rate_id = $data ->wrf_custom_rate_id;
    $cph           = $data ->cph;
    $reactantArray = $data ->reactantArray;
    $productArray  = $data ->productArray;
    $newComment    = $data ->newComment;

    $safe_to_commit = true; // so far....

    pg_query($con, "BEGIN;") or die("Could not start transaction\n");
    $out = "Begin Transaction, safe:".$safe_to_commit."\n";

    // add chemistry
    $result = pg_execute($con, "add_reaction", array($label, $cph, $r1, $r2, $r3, $r4, $r5, $group_id, $wrf_custom_rate_id));
    $out = $out . "label".$label." cph:".$cph." r1:".$r1." r2:".$r2." r3:".$r3." r4:".$r4." r5:".$r5."\n";
    $new_reaction_id = pg_fetch_array($result)[0];
    $out = $out . "new id:".json_encode($result)."\n";
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." new reaction with pid ".$new_reaction_id."\n";

    // add new comment
    $result = pg_prepare($con, "add_comment", "INSERT INTO comments (note, user_id) SELECT $1, id FROM users WHERE username = $2 RETURNING id;");
    $result = pg_execute($con, "add_comment", array($newComment,$_COOKIE['chemdb_id']));
    $new_comment_id = pg_fetch_array($result)[0];
    $safe_to_commit = $safe_to_commit && ($new_comment_id>-1);
    $out = $out . "safe".$safe_to_commit." new comment with id ".$new_comment_id."\n";

    // link new comment to new reaction_id
    $result = pg_execute($con, "add_reaction_comment", array($new_reaction_id, $new_comment_id));
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." comment added to new reaction \n";

    // add reactionreactants
    $out = $out . "reactarr:".json_encode($reactantArray)."\n";
    foreach($reactantArray as $molecule){
        // add reactant
        $res = pg_execute ($con, "add_reaction_reactant", array($new_reaction_id, $molecule));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit." new reactant:".$molecule. ":\n";
    }

    // add reactionproducts
    $out = $out . "prodarr:".json_encode($productArray)."\n";
    foreach($productArray as $coeffproduct){
        // add photoproducts
        $res = pg_execute ($con, "add_reaction_product", array($new_reaction_id, $coeffproduct[1], $coeffproduct[0]));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit." new products, coeff:".$coeffproduct[0].":prod:".$coeffproduct[1]. ":\n";

        // prepare data to log result
        $reactantString = implode('+',$reactantArray);
        $rate = " rates(".$r1.", ".$r2.", ".$r3.", ".$r4.", ".$r5.") ";
        $productString = productArrayToString($productArray);
        $change = "Add [".$label."]  cph:".$cph." ,".$rate.$reactantString."->".$productString;
        $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
        $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

    }

    if ($safe_to_commit){
        pg_query($con, "COMMIT") or die("Transaction commit failed\n");
        $out = $out . "\nCommiting transaction\n";
    } else {
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
        $out = $out . "\nROLLBACK  transaction\n";
    }
    echo json_encode($out);
}

function del_branchreaction(){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "del_branchreaction", 
            "DELETE FROM branchreactions WHERE branch_id IN (SELECT id FROM branches WHERE name= $1) AND branchreactions.reaction_id = $2;");

    $data = json_decode(file_get_contents("php://input"));
    $branch_name    = $data->branch_name  ;
    $reaction       = $data->reaction;
    $reaction_id    = $reaction->id;
    $label = $reaction->label;
    $reactantString = $reaction->reactantString;
    $productString = $reaction->productString;
    $cph = $reaction->cph;
    $r1 = $reaction->r1;
    $r2 = $reaction->r2;
    $r3 = $reaction->r3;
    $r4 = $reaction->r4;
    $r5 = $reaction->r5;

    $result = pg_execute($con, "del_branchreaction", array($branch_name, $reaction_id));

    // prepare data to log result
    $rate = " rates(".$r1.", ".$r2.", ".$r3.", ".$r4.", ".$r5.") ";
    $newComment='';
    $change = "From :".$branch_name.", Delete [".$label."]  cph:".$cph." ,".$rate.$reactantString."->".$productString;
    $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
    $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));


}

function add_branchreaction(){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;

    $result = pg_prepare($con, "get_branch_id", "SELECT id FROM branches WHERE name = $1;") or die ("failed to prepare branch");
    $result = pg_prepare($con, "add_branchreaction",
            "INSERT INTO branchreactions (branch_id, reaction_id) VALUES ($1, $2);") or die ("failed to prepare pbr");

    $data = json_decode(file_get_contents("php://input"));
    $branch_name    = $data->branch_name  ;
    $reaction       = $data->reaction;
    $reaction_id    = $reaction->id;
    $label = $reaction->label;
    $reactantString = $reaction->reactantString;
    $productString = $reaction->productString;
    $cph = $reaction->cph;
    $r1 = $reaction->r1;
    $r2 = $reaction->r2;
    $r3 = $reaction->r3;
    $r4 = $reaction->r4;
    $r5 = $reaction->r5;

    $branches = pg_execute($con, "get_branch_id", array($branch_name));
    $row = pg_fetch_row($branches);
    $br_id = $row[0];

    $result = pg_execute($con, "add_branchreaction", array($br_id, $reaction_id));

    // prepare data to log result
    $rate = " rates(".$r1.", ".$r2.", ".$r3.", ".$r4.", ".$r5.") ";
    $newComment='';
    $change = "To   :".$branch_name.", Add    [".$label."]  cph:".$cph." ,".$rate.$reactantString."->".$productString;
    $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
    $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

}

function add_reaction_reference() {

    global $con;
    $result = pg_prepare($con, "add_reaction_reference",
            "INSERT INTO reactions_references (reaction_id, reference_id) VALUES ($1, $2);");

    $data = json_decode(file_get_contents("php://input"));
    $reaction_id= $data->reaction_id  ;
    $reference_id= $data->ref_id;

    $result = pg_execute($con, "add_reaction_reference", array($reaction_id, $reference_id));
}

function del_reaction_reference() {

    global $con;
    $result = pg_prepare($con, "del_reaction_reference",
            "DELETE FROM reactions_references WHERE reaction_id = $1 AND reference_id = $2;");

    $data = json_decode(file_get_contents("php://input"));
    $reaction_id= $data->reaction_id;
    $reference_id= $data->ref_id;

    $result = pg_execute($con, "del_reaction_reference", array($reaction_id, $reference_id));
 
    
} 

function update_chemistry_group() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $reaction = $data->reaction;
    $group_id = $data->group_id;

    $result = pg_query($con,"UPDATE reactions SET group_id=".$group_id." WHERE id=".$id." ;");

    // prepare data to log result
    $rate = " rates(".$reaction->r1.", ".$reaction->r2.", ".$reaction->r3.", ".$reaction->r4.", ".$reaction->r5.") ";
    $newComment='';
    $change = "Move Into Group:".$group_id.",   [".$reaction->label."]  cph:".$reaction->cph." ,".$rate.$reaction->reactantString."->".$reaction->productString;
    $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
    $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

}

function update_wrf_rate() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $reaction = $data->reaction;
    $wrf_custom_rate_id = $data->wrf_custom_rate_id;

    $result = pg_query($con,"UPDATE reactions SET wrf_custom_rate_id=".$wrf_custom_rate_id." WHERE id=".$id." ;");

    // prepare data to log result
    $rate = " rates(".$reaction->r1.", ".$reaction->r2.", ".$reaction->r3.", ".$reaction->r4.", ".$reaction->r5.") ";
    $newComment='';
    $change = "Update WRF Rate:".$wrf_custom_rate_id.",   [".$reaction->label."]  cph:".$reaction->cph." ,".$rate.$reaction->reactantString."->".$reaction->productString;
    $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
    $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

}

?>
