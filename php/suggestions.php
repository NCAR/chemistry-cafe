<?php

include('config.php'); 

switch($_GET['action'])  {
//switch('test')  { // testing :  php < thisfile.php
    case 'get_all_suggestions' :
            get_all_suggestions();
            break;

    case 'put_suggestion' :
            put_suggestion();
            break;

    case 'test' :
            get_all_suggestions();
            break;

}

function get_all_suggestions() {
    global $con;

    $result = pg_prepare($con, "get_all_suggestions",
            "SELECT s.id, u.initials, s.suggestion
             FROM suggestions AS s
             INNER JOIN users AS u
             ON u.id=s.user_id ;");

    $suggestions = pg_execute($con, "get_all_suggestions", array());

    $suggestionlist = array();
    while ($suggestion = pg_fetch_array($suggestions))
    {
        array_push($suggestionlist, $suggestion);
    }
    print_r(json_encode($suggestionlist));
    return json_encode($suggestionlist);

}

function put_suggestion() {

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $username = $_COOKIE['chemdb_id'];
    $suggestion = $data->suggestion;

    $result = pg_prepare($con, "get_userid",
            "SELECT id from users
             WHERE users.username = $1;
            ");

    $result = pg_prepare($con, "put_suggestion",
            "INSERT INTO suggestions (user_id, suggestion) 
             VALUES ($1, $2) 
             RETURNING id;
            ");

    $safe_to_commit = true; // so far everything seems normal
    pg_query($con, "BEGIN;") or die("Could not start transaction\n");
    $out = "Begin Transaction, new suggestion ".$suggestion." /n";

    $result = pg_execute($con, "get_userid",array($username));

    if($result){
        $row = pg_fetch_array($result);
        $user_id = $row[0];
        $out .= "user id:".$user_id." /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("no user id\n");
        $out = $out . "\nNo User ID\n";
        print_r(json_encode($out));
        return json_encode($out);
    }

    $result = pg_execute($con, "put_suggestion",array($user_id,$suggestion));
    if($result){
        $row = pg_fetch_array($result);
        $s_id = $row[0];
        $out .= "suggestion id:".$s_id." /n";
    } else {
        $safe_to_commit = false;
        pg_query($con, "ROLLBACK") or die("no user id\n");
        $out = $out . "Suggestion not inserted";
        print_r(json_encode($out));
        return json_encode($out);
    }

    pg_query($con, "COMMIT;");

    print_r(json_encode($out));
    return json_encode($out);

}

?>
