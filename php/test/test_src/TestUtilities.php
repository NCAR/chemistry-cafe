<?php

// reads a csv file to an array of dictionaries, one per row in the file
function loadDictionaryFromCsvFile( $file_path ) {
    $row = 0;
    $dict = array( );
    if( ( $handle = fopen( $file_path, "r" ) ) !== FALSE ) {
        $labels = fgetcsv( $handle, 0, "," );
        while( ( $data = fgetcsv( $handle, 0, "," ) ) !== FALSE ) {
            $dict[ $row ] = array( );
            for( $i_elem = 0; $i_elem < count( $labels ); ++$i_elem ) {
                $dict[ $row ][ $labels[ $i_elem ] ] = $data[ $i_elem ];
            }
            ++$row;
        }
        fclose( $handle );
    }
    return $dict;
}

// assert two values are equal within a tolerance
function assert_almost_equal( $val1, $val2, $relative_tolerance = 1.0e-10 ) {
    $diff = abs( $val1 - $val2 );
    assert( $diff < abs( $val1 + $val2 ) / 2.0 );
}
?>
