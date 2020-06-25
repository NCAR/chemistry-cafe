<?php 


include('config.php');

switch('test_json')  { // testing :  php < thisfile.php
    case 'update_rate_class' :
            update_rate_class();
            break;

    case 'set_troe' :
            set_troe();
            break;

    case 'set_arr' :
            set_arr();
            break;

    case 'test_json' :
            test_json();
            break;


}

function test_json(){
    global $con;

    $va = 8;
    $vab = 0;
    $parameters = array("A"=>8,"B"=>0);
    $jsIN = json_encode($parameters);
    //$parameters = '{"parameters":{"A":"8e-12","C":"2060","D":"300","B":"0","E":"0"},"reaction_class":"Arrhenius"}';
    print_r($jsIN);

    $qry = "update reactions set rate_constant = '$jsIN' where id=8252;";
    print($qry);

    $result = pg_prepare($con, "insert_json", $qry);
    print($result);
    $returnval= pg_execute($con, "insert_json", array());
    print($returnval);
}


function set_troe() {
    global $con;

    $result = pg_prepare($con, "get_all_reactions", " SELECT * FROM reactions r where r.r3 IS NOT NULL ;");


    $chemistryreactions = pg_execute($con, "get_all_reactions", array());
    while ($r= pg_fetch_array($chemistryreactions, NULL, PGSQL_ASSOC)) {
      $parray = array('A_k0'=>$r['r1'], 'B_k0'=>$r['r2'],'C_k0'=>"0.0",'A_kinf'=>$r['r3'],'B_kinf'=>$r['r4'],'C_kinf'=>"0.0",'F_C'=>$r['r5']);
      $rc = "Troe";
      $rate_constant = array('parameters'=>$parray, 'reaction_class'=>$rc);
      $rate_constant_json = json_encode($rate_constant);
      echo $rate_constant_json ;
      echo ("\n");
      $execu = "update reactions r set rate_constant = '".$rate_constant_json ."' where id = " . $r['id'] .";";
      $result = pg_query($con, $execu);
      echo $execu;
      echo ("\n");
    }

}

function set_arr() {
  
    global $con;
  
    $qu = "select *  from reactions  
        where  
          r3 IS NULL and 
          r1 IS NOT NULL and  
          not label like 'usr_%' and 
          not label like 'xhet%'  
        order by id ;";

    $result = pg_prepare($con, "get_all_arrhenius", $qu);

    $chemistryreactions = pg_execute($con, "get_all_arrhenius", array());
    while ($r= pg_fetch_array($chemistryreactions, NULL, PGSQL_ASSOC)) {
      if( $r['r2'] == null){ 
        $r['r2']=0.0;
      }
      $parray = array('A'=>sprintf("%e",$r['r1']), 'C'=>sprintf("%01.2f",-$r['r2']), 'D'=>"300.0", 'B'=>"0.0", 'E'=>"0.0");
      $rc = "Arrhenius";
      $rate_constant = array('parameters'=>$parray, 'reaction_class'=>$rc);
      $rate_constant_json = json_encode($rate_constant);
      echo $rate_constant_json ;
      echo ("\n");
      $execu = "update reactions r set rate_constant = '".$rate_constant_json ."' where id = " . $r['id'] .";";

      $result = pg_query($con, $execu);

      echo $execu;
      echo ("\n");
    }


}

