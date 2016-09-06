<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_groups')  {
    case 'get_groups' :
            get_groups();
            break;

    case 'get_group_by_id' :
            get_group_by_id();
            break;
 
    case 'add_group' :
            add_group();
            break;

    case 'mod_group':
            mod_group();
            break;

}


function get_groups() {    
    global $con;

    $qry = pg_query($con, "SELECT * FROM species_groups ORDER BY ordering;");
    $response = array();
    while($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        $res['id'] = $row['id'];
        $res['name'] = $row['name'];
        $res['ordering'] = $row['ordering'];
        $res['description'] = $row['description'];
        array_push($response,$res);
    }
    print_r(json_encode($response));
    return json_encode($response);  
}

function get_group_by_id() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $qry = pg_query($con, "SELECT * FROM species_groups WHERE id = '".$id."';");
    if($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        print_r(json_encode($row));
    }
    return;
}

function add_group() {

    global $con;

    $result = pg_prepare($con,"create_group", "INSERT INTO species_groups (name, description) VALUES ($1, $2) RETURNING id ;");
    $result = pg_prepare($con,"order_group", "UPDATE species_groups SET ordering=$1 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $description = $data->description;

    $result = pg_execute($con, "create_group",array($name, $description));
    $new_group_id = pg_fetch_array($result)[0];

    $result = pg_execute($con, "order_group",array($new_group_id));

    return;
}

function mod_group() {

    global $con;

    $result = pg_prepare($con,"mod_group", "UPDATE species_groups SET name=$2, description=$3 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $description= $data->description;

    $result = pg_execute($con, "mod_group",array($id,$name,$description));

    return;
}


?>
