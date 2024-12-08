<?php
require __DIR__ . '/vendor/autoload.php'; // Ensure the path is correct

// MySQL Database connection
$servername = "localhost";
$username = "root";  // Update with your MySQL username
$password = "";      // Update with your MySQL password
$dbname = "bill_calculator";  // Your database name

// MySQL connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get raw POST data from the request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check if 'billData' is available
if (!isset($data['billData'])) {
    // If no bill data, return an error response
    http_response_code(400);  // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'No bill data provided.']);
    exit;
}

$billData = $data['billData'];  // Extract bill data from JSON

// Create variables for each field
$previousReading = $billData['previousReading'];
$currentReading = $billData['currentReading'];
$ratePerKwh = $billData['ratePerKwh'];
$numPeople = $billData['numPeople'];
$totalUnits = $billData['totalUnits'];
$totalBill = $billData['totalBill'];

// Prepare the SQL query with placeholders
$sql = "INSERT INTO bills (previousReading, currentReading, ratePerKwh, numPeople, totalUnits, totalBill, people)
        VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt === false) {
    die("Error preparing statement: " . $conn->error);
}

$peopleJson = json_encode($billData['people']);

// Bind the parameters (passing variables, not direct values)
$stmt->bind_param("iiiddds", $previousReading, $currentReading, $ratePerKwh, $numPeople, $totalUnits, $totalBill, $peopleJson);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Bill data saved to MySQL!']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save data.']);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
