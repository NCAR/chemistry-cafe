<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

get_all_species_hnr();

function get_all_species_hnr() {
    global $con;

    $result = pg_prepare($con, "get_families", 'SELECT * FROM species_families where species_id=$1;');

    $qry = pg_query($con, 'SELECT name,henrys_law_type,kh_298,dh_r,k1_298,dh1_r,k2_298,dh2_r FROM molecules ORDER BY name ;');
    $data = "";
    while($row = pg_fetch_assoc($qry))
    {
        $data .= implode(',',$row)."\n";
    }
    print_r($data);
    return(true);
}

?>
