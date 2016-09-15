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
    $henry         = $data->henry;
    $dry_dep       = $data->dry_dep;

    //$qry = "INSERT INTO molecules (name, formula, description) values ('".$name."','".$formula."','".$edescription."');";

    $result = pg_prepare($con, "insert_molecules",
            "INSERT INTO molecules (name, formula, description, transport, source, aerosol, solve, henry, wet_dep, dry_dep) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);");

    $to_be = array($name, $formula, $edescription, $transport, $source, $aerosol, $solve, $henry, $wet_dep, $dry_dep);

    $qry_res = pg_execute($con, "insert_molecules", $to_be);

    if ($qry_res) {
        $retval = array('formula' => $formula,'name' =>$name, 'qry' => $qry, 'msg' => "Molecule Added Successfully:".$name, 'success' => true, 'error' => "No error" );
    } 
    else {
        $retval = array('msg' => "Species was not added:".$name, 'success' => false, 'error' => 'Error In inserting record');
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
    $name = $data->name;

    $result = pg_prepare($con, "get_species","SELECT * FROM molecules WHERE name= $1;");
    $qry = pg_execute($con, "get_species",array($name));
    $res = array();
    if($row = pg_fetch_assoc($qry))
    {
        $res = $row;
    }
    print_r(json_encode($res));
    return json_encode($res);  
}


/** Function to Update Species **/
function update_species() {
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
    $henry         = $data->henry;
    $dry_dep       = $data->dry_dep;

    $to_be = array($name, $formula, $edescription, $transport, $source, $aerosol, $solve, $henry, $wet_dep, $dry_dep);

    $result = pg_prepare($con, "update_molecules",
        "UPDATE molecules SET formula=$2, description=$3, transport=$4, source=$5, aerosol=$6, solve=$7, henry=$8, wet_dep=$9, dry_dep=$10   WHERE name=$1;");

    $qry_res = pg_execute($con, "update_molecules", $to_be);

    //print_r(json_encode($to_be));
    //return(true);

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
