<?php

include('pwd.php');

$host = "localhost"; 
$db = "chem3"; 
//$db = "chemtest2"; 

$con = pg_connect("host=$host dbname=$db user=$user password=$pass")
    or die ("Could not connect to server\n"); 

if (!user_is_valid()) {
    header("HTTP/1.0 419 Authentication Timeout");
    return;
}

function user_is_valid() {

    global $con;
    //check cookies to make sure they are logged in 
    if(isset($_COOKIE['chemdb_id']) ){

        $username = $_COOKIE['chemdb_id'];
        $check = pg_query("SELECT * FROM users WHERE username = '$username'")or die("User not available from database");

        if (pg_num_rows($check) === 1){
            return true;
        } else {
            header("Location: /login/login.php");
            return false;
        }
    }
}


?>
