<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_species_in_family')  {
    case 'get_families' :
            get_families();
            break;

    case 'get_family_by_id' :
            get_family_by_id();
            break;
 
    case 'add_family' :
            add_family();
            break;

    case 'mod_family':
            mod_family();
            break;

    case 'get_species_in_family':
            get_species_in_family();
            break;
  
   case 'add_species_in_family':
            add_species_in_family();
            break;
  
   case 'del_species_in_family':
            del_species_in_family();
            break;
}


function get_families() {    
    global $con;

    $qry = pg_query($con, "SELECT * FROM families ORDER BY ordering;");
    while($row = pg_fetch_assoc($qry,NULL))
    {
        $response[] = $row;
    }
    print_r(json_encode($response));
    return json_encode($response);  
}

function get_family_by_id() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $qry = pg_query($con, "SELECT * FROM families WHERE id = '".$id."';");
    if($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        print_r(json_encode($row));
    }
    return;
}

function get_species_in_family() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $family_id=$data->family_id;
    //$family_id = 1;

    $qry = pg_query_params($con, "
        WITH sp_f AS (
            SELECT sp.id, sp.name, sp.formula, sp.description, spf.families_id
            FROM molecules AS sp 
            LEFT JOIN species_families AS spf
            ON spf.species_id=sp.id AND spf.families_id = $1
        )
        SELECT sp_f.id, sp_f.name, sp_f.formula, sp_f.description, 
        CASE WHEN sp_f.families_id = $1 THEN 'T' else 'F' END as infamily  
        FROM sp_f
        ORDER BY sp_f.name"
        ,array($family_id));

    $spinfam = array();
    while($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        $spinfam[]=$row;
    }
    print_r(json_encode($spinfam));
    return;
}

function add_family() {

    global $con;

    $result = pg_prepare($con,"create_family", "INSERT INTO families (name, description) VALUES ($1, $2) RETURNING id ;");
    $result = pg_prepare($con,"order_family", "UPDATE families SET ordering=$1 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $description = $data->description;

    $result = pg_execute($con, "create_family",array($name, $description));
    $new_family_id = pg_fetch_array($result)[0];

    $result = pg_execute($con, "order_family",array($new_family_id));

    return;
}

function mod_family() {

    global $con;

    $result = pg_prepare($con,"mod_family", "UPDATE families SET name=$2, description=$3 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $description= $data->description;

    $result = pg_execute($con, "mod_family",array($id,$name,$description));

    return;
}

function add_species_in_family() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $families_id=$data->families_id;
    $species_id =$data->species_id;

    $qry = pg_query_params($con, "INSERT INTO species_families (families_id, species_id) VALUES ($1,$2)",array($families_id,$species_id));
    print_r("added species".$species_id." from family ".$families_id);
 
}


function del_species_in_family() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $families_id=$data->families_id;
    $species_id =$data->species_id;

    $qry = pg_query_params($con, "DELETE FROM species_families WHERE families_id=$1 and species_id=$2",array($families_id,$species_id));
    print_r("deleted species".$species_id." from family ".$families_id);

}


?>
