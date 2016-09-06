<?php

include('config.php'); 

switch($_GET['action'])  {
//switch('get_all_rates')  { // testing :  unix-prompt> php thisfile.php
    case 'get_all_rates' :
            get_all_rates();
            break;

    case 'add_rates' :
            add_ref_no_file();
            break;

    case 'get_rate_by_id' :
            get_rate_by_id();
            break;

}

function get_all_rates() {
    global $con;
    $result = pg_query($con, 
        "SELECT r.id, r.name, r.version, r.deprecated, r.code
         FROM wrf_custom_rates as r
         ORDER BY r.id DESC;" );

    $rate_list = array();
    while($row = pg_fetch_array($result))
    {
        $row_array['id'] =  $row['id'];
        $row_array['name']=  $row['name'];
        $row_array['version']=  $row['version'];
        $row_array['deprecated']=  $row['deprecated'];
        $row_array['code']=  $row['code'];
        array_push($rate_list, $row_array);
    }
    print_r(json_encode($rate_list));
    return json_encode($rate_list);
}

function get_rate_by_id() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $result = pg_query($con, 
        "SELECT r.id, r.name, r.version, r.deprecated, r.code
         FROM wrf_custom_rates as r
         WHERE r.id =".$id."
         ORDER BY r.id DESC;" );

    $rate_list = array();
    while($row = pg_fetch_array($result))
    {
        $row_array['id'] =  $row['id'];
        $row_array['name']=  $row['name'];
        $row_array['version']=  $row['version'];
        $row_array['deprecated']=  $row['deprecated'];
        $row_array['code']=  $row['code'];
        array_push($rate_list, $row_array);
    }
    print_r(json_encode($rate_list));
    return json_encode($rate_list);
}



function add_rates() {

    return 3;
    //file is stored with a name: $ref_files.id+"_"+$original_file_name

    global $con;

    $out ="start update";

    $user_name = $_COOKIE['chemdb_id'];

    $data = json_decode(file_get_contents("php://input"));
    $doi          = $data->doi;
    $citation     = $data->citation;
    $detail       = $data->detail;
    $label        = $data->label;
    $http         = $data->http;

    $out .=" username:".$user_name."\n givenname".$label ;

    //find id of person uploading file
    $id_res = pg_query($con, "SELECT id FROM users WHERE username ='".$user_name."';");
    $row = pg_fetch_array($id_res);
    $user_id = $row['id'];

    $result = pg_prepare($con, "add_ref","INSERT INTO ref_files (user_id, doi, citation, label, detail, http) VALUES ($1, $2, $3, $4, $5, $6 );");
    $result = pg_execute($con, "add_ref", array($user_id, $doi, $citation, $label, $detail, $http));

    print_r(json_encode($out));
    return(json_encode($out));
}


?>
