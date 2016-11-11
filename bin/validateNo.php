<?php
// check if fields passed are empty
$errors = array();
$data = array();
// Getting posted data and decodeing json
$_POST = json_decode(file_get_contents('php://input'), true);

//Trim
//$var = 'master_skinsoul';
//echo trim($var, 'master_'); $text = preg_replace('/\s+/', ' ', $text);
//echo preg_replace('/^master_+/','',$var);
//End

// checking for blank values.
if (empty($_POST['cellNo']) || !preg_match('/^[1-9]{1}[0-9]{9}$/', $_POST['cellNo'])) {
  $data['validate'] = false;
} else {
  $data['validate'] = true;
}
// response back.
echo json_encode($data);

?>