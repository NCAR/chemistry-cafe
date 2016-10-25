<?php

include('config.php'); 

//switch($_GET['action'])  {
switch('get_all_logs')  { // testing :  php < thisfile.php
    case 'get_all_logs' :
            get_all_logs();
            break;
}

function get_all_logs() {
    global $con;

    $qry=   "SELECT l.id, age(localtimestamp, l.date), date(l.date - interval '7 hours'), l.user_id, l.change, l.comment, u.initials
             FROM log AS l
             INNER JOIN users AS u
             ON u.id=l.user_id 
             ORDER BY age asc
             ;";

    $lqry = pg_query($con, $qry);
    $response = pg_fetch_all($lqry);

    print_r(json_encode($response));
    return json_encode($response);

}

?>
