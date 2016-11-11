<?php
// check if fields passed are empty
$errors = array();
$data = array();
// Getting posted data and decodeing json
$_POST = json_decode(file_get_contents('php://input'), true);

// checking for blank values.
if (empty($_POST['userName'])) {
  $errors['name'] = 'Username is required.';
} else {
	if($_POST['userName']!='demouser') {
		$errors['errmsg'] = 'Invalid credentials.';
	}
}

if (empty($_POST['password'])) {
  $errors['phone'] = 'Password is required.';
} else {
	if($_POST['password']!='demouser') {
		$errors['errmsg'] = 'Invalid credentials.';
	}
}
if (!empty($errors)) {
  $data['errors']  = $errors;
  //http_response_code(200 OK);
  header('Status: 404', TRUE, 404);
} else {
  $data['access_token']='abhis-sdn-43';
  $data['userName']=$_POST['userName'];
  $data['message'] = 'You are logged in successfully !!';
}
//header('Status: 404', TRUE, 404);
//header('HTTP/1.1 500 OK');
echo json_encode($data);
?>