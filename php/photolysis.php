<?php 

include('config.php');

switch($_GET['action'])  {
//switch('get_all_wrf_rates') {
    case 'get_all_photolysis' :
            get_all_photolysis();
            break;

    case 'get_all_wrf_rates' :
            get_all_wrf_rates();
            break;

    case 'get_all_micm_rates' :
            get_all_micm_rates();
            break;

    case 'get_photolysis_by_id' :
            get_photolysis_by_id();
            break;

    case 'get_references_by_id' :
            get_references_by_id();
            break;

    case 'add_photolysis_and_products' :
            add_photolysis_and_products();
            break;

    case 'mod_photolysis' :
            mod_photolysis();
            break;

    case 'deprecate_photolysis' :
            deprecate_photolysis();
            break;

    case 'un_deprecate_photolysis' :
            un_deprecate_photolysis();
            break;

    case 'add_branchreaction' :
            add_branchreaction();  
            break;

    case 'del_branchreaction' :
            del_branchreaction();  
            break;

    case 'add_photolysis_reference' :
            add_photolysis_reference();
            break;

    case 'del_photolysis_reference' :
            del_photolysis_reference();
            break;

    case 'update_photolysis_group' :
            update_photolysis_group();


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

function get_all_comments_for_photolysis_id($id){
    global $con;
    $comments = pg_query($con, 
        "SELECT (u.initials || ' : ' || date(c.date - interval '7 hours') || ' : ' || c.note ) AS comment 
            FROM comments AS c 
            INNER JOIN users AS u 
            ON u.id=user_id 
            INNER JOIN photolysiscomments AS pc
            ON pc.comment_id=c.id
            WHERE pc.photolysis_id = ".$id.
            "ORDER BY c.date DESC;" );
    while($row = pg_fetch_array($comments))
    {
        $commentarray[]= $row['comment'];
    }
    return $commentarray;
}

function get_all_wrf_rates() {
    global $con;

    $result = pg_prepare($con, "get_all_wrf_rates",
            "SELECT *
             FROM wrf_photo_rates;");

    $wrf_rates = pg_execute($con, "get_all_wrf_rates", array());
    $row_array = pg_fetch_all($wrf_rates);

    echo json_encode($row_array);
}

function get_all_micm_rates() {
    global $con;

    $result = pg_prepare($con, "get_all_micm_rates",
            "SELECT *
             FROM micm_js
             ORDER BY reaction;");

    $micm_rates = pg_execute($con, "get_all_micm_rates", array());
    $row_array = pg_fetch_all($micm_rates);

    echo json_encode($row_array);
}


function get_all_photolysis() {

    global $con;

    $result = pg_prepare($con, "get_all_photolysis",
            "SELECT p.id, p.rate, p.moleculename, p.obsolete, p.group_id, p.wrf_photo_rates_coeff, p.micm_js_id, p.micm_js_coeff, mj.label
             FROM photolysis AS p 
             INNER JOIN photolysis_groups AS g 
             ON g.id=p.group_id 
             LEFT JOIN micm_js as mj
             on mj.id = p.micm_js_id
             ORDER BY g.ordering ASC, p.moleculename ASC;");

    $result = pg_prepare($con, "get_photolysis_products", 
            "SELECT pp.moleculename, pp.coefficient FROM photolysisproducts pp WHERE pp.photolysisid = $1;");

    $result = pg_prepare($con, "get_branches_for_reaction", 
            "SELECT br.name FROM branchphotolysis AS p, branches AS br WHERE br.id = p.branch_id AND p.photolysis_id = $1 ORDER BY br.name;");

    $json_response = array();

    // list of reactions
    $photolysisreactions = pg_execute($con, "get_all_photolysis", array());
    while ($reaction = pg_fetch_array($photolysisreactions)) {
      $row_array['id'] = $reaction['id'];
      $row_array['rate'] = $reaction['rate'];
      $row_array['molecule'] = $reaction['moleculename'];
      $row_array['wrf_photo_rates_coeff'] = $reaction['wrf_photo_rates_coeff'];
      $row_array['micm_js_coeff'] = $reaction['micm_js_coeff'];
      $row_array['micm_js_id'] = $reaction['micm_js_id'];
      $row_array['label'] = $reaction['label'];
      $row_array['obsolete'] = ($reaction['obsolete'] === 't') ;
      $row_array['productArray'] = array();
      $row_array['branchArray'] = array();
      $row_array['branchString'] = '';
      $row_array['group_id'] = $reaction['group_id'];

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

      // products and coefficients for each reaction
      $photolysisproducts = pg_execute($con, "get_photolysis_products", array($reaction['id']));

      while ($product = pg_fetch_array($photolysisproducts)) {
          array_push($row_array['productArray'],array($product['coefficient'],$product['moleculename']));
      }

      // comment in database
      $comments = pg_query($con, 
          "SELECT note,users.username 
              FROM comments 
              INNER JOIN photolysiscomments ON photolysiscomments.comment_id=comments.id 
              INNER JOIN users ON comments.user_id=users.id 
              WHERE photolysiscomments.photolysis_id = ".$reaction['id']." ;");
      while ($comment = pg_fetch_array($comments)) {
          $row_array['comment']  =$comment['note'];
          $row_array['commenter']=$comment['username'];
      }
      array_push($json_response,$row_array);
   }
   echo json_encode($json_response);
}


function get_photolysis_by_id() {

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "get_photolysis_by_id", 
            "SELECT id, rate, moleculename, obsolete, wrf_photo_rates_id, wrf_photo_rates_coeff, micm_js_id, micm_js_coeff, group_id FROM photolysis WHERE id = $1;");

    $result = pg_prepare($con, "get_branches_for_reaction", 
            "SELECT br.name FROM branchphotolysis AS p, branches AS br WHERE br.id = p.branch_id AND p.photolysis_id = $1 ORDER BY br.name;");

    $result = pg_prepare($con, "get_photolysis_products",
            "SELECT pp.moleculename, pp.coefficient FROM photolysisproducts pp WHERE pp.photolysisid = $1;");

    $data = json_decode(file_get_contents("php://input"));
    $id          = $data->id;  
    
    // list of reactions
    $reactions = pg_execute($con, "get_photolysis_by_id", array($id));

    $reaction = pg_fetch_array($reactions);

    $row_array['id'] = $reaction['id'];
    $row_array['rate'] = $reaction['rate'];
    $row_array['group_id'] = $reaction['group_id'];
    $row_array['wrf_photo_rates_id'] = $reaction['wrf_photo_rates_id'];
    $row_array['wrf_photo_rates_coeff'] = $reaction['wrf_photo_rates_coeff'];
    $row_array['micm_js_id'] = $reaction['micm_js_id'];
    $row_array['micm_js_coeff'] = $reaction['micm_js_coeff'];
    $row_array['selectedMicmRateId'] = $reaction['micm_js_id'];
    $row_array['molecule'] = $reaction['moleculename'];
    $row_array['obsolete'] = ($reaction['obsolete'] === 't');
    $row_array['productArray'] = array();
    $row_array['branchArray'] = array();
    $row_array['branchString'] = '';

    $result = pg_prepare($con, "get_rate",
            "SELECT * FROM wrf_photo_rates WHERE id =".$reaction['wrf_photo_rates_id'].";");

    $wrf_rate = pg_execute($con, "get_rate", array());
    $wr = pg_fetch_array($wrf_rate);
    $row_array['selectedWrfRateId'] = $wr['id'];


    // construct list of branches for a given reaction
    $branchlist = pg_execute($con, "get_branches_for_reaction", array($reaction['id']));
    if($branch = pg_fetch_array($branchlist)) {
        array_push($row_array['branchArray'] ,$branch[0]);
        $row_array['branchString'] = $branch[0];
    }
    while ($branch = pg_fetch_array($branchlist)) {
        array_push($row_array['branchArray'] ,$branch[0]);
        $row_array['branchString'] .= ' ' . $branch[0];
    }

    // construct array of products and coefficients for each reaction
    $photolysisproducts = pg_execute($con, "get_photolysis_products", array($reaction['id']));

    while ($product = pg_fetch_array($photolysisproducts)) {
        array_push($row_array['productArray'],array($product['coefficient'],$product['moleculename']));
    }

    $row_array['previousComments'] = get_all_comments_for_photolysis_id($reaction['id']);

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
             INNER JOIN photolysis_references AS pr ON pr.reference_id=r.id
             WHERE pr.photolysis_id=".$reaction_id."
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

function mod_photolysis (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;

    $result = pg_prepare($con, "add_photolysis", 
            "INSERT INTO photolysis (rate, moleculename, wrf_photo_rates_id, wrf_photo_rates_coeff, micm_js_id, micm_js_coeff,group_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;"); 

    $result = pg_prepare($con, "add_photolysis_products", 
            "INSERT INTO photolysisproducts (photolysisid, moleculename, coefficient) VALUES ($1,$2, $3);");

    $result = pg_prepare($con, "add_branchreaction", 
            "INSERT INTO branchphotolysis (branch_id, photolysis_id) SELECT id,$2 FROM branches WHERE name= $1;");

    $result = pg_prepare($con, "del_branchreaction", 
            "DELETE FROM branchphotolysis WHERE branch_id IN (SELECT id FROM branches WHERE name= $1) AND branchphotolysis.photolysis_id = $2;");


    $result = pg_prepare($con, "add_photolysis_comment", "INSERT INTO photolysiscomments (photolysis_id, comment_id) VALUES ($1, $2);");

    $result = pg_prepare($con, "get_group", "SELECT group_id FROM photolysis WHERE id = $1;");

    $data = json_decode(file_get_contents("php://input"));
    $oldpid       = $data->oldpid;  
    $group_id     = $data->group_id;
    $branchArray  = $data->branchArray;
    $rate         = $data->rate;
    $molecule     = $data->molecule;
    $micm_js_id    = $data->micm_js_id;
    $micm_js_coeff = $data->micm_js_coeff;
    $wrf_photo_rates_id    = $data->wrf_photo_rates_id;
    $wrf_photo_rates_coeff = $data->wrf_photo_rates_coeff;
    $productArray          = $data->productArray;
    $newComment            = $data->newComment;

    $safe_to_commit = true; // so far everything seems normal

    pg_query($con, "BEGIN;") or die("Could not start transaction\n");
    $out = "Begin Transaction, safe:".$safe_to_commit."\n";

    // add photolysis
    $result = pg_execute($con, "add_photolysis", array($rate, $molecule, $wrf_photo_rates_id, $wrf_photo_rates_coeff, $micm_js_id, $micm_js_coeff, $group_id));
    $new_photolysis_id = pg_fetch_array($result)[0];
    $safe_to_commit = $safe_to_commit && ($new_photolysis_id>-1);
    $out = $out . "safe".$safe_to_commit." new photolysis with pid ".$new_photolysis_id."\n New wrf rate:".$wrf_photo_rates_id."\n";

    // add new comment
    $result = pg_prepare($con, "add_comment", "INSERT INTO comments (note,user_id) SELECT $1, id FROM users WHERE username = $2 RETURNING id;");
    $result = pg_execute($con, "add_comment", array($newComment,$_COOKIE['chemdb_id']));
    $new_comment_id = pg_fetch_array($result)[0];
    $safe_to_commit = $safe_to_commit && ($new_comment_id>-1);
    $out = $out . "safe".$safe_to_commit." new comment with id ".$new_comment_id."\n";

    // link new comment to new photolysis_id
    $result = pg_execute($con, "add_photolysis_comment", array($new_photolysis_id, $new_comment_id));
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." comment added to new photolysis \n";

    // link all previous comments to this new reaction
    $result = pg_prepare($con, "link_prev_comment", "INSERT INTO photolysiscomments (photolysis_id, comment_id) SELECT $1, comment_id FROM photolysiscomments WHERE photolysis_id = $2;");
    $result = pg_execute($con, "link_prev_comment", array($new_photolysis_id, $oldpid));
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." old comments added to new photolysis \n";

    // add photolysisproducts
    $out = $out . "prodarr:".json_encode($productArray)."\n";
    foreach($productArray as $coeffproduct){
        // add photoproducts
        $res = pg_execute ($con, "add_photolysis_products", array($new_photolysis_id, $coeffproduct[1], $coeffproduct[0]));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit." new products, coeff:".$coeffproduct[0].":prod:".$coeffproduct[1]. ":\n";
    }

    foreach($branchArray as $branch){
        // add new reaction to branches
        $res = pg_execute($con, "add_branchreaction", array($branch,$new_photolysis_id));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit."Add reaction ".$new_photolysis_id." to branch ".$branch."\n";

        // remove old reaction from branches
        $res = pg_execute($con, "del_branchreaction", array($branch,$oldpid));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out ."safe".$safe_to_commit. "Removing reaction ".$oldpid." from branch ".$branch."\n";
    }

    //$safe_to_commit = false;
    if ($safe_to_commit){
        pg_query($con, "COMMIT") or die("Transaction commit failed\n");
        $out = "Committed";

        // prepare data to log result
        $reactantString = $molecule;
        $productString = productArrayToString($productArray);
        $change = "Mod : ".$rate." ,".$reactantString."->".$productString;
        $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
        $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

    } else {
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
        $out = "\nCommit FAILED!\n". $out;
    }
    echo json_encode($out);
}

function deprecate_photolysis (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "mod_reaction_deprecate", 
            "UPDATE photolysis SET obsolete=TRUE where id = $1;");

    $data = json_decode(file_get_contents("php://input"));
    $id= $data->photolysis_id;

    $out = "deprecating id:".$id;
    $res = pg_execute ($con,"mod_reaction_deprecate", array($id));
    echo  $out;
}

function un_deprecate_photolysis (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "mod_reaction_un_deprecate", 
            "UPDATE photolysis SET obsolete=FALSE where id = $1;");

    $data = json_decode(file_get_contents("php://input"));
    $id= $data->photolysis_id;

    $out = "undeprecating id:".$id;
    $res = pg_execute ($con,"mod_reaction_un_deprecate", array($id));
    echo  $out;
}


function add_photolysis_and_products (){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;

    $result = pg_prepare($con, "add_photolysis", 
            "INSERT INTO photolysis (rate, moleculename, wrf_photo_rates_id, wrf_photo_rates_coeff, group_id) VALUES ($1, $2, $3, $4, $5) RETURNING id;"); 

    $result = pg_prepare($con, "add_photolysis_products",
            "INSERT INTO photolysisproducts (photolysisid, moleculename, coefficient) VALUES ($1,$2, $3);");

    $result = pg_prepare($con, "add_comment", "INSERT INTO comments (note,user_id) SELECT $1, id FROM users WHERE username = $2 RETURNING id;");

    $result = pg_prepare($con, "add_photolysis_comment", "INSERT INTO photolysiscomments (photolysis_id, comment_id) VALUES ($1, $2);");

    $result = pg_prepare($con, "add_branchreaction", 
            "INSERT INTO branchphotolysis (branch_id, photolysis_id) SELECT id,$2 FROM branches WHERE name= $1;");

    $data = json_decode(file_get_contents("php://input"));
    $group_id       = $data->group_id;
    $molecule       = $data->molecule;
    $rate           = $data->rate;
    $productArray   = $data->productArray;
    $wrf_photo_rates_id    = $data->wrf_photo_rates_id;
    $wrf_photo_rates_coeff = $data->wrf_photo_rates_coeff;
    $newComment            = $data->newComment;

    $safe_to_commit = true; // so far....
    $out = json_encode($data);

    pg_query($con, "BEGIN;") or die("Could not start transaction\n");
    $out .= "Begin Transaction, safe:".$safe_to_commit."\n";

    // add photolysis
    $result = pg_execute($con, "add_photolysis", array($rate, $molecule, $wrf_photo_rates_id, $wrf_photo_rates_coeff, $group_id));
    $out = $out . "molecule:".$molecule.":rate:".$rate.":\n";
    $new_photolysis_id = pg_fetch_array($result)[0];
    $out = $out . "pid:".$new_photolysis_id."\n";
    $safe_to_commit = $safe_to_commit && ($new_photolysis_id>-1);
    $out = $out . "safe".$safe_to_commit." new photolysis with pid ".$new_photolysis_id."\n";

    // add new comment
    $result = pg_execute($con, "add_comment", array($newComment,$_COOKIE['chemdb_id']));
    $new_comment_id = pg_fetch_array($result)[0];
    $safe_to_commit = $safe_to_commit && ($new_comment_id>-1);
    $out = $out . "safe".$safe_to_commit." new comment with id ".$new_comment_id."\n";

    // link new comment to new photolysis_id
    $result = pg_execute($con, "add_photolysis_comment", array($new_photolysis_id, $new_comment_id));
    $safe_to_commit = $safe_to_commit && $result;
    $out = $out . "safe".$safe_to_commit." comment added to new photolysis \n";

    // add photolysisproducts
    $out = $out . "prodarr:".json_encode($productArray)."\n";
    foreach($productArray as $coeffproduct){
        // add photoproducts
        $out = $out . "Adding new products, coeff:".$coeffproduct[0].":prod:".$coeffproduct[1]. ":\n";
        $res = pg_execute ($con, "add_photolysis_products", array($new_photolysis_id, $coeffproduct[1], $coeffproduct[0]));
        $safe_to_commit = $safe_to_commit && $res;
        $out = $out . "safe".$safe_to_commit." new products, coeff:".$coeffproduct[0].":prod:".$coeffproduct[1]. ":\n";
    }

    if ($safe_to_commit){
        pg_query($con, "COMMIT") or die("Transaction commit failed\n");
        $out = "Committed";

        // prepare data to log result
        $reactantString = $molecule;
        $rate =$rate;
        $productString = productArrayToString($productArray);
        $change = "Add : ".$rate." ,".$reactantString."->".$productString;
        $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
        $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));

    } else {
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
        $out = "Commit FAILED:\n". $out;
    }
    echo($out);
}

function del_branchreaction(){

    if (!user_is_valid()) {
        header("HTTP/1.0 419 Authentication Timeout");
        return;
    }

    global $con;
    $result = pg_prepare($con, "del_branchreaction", 
            "DELETE FROM branchphotolysis WHERE branch_id IN (SELECT id FROM branches WHERE name= $1) AND branchphotolysis.photolysis_id = $2;");

    $data = json_decode(file_get_contents("php://input"));
    $photolysis_id          = $data->photolysis_id;
    $photolysis             = $data->photolysis;
    $branch_name            = $data->branch_name  ;

    $result = pg_execute($con, "del_branchreaction", array($branch_name, $photolysis_id));

    // prepare data to log result
    $reactantString = $photolysis->molecule;
    $rate = $photolysis->rate;
    $newComment='';
    $change = "From :".$branch_name.", Del  ".$rate." ,".$reactantString."->".$photolysis->productString;
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
            "INSERT INTO branchphotolysis (branch_id, photolysis_id) VALUES ($1, $2);") or die ("failed to prepare pbr");

    $data = json_decode(file_get_contents("php://input"));
    $photolysis_id          = $data->photolysis_id;
    $branch_name            = $data->branch_name  ;
    $photolysis             = $data->photolysis;

    $branches = pg_execute($con, "get_branch_id", array($branch_name));
    $row = pg_fetch_row($branches);
    $br_id = $row[0];

    $result = pg_execute($con, "add_branchreaction", array($br_id, $photolysis_id));

    // prepare data to log result
    $reactantString = $photolysis->molecule;
    $rate = $photolysis->rate;
    $newComment='';
    $change = "To   :".$branch_name.", Add  ".$rate." ,".$reactantString."->".$photolysis->productString;
    $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
    $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));
}

function add_photolysis_reference() {

    global $con;
    $result = pg_prepare($con, "add_photolysis_reference",
            "INSERT INTO photolysis_references (photolysis_id, reference_id) VALUES ($1, $2);");

    $data = json_decode(file_get_contents("php://input"));
    $photolysis_id= $data->photolysis_id  ;
    $reference_id= $data->ref_id;

    $result = pg_execute($con, "add_photolysis_reference", array($photolysis_id, $reference_id));
}

function del_photolysis_reference() {

    global $con;
    $result = pg_prepare($con, "del_photolysis_reference",
            "DELETE FROM photolysis_references WHERE photolysis_id = $1 AND reference_id = $2;");

    $data = json_decode(file_get_contents("php://input"));
    $photolysis_id= $data->photolysis_id;
    $reference_id= $data->ref_id;

    $result = pg_execute($con, "del_photolysis_reference", array($photolysis_id, $reference_id));
 
    
} 

function update_photolysis_group() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $group_id = $data->group_id;

    $result = pg_query($con,"UPDATE photolysis SET group_id=".$group_id." WHERE id=".$id." ;");
}


?>
