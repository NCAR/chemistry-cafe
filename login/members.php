<?php

    include('../php/config.php');
    global $con;


    //check cookies to make sure they are logged in 
    if(isset($_COOKIE['chemdb_id'])){ 

        $username = $_COOKIE['chemdb_id']; 
        $check = pg_query("SELECT * FROM users WHERE username = '$username'")or die("User not available from database"); 

        if ($check.length == 1) {
            validuser
        } else {
            invaliduser
            header("Location: /login/login.php"); 
        }
    }

?>

