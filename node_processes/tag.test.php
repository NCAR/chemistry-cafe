<?php

//$row = exec('/usr/local/bin/node /home/www/node_processes/nodels.js /home/www/node_processes',$output,$error);
//while(list(,$row) = each($output)){
//echo $row, "\n";

$data = array("name" => "Robot", "msg" => "Hi guys, I'm a PHP bot !");                                                                    
$data_string = json_encode($data);

$ch = curl_init('http://localhost:8080/phpcallback');                                                                      
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
    'Content-Type: application/json',                                                                                
    'Content-Length: ' . strlen($data_string))                                                                       
);                                                                                                                   

echo curl_exec($ch)."\n";
curl_close($ch);


function write_cesm_tag_file($tag_dir,$target_file_name,$tag_id, $mechanism_id){

    global $con;
    // write file $target_file_name with data in $tag_id
    $cesm_dir = $tag_dir.'/cesm';

    if(!is_dir($cesm_dir)) {
        mkdir($cesm_dir);
    }

    $tag_filename = $cesm_dir."/".$target_file_name.".in";
    $tag_file = fopen($cesm_dir."/".$target_file_name.".in",'w');
    $rpt_file = fopen($cesm_dir."/".$target_file_name.".rpt",'w');
    $species_rpt = fopen($cesm_dir."/".$target_file_name.".species",'w');
    $namelist = fopen($cesm_dir."/".$target_file_name.".atm_in",'w');

// collect species-level diagnostics to namelist
    $sql_q="
        SELECT sd.id, sd.name, sd.species_id, sd.family_id, sd.species_id2, sd.family_id2,
               sp1.name as sp1name, fm1.name as fm1name, sp2.name as sp2name, fm2.name as fm2name
        FROM sdiags AS sd
        INNER JOIN mechanism_sdiags as mws
        ON mws.sdiag_id=sd.id
        LEFT JOIN molecules AS sp1
        ON sp1.id=sd.species_id
        LEFT JOIN molecules AS sp2
        ON sp2.id=sd.species_id2
        LEFT JOIN families AS fm1
        ON fm1.id=sd.family_id
        LEFT JOIN families AS fm2
        ON fm2.id=sd.family_id2
        WHERE mws.mechanism_id = $1;
        ";

    $sdiagslist = pg_query_params($con, $sql_q, array($mechanism_id));
    $sdiags = array();
    fwrite($rpt_file,   "\n Species-level Diagnositic Definitions \n");
    while($diag = pg_fetch_assoc($sdiagslist))
    {
       $diagrow = array();
       $diagrow['name'] = $diag['name'];
       $diagrow['labellist'] = array();
       $diagrow['foundinmech'] = false;
       fwrite($rpt_file, $diag['name'].": ");
       if ($diag['species_id'] ) {
         $mole=  pg_query($con,'SELECT name from molecules where id='.$diag['species_id']);
         if($mole=pg_fetch_assoc($mole)){
             $diagrow['l1']=array($mole['name']);
         }
       }
       if ($diag['family_id'] ) {
         $diagrow['l1']=array();
         $molelist=  pg_query($con,'
              SELECT m.name from species_families 
              INNER JOIN molecules AS m
              on m.id=species_families.species_id
              WHERE species_families.families_id='.$diag['family_id']);
         while($mole=pg_fetch_assoc($molelist)){
             array_push($diagrow['l1'],$mole['name']);
         }
       }
       fwrite($rpt_file, json_encode($diagrow['l1'])." , ");
       if ($diag['species_id2'] ) {
         $mole=  pg_query($con,'SELECT name from molecules where id='.$diag['species_id2']);
         if($mole=pg_fetch_assoc($mole)){
             $diagrow['l2']=array($mole['name']);
         }
       }
       if ($diag['family_id2'] ) {
         $diagrow['l2']=array();
         $molelist=  pg_query($con,'
              SELECT m.name from species_families 
              INNER JOIN molecules AS m
              on m.id=species_families.species_id
              WHERE species_families.families_id='.$diag['family_id2']);
         while($mole=pg_fetch_assoc($molelist)){
             array_push($diagrow['l2'],$mole['name']);
         }
       }
       fwrite($rpt_file, json_encode($diagrow['l2'])."\n");
       array_push($sdiags,$diagrow);
    }

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
    fwrite($tag_file,"* Comments\n");
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
    $phot_react = "SELECT moleculename, formula, transport, solve 
            FROM photolysis AS p 
            INNER JOIN molecules AS m ON m.name=p.moleculename 
            INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=p.id 
            WHERE moleculename <> 'H2O' AND tp.tag_id = ".$tag_id." ";
    $phot_prod = "SELECT moleculename, formula, transport, solve 
            FROM photolysisproducts AS pp 
            INNER JOIN molecules AS m ON m.name=pp.moleculename 
            INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=pp.photolysisid 
            WHERE moleculename <> 'H2O' AND tp.tag_id = ".$tag_id." ";
    $chem_react = "SELECT moleculename, formula, transport, solve 
            FROM reactionreactants AS rr 
            INNER JOIN molecules AS m ON m.name=rr.moleculename 
            INNER JOIN tag_reactions AS tr ON tr.reaction_id=rr.reaction_id 
            WHERE moleculename <> 'H2O' AND tr.tag_id = ".$tag_id." ";
    $chem_prod = "SELECT moleculename, formula, transport, solve 
            FROM reactionproducts AS rp 
            INNER JOIN molecules AS m ON m.name=rp.moleculename 
            INNER JOIN tag_reactions AS tr ON tr.reaction_id=rp.reaction_id 
            WHERE moleculename <> 'H2O' AND tr.tag_id = ".$tag_id." ";

    $molecules_in_tag_query = $phot_react." UNION ".$phot_prod." UNION ".$chem_react." UNION ".$chem_prod." ORDER BY transport ASC, moleculename;";

    $transported_phot_react = "
            SELECT moleculename, formula, description, source, solve, wet_dep, dry_dep
            FROM photolysis AS p 
            INNER JOIN molecules AS m ON m.name=p.moleculename 
            INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=p.id 
            WHERE tp.tag_id = $1
            AND moleculename <> 'H2O'
            AND moleculename NOT IN (
                -- not transported
                SELECT name AS moleculename 
                FROM molecules AS moles
                INNER JOIN mechanism_nottransported AS nt 
                ON moles.id = nt.species_id 
                WHERE mechanism_id = $2
                UNION
                -- nor in fixed
                SELECT name AS moleculename
                FROM molecules 
                INNER JOIN mechanism_fixed
                ON mechanism_fixed.species_id=molecules.id
                WHERE mechanism_fixed.mechanism_id=$2
            )
            ";

    $transported_chem_react = "
            SELECT moleculename, formula, description, source, solve , wet_dep, dry_dep
            FROM reactionreactants AS rr 
            INNER JOIN molecules AS m ON m.name=rr.moleculename 
            INNER JOIN tag_reactions AS tr ON tr.reaction_id=rr.reaction_id 
            WHERE tr.tag_id = $1
            AND moleculename <> 'H2O'
            AND moleculename NOT IN (
                -- not transported
                SELECT name AS moleculename 
                FROM molecules AS moles
                INNER JOIN mechanism_nottransported AS nt 
                ON moles.id = nt.species_id 
                WHERE mechanism_id = $2
                UNION
                -- nor in fixed
                SELECT name AS moleculename
                FROM molecules 
                INNER JOIN mechanism_fixed
                ON mechanism_fixed.species_id=molecules.id
                WHERE mechanism_fixed.mechanism_id=$2
                )
            ";

    $transported_externals_in_mechanism_query ="
            SELECT DISTINCT m.name as moleculename, m.formula, m.description, m.source, m.solve, m.wet_dep, m.dry_dep
            FROM molecules AS m
            INNER JOIN mechanism_externals AS me ON me.mechanism_id = $2
            INNER JOIN externals AS e ON e.id = me.external_id         
            INNER JOIN species_externals AS se ON se.species_id=m.id 
            WHERE se.external_id = e.id 
            AND m.name NOT IN(SELECT name 
                FROM molecules AS moles
                INNER JOIN mechanism_nottransported AS nt 
                ON moles.id = nt.species_id 
                WHERE mechanism_id = $2
                )
           ";

    $transported_reactants_in_tag_query = $transported_phot_react." UNION ".$transported_chem_react." UNION ".$transported_externals_in_mechanism_query." ORDER BY moleculename;";

    $nontransported_phot_react = "
            SELECT m.name as moleculename, m.formula, m.description, m.source, m.solve, m.wet_dep, m.dry_dep
            FROM photolysis AS p 
            INNER JOIN molecules AS m ON m.name=p.moleculename 
            INNER JOIN tag_photolysis AS tp ON tp.photolysis_id=p.id 
            WHERE tp.tag_id = $1
            AND moleculename <> 'H2O' 
            AND moleculename IN (
                -- not transported
                SELECT name AS moleculename 
                FROM molecules AS moles
                INNER JOIN mechanism_nottransported AS nt 
                ON moles.id = nt.species_id 
                WHERE mechanism_id = $2
                )
            AND moleculename NOT IN(
                -- fixed
                SELECT name AS moleculename
                FROM molecules 
                INNER JOIN mechanism_fixed
                ON mechanism_fixed.species_id=molecules.id
                WHERE mechanism_fixed.mechanism_id=$2
                )
            ";

    $nontransported_chem_react = "SELECT m.name as moleculename, m.formula, m.description, m.source, m.solve, m.wet_dep, m.dry_dep
            FROM reactionreactants AS rr 
            INNER JOIN molecules AS m ON m.name=rr.moleculename 
            INNER JOIN tag_reactions AS tr ON tr.reaction_id=rr.reaction_id 
            WHERE tr.tag_id = $1
            AND moleculename <> 'H2O' 
            AND moleculename IN (
                -- not transported
                SELECT name AS moleculename 
                FROM molecules AS moles
                INNER JOIN mechanism_nottransported AS nt 
                ON moles.id = nt.species_id 
                WHERE mechanism_id = $2
                )
            AND moleculename NOT IN(
                -- fixed
                SELECT name AS moleculename
                FROM molecules 
                INNER JOIN mechanism_fixed
                ON mechanism_fixed.species_id=molecules.id
                WHERE mechanism_fixed.mechanism_id=$2
                )
            ";

    $nontransported_externals_in_mechanism_query =
           "SELECT DISTINCT m.name as moleculename, m.formula, m.description, m.source, m.solve, m.wet_dep, m.dry_dep
            FROM molecules AS m
            INNER JOIN mechanism_externals AS me ON me.mechanism_id = $2
            INNER JOIN externals AS e ON e.id = me.external_id         
            INNER JOIN species_externals AS se ON se.species_id=m.id 
            INNER JOIN mechanism_nottransported AS nt ON m.id = nt.species_id 
            WHERE se.external_id = e.id
            ";

    $nontransported_reactants_in_tag_query = $nontransported_phot_react." UNION ".$nontransported_chem_react." UNION ".$nontransported_externals_in_mechanism_query." ORDER BY moleculename;";


    $unsolved_species_query = "
        WITH reactants AS
            (
                SELECT moleculename
                FROM   photolysis AS p 
                INNER JOIN 
                       tag_photolysis AS tp 
                ON     tp.photolysis_id=p.id  
                WHERE  tp.tag_id = ".$tag_id."
                UNION
                SELECT moleculename
                FROM   reactionreactants AS rr 
                INNER JOIN 
                       tag_reactions AS tr 
                ON     tr.reaction_id=rr.reaction_id  
                WHERE  tr.tag_id = ".$tag_id."
           ) 
        SELECT moleculename
        FROM   photolysisproducts AS pp 
        INNER JOIN 
               tag_photolysis AS tp 
        ON     tp.photolysis_id=pp.photolysisid
        WHERE  tp.tag_id = ".$tag_id ."
        AND    moleculename NOT IN (SELECT moleculename FROM reactants)
        UNION
        SELECT moleculename
        FROM   reactionproducts AS rp 
        INNER JOIN 
               tag_reactions AS tr 
        ON     tr.reaction_id=rp.reaction_id
        WHERE  tr.tag_id = ".$tag_id ."
        AND    moleculename NOT IN (SELECT moleculename FROM reactants) 
        ORDER BY moleculename ;";


    // create report of species in mechansim which are not "solution" species.
    $unsolved_result = pg_query($con,$unsolved_species_query);
    fwrite($rpt_file,"Species Appearing only as products\n");
    while($m = pg_fetch_array($unsolved_result)){
        fwrite($rpt_file," ".$m['moleculename']."\n");
    }

    // get an array of {molecules, molecule->formula} strings, [transported, externals, diagnostics, nontransported, H2O]
    $m_array = [];
    $not_trans_array = [];
    $implicit_solve_array = [];
    $explicit_solve_array = [];

    $species_report =[];
    $diags_report =[];

    $trans_molecules_result     = pg_query_params($con,$transported_reactants_in_tag_query,array($tag_id,$mechanism_id));
    $rdiags_result              = pg_query_params($con,$rdiags_query,                      array($mechanism_id));
    $nontrans_molecules_result  = pg_query_params($con,$nontransported_reactants_in_tag_query,array($tag_id,$mechanism_id));
    $fixed_molecules_result     = pg_query_params($con,$fixed_query,                       array($mechanism_id));
    $forcing_result             = pg_query_params($con,$extforcing_query,                  array($mechanism_id));

    while($m = pg_fetch_array($trans_molecules_result)){
        if($m['formula']){
            $m_array[]=" ".$m['moleculename']." -> ".$m['formula'];
        }else{
            $m_array[]=" ".$m['moleculename'];
        }
        if($m['solve']=="explicit"){
            $explicit_solve_array[] =" ".$m['moleculename'];
        }
        if($m['solve']=="implicit"){
            $implicit_solve_array[] =" ".$m['moleculename'];
        }
        $species_report[]=$m['moleculename'].";".$m['formula'].";".$m['description'].";".$m['source'].";".$m['solve'].";".( ($m['wet_dep']==0) ? 'N' :'Y').";".( ($m['dry_dep']==0)? 'N' : 'Y');
    }
    while($m = pg_fetch_array($rdiags_result)){
        if($m['formula']){
            $m_array[]=" ".$m['name']." -> ".$m['formula'];
        }else{
            $m_array[]=" ".$m['name'];
        }
        $explicit_solve_array[] =" ".$m['name'];
        $species_report[]=$m['name'].";".$m['formula'].";Diagnostic;None;Explicit;N;N";
    }
    foreach($sdiags as $sdiag){
        $m_array[]=" ".$sdiag['name'];
        $explicit_solve_array[] =" ".$sdiag['name'];
        $species_report[]=$sdiag['name'].";;Diagnostic;None;Explicit;N;N";
    }
    while($m = pg_fetch_array($nontrans_molecules_result)){
        if($m['formula']){
            $m_array[]=" ".$m['moleculename']." -> ".$m['formula'];
        }else{
            $m_array[]=" ".$m['moleculename'];
        }
        $not_trans_array[] =" ".$m['moleculename'];
        if($m['solve']=="explicit"){
            $explicit_solve_array[] =" ".$m['moleculename'];
        }
        if($m['solve']=="implicit"){
            $implicit_solve_array[] =" ".$m['moleculename'];
        }
        $species_report[]=$m['moleculename'].";".$m['formula'].";".$m['description'].";".$m['source'].";".$m['solve'].";".( ($m['wet_dep']==0) ? 'N' :'Y').";".( ($m['dry_dep']==0)? 'N' : 'Y');
    }

    sort($species_report);
    $species_text="Species_Name;Chemical_Formula;Description;Source;Solver_Method;Wet_Dep;Dry_Dep\n".implode("\n",$species_report);
    fwrite($species_rpt,$species_text);

    $m_array[]=" H2O";
    $implicit_solve_array[] = " H2O";

    $fixed = array();
    $fixed[] = " M";
    while($m = pg_fetch_array($fixed_molecules_result)){
        $fixed[] = " ".$m['name'];
    }

    $file_forced =  "";
    $code_forced =  "";
    while($f = pg_fetch_array($forcing_result)){
       if($f['forcing'] == "File"){
           $file_forced =  $file_forced." ".$f['moleculename']." <- dataset \n";
       } elseif ($f['forcing'] == "Code") {
           $code_forced =  $code_forced." ".$f['moleculename']." \n";
       }
    }


    // join array elements into string with commas and newlines
    $m_text = implode(",\n",$m_array);
    $implicit_text = implode("\n",$implicit_solve_array);
    $explicit_text = implode("\n",$explicit_solve_array);
    $not_trans_text = implode(",\n",$not_trans_array);
    $fixed_text = implode(",",$fixed)."\n";


    // write molecules and formulae to file
    fwrite($tag_file,$m_text);

    // write molecule footer to file
    fwrite($tag_file,"\n\n");
    fwrite($tag_file,"      End Solution\n");
    fwrite($tag_file,"\n\n");
    fwrite($tag_file,"      Fixed\n");
    fwrite($tag_file,$fixed_text);
    fwrite($tag_file,"      End Fixed\n\n");
    fwrite($tag_file,"      Col-int\n");
    fwrite($tag_file," O3 = 0.\n");
    fwrite($tag_file," O2 = 0.\n");
    fwrite($tag_file,"      End Col-int\n\n");
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

    // for each reaction(p_array element), construct product string
    $result = pg_prepare($con,"get_products",
        "SELECT moleculename, coefficient 
         FROM photolysisproducts AS pp 
         WHERE pp.photolysisid = $1");
  
    $result = pg_prepare($con,"get_rdiags", 
         "SELECT r.name as moleculename, pr.coefficient, pr.photolysis_id
          FROM photolysis_rdiags AS pr
          INNER JOIN rdiags AS r on r.id=pr.rdiags_id
          INNER JOIN mechanism_rdiags AS mr ON mr.rdiag_id=pr.rdiags_id
          WHERE mr.mechanism_id=$2
          AND pr.photolysis_id=$1");

    while($group = pg_fetch_array($groups)){

        $photolysis_query =
            "SELECT p.id, p.rate, p.moleculename, p.group_id
             FROM photolysis AS p 
             INNER JOIN tag_photolysis AS tp 
             ON tp.photolysis_id=p.id 
             WHERE tp.tag_id =".$tag_id."
             AND p.group_id =".$group['id']."
             ORDER BY p.moleculename ASC;";
    
        $photo_reaction = pg_query($con,$photolysis_query);

        if(pg_num_rows($photo_reaction) > 0){
            fwrite($tag_file,"*********************************\n");
            fwrite($tag_file,"*** ".$group['description']."\n");
            fwrite($tag_file,"*********************************\n");
        }

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
            $r_diags = pg_execute($con,"get_rdiags",array($p['id'],$mechanism_id));
            while($r_diag = pg_fetch_array($r_diags)){
                $p_array[] = $r_diag['coefficient']."*".$r_diag['moleculename'];
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

    $result = pg_prepare($con,"get_rrdiags",
         "SELECT r.name as moleculename, rr.coefficient
          FROM reaction_rdiags AS rr
          INNER JOIN rdiags AS r on r.id=rr.rdiags_id
          INNER JOIN mechanism_rdiags AS mr ON mr.rdiag_id=rr.rdiags_id
          WHERE mr.mechanism_id=$2
          AND   rr.reaction_id = $1");


    $groups = pg_query($con,"SELECT id, description, ordering FROM reaction_groups ORDER BY ordering ASC;");

    while($group = pg_fetch_array($groups)){

        $reactions_query =
           "SELECT r.id, label, cph, r1, r2, r3, r4, r5, r.group_id
            FROM reactions AS r 
            INNER JOIN tag_reactions AS tr 
            ON tr.reaction_id=r.id 
            WHERE tr.tag_id =".$tag_id."
            AND r.group_id=".$group['id']."
            ORDER BY r.label ASC;";

        $reactions = pg_query($con,$reactions_query);

        if(pg_num_rows($reactions) > 0){
            fwrite($tag_file,"*********************************\n");
            fwrite($tag_file,"*** ".$group['description']."\n");
            fwrite($tag_file,"*********************************\n");
        }


        // for each reaction ($r)
        while($r = pg_fetch_array($reactions)){
            $p_array = [];
            $r_array = [];
            // construct reactants string
            $r_reactants = pg_execute($con,"get_r_reactants",array($r['id']));
            $no_m_r_array = []; // for testing against species-level reactants
            while($rr = pg_fetch_array($r_reactants)){
                $r_array[] = $rr['moleculename'];
                if ($rr['moleculename'] != 'M') {
                    $no_m_r_array[]=$rr['moleculename'];
                }
            }

            foreach ($sdiags as &$sdiag){
              if(count($no_m_r_array) > 1){
                if ( ( in_array($no_m_r_array[0],$sdiag['l1']) && in_array($no_m_r_array[1],$sdiag['l2']) ) || (in_array($no_m_r_array[1],$sdiag['l1']) && in_array($no_m_r_array[0],$sdiag['l2']))){
                    $p_array[]=$sdiag['name'];
                    $sdiag['labellist'][] = $r['label'];
                }
              }
            }

            $reactants_string = implode(" + ",$r_array);
            $reactants_string .= " ";

    
            // construct products string
            $r_products = pg_execute($con,"get_r_products",array($r['id']));
            while($rp = pg_fetch_array($r_products)){
                if($rp['coefficient']){
                    $p_array[] = $rp['coefficient']."*".$rp['moleculename'];
                } else {
                    $p_array[] = $rp['moleculename'];
                } 
            }
            $r_diags = pg_execute($con,"get_rrdiags",array($r['id'], $mechanism_id));
            while($r_diag = pg_fetch_array($r_diags)){
                $p_array[] = $r_diag['coefficient']."*".$r_diag['moleculename'];
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
                $label_string="[".$r['label'].",cph=".$r['cph']."]";
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

    $line = array();
    foreach ($sdiags as &$sdiag){
       $labellist = $sdiag['labellist'];
       $line[] = " ".$sdiag['name']." = ".implode(" + ",$labellist);
    }
    $sdiag_string = " '".implode("',\n '",$line)." '\n";

    fwrite($namelist, $sdiag_string);
    // close the mechanism file
    fclose($tag_file);

    // run cam preprocessor

    // campp  cam-chem preprocessor skeleton files
    $campp_src = "/home/www/html/campp_skel";
    $campp_dst = $cesm_dir.'/campp';

    mkdir($campp_dst);
    mkdir($campp_dst.'/'.$target_file_name);
    $target_campp = $campp_dst.'/inputs/';
    $campp_file = fopen($target_campp.$target_file_name.".in",'w');
    file_put_contents($target_campp.$target_file_name.".in", $campp_header);

    $output = shell_exec('cd '.$target_campp.'; ../campp '.$target_file_name.'.in ;');
    return;
}
    

?>
