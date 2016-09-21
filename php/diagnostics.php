<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_all_diagnostics')  {
    case 'get_all_diagnostics' :
            get_all_diagnostics();
            break;

    case 'get_sdiag' :
            get_sdiag();
            break;

    case 'ins_sdiag' :
            ins_sdiag();
            break;

    case 'mod_sdiag' :
            mod_sdiag();
            break;

    case 'get_rdiag' :
            get_rdiag();
            break;

    case 'ins_rdiag' :
            ins_rdiag();
            break;

    case 'mod_rdiag' :
            mod_rdiag();
            break;

}


function IsEmptyString($val){
    if (trim($val) === ''){$val = NULL;}
    return $val;
}


function get_all_diagnostics() {
    global $con;

    $diags['sdiags'] = array();

    /**  Species-level diagnostics such as VOC + OH **/
    $sql_q="
        SELECT sd.id, sd.name, sd.species_id, sd.family_id, sd.species_id2, sd.family_id2,
               sp1.name as sp1name, fm1.name as fm1name, sp2.name as sp2name, fm2.name as fm2name
        FROM sdiags AS sd
        LEFT JOIN molecules AS sp1
        ON sp1.id=sd.species_id
        LEFT JOIN molecules AS sp2
        ON sp2.id=sd.species_id2
        LEFT JOIN families AS fm1
        ON fm1.id=sd.family_id
        LEFT JOIN families AS fm2
        ON fm2.id=sd.family_id2
        ";

    $sdiags = pg_query($con, $sql_q);

    while($diag = pg_fetch_assoc($sdiags))
    {
       $diags['sdiags'][] = $diag;
    }

    /** Reaction-level diagnostics **/
    $sql_q="
        SELECT rd.id, rd.name, rd.cesm_namelist
        FROM rdiags AS rd
        ";
    $rdiags = pg_query($con, $sql_q);

    $diags['rdiags'] = array();
    while($diag = pg_fetch_assoc($rdiags))
    {
        $diags['rdiags'][] = $diag;
    }

    print_r(json_encode($diags));
    return json_encode($diags);
}

/**  Function to populate the form so that this diagnostics can be edited**/
/**  get a diagnostics by name **/
function get_sdiag() {    
    global $con;

    $data = json_decode(file_get_contents("php://input"));     
    $id = $data->id;

    $sql_q="
        SELECT sd.id, sd.name, sd.species_id, sd.family_id, sd.species_id2, sd.family_id2,
               sp1.name as sp1name, fm1.name as fm1name, sp2.name as sp2name, fm2.name as fm2name
        FROM sdiags AS sd
        LEFT JOIN molecules AS sp1
        ON sp1.id=sd.species_id
        LEFT JOIN molecules AS sp2
        ON sp2.id=sd.species_id2
        LEFT JOIN families AS fm1
        ON fm1.id=sd.family_id
        LEFT JOIN families AS fm2
        ON fm2.id=sd.family_id2
        WHERE sd.id=$1
        ";

    $qry = pg_query_params($con, $sql_q ,array($id));
    $res = array();
    if($row = pg_fetch_assoc($qry))
    {
        $res = $row;
    }

    print_r(json_encode($res));
    return json_encode($res);  
}

function ins_sdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $species_id = IsEmptyString($data->species_id);
    $family_id = IsEmptyString($data->family_id);
    $species_id2 = IsEmptyString($data->species_id2);
    $family_id2 = IsEmptyString($data->family_id2);

    $sql_q="
        INSERT INTO sdiags (name, species_id, family_id, species_id2, family_id2)
        VALUES ($1,$2,$3,$4,$5) 
        RETURNING id";

    $vals = array($name, $species_id, $family_id, $species_id2, $family_id2);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}

function mod_sdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $species_id = IsEmptyString($data->species_id);
    $family_id = IsEmptyString($data->family_id);
    $species_id2 = IsEmptyString($data->species_id2);
    $family_id2 = IsEmptyString($data->family_id2);

    $sql_q="
        UPDATE sdiags
        SET name=$1,species_id=$2,family_id=$3,species_id2=$4,family_id2=$5
        WHERE id=$6";

    $vals = array($name, $species_id, $family_id, $species_id2, $family_id2,$id);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}



function get_rdiag() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;

    $sql_q="
        SELECT rd.id, rd.name, rd.cesm_namelist
        FROM rdiags AS rd
        WHERE rd.id=$1
        ";

    $qry = pg_query_params($con, $sql_q ,array($id));
    $res = array();
    if($row = pg_fetch_assoc($qry))
    {
        $res = $row;
    }

    print_r(json_encode($res));
    return json_encode($res);
}

function ins_rdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $name = $data->name;
    $cesm_namelist = $data->cesm_namelist;

    $sql_q="
        INSERT INTO rdiags (name, cesm_namelist)
        VALUES ($1,$2)
        RETURNING id";

    $vals = array($name, $cesm_namelist);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}

function mod_rdiag(){

    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $name = $data->name;
    $cesm_namelist = $data->cesm_namelist;

    $sql_q="
        UPDATE rdiags
        SET name=$1,cesm_namelist=$2
        WHERE id=$3";

    $vals = array($name, $cesm_namelist, $id);
    $qry = pg_query_params($con, $sql_q, $vals);
    print_r(json_encode($vals));

}



?>
