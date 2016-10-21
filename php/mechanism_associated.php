<?php

include('config.php'); 

/**  Switch Case to Get Action from controller  **/

switch($_GET['action'])  {
//switch('get_all_associated')  {
    case 'get_all_associated' :
            get_all_associated();
            break;

    case 'add_external' :
            add_external();
            break;

    case 'del_external' :
            del_external();
            break;

    case 'add_sdiag' :
            add_sdiag();
            break;

    case 'del_sdiag' :
            del_sdiag();
            break;

    case 'add_wrf_sdiag' :
            add_wrf_sdiag();
            break;

    case 'del_wrf_sdiag' :
            del_wrf_sdiag();
            break;

    case 'add_rdiag' :
            add_rdiag();
            break;

    case 'del_rdiag' :
            del_rdiag();
            break;

    case 'add_fixed' :
            add_fixed();
            break;

    case 'del_fixed' :
            del_fixed();
            break;

    case 'add_nottransported' :
            add_nottransported();
            break;

    case 'del_nottransported' :
            del_nottransported();
            break;

    case 'mod_extforcing' :
            mod_extforcing();
            break;

}

function IsEmptyString($val){
    if (trim($val) === ''){$val = NULL;}
    return $val;
}


function get_all_associated() {
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;

    $response['externals']=array();
    $response['sdiags']=array();
    $response['wrf_sdiags']=array();
    $response['rdiags']=array();
    $response['fixed']=array();
    $response['nottransported']=array();
    $response['extforcing']=array();

    $externals_q = "
            SELECT external_id, name, description, mechanism_id, CASE WHEN mechanism_id = $1 THEN 'T' else 'F' END AS externals FROM      
            (SELECT id as external_id, name, description FROM externals) e   
            LEFT JOIN 
            (SELECT external_id as eid, mechanism_id FROM mechanism_externals WHERE mechanism_id = $1 ) me
            ON me.eid=e.external_id;";

    $sdiags_q = "
            SELECT sdiag_id, sdname, mechanism_id, m1name, m2name, f1name, f2name, 
                   CASE WHEN mechanism_id = $1 THEN 'T' else 'F' END AS sdiags,
                   CASE WHEN wmid = $1 THEN 'T' else 'F' END AS wrf_sdiags
            FROM      
            (
            SELECT sdiags.id as sdiag_id, sdiags.name as sdname, m1.name as m1name, m2.name as m2name, f1.name as f1name, f2.name as f2name, species_id FROM sdiags
            LEFT  JOIN molecules as m1
            ON m1.id=sdiags.species_id
            LEFT  JOIN molecules as m2
            ON m2.id = sdiags.species_id2
            LEFT  JOIN families as f1
            ON f1.id = sdiags.family_id
            LEFT  JOIN families as f2
            ON f2.id = sdiags.family_id2
            ) e   
            LEFT JOIN 
            (
            SELECT sdiag_id as eid, mechanism_id FROM mechanism_sdiags WHERE mechanism_id = $1
            ) me
            ON me.eid=e.sdiag_id
            LEFT JOIN 
            (
            SELECT sdiag_id as weid, mechanism_id as wmid FROM mechanism_wrf_sdiags WHERE mechanism_id = $1
            ) wme
            ON wme.weid=e.sdiag_id; ";

    $rdiags_q = "
            SELECT rdiag_id, name, mechanism_id, CASE WHEN mechanism_id = $1 THEN 'T' else 'F' END AS rdiags FROM      
            (SELECT id as rdiag_id, name FROM rdiags) e   
            LEFT JOIN 
            (SELECT rdiag_id as eid, mechanism_id FROM mechanism_rdiags WHERE mechanism_id = $1 ) me
            ON me.eid=e.rdiag_id;";

    $fixed_q = "
            SELECT species_id, name, description, mechanism_id, CASE WHEN mechanism_id = $1 THEN 'T' else 'F' END AS fixed FROM      
            (SELECT id as species_id, name, description FROM molecules) e   
            LEFT JOIN 
            (SELECT species_id as mid, mechanism_id FROM mechanism_fixed WHERE mechanism_id = $1 ) me
            ON me.mid=e.species_id;";

    $trans_q = "
            SELECT id as species_id, name, description, mechanism_id, CASE WHEN mechanism_id = $1 THEN 'T' else 'F' END AS nottransported FROM      
            (SELECT id, name, description FROM molecules) e   
            LEFT JOIN 
            (SELECT species_id, mechanism_id FROM mechanism_nottransported WHERE mechanism_id = $1 ) me
            ON me.species_id=e.id
            ORDER BY nottransported DESC, name;";

    $eforce_q = "
            SELECT id as species_id, name, description, mechanism_id, forcing FROM      
            (SELECT id, name, description FROM molecules) e   
            LEFT JOIN 
            (SELECT species_id, mechanism_id, forcing,
                CASE
                  WHEN forcing='File' THEN 2
                  WHEN forcing='Code' THEN 3
                  WHEN forcing='None' THEN 4
                  ELSE 5  
                  END AS extforcing
            FROM mechanism_extforcing WHERE mechanism_id = $1 ) me
            ON me.species_id=e.id 
            ORDER BY forcing, name;
            ";


    $mech=array($mechanism_id);

    $qry = pg_query_params($con, $externals_q, $mech);
    $response['externals']=pg_fetch_all($qry);

    $qry = pg_query_params($con, $sdiags_q, $mech);
    $response['sdiags']=pg_fetch_all($qry);

    $qry = pg_query_params($con, $rdiags_q, $mech);
    $response['rdiags']=pg_fetch_all($qry);

    $qry = pg_query_params($con, $fixed_q, $mech);
    $response['fixed']=pg_fetch_all($qry);

    $qry = pg_query_params($con, $trans_q, $mech);
    $response['nottransported']=pg_fetch_all($qry);

    $qry = pg_query_params($con, $eforce_q, $mech);
    $response['extforcing']=pg_fetch_all($qry);

    print_r(json_encode($response));
    return json_encode($response);  
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

function add_external(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $external_id = $data->external_id;

    $qry = " INSERT INTO mechanism_externals (mechanism_id, external_id)
       VALUES ($1, $2) RETURNING id;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $external_id));
    if($res = pg_fetch_array($res)) {
        print_r ( ($res['id'] > 0 ? 'T' : 'F' )  );
    }

}

