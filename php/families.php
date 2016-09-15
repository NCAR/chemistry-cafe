<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_families')  {
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


?>