function update_rate_class() {

    global $con;

    $result = pg_prepare($con, "get_all_reactions", " SELECT * FROM reactions r;");

    $json_response = array();

    //$result = pg_prepare($con, "add_reaction", "INSERT INTO reactions (label, cph, r1, r2, r3, r4, r5, group_id, wrf_custom_rate_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;"); 
    //$result = pg_execute($con, "add_reaction", array($label, $cph, $r1, $r2, $r3, $r4, $r5, $group_id, $wrf_custom_rate_id));

    //$result = pg_prepare($con, "mod_reaction_deprecate", 
            //"UPDATE reactions SET obsolete=TRUE where id = $1;");
    //$res = pg_execute ($con,"mod_reaction_deprecate", array($id));


    $chemistryreactions = pg_execute($con, "get_all_reactions", array());
    while ($reaction = pg_fetch_array($chemistryreactions, NULL, PGSQL_ASSOC)) {
      $row_array['id'] = $reaction['id'];
      $row_array['label'] = $reaction['label'];
      $row_array['r1'] = $reaction['r1'];
      $row_array['r2'] = $reaction['r2'];
      $row_array['r3'] = $reaction['r3'];
      $row_array['r4'] = $reaction['r4'];
      $row_array['r5'] = $reaction['r5'];
      if (strpos($reaction['label'],  "usr_") !== false) {
          echo "USER: ";
          echo $row_array['label'];
          echo " with:  ";
          echo $row_array['r1'];
          echo "\n";
//$parameters = {"parameters":{"A_k0":"6.0e-34","B_k0":"-2.4","C_k0":0},"reaction_class":"Troe_low_pressure"}
      } elseif($row_array['r5'] != NULL) {
          echo "Troe: ";
          echo $row_array['label'].": ";
          echo "param:: ";
          echo $row_array['r1'].": ".$row_array['r2'].": ".$row_array['r3'].": ".$row_array['r4'].": ".$row_array['r5']."\n";
          echo "\n";
//{"parameters":{"A":"8e-12","C":"2060","D":"300","B":"0","E":"0"},"reaction_class":"Arrhenius"}
      } elseif($row_array['r2'] != NULL) {
          echo "Arrhen2: ";
          echo $row_array['label'].": ";
          echo "param:: ";
          echo $row_array['r1'].": ".$row_array['r2'].": ".$row_array['r3'].": ".$row_array['r4'].": ".$row_array['r5']."\n";
          echo "\n";
//{"parameters":{"A":"8e-12","C":"2060","D":"300","B":"0","E":"0"},"reaction_class":"Arrhenius"}
      } elseif($row_array['r1'] != NULL) {
          echo "Arrhen1: ";
          echo $row_array['label'].": ";
          echo "param:: ";
          echo $row_array['r1'].": ".$row_array['r2'].": ".$row_array['r3'].": ".$row_array['r4'].": ".$row_array['r5']."\n";
          echo "\n";
//{"parameters":{"A":"8e-12","C":"2060","D":"300","B":"0","E":"0"},"reaction_class":"Arrhenius"}
      } else {
          print("other "+$row_array['label']+" "+$row_array['r1']+" "+$row_array['r1']+" "+$row_array['r1']+" "+$row_array['r1']+" "+$row_array['r1']+"\n");
      }
//Troe
//A_k0 = r1
//B_k0 = -r2
//C_k0 = 0
//A_kinf = r3
//B_kinf = -r4
//C_kinf = 0
//F_C = r5
//
//Arrhenius (1)
//A = r1
//
//Arrhenius (2)
//A = r1
//C = -r2
//

   }
   //echo json_encode($json_response,JSON_PRETTY_PRINT);
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
    $label         = trim($data ->label);
    $r1            = $data ->r1;
    $r2            = $data ->r2;
    $r3            = $data ->r3;
    $r4            = $data ->r4;
    $r5            = $data ->r5;
    $wrf_custom_rate_id = $data ->wrf_custom_rate_id;
    $cph           = trim($data ->cph);
    $reactantArray = $data ->reactantArray;
    $productArray  = $data ->productArray;
    $newComment    = trim($data ->newComment);

    if (empty($cph)) { $cph = null; }

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
    }

    // prepare data to log result
    $reactantString = implode('+',$reactantArray);
    $rate = " rates(".$r1.", ".$r2.", ".$r3.", ".$r4.", ".$r5.") ";
    $productString = productArrayToString($productArray);
    $change = "Add [".$label."]  cph:".$cph." ,".$rate.$reactantString."->".$productString;
    $logq= "INSERT INTO log (user_id, change, comment) SELECT id, $2, $3 FROM users WHERE username = $1 RETURNING id;";
    $res = pg_query_params($con, $logq, array($_COOKIE['chemdb_id'], $change, $newComment));


    if ($safe_to_commit){
        pg_query($con, "COMMIT") or die("Transaction commit failed\n");
        $out = $out . "\nCommiting transaction\n";
    } else {
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
        $out = $out . "\nROLLBACK  transaction\n";
    }

    echo $out;
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
