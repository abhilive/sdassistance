<?php
require '.././libs/Slim/Slim.php';
require_once 'config/dbHelper.php';
include_once 'objects/order.php';
include_once 'objects/product.php';
include_once 'objects/recharge.php';

\Slim\Slim::registerAutoloader();
$app = new \Slim\Slim();
$app = \Slim\Slim::getInstance();

$dbHelper = new dbHelper();
$db = $dbHelper->getConnection();

/**
 * Database Helper Function templates
 */
/*
select(table name, where clause as associative array)
insert(table name, data as associative array, mandatory column names as array)
update(table name, column names as associative array, where clause as associative array, required columns as array)
delete(table name, where clause as array)
*/

// Orders
$app->get('/orders', function() {
    global $db;
    // initialize object
    $order = new Order($db);
    // query orders
    $data = $order->readAll();
    echoResponse(200, $data);
});

// Export-Orders
$app->post('/exportOrders', function() use ($app) {
    global $db;
    $order = new Order($db);
    $data = json_decode($app->request->getBody());
    //$mandatory = array('exportedBy');
    // query orders to export
    $rows = $order->exportOrders($data);
    if($rows["status"]=="success")
        $rows["message"] = 'File generated successfully.';
    echoResponse(200, $rows);
});

// Products
$app->get('/products', function() {
    global $db;
    // initialize object
    $product = new Product($db);
    // query products
    $data = $product->readAll();
    echoResponse(200, $data);
});

$app->post('/orders', function() use ($app) { 
    $data = json_decode($app->request->getBody());
    $mandatory = array('issuedTo','issuedBy');
    global $db;
    $order = new Order($db);
    $rows = $order->create("orders", $data, $mandatory);
    if($rows["status"]=="success")
        $rows["message"] = "Information saved successfully.";
    echoResponse(200, $rows);
});

// Export-Orders
$app->post('/validateno', function() use ($app) {
    global $db;
    $recharge = new Recharge($db);
    $data = json_decode($app->request->getBody());
    //$mandatory = array('exportedBy');
    // query orders to export
    $rows = $recharge->validateNo($data);
    if($rows["status"]=="success")
        $rows["message"] = 'File generated successfully.';
    echoResponse(200, $rows);
});

$app->delete('/orders/:id', function($id) { 
    global $db;
    $order = new Order($db);
    $rows = $order->delete("orders", array('order_id'=>$id));
    if($rows["status"]=="success")
        $rows["message"] = "Order removed successfully.";
    echoResponse(200, $rows);
});

function echoResponse($status_code, $response) {
    global $app;
    $app->status($status_code);
    $app->contentType('application/json');
    echo json_encode($response,JSON_NUMERIC_CHECK);
}

$app->run();
?>
