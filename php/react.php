<?php 


include('config.php');

switch($_GET['action'])  {
//switch('get_all_reaction_classes')  { // testing :  php < thisfile.php
    case 'get_all_reaction_classes' :
            get_all_reaction_classes();
            break;

}

function get_all_reaction_classes() {

    global $con;

    $result = pg_prepare($con, "get_all_reaction_classes", "SELECT * from reaction_class order by id;");

    $json_response = array();

    $reaction_classes = pg_execute($con, "get_all_reaction_classes", array());
    while ($reaction_class = pg_fetch_array($reaction_classes, NULL, PGSQL_ASSOC)) {
      $r['id']=$reaction_class['id'];
      $r['environmentals']=json_decode($reaction_class['environmentals']);
      $r['parameters']=json_decode($reaction_class['parameters']);
      $r['description']=$reaction_class['description'];
      $r['name']=$reaction_class['name'];
      $r['formula_img_url']=$reaction_class['formula_png_path'];
      array_push($json_response,$r);
   }
   print_r(json_encode($json_response));
   return json_encode($json_response);

}

?>
