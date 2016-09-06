<?php

include('config.php'); 

//switch($_GET['action'])  {
switch('tstfilewrite')  { // testing :  php < thisfile.php
    case 'get_all_branches' :
            get_all_branches();
            break;

    case 'get_all_tags' :
            get_all_tags();
            break;

    case 'export_tag' :
            export_tag();
            break;
  
    case 'create_tag' :
            create_tag();
            break;
  
    case 'create_branch_from_tag' :
            create_branch_from_tag();
            break;
  
    case 'get_user_id' :
            get_user_id();
            break;

    case 'update_user_tag_info' :
            update_user_tag_info();
            break;

    case 'tstfilewrite' :
            global $con;
            $id = 97;
            $tags = pg_query($con,"SELECT filename FROM tags WHERE id = ".$id.";");
            $tagref= pg_fetch_array($tags,0,$result_type = PGSQL_ASSOC);
            mkdir('../tag_files/testdir');
            $tagdir = '../tag_files/testdir/'.$tagref['filename'];
            mkdir($tagdir);
            write_cesm_tag_file($tagdir,$tagref['filename'],$id);
            write_kpp_tag_file($tagdir,$tagref['filename'],$id);
            break;

}

function cesm_to_kpp_photo_rate($cesm_rate) {
    global $con;
// kpp format:   .20946_dp*j(Pj_o2)
// conversion:
//        cesm                   resulting kpp
//        jno=userdefined,      ---:ERROR(jno=userdefined,)
//        jbrono2_b             j(Pj_brono2_b)
//        jbigald->,0.2*jno2    0.2*j(Pj_no2)
//        jalknit->,jch3ooh     j(Pj_ch3ooh)
    if(strpos($cesm_rate,"=")!==false) return(":ERROR(".$cesm_rate.")");
    if(strpos($cesm_rate,"->")===false){
        $kpp_rate = substr($cesm_rate, 1);
        $wrf_ref = $kpp_rate;
        $wrf_str = "j(Pj_".$kpp_rate.")";
    } else {
        $sections=explode("->,",$cesm_rate);
        $right = trim($sections[1]);
        // does it now start with j... or 0.2*j...
        $start = substr( $right ,0, 1);
        if ($start == 'j') {
            $kpp_rate = substr( $right ,1 );
            $wrf_ref = $kpp_rate;
            $wrf_str = "j(Pj_".$kpp_rate.")";
        } else {
            $vals = explode("*",$right);
            $wrf_ref = substr($vals[1],1);
            $wrf_str = $vals[0]."_dp*j(Pj_".substr($vals[1],1).")";
        }
    }

    $wrf_rate_array = pg_execute($con,"get_wrf_rates",array($wrf_ref));
    //print json_encode($wrf_ref);
    $wrf_rate_comment = '{ERROR}';
    while($wrf_rate_e = pg_fetch_array($wrf_rate_array)){
        //print $wrf_rate_e['photr'];
        //print   "\nnext\n";
        $wrf_rate_comment = "  {PHOTR".$wrf_rate_e['photr']." ,".$wrf_rate_e['molecule']."}";
    }
    return($wrf_str . $wrf_rate_comment);

}

function get_all_branches() {

    global $con;

    $result = pg_prepare($con, "get_all_branches",
            "SELECT id, name FROM branches WHERE not(branches.deprecated);");

    $branches = pg_execute($con, "get_all_branches", array());
    $branchlist = array();
    while ($branch = pg_fetch_array($branches))
    {
        $row_array['id'] =  $branch['id'];
        $row_array['name']=  $branch['name'];
        array_push($branchlist, $row_array);
    }
    print_r(json_encode($branchlist));
    return json_encode($branchlist);
}

