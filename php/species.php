<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_all_species')  {
    case 'get_species' :
            get_species();
            break;

    case 'get_all_species' :
            get_all_species();
            break;

    case 'update_species' :
            update_species();
            break;

    case 'insert_species' :
            insert_species();
            break;
}


/**  Function to Add a species  **/
function insert_species() {
    global $con;

    $data = json_decode(file_get_contents("php://input")); 

    $name          = $data->speciesname;    
    $formula       = $data->formula;    
    $edescription  = $data->edescription;    
    $aerosol       = $data->aerosol;
    $transport     = $data->transport;
    $source        = $data->source;
    $solve         = $data->solve;
    $wet_dep       = $data->wet_dep;
    $henrys_law_type  = $data->henrys_law_type;
    $henrys_sources   = $data->henrys_sources ;
    $molecular_weight = $data->molecular_weight;
    $kh_298           = $data->kh_298          ;
    $dh_r             = $data->dh_r            ;
    $k1_298           = $data->k1_298          ;
    $dh1_r            = $data->dh1_r           ;
    $k2_298           = $data->k2_298          ;
    $dh2_r            = $data->dh2_r           ;
    $dry_dep       = $data->dry_dep;
    $selectedFamilyIds = $data->selectedFamilyIds;

    $result = pg_prepare($con, "insert_molecules",
            "INSERT INTO molecules 
                 (name, formula, description, transport, 
                  source, aerosol, solve, wet_dep, dry_dep,
                  henrys_law_type, molecular_weight, kh_298, dh_r, k1_298, dh1_r, k2_298, dh2_r, henrys_sources) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
             RETURNING id;");

    $to_be = array($name, $formula, $edescription, $transport, $source, $aerosol, $solve, $wet_dep, $dry_dep, $henrys_law_type, $molecular_weight, $kh_298, $dh_r, $k1_298, $dh1_r, $k2_298, $dh2_r, $henrys_sources);

    $qry_res = pg_execute($con, "insert_molecules", $to_be);
    $new_id = pg_fetch_array($qry_res)[0];

    if ($qry_res) {
        $retval = array('formula' => $formula,'name' =>$name, 'qry' => $qry, 'msg' => "Molecule Added Successfully:".$name, 'success' => true, 'error' => "No error" );
    } 
    else {
        $retval = array('msg' => "Species was not added:".$name, 'success' => false, 'error' => 'Error In inserting record');
    }

    $result = pg_prepare($con, "put_families",
        "INSERT INTO species_families (species_id, families_id)
         VALUES ($1, $2);");

    foreach ( $selectedFamilyIds as$familyid ){
        $q_res = pg_execute($con, "put_families", array($new_id, $familyid));
    }

    print_r(json_encode($retval));
    return json_encode($retval);
    //return $retval;
}

/**  Function to Get All Species  **/
function get_all_species() {
    global $con;

    $result = pg_prepare($con, "get_families", 'SELECT * FROM species_families where species_id=$1;');

    $qry = pg_query($con, 'SELECT * FROM molecules ORDER BY name ;');
    $data = array();
    while($row = pg_fetch_assoc($qry))
    {
        $r = $row;

        $famlist = pg_execute($con,"get_families",array($r['id']));
        while ($fam = pg_fetch_assoc($famlist)) {
          $r['families'][]=$fam;
        }

        array_push($data,$r);
    }
    print_r(json_encode($data));
    return json_encode($data);
}

/**  Function to populate the form so that this species can be edited**/
/**  get a species by name **/
function get_species() {    
    global $con;

    $data = json_decode(file_get_contents("php://input"));     
    $id = $data->id;

    $result = pg_prepare($con, "get_species","SELECT * FROM molecules WHERE id= $1;");
    $result = pg_prepare($con, "get_families", 'SELECT * FROM species_families where species_id=$1;');

    $qry = pg_execute($con, "get_species",array($id));
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
function update_species() {
    global $con;
    $data = json_decode(file_get_contents("php://input")); 
    $id            = $data->id;    
    $name          = $data->speciesname;    
    $formula       = $data->formula;    
    $edescription  = $data->edescription;    
    $aerosol       = $data->aerosol;
    $transport     = $data->transport;
    $source        = $data->source;
    $solve         = $data->solve;
    $wet_dep       = $data->wet_dep;
    $dry_dep       = $data->dry_dep;
    $henrys_law_type  = $data->henrys_law_type;
    $henrys_sources   = $data->henrys_sources ;
    $molecular_weight = $data->molecular_weight;
    $kh_298           = $data->kh_298          ;
    $dh_r             = $data->dh_r            ;
    $k1_298           = $data->k1_298          ;
    $dh1_r            = $data->dh1_r           ;
    $k2_298           = $data->k2_298          ;
    $dh2_r            = $data->dh2_r           ;
    $selectedFamilyIds = $data->selectedFamilyIds;

    $to_be = array($name, $formula, $edescription, $transport, $source, $aerosol, $solve, $wet_dep, $dry_dep, $henrys_law_type, $molecular_weight, $kh_298, $dh_r, $k1_298, $dh1_r, $k2_298, $dh2_r, $henrys_sources);

    $result = pg_prepare($con, "update_molecules",
        "UPDATE molecules SET formula=$2, description=$3, transport=$4, source=$5, aerosol=$6, solve=$7,  wet_dep=$8, dry_dep=$9, henrys_law_type=$10, molecular_weight=$11, kh_298=$12, dh_r=$13, k1_298=$14, dh1_r=$15, k2_298=$16, dh2_r=$17, henrys_sources=$18   WHERE name=$1;");

    $qry_res = pg_execute($con, "update_molecules", $to_be);

    $result = pg_prepare($con, "put_families",
        "INSERT INTO species_families (species_id, families_id)
         VALUES ($1, $2);");

    $result = pg_query($con, "DELETE FROM species_families
         WHERE species_id=".$id.";");

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