function del_external(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $external_id = $data->external_id;

    $qry = "
       DELETE FROM mechanism_externals 
       WHERE mechanism_id =$1 AND external_id= $2;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $external_id));
    print_r( 'F' );

}

function add_sdiag(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $sdiag_id = $data->sdiag_id;

    $qry = " INSERT INTO mechanism_sdiags (mechanism_id, sdiag_id)
       VALUES ($1, $2) RETURNING id;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $sdiag_id));
    if($res = pg_fetch_array($res)) {
        print_r ( ($res['id'] > 0 ? 'T' : 'F' )  );
    }

}

function del_sdiag(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $sdiag_id = $data->sdiag_id;

    $qry = "
       DELETE FROM mechanism_sdiags 
       WHERE mechanism_id =$1 AND sdiag_id= $2;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $sdiag_id));
    print_r( 'F' );

}

function add_wrf_sdiag(){
    global $con;
    
    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $sdiag_id = $data->sdiag_id;

    $qry = " INSERT INTO mechanism_wrf_sdiags (mechanism_id, sdiag_id)
       VALUES ($1, $2) RETURNING id;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $sdiag_id));
    if($res = pg_fetch_array($res)) {
        print_r ( ($res['id'] > 0 ? 'T' : 'F' )  );
    }
    
}
    
function del_wrf_sdiag(){
    global $con;
    
    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $sdiag_id = $data->sdiag_id;

    $qry = "
       DELETE FROM mechanism_wrf_sdiags 
       WHERE mechanism_id =$1 AND sdiag_id= $2;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $sdiag_id));
    print_r( 'F' );

}


function add_rdiag(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $rdiag_id = $data->rdiag_id;

    $qry = " INSERT INTO mechanism_rdiags (mechanism_id, rdiag_id)
       VALUES ($1, $2) RETURNING id;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $rdiag_id));
    if($res = pg_fetch_array($res)) {
        print_r ( ($res['id'] > 0 ? 'T' : 'F' )  );
    }

}

function del_rdiag(){
    global $con;
    
    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $rdiag_id = $data->rdiag_id;

    $qry = "
       DELETE FROM mechanism_rdiags 
       WHERE mechanism_id =$1 AND rdiag_id= $2;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $rdiag_id));
    print_r( 'F' );

}

function add_fixed(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $specie_id = $data->specie_id;

    $qry = " INSERT INTO mechanism_fixed (mechanism_id, species_id)
       VALUES ($1, $2) RETURNING id;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $specie_id));
    if($res = pg_fetch_array($res)) {
        print_r ( ($res['id'] > 0 ? 'T' : 'F' )  );
    }

}

function del_fixed(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $specie_id = $data->specie_id;

    $qry = "
       DELETE FROM mechanism_fixed 
       WHERE mechanism_id =$1 AND species_id= $2;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $specie_id));
    print_r( 'F' );

}

function add_nottransported(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $specie_id = $data->specie_id;

    $qry = " INSERT INTO mechanism_nottransported (mechanism_id, species_id)
       VALUES ($1, $2) RETURNING id;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $specie_id));
    if($res = pg_fetch_array($res)) {
        print_r ( ($res['id'] > 0 ? 'T' : 'F' )  );
    }

}

function del_nottransported(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $specie_id = $data->specie_id;

    $qry = "
       DELETE FROM mechanism_nottransported 
       WHERE mechanism_id =$1 AND species_id= $2;";
    $res = pg_query_params($con,$qry,array($mechanism_id, $specie_id));
    print_r( 'F' );

}


function mod_extforcing(){
    global $con;

    $data = json_decode(file_get_contents("php://input"));
    $mechanism_id = $data->mechanism_id;
    $specie_id = $data->specie_id;
    $extforcing = $data->extforcing;

    $s_qry = " 
       SELECT mechanism_id, species_id, forcing 
       FROM mechanism_extforcing 
       WHERE mechanism_id = $1 AND species_id=$2;";
    $d_qry = " 
       DELETE FROM mechanism_extforcing
       WHERE mechanism_id = $1 AND species_id=$2;";
    $i_qry = " 
       INSERT INTO mechanism_extforcing (mechanism_id, species_id, forcing)
       VALUES ($1, $2, $3);";

    $resset = pg_query_params($con,$s_qry,array($mechanism_id, $specie_id));
    if($res = pg_fetch_array($resset)) {
        $res = pg_query_params($con,$d_qry,array($mechanism_id, $specie_id));
        $res = pg_query_params($con,$i_qry,array($mechanism_id, $specie_id, $extforcing));
    } else {
        $res = pg_query_params($con,$i_qry,array($mechanism_id, $specie_id, $extforcing));
    }
    print_r ( $extforcing  );
}


?>
