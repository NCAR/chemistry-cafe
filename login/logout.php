<?php 
 $past = time() - 100; 
 //this makes the time in the past to destroy the cookie 
 setcookie("chemdb_id", "gone", $past, "/"); 
 //header("Location: http://chemdb:3141/login/login.php");
 header("Location: /login/login.php");
 ?> 