function get_all_tags() {

// given_name, user_id, branch_id, id, date, buggy
    global $con;

    $result = pg_query($con, 
       "SELECT t.id, t.given_name, t.filename, u.initials, b.name AS branchname, b.id AS branch_id, date(t.date - interval '7 hours'), t.buggy 
        FROM tags AS t
        INNER JOIN users AS u
        ON u.id=t.user_id
        INNER JOIN branches AS b
        ON b.id=t.branch_id
        ORDER BY t.id DESC;");

    $taglist = array();
    while ($tag = pg_fetch_array($result))
    {
        $row_array['id'] =  $tag['id'];
        $row_array['given_name']=  $tag['given_name'];
        $row_array['filename']=  $tag['filename'];
        $row_array['initials'] =  $tag['initials'];
        $row_array['branchname'] =  $tag['branchname'];
        $row_array['branch_id'] =  $tag['branch_id'];
        $row_array['date'] =  $tag['date'];
        $row_array['buggy'] = ($tag['buggy']=='t');
        $row_array['previousComments'] = get_all_comments_for_tag($row_array['id']);
        array_push($taglist, $row_array);
    }
    print_r(json_encode($taglist));
    return json_encode($taglist);
}

function download($tagid) {
// cause browser to send file to new window 
// with disposition causing "download"

    global $con;

    $tags = pg_query($con,"SELECT filename FROM tags WHERE id =".$tagid.";");
    $tagref= pg_fetch_array($tags,0,$result_type = PGSQL_ASSOC);
    $tagfile = $tagref['filename'].".tar";
    $pathtagfile = "../tag_files/".$tagfile;

    if (file_exists($pathtagfile)) {

        header("Content-Type: application/x-tar");
        header("Content-Disposition: attachment; filename=".$tagfile);
        header("Content-Length:".filesize($pathtagfile));
        header("Content-Transfer-Encoding: binary");
        readfile($pathtagfile);

        exit;

    } else {
        die("Error: File not found.");
    }

}

function create_branch_from_tag() {

    global $con;


    $data = json_decode(file_get_contents("php://input"));
    $new_branch_name = $data->new_branch_name;
    $source_tag_id = $data->tag_id;

    // Start transaction
    $safe_to_commit = true; // so far everything seems normal
    pg_query($con, "BEGIN;") or die("Could not start transaction\n");
    $out = "Begin Transaction, new branch name".$new_branch_name." /n";

    // Create branch
    $result = pg_prepare($con, "create_branch","INSERT INTO branches (name) VALUES ($1) RETURNING id;");
    $result = pg_execute($con, "create_branch",array($new_branch_name));

    if($result){
        $row = pg_fetch_array($result);
        $branch_id = $row[0];
        $out .= "New branch id:".$branch_id." /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
        $out = $out . "\nROLLBACK  transaction\n";
    }

    // set reactions to not-obsolete for all in tag
    $result = pg_query($con, "UPDATE reactions AS r
                              SET obsolete = FALSE
                              FROM tag_reactions AS t
                              WHERE r.id = t.reaction_id
                              AND t.tag_id =".$source_tag_id.";");
    if($result){
        $out .= "All tagged reactions made not-obsolete /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
    }

    // set photolysis to not-obsolete for all in tag
    $result = pg_query($con, "UPDATE photolysis AS p
                              SET obsolete = FALSE
                              FROM tag_photolysis AS t
                              WHERE p.id = t.photolysis_id
                              AND t.tag_id =".$source_tag_id.";");
    if($result){
        $out .= "All tagged photolysis reactions made not-obsolete /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
    }
    
    // connect branch to photolysis in tag
    $qry = "INSERT INTO branchphotolysis (branch_id, photolysis_id)
                                  SELECT ".$branch_id.",photolysis_id
                                  FROM tag_photolysis AS t
                                  WHERE t.tag_id =".$source_tag_id.";" ;

    $out .="/n query:".$qry."/n";

    $result = pg_query($con, $qry);
    if($result){
        $out .= "All tagged photolysis placed on branch /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
    }
    
    // connect branch to photolysis in tag
    $result = pg_query($con, "INSERT INTO branchreactions (branch_id, reaction_id)
                                  SELECT ".$branch_id.",reaction_id
                                  FROM tag_reactions AS t
                                  WHERE t.tag_id =".$source_tag_id.";");
    if($result){
        $out .= "All tagged reactions placed on branch /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("Transaction commit failed\n");
    }

    // Commit Transaction
    pg_query($con, "COMMIT") or die("Transaction commit failed\n");
    $out = $out . "\nCommiting transaction\n";
    
    print_r(json_encode($out));
    return json_encode($out);
}


    

function create_tag() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $given_name= $data->given_name  ;
    $branch_id= $data->branch_id;
    $branch_name= $data->branch_name;
    $comment= $data->comment;
    // get user_id
    $user_id = get_user_id();

    // Useful database queries
    $result = pg_prepare($con, "add_comment", "INSERT INTO comments (note, user_id) VALUES ($1,$2) RETURNING id");
    $result = pg_prepare($con, "create_tag",
            "INSERT INTO tags (given_name, user_id, branch_id)VALUES ($1, $2, $3) RETURNING id;"); 

    // put comment in DB
    $cid = pg_execute($con, "add_comment", array($comment,$user_id));
    $comment_id = pg_fetch_array($cid)[0];

    // put tag in DB
    $tid = pg_execute($con, "create_tag", array($given_name, $user_id, $branch_id));
    $tag_id = pg_fetch_array($tid)[0];

    //parent directory for all preprocessor files
    $target_file_name = $tag_id."-".trim($branch_name)."-".date("Y-m-d");
    $target_dir = '../tag_files/'.$target_file_name;
    if(!is_dir($target_dir)) {
        mkdir($target_dir);
    }

    $result = pg_query($con, "UPDATE tags SET filename ='".$target_file_name."' WHERE id=".$tag_id.";");

    // connect tag to comment
    $result = pg_query($con, "INSERT INTO tag_comments (tag_id, comment_id) VALUES (".$tag_id.",".$comment_id.");");

    // for each branchreaction with branch_id, create tag_reaction
    $result = pg_query($con, "INSERT INTO tag_reactions (tag_id, reaction_id) SELECT ".$tag_id.",reaction_id FROM branchreactions WHERE branch_id =".$branch_id.";");

    // for each branchphotolysis with branch_id, create tag_photolysis
    $result = pg_query($con, "INSERT INTO tag_photolysis (tag_id, photolysis_id) SELECT ".$tag_id.",photolysis_id FROM branchphotolysis WHERE branch_id =".$branch_id.";");

    write_cesm_tag_file($target_dir,$target_file_name, $tag_id);
    write_kpp_tag_file($target_dir, $target_file_name, $tag_id);

    //tar up the files
    exec("cd ../tag_files ; tar -cf ".$target_file_name.".tar ".$target_file_name);
}

function get_user_id(){

    $user_name = $_COOKIE['chemdb_id'];

    global $con ;

    //find id of person uploading file
    $id_res = pg_query($con, "SELECT id FROM users WHERE username ='".$user_name."';");
    $id_v = pg_fetch_array($id_res);
    $user_id = $id_v['id'];
    return $user_id;
}

function export_tag (){
     $tagid = $_GET['id'];
     download($tagid);
}

function update_user_tag_info() {

    $file_handle = fopen("debug.txt","w");

    $user_id = get_user_id();

    $data = json_decode(file_get_contents("php://input"));
    $tag_id = $data->tag_id;
    $given_name = $data->given_name;
    $buggy = $data->buggy;
    $comment = $data->comment;

    global $con ;

    // add comment
    $result = pg_prepare($con, "add_comment", "INSERT INTO comments (note, user_id) VALUES ($1,$2) RETURNING id");
    $cid = pg_execute($con, "add_comment", array($comment,$user_id));
    $comment_id = pg_fetch_array($cid)[0];

    // link to tag
    $result = pg_query($con, "INSERT INTO tag_comments (tag_id, comment_id) VALUES (".$tag_id.",".$comment_id.");");
    
    //update tag with buggy and given_name
    if( $buggy == 'true'){
        $result = pg_query($con, "UPDATE tags SET given_name ='".$given_name."', buggy = TRUE WHERE id=".$tag_id.";");
    } else {
        $result = pg_query($con, "UPDATE tags SET given_name ='".$given_name."', buggy = FALSE WHERE id=".$tag_id.";");
    }
 
    return;
}

function get_all_comments_for_tag($tag_id){
    global $con;
    
    $previous_comments = [];
    $comments = pg_query($con,
        "SELECT (u.initials || ' : ' || date(c.date - interval '7 hours') || ' : ' || c.note ) AS comment 
            FROM comments AS c 
            INNER JOIN users AS u 
            ON u.id=user_id 
            INNER JOIN tag_comments AS tc
            ON tc.comment_id=c.id
            WHERE tc.tag_id = ".$tag_id.
            "ORDER BY c.date DESC;" );
    while($row = pg_fetch_array($comments))
    {
        //$row_array['comment']=$row['comment'];
        $broken_line = explode("\n",$row['comment']);
        foreach($broken_line as &$line){
            array_push($previous_comments, $line);
        }
    }
    return $previous_comments;
}

function write_kpp_tag_file($tag_dir, $target_file_name, $tag_id){
    global $con;
    // write file $target_file_name with data in $tag_id

    $wrf_dir = $tag_dir.'/wrf';
    if(!is_dir($wrf_dir)) {
        mkdir($wrf_dir);
    }

    $boxmox_dir = $tag_dir.'/boxmox';
    if(!is_dir($boxmox_dir)) {
        mkdir($boxmox_dir);
    }

    //.eqn and .spc files are identical between wrf and boxmox
    //.def has some additional info for boxmox 
    $eqn_file = fopen($wrf_dir."/".$target_file_name.".eqn",'w');
    $spc_file = fopen($wrf_dir."/".$target_file_name.".spc",'w');
    $def_file = fopen($wrf_dir."/".$target_file_name.".def",'w');

    $b_eqn_file = fopen($boxmox_dir."/".$target_file_name.".eqn",'w');
    $b_spc_file = fopen($boxmox_dir."/".$target_file_name.".spc",'w');
    $b_def_file = fopen($boxmox_dir."/".$target_file_name.".def",'w');

    // get tag information
    $tagresult = pg_query($con,
       "SELECT t.id, t.given_name, u.initials, b.name AS branchname, b.id AS branch_id, t.date, t.buggy , t.filename
        FROM tags AS t
        INNER JOIN users AS u
        ON u.id=t.user_id
        INNER JOIN branches AS b
        ON b.id=t.branch_id
        WHERE t.id=".$tag_id."
        ORDER BY date DESC;");

    while ($tag = pg_fetch_array($tagresult))
    {
        $tagv['id'] =  $tag['id'];
        $tagv['given_name']=  $tag['given_name'];
        $tagv['initials'] =  $tag['initials'];
        $tagv['branchname'] =  $tag['branchname'];
        $tagv['branch_id'] =  $tag['branch_id'];
        $tagv['date'] =  $tag['date'];
        $tagv['buggy'] = ($tag['buggy']=='t');
        $tagv['filename'] = $tag['filename'];
        $tagv['previousComments'] = get_all_comments_for_tag($tagv['id']);
    }

    // header
    // write header to file    
    fwrite($eqn_file,"// User-given Tag Name: ".$tagv['given_name']."\n");
    fwrite($eqn_file,"// Tag database identifier : ".$tagv['filename']."\n");
    fwrite($eqn_file,"// Tag created by : ".$tagv['initials']."\n");
    fwrite($eqn_file,"// Tag created from branch : ".$tagv['branchname']."\n");
    fwrite($eqn_file,"// Tag created on : ".$tagv['date']."\n");
    fwrite($eqn_file,"// Comments for this tag follow:\n");
    foreach ($tagv['previousComments'] as &$t ){
        fwrite($eqn_file,"//     ".$t."\n");
    }

    // write header 
    fwrite($eqn_file,"# EQUATIONS \n");
    fwrite($eqn_file,"// photorates\n");

    //select unique molecules in tag
    $phot_react = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM photolysis AS p INNER JOIN molecules AS m ON m.name=p.moleculename INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=p.id WHERE tp.tag_id = ".$tag_id." ";
    $phot_prod = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM photolysisproducts AS pp INNER JOIN molecules AS m ON m.name=pp.moleculename INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=pp.photolysisid WHERE tp.tag_id = ".$tag_id." ";
    $chem_react = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM reactionreactants AS rr INNER JOIN molecules AS m ON m.name=rr.moleculename INNER JOIN tag_reactions AS tr ON tr.reaction_id=rr.reaction_id WHERE tr.tag_id = ".$tag_id." ";
    $chem_prod = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM reactionproducts AS rp INNER JOIN molecules AS m ON m.name=rp.moleculename INNER JOIN tag_reactions AS tr ON tr.reaction_id=rp.reaction_id WHERE tr.tag_id = ".$tag_id." ";
    $molecules_in_tag_query = $phot_react." UNION ".$phot_prod." UNION ".$chem_react." UNION ".$chem_prod." ORDER BY transport, moleculename;";

    // get an array of {molecules, molecule->formula} strings
    $molecules_result = pg_query($con,$molecules_in_tag_query);
    $m_array = [];
    $m_array[] = "#DEFVAR";
    while($m = pg_fetch_array($molecules_result)){
        if($m['moleculename'] !== 'H2O' && $m['moleculename'] !== 'CO2' && $m['moleculename'] !== 'O2' && $m['moleculename'] !== 'N2') {
            // IGNORE means that there are no stoichiometry tests done for the molecules
            $m_array[]=" ".$m['moleculename']." =IGNORE ;";
        }
    }
    $m_array[] = "#DEFFIX";
    $m_array[] = " M = IGNORE ; {air density}";
    $m_array[] = " H2O = IGNORE ;  {water}";
    $m_array[] = " O2 = IGNORE ;";
    $m_array[] = " N2 = IGNORE ;";
    $m_array[] = " CO2 = IGNORE ;";
    
    // join array elements into string with commas and newlines
    $m_text = implode("\n",$m_array);
    // write molecules to .spc file
    fwrite($spc_file,$m_text);
    fclose($spc_file);

    // index to number of equations
    $equation_index = 0;

// photolysis
    // get all photolysis reactions and components (for tag);

    $groups = pg_query($con,"SELECT id, description, ordering FROM photolysis_groups ORDER BY ordering ASC;");

    // for each reaction(p_array element), construct product string
    $result = pg_prepare($con,"get_wrf_rates",
            "SELECT photr, molecule
             FROM wrf_photo_rates AS wpr
             WHERE wpr.name = $1");
    
    $result = pg_prepare($con,"get_kpp_products",
            "SELECT moleculename, coefficient 
             FROM photolysisproducts AS pp 
             WHERE pp.photolysisid = $1");

    while($group = pg_fetch_array($groups)){

        fwrite($eqn_file,"//\n");
        fwrite($eqn_file,"// ".$group['description']."\n");
        fwrite($eqn_file,"//\n");

        $photolysis_query =
            "SELECT p.id, p.rate, p.moleculename, p.group_id, p.wrf_photo_rates_id, wr.name as wrname, p.wrf_photo_rates_coeff as wrcoeff
             FROM photolysis AS p 
             INNER JOIN tag_photolysis AS tp 
             ON tp.photolysis_id=p.id 
             INNER JOIN wrf_photo_rates AS wr
             ON wr.id = p.wrf_photo_rates_id
             WHERE tp.tag_id =".$tag_id."
             AND p.group_id =".$group['id']."
             ORDER BY p.moleculename ASC;";
    
        $photo_reaction = pg_query($con, $photolysis_query);
    
        while($p = pg_fetch_array($photo_reaction)){
    
            $equation_index += 1;
    
            $p_array = []; // array of strings, each a product of coefficient and molecule
            $p_products = pg_execute($con,"get_kpp_products",array($p['id']));
            while($pp = pg_fetch_array($p_products)){
                if ($pp['coefficient']){
                    $p_array[] = $pp['coefficient']." ".$pp['moleculename'];
                } else {
                    $p_array[] = $pp['moleculename'];
                }
            }
            $product_string = implode("+",$p_array); // combine products for complete yield
    
            $reaction_string = $p['moleculename']."+hv=".$product_string; // reactants
    

            if ($p['wrcoeff']==1.0){
                $rate_string = "j(Pj_".$p['wrname'].") ";
            } else {
                $rate_string = $p['wrcoeff']."_dp*j(Pj_".$p['wrname'].") ";
            }

            //$rate_string = cesm_to_kpp_photo_rate($p['rate']);
    
            // construct string for each line of file
            //$photolysis_reaction_string = $rate_string . "      " . $reactant_string . " -> " . $product_string . "\n";
            // pad on the right with spaces to pseudo-format output
    
            $jstring = "J".$p['id'];
            $lab = "{".$equation_index.":".$jstring."} ";
    
            $pad_string = " ";
            $line = $lab.str_pad($reaction_string, 80, $pad_string, STR_PAD_RIGHT);
            $line .= ": " . $rate_string . " ;\n";
    
            fwrite($eqn_file,$line);
        }
    }

    // chemical reactions
    fwrite($eqn_file,"// gas phase reactions\n");
    // get reactions for a tag


    // queries to find reactants, products
    $result = pg_prepare($con,"get_r_kpp_products",
        "SELECT moleculename, coefficient 
         FROM reactionproducts AS rp 
         WHERE rp.reaction_id = $1");

    $result = pg_prepare($con,"get_r_kpp_reactants",
        "SELECT moleculename
         FROM reactionreactants AS rr 
         WHERE rr.reaction_id = $1");

    $result = pg_prepare($con,"get_group_reactions",
           "SELECT r.id, label, cph, r1, r2, r3, r4, r5, r.group_id, wcr.name
            FROM reactions AS r 
            INNER JOIN tag_reactions AS tr 
            ON tr.reaction_id=r.id 
            LEFT JOIN wrf_custom_rates AS wcr
            ON wcr.id = r.wrf_custom_rate_id
            WHERE tr.tag_id = $1
            AND r.group_id = $2
            ORDER BY r.label ASC;");

    $groups = pg_query($con,"SELECT id, description, ordering FROM reaction_groups ORDER BY ordering ASC;");

    $gas_index = 0;

    while($group = pg_fetch_array($groups)){

        fwrite($eqn_file,"// \n");
        fwrite($eqn_file,"// ".$group['description']."\n");
        fwrite($eqn_file,"// \n");

        $reactions = pg_execute($con,"get_group_reactions",array($tag_id,$group['id']));

        // for each reaction ($r)
        while($r = pg_fetch_array($reactions)){

            $equation_index = $equation_index+1;
            $gas_index = $r['id'];
            $lab = "{".$equation_index.":".$gas_index."} ";
    

            // construct rates string
            $rate_string = ": ";
            $include_mass = true;
            if (!is_null($r['r1']) and !is_null($r['r2']) and !is_null($r['r3']) and !is_null($r['r4']) and !is_null($r['r5']) ) {
                $rate_string = sprintf(": JPL_TROE(%e_dp, %.2f_dp, %e_dp, %.2f_dp, %.2f_dp, TEMP, C_M) ;",$r['r1'],$r['r2'],$r['r3'],$r['r4'],$r['r5']);
                $include_mass = false;
            } elseif (!is_null($r['r1']) and !is_null($r['r2']) and !is_null($r['r3']) and !is_null($r['r4']) ) {
                $rate_string = sprintf(": ERROR(%e_dp, %e_dp, %e_dp, %e_dp, TEMP, C_M) ;",$r['r1'],$r['r2'],$r['r3'],$r['r4']);
            } elseif (!is_null($r['r1']) and !is_null($r['r2']) and !is_null($r['r3'])) {
                $rate_string = sprintf(": ERROR(%e_dp, %e_dp, %e_dp, TEMP, C_M) ;",$r['r1'],$r['r2'],$r['r3']);
            } elseif (!is_null($r['r1']) and !is_null($r['r2']) ) {
                $rate_string = sprintf(": ARR2(%e_dp, %.2f_dp, TEMP) ;",$r['r1'],-$r['r2']);
            } elseif (!is_null($r['r1']) ) {
                $rate_string = sprintf(": %e_dp;",$r['r1']);
            } else if(strpos($r['label'],"usr_") !== false){
                 $rate_string .= $r['name'].";";
            } else {
                $rate_string = ": ERROR(".$r['id'].") ;";
            }

            // construct reactants string
            $r_array = [];
            $r_reactants = pg_execute($con,"get_r_kpp_reactants",array($r['id']));

            while($rr = pg_fetch_array($r_reactants)){
                if ($include_mass) {
                    $r_array[] = $rr['moleculename'];
                } elseif ($rr['moleculename'] != 'M') {
                    $r_array[] = $rr['moleculename'];
                }
            }
            $reactants_string = implode("+",$r_array);

            // construct products string
            $p_array = [];
            $r_products = pg_execute($con,"get_r_kpp_products",array($r['id']));
            while($rp = pg_fetch_array($r_products)){
                if ($include_mass) {
                    if($rp['coefficient']){
                        $p_array[] = $rp['coefficient']." ".$rp['moleculename'];
                    } else {
                        $p_array[] = $rp['moleculename'];
                    }
                } elseif ($rp['moleculename'] != 'M') {
                    if($rp['coefficient']){
                        $p_array[] = $rp['coefficient']." ".$rp['moleculename'];
                    } else {
                        $p_array[] = $rp['moleculename'];
                    }
                }
            }

            $products_string = implode("+",$p_array);

            if(empty($products_string)){
                $products_string = 'M';
            }

            // write line to file
            // pad each string on the right with spaces to attempt somewhat formatted output
            $pad_string = " ";
            $line = str_pad($lab, 10, $pad_string, STR_PAD_RIGHT);
            $line .= $reactants_string. "=". $products_string;
            $line = str_pad($line, 80, $pad_string, STR_PAD_RIGHT);
            $line .=  $rate_string . "\n";
            fwrite($eqn_file,$line);
        }
    }
    
    // close the mechanism file
    fclose($eqn_file);
 
    // copy eqn_file to b_eqn_file (and spc_file similarly)
    if (!copy($wrf_dir."/".$target_file_name.".eqn", $boxmox_dir."/".$target_file_name.".eqn")) {
        echo "failed to copy eqn_file...\n";
    }

    if (!copy($wrf_dir."/".$target_file_name.".spc", $boxmox_dir."/".$target_file_name.".spc")) {
        echo "failed to copy spc_file...\n";
    }

    // construct the def file 
    $b_header = file_get_contents("/home/www/html/data/boxmox_header.def");
    $header = file_get_contents("/home/www/html/data/header.def");
    $footer = file_get_contents("/home/www/html/data/footer.def");

    $spc_file_name = "#include ".$target_file_name.".spc\n";
    $eqn_file_name = "#include ".$target_file_name.".eqn\n";

    fwrite($def_file,"#include atoms_red\n");
    fwrite($def_file,$spc_file_name);
    fwrite($def_file,$eqn_file_name);

    fwrite($b_def_file,"#include atoms_red\n");
    fwrite($b_def_file,$spc_file_name);
    fwrite($b_def_file,$eqn_file_name);

    fwrite($def_file,$header);
    fwrite($b_def_file,$b_header);

    $query =     
        "SELECT wr.id, wr.name, wr.code
         FROM wrf_custom_rates AS wr
         INNER JOIN reactions AS r
               ON r.wrf_custom_rate_id = wr.id
         INNER JOIN tag_reactions as tr
               ON r.id = tr.reaction_id
         WHERE tr.tag_id = ".$tag_id." ;" ;

    $wrf_functions_array = pg_query($con,$query);

    while($wrf_function = pg_fetch_array($wrf_functions_array)){
        fwrite($def_file, $wrf_function['code']);
        fwrite($def_file, "\n");
        fwrite($def_file, "\n");
        fwrite($b_def_file, $wrf_function['code']);
        fwrite($b_def_file, "\n");
        fwrite($b_def_file, "\n");
    }

    fwrite($def_file,$footer);
    fwrite($b_def_file,$footer);

    fclose($def_file);
    fclose($b_def_file);

    return;
}

function write_cesm_tag_file($tag_dir,$target_file_name,$tag_id){

    global $con;
    // write file $target_file_name with data in $tag_id
    $cesm_dir = $tag_dir.'/cesm';
    if(!is_dir($cesm_dir)) {
        mkdir($cesm_dir);
    }

    $tag_file = fopen($cesm_dir."/".$target_file_name.".in",'w');

// get tag information
    $tagresult = pg_query($con,
       "SELECT t.id, t.given_name, u.initials, b.name AS branchname, b.id AS branch_id, t.date, t.buggy , t.filename
        FROM tags AS t
        INNER JOIN users AS u
        ON u.id=t.user_id
        INNER JOIN branches AS b
        ON b.id=t.branch_id
        WHERE t.id=".$tag_id."
        ORDER BY date DESC;");

    while ($tag = pg_fetch_array($tagresult))
    {
        $tagv['id'] =  $tag['id'];
        $tagv['given_name']=  $tag['given_name'];
        $tagv['initials'] =  $tag['initials'];
        $tagv['branchname'] =  $tag['branchname'];
        $tagv['branch_id'] =  $tag['branch_id'];
        $tagv['date'] =  $tag['date'];
        $tagv['buggy'] = ($tag['buggy']=='t');
        $tagv['filename'] = $tag['filename'];
        $tagv['previousComments'] = get_all_comments_for_tag($tagv['id']);
    }

// header
    // write header to file
    fwrite($tag_file,"* User-given Tag Description: ".$tagv['given_name']."\n");
    fwrite($tag_file,"* Tag database identifier : ".$tagv['filename']."\n");
    fwrite($tag_file,"* Tag created by : ".$tagv['initials']."\n");
    fwrite($tag_file,"* Tag created from branch : ".$tagv['branchname']."\n");
    fwrite($tag_file,"* Tag created on : ".$tagv['date']."\n");
    fwrite($tag_file,"* Comments for this tag follow:\n");
    foreach ($tagv['previousComments'] as &$t ){
        fwrite($tag_file,"*     ".$t."\n");
    }

// molecules
    // write molecule header 
    fwrite($tag_file,"\n      SPECIES\n");
    fwrite($tag_file,"\n      Solution\n");

    //select unique molecules in tag
    $phot_react = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM photolysis AS p INNER JOIN molecules AS m ON m.name=p.moleculename INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=p.id WHERE moleculename <> 'H2O' AND tp.tag_id = ".$tag_id." ";
    $phot_prod = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM photolysisproducts AS pp INNER JOIN molecules AS m ON m.name=pp.moleculename INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=pp.photolysisid WHERE moleculename <> 'H2O' AND tp.tag_id = ".$tag_id." ";
    $chem_react = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM reactionreactants AS rr INNER JOIN molecules AS m ON m.name=rr.moleculename INNER JOIN tag_reactions AS tr ON tr.reaction_id=rr.reaction_id WHERE moleculename <> 'H2O' AND tr.tag_id = ".$tag_id." ";
    $chem_prod = "SELECT DISTINCT ON (moleculename) moleculename, formula, transport, solve FROM reactionproducts AS rp INNER JOIN molecules AS m ON m.name=rp.moleculename INNER JOIN tag_reactions AS tr ON tr.reaction_id=rp.reaction_id WHERE moleculename <> 'H2O' AND tr.tag_id = ".$tag_id." ";
    $molecules_in_tag_query = $phot_react." UNION ".$phot_prod." UNION ".$chem_react." UNION ".$chem_prod." ORDER BY transport ASC, moleculename;";

    // get an array of {molecules, molecule->formula} strings
    $molecules_result = pg_query($con,$molecules_in_tag_query);
    $m_array = [];
    $not_trans_array = [];
    $implicit_solve_array = [];
    $explicit_solve_array = [];
    while($m = pg_fetch_array($molecules_result)){
        if($m['formula']){
            $m_array[]=" ".$m['moleculename']." -> ".$m['formula'];
        }else{
            $m_array[]=" ".$m['moleculename'];
        }
        if($m['transport']=="not-transported"){
            $not_trans_array[] =" ".$m['moleculename'];
        }
        if($m['solve']=="explicit"){
            $explicit_solve_array[] =" ".$m['moleculename'];
        }
        if($m['solve']=="implicit"){
            $implicit_solve_array[] =" ".$m['moleculename'];
        }
    }
    $m_array[]=" H2O";
    $implicit_solve_array[] = " H2O";


    // join array elements into string with commas and newlines
    $m_text = implode(",\n",$m_array);
    $implicit_text = implode("\n",$implicit_solve_array);
    $explicit_text = implode("\n",$explicit_solve_array);
    $not_trans_text = implode(",\n",$not_trans_array);

    // write molecules and formulae to file
    fwrite($tag_file,$m_text);

    // write molecule footer to file
    fwrite($tag_file,"\n\n");
    fwrite($tag_file,"      End Solution\n");
    fwrite($tag_file,"\n\n");
    fwrite($tag_file,"      Fixed\n");
    fwrite($tag_file," M\n");
    fwrite($tag_file,"      End Fixed\n\n");
    fwrite($tag_file,"      Not-Transported\n");
    fwrite($tag_file,$not_trans_text);
    fwrite($tag_file,"\n      End Not-Transported\n\n");
    fwrite($tag_file,"   END Species\n");

    // write solution method as implicit for all variables....
    fwrite($tag_file,"\n\n");
    fwrite($tag_file,"   Solution classes\n");
    fwrite($tag_file,"      Explicit\n");
    fwrite($tag_file,$explicit_text."\n");
    fwrite($tag_file,"      End Explicit\n\n");
    fwrite($tag_file,"      Implicit\n");
    fwrite($tag_file,$implicit_text."\n");
    fwrite($tag_file,"      End Implicit\n\n");
    fwrite($tag_file,"   End Solution classes\n");

// CHEMISTRY
    // header
    fwrite($tag_file,"\n\n");
    fwrite($tag_file," CHEMISTRY\n");
    fwrite($tag_file,"      Photolysis\n");

// photolysis
    // get all photolysis reactions and components (for tag);

    $groups = pg_query($con,"SELECT id, description, ordering FROM photolysis_groups ORDER BY ordering ASC;");

    // for each reaction(p_array element), construct product string
    $result = pg_prepare($con,"get_products",
        "SELECT moleculename, coefficient 
         FROM photolysisproducts AS pp 
         WHERE pp.photolysisid = $1");

    while($group = pg_fetch_array($groups)){

        fwrite($tag_file,"*********************************\n");
        fwrite($tag_file,"*** ".$group['description']."\n");
        fwrite($tag_file,"*********************************\n");

        $photolysis_query =
            "SELECT p.id, p.rate, p.moleculename, p.group_id
             FROM photolysis AS p 
             INNER JOIN tag_photolysis AS tp 
             ON tp.photolysis_id=p.id 
             WHERE tp.tag_id =".$tag_id."
             AND p.group_id =".$group['id']."
             ORDER BY p.moleculename ASC;";
    
        $photo_reaction = pg_query($con,$photolysis_query);

        while($p = pg_fetch_array($photo_reaction)){
            $p_array = []; // array of strings, each a product of coefficient and molecule
            $p_products = pg_execute($con,"get_products",array($p['id']));
            while($pp = pg_fetch_array($p_products)){
                if($pp['coefficient']){
                    $p_array[] = $pp['coefficient']."*".$pp['moleculename'];
                } else {
                    $p_array[] = $pp['moleculename'];
                } 
            }
            $product_string = implode(" + ",$p_array); // combine products for complete yield
            $product_string .= " ";
            $reaction_string = $p['moleculename']." + hv -> ".$product_string; // reactants
            $rate_string = "[".$p['rate']."] ";
            // construct string for each line of file
            //$photolysis_reaction_string = $rate_string . "      " . $reactant_string . " -> " . $product_string . "\n";
            // pad on the right with spaces to pseudo-format output
    
            $pad_string = " ";
            $line = str_pad($rate_string, 30, $pad_string, STR_PAD_RIGHT);
            $line .= $reaction_string ."\n";
    
            fwrite($tag_file,$line);
        }
    }
    fwrite($tag_file,"      End Photolysis\n\n");
    
// chemical reactions
    fwrite($tag_file,"      Reactions\n");
    // get reactions for a tag

    // queries to find reactants, products
    $result = pg_prepare($con,"get_r_products",
        "SELECT moleculename, coefficient 
         FROM reactionproducts AS rp 
         WHERE rp.reaction_id = $1");

    $result = pg_prepare($con,"get_r_reactants",
        "SELECT moleculename
         FROM reactionreactants AS rr 
         WHERE rr.reaction_id = $1");

    $groups = pg_query($con,"SELECT id, description, ordering FROM reaction_groups ORDER BY ordering ASC;");

    while($group = pg_fetch_array($groups)){

        fwrite($tag_file,"*********************************\n");
        fwrite($tag_file,"*** ".$group['description']."\n");
        fwrite($tag_file,"*********************************\n");

        $reactions_query =
           "SELECT r.id, label, cph, r1, r2, r3, r4, r5, r.group_id
            FROM reactions AS r 
            INNER JOIN tag_reactions AS tr 
            ON tr.reaction_id=r.id 
            WHERE tr.tag_id =".$tag_id."
            AND r.group_id=".$group['id']."
            ORDER BY r.label ASC;";

        $reactions = pg_query($con,$reactions_query);

        // for each reaction ($r)
        while($r = pg_fetch_array($reactions)){
            // construct reactants string
            $r_array = [];
            $r_reactants = pg_execute($con,"get_r_reactants",array($r['id']));
            while($rr = pg_fetch_array($r_reactants)){
                $r_array[] = $rr['moleculename'];
            }
            $reactants_string = implode(" + ",$r_array);
            $reactants_string .= " ";
    
            // construct products string
            $p_array = [];
            $r_products = pg_execute($con,"get_r_products",array($r['id']));
            while($rp = pg_fetch_array($r_products)){
                if($rp['coefficient']){
                    $p_array[] = $rp['coefficient']."*".$rp['moleculename'];
                } else {
                    $p_array[] = $rp['moleculename'];
                } 
            }
            $products_string = implode(" + ",$p_array);
            $products_string .= " ";
    
            // construct rates string
            $rate_string = "";
            if (!is_null($r['r1'])) $rate_string .= "; ".$r['r1'];
            if (!is_null($r['r2'])) $rate_string .= ", ".$r['r2'];
            if (!is_null($r['r3'])) $rate_string .= ", ".$r['r3'];
            if (!is_null($r['r4'])) $rate_string .= ", ".$r['r4'];
            if (!is_null($r['r5'])) $rate_string .= ", ".$r['r5'];
            $rate_string .= " ";
    
            // construct label string
            if($r['cph']){
                $label_string="[".$r['label'].",".$r['cph']."]";
            } else {
                $label_string="[".$r['label']."]";
            } 
            $label_string .= " ";
    
            // write line to file
            // pad each string on the right with spaces to attempt somewhat formatted output
            $pad_string = " ";
            $line = str_pad($label_string, 23, $pad_string, STR_PAD_RIGHT);
            $line .= $reactants_string. " -> ". $products_string;
            $line = str_pad($line, 80, $pad_string, STR_PAD_RIGHT);
            $line .=  $rate_string . "\n";
            fwrite($tag_file,$line);
        }
    }
    fwrite($tag_file,"      End Reactions\n\n");

// add footer

   $version_text ="      Version Options
        machine = intel
        model   = cam
        model_architecture = SCALAR
        architecture = hybrid
*       vec_ftns = on
        namemod = on
      End Version Options\n";

    fwrite($tag_file,"      Ext Forcing\n");
    fwrite($tag_file,"          NO     \n");
    fwrite($tag_file,"      End Ext Forcing\n\n");
    fwrite($tag_file,"      End Chemistry\n\n");
    fwrite($tag_file,"      SIMULATION PARAMETERS\n\n");
    fwrite($tag_file,$version_text);
    fwrite($tag_file,"\n\n      End Simulation Parameters\n");

    // close the mechanism file
    fclose($tag_file);
    return;
}

?>
