<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_species_in_external')  {
    case 'get_externals' :
            get_externals();
            break;

    case 'get_external_by_id' :
            get_external_by_id();
            break;
 
    case 'add_external' :
            add_external();
            break;

    case 'mod_external':
            mod_external();
            break;

    case 'get_species_in_external':
            get_species_in_external();
            break;
  
   case 'add_species_in_external':
            add_species_in_external();
            break;
  
   case 'del_species_in_external':
            del_species_in_external();
            break;
}


function get_externals() {    
    global $con;

    $qry = pg_query($con, "SELECT * FROM externals ORDER BY ordering;");
    while($row = pg_fetch_assoc($qry,NULL))
    {
        $response[] = $row;
    }
    print_r(json_encode($response));
    return json_encode($response);  
}

function get_external_by_id() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $qry = pg_query($con, "SELECT * FROM externals WHERE id = '".$id."';");
    if($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        print_r(json_encode($row));
    }
    return;
}

function get_species_in_external() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $external_id=$data->external_id;
    //$external_id = 1;

    $qry = pg_query_params($con, "
        WITH sp_e AS (
            SELECT sp.id, sp.name, sp.formula, sp.description, spe.external_id
            FROM molecules AS sp 
            LEFT JOIN species_externals AS spe
            ON spe.species_id=sp.id AND spe.external_id = $1
        )
        SELECT sp_e.id, sp_e.name, sp_e.formula, sp_e.description, 
        CASE WHEN sp_e.external_id = $1 THEN 'T' else 'F' END as inexternal  
        FROM sp_e
        ORDER BY sp_e.name"
        ,array($external_id));

    $spinfam = array();
    while($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        $spinfam[]=$row;
    }
    print_r(json_encode($spinfam));
    return;
}

function add_external() {

    global $con;

    $result = pg_prepare($con,"create_external", "INSERT INTO externals (name, description) VALUES ($1, $2) RETURNING id ;");
    $result = pg_prepare($con,"order_external", "UPDATE externals SET ordering=$1 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $description = $data->description;

    $result = pg_execute($con, "create_external",array($name, $description));
    $new_external_id = pg_fetch_array($result)[0];

    $result = pg_execute($con, "order_external",array($new_external_id));

    return;
}

function mod_external() {

    global $con;

    $result = pg_prepare($con,"mod_external", "UPDATE externals SET name=$2, description=$3 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $description= $data->description;

    $result = pg_execute($con, "mod_external",array($id,$name,$description));

    return;
}

function add_species_in_external() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $externals_id=$data->externals_id;
    $species_id =$data->species_id;

    $qry = pg_query_params($con, "INSERT INTO species_externals (external_id, species_id) VALUES ($1,$2)",array($externals_id,$species_id));
    print_r("added species".$species_id." from external ".$externals_id);
 
}


function del_species_in_external() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $externals_id=$data->externals_id;
    $species_id =$data->species_id;

    $qry = pg_query_params($con, "DELETE FROM species_externals WHERE external_id=$1 and species_id=$2",array($externals_id,$species_id));
    print_r("deleted species".$species_id." from external ".$externals_id);

}


?>
