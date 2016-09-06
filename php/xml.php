<?php
header("Content-disposition: attachment; filename=ltxt");
header("Content-type: application/xml");


function json_to_xml($obj){
  $str = "";
  if(is_null($obj))
    return "<null/>";
  elseif(is_array($obj)) {
      //a list is a hash with 'simple' incremental keys
    $is_list = array_keys($obj) == array_keys(array_values($obj));
    if(!$is_list) {
      $str.= "<hash>";
      foreach($obj as $k=>$v)
        $str.="<item key=\"$k\">".json_to_xml($v)."</item>"."\n";
      $str .= "</hash>";
    } else {
      $str.= "<list>";
      foreach($obj as $v)
        $str.="<item>".json_to_xml($v)."</item>"."\n";
      $str .= "</list>";
    }
    return $str;
  } elseif(is_string($obj)) {
    return htmlspecialchars($obj) != $obj ? "<![CDATA[$obj]]>" : $obj;
  } elseif(is_scalar($obj))
    return $obj;
  else
    throw new Exception("Unsupported type $obj");
}

require '../json/access.php';
$result = pg_prepare($con, "models", "select * from models ;");
$result = pg_execute($con, "models", array());
#$result = "text";

$json_response = array();

while ($row = pg_fetch_array($result)) {
  $row_array['model_id'] = $row['model_id'];
  $row_array['name'] = $row['name'];
  array_push($json_response,$row_array);
}

$xml = json_to_xml($json_response);
echo $xml;
?>
