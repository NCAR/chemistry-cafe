<?php

//$row = exec('/usr/local/bin/node /home/www/node_processes/nodels.js /home/www/node_processes',$output,$error);
//while(list(,$row) = each($output)){
//echo $row, "\n";

$data = array("name" => "Robot", "msg" => "Hi guys, I'm a PHP bot !");                                                                    
$data_string = json_encode($data);

$ch = curl_init('http://localhost:8080/');                                                                      
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);                                                                      
curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
    'Content-Type: application/json',                                                                                
    'Content-Length: ' . strlen($data_string))                                                                       
);                                                                                                                   

$result =  curl_exec($ch);
echo $result."\n";

$result_obj = json_decode($result);
echo $result_obj->{'a'}."\n";

curl_close($ch);


?>
