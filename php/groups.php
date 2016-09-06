<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_photolysis_groups')  {
    case 'get_reaction_groups' :
            get_reaction_groups();
            break;

    case 'get_photolysis_groups' :
            get_photolysis_groups();
            break;
 
    case 'get_photolysis_group_by_id' :
            get_photolysis_group_by_id();
            break;
 
    case 'get_reaction_group_by_id' :
            get_reaction_group_by_id();
            break;

    case 'add_reaction_group' :
            add_reaction_group();
            break;

    case 'add_photolysis_group' :
            add_photolysis_group();
            break;

    case 'mod_reaction_group':
            mod_reaction_group();
            break;

    case 'mod_photolysis_group':
            mod_photolysis_group();
            break;
}


function get_reaction_groups() {    
    global $con;

    $qry = pg_query($con, "SELECT id, description, ordering FROM reaction_groups ORDER BY ordering;");
    $response = array();
    while($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        $res['id'] = $row['id'];
        $res['description'] = $row['description'];
        $res['ordering'] = $row['ordering'];
        $res['drag'] = true;
        array_push($response,$res);
    }
    print_r(json_encode($response));
    return json_encode($response);  
}

function get_photolysis_groups() {
    global $con;

    $qry = pg_query($con, "SELECT id, description, ordering FROM photolysis_groups;");
    $response = array();
    while($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        $res['id'] = $row['id'];
        $res['description'] = $row['description'];
        $res['ordering'] = $row['ordering'];
        array_push($response,$res);
    }
    print_r(json_encode($response));
    return json_encode($response);  
}
 
function get_photolysis_group_by_id() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $pid = $data->id;

    $qry = pg_query($con, "SELECT id, description, ordering FROM photolysis_groups WHERE id = '".$pid."';");
    if($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        print_r(json_encode($row));
    }
    return;
}

function get_reaction_group_by_id() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $pid = $data->id;

    $qry = pg_query($con, "SELECT id, description, ordering FROM reaction_groups WHERE id = '".$pid."';");
    if($row = pg_fetch_array($qry,NULL, PGSQL_ASSOC))
    {
        print_r(json_encode($row));
    }
    return;  
}


function add_reaction_group() {


    global $con;

    $result = pg_prepare($con,"create_reaction_group", "INSERT INTO reaction_groups (description) VALUES ($1) RETURNING id;");
    $result = pg_prepare($con,"order_reaction_group", "UPDATE reaction_groups SET ordering=$1 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $edescription = $data->edescription;

    $result = pg_execute($con, "create_reaction_group",array($edescription));
    $new_group_id = pg_fetch_array($result)[0];

    $result = pg_execute($con, "order_reaction_group",array($new_group_id));

    return;
}

function add_photolysis_group() {

    global $con;

    $result = pg_prepare($con,"create_photolysis_group", "INSERT INTO photolysis_groups (description) VALUES ($1) RETURNING id;");
    $result = pg_prepare($con,"order_photolysis_group", "UPDATE photolysis_groups SET ordering=$1 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $edescription = $data->edescription;

    $result = pg_execute($con, "create_photolysis_group",array($edescription));
    $new_group_id = pg_fetch_array($result)[0];

    $result = pg_execute($con, "order_photolysis_group",array($new_group_id));

    return;
}

function mod_reaction_group() {

    global $con;

    $result = pg_prepare($con,"mod_reaction_group", "UPDATE reaction_groups SET description=$2 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $edescription = $data->edescription;

    $result = pg_execute($con, "mod_reaction_group",array($id,$edescription));

    return;
}

function mod_photolysis_group() {

    global $con;
                
    $result = pg_prepare($con,"mod_photolysis_group", "UPDATE photolysis_groups SET description=$2 WHERE id=$1 ;");

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $edescription = $data->edescription;

    $result = pg_execute($con, "mod_photolysis_group",array($id,$edescription));

    return;
}


?>
