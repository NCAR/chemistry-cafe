<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_all_diagnostics')  {
    case 'get_all_diagnostics' :
            get_all_diagnostics();
            break;

    case 'get_diagnostic_by_id' :
            get_diagnostic_by_id();
            break;

    case 'add_reaction_level_diagnostic' :
            add_reaction_level_diagnostic();
            break;

    case 'mod_reaction_level_diagnostic' :
            mod_reaction_level_diagnostic();
            break;

    case 'add_species_level_diagnostic' :
            add_species_level_diagnostic();
            break;

    case 'mod_species_level_diagnostic' :
            add_reaction_level_diagnostic();
            break;

}


/**  Function to Add a diagnostics  **/
function insert_diagnostics() {
    global $con;

    $data = json_decode(file_get_contents("php://input")); 

    $name          = $data->diagnostics;    
    $formula       = $data->formula;    
    $edescription  = $data->edescription;    
    $aerosol       = $data->aerosol;
    $transport     = $data->transport;
    $source        = $data->source;
    $solve         = $data->solve;
    $wet_dep       = $data->wet_dep;
    $henry         = $data->henry;
    $dry_dep       = $data->dry_dep;
    $selectedFamilyIds = $data->selectedFamilyIds;

    $result = pg_prepare($con, "insert_molecules",
            "INSERT INTO molecules (name, formula, description, transport, source, aerosol, solve, henry, wet_dep, dry_dep) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING id;");

    $to_be = array($name, $formula, $edescription, $transport, $source, $aerosol, $solve, $henry, $wet_dep, $dry_dep);

    $qry_res = pg_execute($con, "insert_molecules", $to_be);
    $new_id = pg_fetch_array($qry_res)[0];

    if ($qry_res) {
        $retval = array('formula' => $formula,'name' =>$name, 'qry' => $qry, 'msg' => "Molecule Added Successfully:".$name, 'success' => true, 'error' => "No error" );
    } 
    else {
        $retval = array('msg' => "Species was not added:".$name, 'success' => false, 'error' => 'Error In inserting record');
    }

    $result = pg_prepare($con, "put_families",
        "INSERT INTO diagnostics (diagnostics, families_id)
         VALUES ($1, $2);");

    foreach ( $selectedFamilyIds as$familyid ){
        $q_res = pg_execute($con, "put_families", array($new_id, $familyid));
    }

    print_r(json_encode($retval));
    return json_encode($retval);
    //return $retval;
}

/**  Function to Get All Species  **/
function get_all_diagnostics() {
    global $con;

    $diags['sdiags'] = array();

    /**  Species-level diagnostics such as VOC + OH **/
    $sdiags = pg_query($con, 'SELECT * FROM sdiags;');

    while($diag = pg_fetch_assoc($sdiags))
    {
       $diags['sdiags'][] = $diag;
    }

    /**  Reaction-level diagnostics such as N-conservation **/
    $diags['rdiags'] = array();

        $diags['rdiags'][] = ['null'];

    print_r(json_encode($diags));
    return json_encode($diags);
}

/**  Function to populate the form so that this diagnostics can be edited**/
/**  get a diagnostics by name **/
function get_diagnostics() {    
    global $con;

    $data = json_decode(file_get_contents("php://input"));     
    $id = $data->id;

    $result = pg_prepare($con, "get_diagnostics", 'SELECT * FROM diagnostics where diagnostics=$1;');

    $qry = pg_execute($con, "get_diagnostics",array($id));
    $res = array();
    if($row = pg_fetch_assoc($qry))
    {
        $res = $row;

        $famlist = pg_execute($con,"get_families",array($res['id']));
        while ($fam = pg_fetch_assoc($famlist)) {
          $res['selectedFamilyIds'][]=$fam['families_id'];
        }
    }
    print_r(json_encode($res));
    return json_encode($res);  
}


/** Function to Update Species **/
function update_diagnostics() {
    global $con;
    $data = json_decode(file_get_contents("php://input")); 
    $id            = $data->id;    
    $name          = $data->diagnostics;    
    $formula       = $data->formula;    
    $edescription  = $data->edescription;    
    $aerosol       = $data->aerosol;
    $transport     = $data->transport;
    $source        = $data->source;
    $solve         = $data->solve;
    $wet_dep       = $data->wet_dep;
    $henry         = $data->henry;
    $dry_dep       = $data->dry_dep;
    $selectedFamilyIds = $data->selectedFamilyIds;

    $to_be = array($name, $formula, $edescription, $transport, $source, $aerosol, $solve, $henry, $wet_dep, $dry_dep);

    $result = pg_prepare($con, "update_molecules",
        "UPDATE molecules SET formula=$2, description=$3, transport=$4, source=$5, aerosol=$6, solve=$7, henry=$8, wet_dep=$9, dry_dep=$10   WHERE name=$1;");

    $qry_res = pg_execute($con, "update_molecules", $to_be);

    $result = pg_prepare($con, "put_families",
        "INSERT INTO diagnostics (diagnostics, families_id)
         VALUES ($1, $2);");

    $result = pg_query($con, "DELETE FROM diagnostics
         WHERE diagnostics=".$id.";");

    foreach ( $selectedFamilyIds as $familyid ){
        $result = pg_execute($con, "put_families", array($id, $familyid));
    }


    if ($qry_res) {
        $arr = array('msg' => "Species Updated Successfully!!!", 'error' => false);
        $jsn = json_encode($arr);
        print_r($jsn);
        return(true);
    } else {
        $arr = array('msg' => "Error In Updating record", 'error' => true);
        $jsn = json_encode($arr);
        print_r($jsn);
        return(false);
    }
}

?>
