<?php 

$hour = 60*60; //in seconds
$cookie_timeout = 4*$hour; // cookies for login last 4 hours.

session_start();
$_SESSION["edit"]=0;

include('../php/config.php');
global $con;

//Checks if there is a login cookie
if(isset($_COOKIE['chemdb_id'])){ 
    //if there is, it logs you in and directes you to the members page
    $username = $_COOKIE['chemdb_id']; 
    $pass = $_COOKIE['chemdb_key'];
    $check = pg_query("SELECT * FROM users WHERE username = '$username'")or die("User not available from database");

    while($info = pg_fetch_array( $check )){
        //echo(json_encode($info));
        if ($pass != $info['password']){
            } else {
                header("Location: /index.html");
            }
        }
    }

//if the login form is submitted 
if (isset($_POST['submit'])) {

    // makes sure they filled it in
    if(!$_POST['username']){
        die('You did not fill in a username.');
    }
    if(!$_POST['pass']){
        die('You did not fill in a password.');
    }
    $_POST['username'] = pg_escape_string($_POST['username']);
    $check = pg_query("SELECT * FROM users WHERE username = '".$_POST['username']."'")or die("user not available from db");
    $check2 = pg_num_rows($check);
    if ($check2 != 1){
        // Die if there is not precisely one user with that login
        die('That user does not exist in our database.<br /><br />If you think this is wrong <a href="/login/login.php">try again</a>.');
    }
    
    while($info = pg_fetch_array( $check )){
        $_POST['pass'] = stripslashes($_POST['pass']);
        $info['password'] = stripslashes($info['password']);
        $initials = $info['initials'];
        $_POST['pass'] = md5($_POST['pass']);
        
        if ($_POST['pass'] != $info['password']){
            // password wrong -> go to login again.
            die('Incorrect password, please <a href="/login/login.php">try again</a>.');
        } else { 
            // if login is ok then we add a cookie 
            $_POST['username'] = stripslashes($_POST['username']); 
            $expire = time() + $cookie_timeout;
            setcookie("chemdb_id", $_POST['username'], $expire, "/");
            setcookie("chemdb_initials", $initials, $expire, "/");
            setcookie("chemdb_prmn", $info['edit'], $expire, "/");
            
            // and then send them to the web pages.
            header("Location: /index.html");
        }
        $_SESSION["edit"]=$info['edit'];
    }
} else {
    // no form submitted.  Fill it out.
?>

 <form action="<?php echo $_SERVER['PHP_SELF']?>" method="post"> 

 <table border="0"> 

 <tr><td colspan=2><h1>Login</h1></td></tr> 

 <tr><td>Username:</td><td> 

 <input type="text" name="username" maxlength="40"> 

 </td></tr> 

 <tr><td>Password:</td><td> 

 <input type="password" name="pass" maxlength="50"> 

 </td></tr> 

 <tr><td colspan="2" align="right"> 

 <input type="submit" name="submit" value="Login"> 

 </td></tr> 

 </table> 

 </form> 

 <?php 
 }
 ?> 

