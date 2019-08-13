<?php

include('../php/config.php');


//switch('test')  { // testing 
switch($_GET['action'])  {
    //case 'get_all_branches' :
            //get_all_branches();
            //break;

    //case 'get_all_tags' :
            //get_all_tags();
            //break;

    case 'return_tag' :
            //global $con;
            //get_all_comments_for_tag($id);
            //return_tag_json(255 );
            return_tag_json($_GET['tag_id'] );
            //return_tag_json(137 );
            break;

    case 'test' :
            //global $con;
            ////get_all_comments_for_tag($id);
            //return_tag_json($_GET['tag_id'] );
            return_tag_json(265 );
            //break;

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

function get_all_comments_for_tag($tag_id){
    global $con;
    
    $previous_comments = array();
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
    $comment_list = array("comments"=>$previous_comments);
    //print(json_encode($comment_list));
    return $comment_list;
}

function return_tag_json($tag_id){
    global $con;

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

    //select unique molecules in tag
    $phot_react = "SELECT moleculename, formula, transport, solve, henrys_law_type, molecular_weight, kh_298, dh_r, k1_298, dh1_r, k2_298, dh2_r, concat(moleculename,'_std') as standard_name
	    FROM photolysis AS p 
	    INNER JOIN molecules AS m ON m.name=p.moleculename 
	    INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=p.id WHERE tp.tag_id = ".$tag_id." ";
    $phot_prod = "SELECT moleculename, formula, transport, solve, henrys_law_type, molecular_weight, kh_298, dh_r, k1_298, dh1_r, k2_298, dh2_r, concat(moleculename,'_std') as standard_name
	    FROM photolysisproducts AS pp 
	    INNER JOIN molecules AS m ON m.name=pp.moleculename 
	    INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=pp.photolysisid WHERE tp.tag_id = ".$tag_id." ";
    $chem_react = "SELECT moleculename, formula, transport, solve, henrys_law_type, molecular_weight, kh_298, dh_r, k1_298, dh1_r, k2_298, dh2_r , concat(moleculename,'_std') as standard_name
	    FROM reactionreactants AS rr 
	    INNER JOIN molecules AS m ON m.name=rr.moleculename 
	    INNER JOIN tag_reactions AS tr ON tr.reaction_id=rr.reaction_id WHERE tr.tag_id = ".$tag_id." ";
    $chem_prod = "SELECT moleculename, formula, transport, solve, henrys_law_type, molecular_weight, kh_298, dh_r, k1_298, dh1_r, k2_298, dh2_r , concat(moleculename,'_std') as standard_name
	    FROM reactionproducts AS rp 
	    INNER JOIN molecules AS m ON m.name=rp.moleculename 
	    INNER JOIN tag_reactions AS tr ON tr.reaction_id=rp.reaction_id WHERE tr.tag_id = ".$tag_id." ";

    $molecules_in_tag_query = $phot_react." UNION ".$phot_prod." UNION ".$chem_react." UNION ".$chem_prod ." ORDER BY moleculename;";

    $molecules_result = pg_query($con,$molecules_in_tag_query);
    if (pg_num_rows($molecules_result)) {
        $molecule_array = pg_fetch_all($molecules_result);
    } 
    else {
        $molecule_array = [];
    }

    $molecule_section =array("molecules"=>$molecule_array);

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

    $photolysis_query =
        "SELECT p.id, 
            p.rate, 
            p.moleculename, 
            p.group_id, 
            p.wrf_photo_rates_id, 
            wr.name as wrname, 
            p.wrf_photo_rates_coeff as wrcoeff,
            p.tuv_id,
            p.tuv_coeff,
            tuv.reaction as tuv_reaction
         FROM photolysis AS p 
         INNER JOIN tag_photolysis AS tp 
         ON tp.photolysis_id=p.id 
         INNER JOIN wrf_photo_rates AS wr
         ON wr.id = p.wrf_photo_rates_id
         INNER JOIN tuv
         ON tuv.id = p.tuv_id
         WHERE tp.tag_id =".$tag_id."
         ORDER BY p.moleculename ASC;";
    
    $photo_reaction = pg_query($con, $photolysis_query);

    $photolysis_array = [];
    while($p = pg_fetch_array($photo_reaction)){

            $p_array = []; // array of products and coefficients
            $p_products = pg_execute($con,"get_kpp_products",array($p['id']));
            while($pp = pg_fetch_array($p_products)){
                if ($pp['coefficient']){
                    $p_array[] = array("coefficient"=>$pp['coefficient'], "molecule"=>$pp['moleculename']);
                } else {
                    $p_array[] = array("coefficient"=>1, "molecule"=>$pp['moleculename']);
                }
            }

            $p_wpr = pg_execute($con,"get_wrf_rates",array($pp['wrf_photo_rates_id']));
            $wpr = pg_fetch_array($p_wpr);

            $reactant = array($p['moleculename']);

            $photolysis_array[] = array(
                "reactants"=>$reactant, 
                "id"=>$p['id'], 
                "rate"=>$p['rate'], 
                "wrf_rate"=>$wpr['photr'],
                "tuv_id"=>$p['tuv_id'],
                "tuv_coeff"=>$p['tuv_coeff'],
                "tuv_reaction"=>$p['tuv_reaction'],
                "reactant_count" => 1, 
                "troe" => false, 
                "products"=>$p_array
                );
    }
            
    $photolysis_section = array("photolysis"=>$photolysis_array);
    

    // chemical reactions


    // queries to find reactants, products
    $result = pg_prepare($con,"get_r_kpp_products",
        "SELECT moleculename, coefficient 
         FROM reactionproducts AS rp 
         WHERE rp.reaction_id = $1");

    $result = pg_prepare($con,"get_r_kpp_reactants",
        "SELECT moleculename
         FROM reactionreactants AS rr 
         WHERE rr.reaction_id = $1");

    $result = pg_prepare($con,"get_reactions",
           "SELECT r.id, label, cph, r1, r2, r3, r4, r5, r.group_id, 
                   wcr.name, 
                   r.rate_constant_call, 
                   r.rate_constant_function_id,
                   rcf.name as rate_function_name, 
                   rcf.id as rate_function_id,
                   rcf.fortran_computation as fortran
            FROM reactions AS r 
            INNER JOIN tag_reactions AS tr 
            ON tr.reaction_id=r.id 
            LEFT JOIN rate_constant_function as rcf
            ON r.rate_constant_function_id = rcf.id
            LEFT JOIN wrf_custom_rates AS wcr
            ON wcr.id = r.wrf_custom_rate_id
            WHERE tr.tag_id = $1
            ORDER BY r.label ASC;");


    $reactions = pg_execute($con,"get_reactions",array($tag_id));

    $reaction_rate_constant_functions_set = array(); 
    $reaction_array = array();

    $include_mass = false;
    $t_inv_300 = false;
    $t_inv = false;

    // for each reaction ($r)
    while($r = pg_fetch_array($reactions)){

        // construct rates string
        if (!is_null($r['r1']) and !is_null($r['r2']) and !is_null($r['r3']) and !is_null($r['r4']) and !is_null($r['r5']) ) {
            $rate_string =  sprintf(" troe(%e_r8, %.2f_r8, %e_r8, %.2f_r8, %.2f_r8, t_inv_300, C_M) ",$r['r1'],$r['r2'],$r['r3'],$r['r4'],$r['r5']);
            $include_mass = true;
            $t_inv_300 = true;
        } elseif (!is_null($r['r1']) and !is_null($r['r2']) and !is_null($r['r3']) and !is_null($r['r4']) ) {
            $rate_string = sprintf(" ERROR(%e_r8, %e_r8, %e_r8, %e_r8, TEMP, C_M) ",$r['r1'],$r['r2'],$r['r3'],$r['r4']);
        } elseif (!is_null($r['r1']) and !is_null($r['r2']) and !is_null($r['r3'])) {
            $rate_string = sprintf(" ERROR(%e_r8, %e_r8, %e_r8, TEMP, C_M) ",$r['r1'],$r['r2'],$r['r3']);
        } elseif (!is_null($r['r1']) and !is_null($r['r2']) ) {
            $rate_string = sprintf(' %e_r8 * exp(%.2f_r8 / TEMP) ',$r['r1'],$r['r2']);
            $t_inv = true;
        } elseif (!is_null($r['r1']) ) {
            $rate_string = sprintf(" %e_r8",$r['r1']);
        } else if(strpos($r['label'],"usr_") !== false){
             $rate_string = $r['name'];
        } else {
            $rate_string = " ERROR(".$r['id'].")";
        }
        $r['rate_string'] = $rate_string;
        
        if(!is_null($r['rate_function_id'])){
          $r['rate_constant_function_call'] = $r['rate_function_name']."(".$r['rate_constant_call'].")";
          $reaction_rate_constant_functions_set[] = $r['rate_function_id'];
        }



        // construct reactants
        $no_m_r_array = []; // for testing against species-level reactants
        $r_array = [];
        $troe = false;
        $reactant_count = 0;
        $r_reactants = pg_execute($con,"get_r_kpp_reactants",array($r['id']));
        while($rr = pg_fetch_array($r_reactants)){
            $reactant_count ++;
            if ($rr['moleculename'] == 'M') {
                $troe = true;
            }else{
                $r_array[] = $rr['moleculename'];
            }
        }
        $r['reactants']=$r_array;

        // construct products
        $r_products = pg_execute($con,"get_r_kpp_products",array($r['id']));
        $p_array = [];
        while($rp = pg_fetch_array($r_products)){
            if ($rp['moleculename'] != 'M') {
                if(!is_null($rp['coefficient'])){
                    $p_array[] = array('coefficient'=>$rp['coefficient'], 'molecule'=>$rp['moleculename']);
                } else {
                    $p_array[] = array('coefficient'=>1, 'molecule'=>$rp['moleculename']);
                }
            }
        }
        $r['products']=$p_array;
        if($_GET['micm'] == 'true'){
            $reaction_array[] = array( 
              "rate" => $r['rate_constant_function_call'],
              "reactants" => $r['reactants'], 
              "reactant_count" => $reactant_count, 
              "troe" => $troe, 
              "products" => $r['products']
              );
        } else {
            $reaction_array[] = array(
              "rate" => $r['rate_string'], 
              "reactants" => $r['reactants'],
              "reactant_count" => $reactant_count,
              "troe" => $troe,
              "products" => $r['products']
              );
        }
    }
    // collect rate constant functions
    $rate_function_ids = array_unique($reaction_rate_constant_functions_set);

    $rate_list = array();

    $result = pg_prepare($con,"get_rate_functions",
        "SELECT *
         FROM rate_constant_function 
         WHERE rate_constant_function.id = $1;" );

    foreach( $rate_function_ids as $rate_id ){
      $row_list = pg_execute($con, "get_rate_functions", array($rate_id));
      while($row = pg_fetch_array($row_list))
        {
          $row_array['id'] =  $row['id'];
          $row_array['name']=  $row['name'];
          $row_array['returned_units']=  $row['returned_units'];
          $row_array['local_variables']=  $row['local_variables'];
          $row_array['code']=  $row['fortran_computation'];
          array_push($rate_list, $row_array);
        }
    }
    
    $query =     
        "SELECT DISTINCT wr.id, wr.name, wr.code
         FROM wrf_custom_rates AS wr
         INNER JOIN reactions AS r
               ON r.wrf_custom_rate_id = wr.id
         INNER JOIN tag_reactions as tr
               ON r.id = tr.reaction_id
         WHERE tr.tag_id = ".$tag_id." ;" ;

    $result = pg_prepare($con,"get_custom_functions",$query); 

    $wrf_custom_functions_query_result = pg_execute($con,"get_custom_functions",array());
    $wrf_functions_array = [];
    while($custom_function = pg_fetch_array($wrf_custom_functions_query_result)){
        $wrf_functions_array[] = array(
             "name"=>$custom_function['name'],
             "code"=>str_replace("_dp","_r8",str_replace("KIND=dp","KIND=r8",$custom_function['code']))
             );
    }

    if($_GET['micm'] == 'true'){
        $mechanism = array( "mechanism"=> array(
           "tag_info"=>$tagv,
           "molecules"=>$molecule_array, 
           "photolysis"=>$photolysis_array, 
           "reactions"=>$reaction_array, 
           "custom_rates"=>$rate_list,
           "t_inv_300"=>$t_inv_300,
           "t_inv"=>$t_inv,
           "include_mass"=>$include_mass,
           ));
    } else {
        $mechanism = array( "mechanism"=> array(
           "tag_info"=>$tagv,
           "molecules"=>$molecule_array, 
           "photolysis"=>$photolysis_array, 
           "reactions"=>$reaction_array, 
           "custom_rates"=>$wrf_functions_array ,
           ));
    }

    print(json_encode($mechanism, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    

}

?>
