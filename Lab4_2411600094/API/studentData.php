<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

date_default_timezone_set('Asia/Manila');

define('DATA_FILE', __DIR__ . '/data.json');

$action = $_GET['action'] ?? 'all';

$response = [
    'success'   => false,
    'data'      => null,
    'message'   => '',
    'timestamp' => date('Y-m-d H:i:s')
];

function loadData() {
    if (!file_exists(DATA_FILE)) return null;
    $raw = file_get_contents(DATA_FILE);
    if ($raw === false) return null;
    return json_decode($raw, true);
}

function computeStatus($gpa, $rules) {
    if ($gpa >= $rules['goodStanding']) return 'Good Standing';
    if ($gpa >= $rules['probation'])    return 'At Risk';
    return 'Probation';
}

function enrich($data) {
    $rules = $data['standingRules'] ?? ['goodStanding' => 2.5, 'probation' => 1.75];
    foreach ($data['students'] as &$s) {
        $s['status'] = computeStatus($s['gpa'], $rules);
    }
    return $data;
}

try {
    $data = loadData();
    if (!$data) throw new Exception('Data file not found or invalid');
    $data = enrich($data);

    switch ($action) {
        case 'students':
            $response['success'] = true;
            $response['data']    = $data['students'];
            $response['message'] = 'Students retrieved';
            break;

        case 'programs':
            $response['success'] = true;
            $response['data']    = $data['programs'];
            $response['message'] = 'Programs retrieved';
            break;

        case 'courses':
            $response['success'] = true;
            $response['data']    = $data['courses'];
            $response['message'] = 'Courses retrieved';
            break;

        case 'activities':
            $response['success'] = true;
            $response['data']    = $data['activities'];
            $response['message'] = 'Activities retrieved';
            break;

        case 'activity-stats':
            $counts = ['Grades' => 0, 'Attendance' => 0, 'Enrollment' => 0, 'Advisory' => 0];
            foreach ($data['activities'] as $a) {
                if (isset($counts[$a['category']])) $counts[$a['category']]++;
            }
            $response['success'] = true;
            $response['data']    = $counts;
            $response['message'] = 'Activity stats retrieved';
            break;

        case 'stats':
            $students = $data['students'];
            $count    = count($students);
            $avgGpa   = $count ? round(array_sum(array_column($students, 'gpa')) / $count, 2) : 0;
            $avgAtt   = $count ? round(array_sum(array_column($students, 'attendance')) / $count) : 0;
            $units    = array_sum(array_column($students, 'units'));
            $assignments = array_sum(array_column($students, 'pendingAssignments'));
            $atRisk   = 0;
            foreach ($students as $s) {
                if ($s['status'] !== 'Good Standing') $atRisk++;
            }
            $response['success'] = true;
            $response['data'] = [
                'avgGpa'            => $avgGpa,
                'totalStudents'     => $count,
                'totalCourses'      => count($data['courses']),
                'totalUnits'        => $units,
                'avgAttendance'     => $avgAtt,
                'atRisk'            => $atRisk,
                'totalAssignments'  => $assignments
            ];
            $response['message'] = 'Stats retrieved';
            break;

        case 'all':
        default:
            $response['success'] = true;
            $response['data']    = $data;
            $response['message'] = 'All data retrieved';
            break;
    }
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);