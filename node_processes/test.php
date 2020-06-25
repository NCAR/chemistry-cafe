<?php
$fruits = array("d" => "lemon", "a" => "orange", "b" => "banana", "c" => "apple");

function arg_list($arr)
{   
    $key_val_arr=[];
    foreach($arr as $key=>$value) {
      $key_val_arr[] = "$key=$value";
    }
    return (join(" , ",$key_val_arr));
}   

print_r(arg_list($fruits));

?>
