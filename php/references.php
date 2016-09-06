<?php

include('config.php'); 

switch($_GET['action'])  {
//switch('get_all_references')  { // testing :  php < thisfile.php
    case 'get_all_references' :
            get_all_references();
            break;

    case 'upload_reference' :
            upload_reference();
            break;

    case 'add_ref_no_file' :
            add_ref_no_file();
            break;

    case 'show_file' :
            show_file();
            break;

}

function get_all_references() {
    global $con;
    $result = pg_query($con, 
        "SELECT r.id, r.original_name, u.username, r.doi, r.citation, r.label, r.http, r.detail
         FROM ref_files as r
         INNER JOIN users AS u 
         ON r.user_id=u.id
         ORDER BY r.date DESC;" );
    $ref_list = array();
    while($row = pg_fetch_array($result))
    {
        $row_array['id'] =  $row['id'];
        $row_array['filename']=  $row['original_name'];
        $row_array['username']=  $row['username'];
        $row_array['doi']=  $row['doi'];
        $row_array['desc'] = $row['label']." -- ".$row['original_name'];
        $row_array['detail'] = $row['detail'];
        $row_array['citation'] = $row['citation'];
        $row_array['label'] = $row['label'];
        $row_array['http'] = $row['http'];
        array_push($ref_list, $row_array);
    }
    print_r(json_encode($ref_list));
    return json_encode($ref_list);
}

function upload_reference() {

    //file is stored with a name: $ref_files.id+"_"+$original_file_name

    global $con;

    $out ="start update";

    $tmp_file_name = $_FILES['file']['tmp_name'];
    $orig_name = trim($_FILES['file']['name']);
    $user_name = $_COOKIE['chemdb_id'];
    $doi = $_POST['doi'];
    $citation = $_POST['citation'];
    $detail = $_POST['detail'];
    $label = $_POST['label'];
    $http = $_POST['http'];

    $out .="tmpname:".$tmp_file_name." orgnma:".$orig_name." username:".$user_name."\n givenname".$label ;

    //find id of person uploading file
    $id_res = pg_query($con, "SELECT id FROM users WHERE username ='".$user_name."';");
    $row = pg_fetch_array($id_res);
    $user_id = $row['id'];
    
    $result = pg_prepare($con, "add_file","INSERT INTO ref_files (original_name, user_id, doi, citation, label, detail, http) VALUES ($1, $2, $3, $4, $5, $6, $7 ) RETURNING id;");
    $result = pg_execute($con, "add_file", array($orig_name, $user_id, $doi, $citation, $label, $detail, $http));
    $new_file_id = pg_fetch_array($result)[0];
    $new_file_name = $new_file_id."_".trim($orig_name);
    
    $out .=" userid:".$user_id." newname:".$new_file_name;
    
    $ok = move_uploaded_file($tmp_file_name, '/home/www/html/reference_materials/'.$new_file_name);

    print_r(json_encode($out));
    return(json_encode($out));
}

function add_ref_no_file() {

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
