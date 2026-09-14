<?php
/**
 * Student Data API
 * Provides student data for the Student Portal Dashboard
 * Laboratory Exercise 4
 */

// Enable CORS for development
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Load configuration
require_once 'config.php';

// Get the request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Create response array
$response = [
    'success' => false,
    'data' => null,
    'message' => '',
    'timestamp' => date('Y-m-d H:i:s')
];

try {
    // Route the request
    switch ($method) {
        case 'GET':
            handleGetRequest($action, $response);
            break;
        case 'POST':
            handlePostRequest($action, $response);
            break;
        case 'PUT':
            handlePutRequest($action, $response);
            break;
        case 'DELETE':
            handleDeleteRequest($action, $response);
            break;
        default:
            $response['message'] = 'Method not allowed';
            http_response_code(405);
            break;
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    http_response_code(500);
}

// Send the response
echo json_encode($response);
exit();

/**
 * Handle GET requests
 */
function handleGetRequest($action, &$response) {
    switch ($action) {
        case 'dashboard':
            getDashboardData($response);
            break;
        case 'courses':
            getCourses($response);
            break;
        case 'course':
            getCourse($response);
            break;
        case 'assignments':
            getAssignments($response);
            break;
        case 'attendance':
            getAttendance($response);
            break;
        case 'activities':
            getActivities($response);
            break;
        case 'grades':
            getGradeDistribution($response);
            break;
        case 'performance':
            getPerformance($response);
            break;
        case 'statistics':
            getStatistics($response);
            break;
        case 'gpa-history':
            getGPAHistory($response);
            break;
        default:
            // Return all data for dashboard
            getAllData($response);
            break;
    }
}

/**
 * Handle POST requests
 */
function handlePostRequest($action, &$response) {
    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'add-course':
            addCourse($input, $response);
            break;
        case 'update-assignment':
            updateAssignment($input, $response);
            break;
        case 'mark-attendance':
            markAttendance($input, $response);
            break;
        default:
            $response['message'] = 'Invalid action for POST';
            http_response_code(400);
            break;
    }
}

/**
 * Handle PUT requests
 */
function handlePutRequest($action, &$response) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'update-course':
            updateCourse($input, $response);
            break;
        case 'update-grade':
            updateGrade($input, $response);
            break;
        default:
            $response['message'] = 'Invalid action for PUT';
            http_response_code(400);
            break;
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($action, &$response) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($action) {
        case 'delete-course':
            deleteCourse($input, $response);
            break;
        default:
            $response['message'] = 'Invalid action for DELETE';
            http_response_code(400);
            break;
    }
}

/**
 * Get all dashboard data
 */
function getAllData(&$response) {
    $data = loadJsonData();
    if ($data) {
        $response['success'] = true;
        $response['data'] = $data;
        $response['message'] = 'Data retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Get dashboard summary data
 */
function getDashboardData(&$response) {
    $data = loadJsonData();
    if ($data) {
        // Calculate statistics
        $stats = calculateStatistics($data);
        
        $response['success'] = true;
        $response['data'] = [
            'statistics' => $stats,
            'courses' => $data['courses'],
            'recentActivities' => array_slice($data['activities'], 0, 5)
        ];
        $response['message'] = 'Dashboard data retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Get courses
 */
function getCourses(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $response['success'] = true;
        $response['data'] = $data['courses'];
        $response['message'] = 'Courses retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'No courses found';
        http_response_code(404);
    }
}

/**
 * Get a specific course
 */
function getCourse(&$response) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if (!$id) {
        $response['message'] = 'Course ID required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $course = null;
        foreach ($data['courses'] as $c) {
            if ($c['id'] === $id) {
                $course = $c;
                break;
            }
        }
        
        if ($course) {
            $response['success'] = true;
            $response['data'] = $course;
            $response['message'] = 'Course retrieved successfully';
            http_response_code(200);
        } else {
            $response['message'] = 'Course not found';
            http_response_code(404);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Get assignments
 */
function getAssignments(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['assignments'])) {
        $response['success'] = true;
        $response['data'] = $data['assignments'];
        $response['message'] = 'Assignments retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'No assignments found';
        http_response_code(404);
    }
}

/**
 * Get attendance
 */
function getAttendance(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['attendance'])) {
        $response['success'] = true;
        $response['data'] = $data['attendance'];
        $response['message'] = 'Attendance retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'No attendance data found';
        http_response_code(404);
    }
}

/**
 * Get activities
 */
function getActivities(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['activities'])) {
        $response['success'] = true;
        $response['data'] = $data['activities'];
        $response['message'] = 'Activities retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'No activities found';
        http_response_code(404);
    }
}

/**
 * Get grade distribution
 */
function getGradeDistribution(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $grades = array_column($data['courses'], 'grade');
        $distribution = array_count_values($grades);
        
        $response['success'] = true;
        $response['data'] = $distribution;
        $response['message'] = 'Grade distribution retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'Failed to calculate grade distribution';
        http_response_code(500);
    }
}

/**
 * Get course performance
 */
function getPerformance(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $performance = array_map(function($course) {
            return [
                'name' => $course['code'],
                'gradeValue' => $course['gradeValue']
            ];
        }, $data['courses']);
        
        $response['success'] = true;
        $response['data'] = $performance;
        $response['message'] = 'Performance data retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'Failed to calculate performance';
        http_response_code(500);
    }
}

/**
 * Get statistics
 */
function getStatistics(&$response) {
    $data = loadJsonData();
    if ($data) {
        $stats = calculateStatistics($data);
        
        $response['success'] = true;
        $response['data'] = $stats;
        $response['message'] = 'Statistics retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'Failed to calculate statistics';
        http_response_code(500);
    }
}

/**
 * Get GPA history
 */
function getGPAHistory(&$response) {
    $data = loadJsonData();
    if ($data && isset($data['gpaHistory'])) {
        $response['success'] = true;
        $response['data'] = $data['gpaHistory'];
        $response['message'] = 'GPA history retrieved successfully';
        http_response_code(200);
    } else {
        $response['message'] = 'No GPA history found';
        http_response_code(404);
    }
}

/**
 * Add a new course
 */
function addCourse($input, &$response) {
    if (!$input || !isset($input['name']) || !isset($input['code'])) {
        $response['message'] = 'Course name and code are required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data) {
        // Generate new ID
        $maxId = 0;
        foreach ($data['courses'] as $course) {
            if ($course['id'] > $maxId) $maxId = $course['id'];
        }
        
        $newCourse = [
            'id' => $maxId + 1,
            'name' => $input['name'],
            'code' => $input['code'],
            'credits' => isset($input['credits']) ? intval($input['credits']) : 3,
            'grade' => isset($input['grade']) ? $input['grade'] : 'N/A',
            'gradeValue' => isset($input['gradeValue']) ? floatval($input['gradeValue']) : 0,
            'instructor' => isset($input['instructor']) ? $input['instructor'] : 'TBA',
            'schedule' => isset($input['schedule']) ? $input['schedule'] : 'TBD'
        ];
        
        $data['courses'][] = $newCourse;
        
        if (saveJsonData($data)) {
            $response['success'] = true;
            $response['data'] = $newCourse;
            $response['message'] = 'Course added successfully';
            http_response_code(201);
        } else {
            $response['message'] = 'Failed to save course';
            http_response_code(500);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Update a course
 */
function updateCourse($input, &$response) {
    if (!$input || !isset($input['id'])) {
        $response['message'] = 'Course ID is required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $found = false;
        foreach ($data['courses'] as &$course) {
            if ($course['id'] === $input['id']) {
                // Update fields
                foreach (['name', 'code', 'credits', 'grade', 'gradeValue', 'instructor', 'schedule'] as $field) {
                    if (isset($input[$field])) {
                        $course[$field] = $input[$field];
                    }
                }
                $found = true;
                break;
            }
        }
        
        if ($found && saveJsonData($data)) {
            $response['success'] = true;
            $response['message'] = 'Course updated successfully';
            http_response_code(200);
        } else {
            $response['message'] = $found ? 'Failed to save data' : 'Course not found';
            http_response_code($found ? 500 : 404);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Update assignment status
 */
function updateAssignment($input, &$response) {
    if (!$input || !isset($input['id']) || !isset($input['status'])) {
        $response['message'] = 'Assignment ID and status are required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data && isset($data['assignments'])) {
        $found = false;
        foreach ($data['assignments'] as &$assignment) {
            if ($assignment['id'] === $input['id']) {
                $assignment['status'] = $input['status'];
                if (isset($input['score'])) {
                    $assignment['score'] = intval($input['score']);
                }
                $found = true;
                break;
            }
        }
        
        if ($found && saveJsonData($data)) {
            $response['success'] = true;
            $response['message'] = 'Assignment updated successfully';
            http_response_code(200);
        } else {
            $response['message'] = $found ? 'Failed to save data' : 'Assignment not found';
            http_response_code($found ? 500 : 404);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Mark attendance
 */
function markAttendance($input, &$response) {
    if (!$input || !isset($input['courseId']) || !isset($input['date']) || !isset($input['status'])) {
        $response['message'] = 'Course ID, date, and status are required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data) {
        $newRecord = [
            'courseId' => intval($input['courseId']),
            'date' => $input['date'],
            'status' => $input['status']
        ];
        
        $data['attendance'][] = $newRecord;
        
        if (saveJsonData($data)) {
            $response['success'] = true;
            $response['data'] = $newRecord;
            $response['message'] = 'Attendance marked successfully';
            http_response_code(201);
        } else {
            $response['message'] = 'Failed to save attendance';
            http_response_code(500);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Update grade
 */
function updateGrade($input, &$response) {
    if (!$input || !isset($input['courseId']) || !isset($input['grade'])) {
        $response['message'] = 'Course ID and grade are required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $found = false;
        foreach ($data['courses'] as &$course) {
            if ($course['id'] === $input['courseId']) {
                $course['grade'] = $input['grade'];
                $course['gradeValue'] = isset($input['gradeValue']) ? floatval($input['gradeValue']) : 0;
                $found = true;
                break;
            }
        }
        
        if ($found && saveJsonData($data)) {
            $response['success'] = true;
            $response['message'] = 'Grade updated successfully';
            http_response_code(200);
        } else {
            $response['message'] = $found ? 'Failed to save data' : 'Course not found';
            http_response_code($found ? 500 : 404);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Delete course
 */
function deleteCourse($input, &$response) {
    if (!$input || !isset($input['id'])) {
        $response['message'] = 'Course ID is required';
        http_response_code(400);
        return;
    }
    
    $data = loadJsonData();
    if ($data && isset($data['courses'])) {
        $index = -1;
        foreach ($data['courses'] as $i => $course) {
            if ($course['id'] === $input['id']) {
                $index = $i;
                break;
            }
        }
        
        if ($index >= 0) {
            array_splice($data['courses'], $index, 1);
            if (saveJsonData($data)) {
                $response['success'] = true;
                $response['message'] = 'Course deleted successfully';
                http_response_code(200);
            } else {
                $response['message'] = 'Failed to save data';
                http_response_code(500);
            }
        } else {
            $response['message'] = 'Course not found';
            http_response_code(404);
        }
    } else {
        $response['message'] = 'Failed to load data';
        http_response_code(500);
    }
}

/**
 * Calculate statistics from data
 */
function calculateStatistics($data) {
    $courses = isset($data['courses']) ? $data['courses'] : [];
    $assignments = isset($data['assignments']) ? $data['assignments'] : [];
    $attendance = isset($data['attendance']) ? $data['attendance'] : [];
    
    // Calculate GPA
    $totalPoints = 0;
    $totalCredits = 0;
    foreach ($courses as $course) {
        if (isset($course['gradeValue']) && $course['gradeValue'] > 0) {
            $totalPoints += $course['gradeValue'] * $course['credits'];
            $totalCredits += $course['credits'];
        }
    }
    $gpa = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0;
    
    // Calculate attendance rate
    $totalAttendance = count($attendance);
    $present = 0;
    foreach ($attendance as $record) {
        if ($record['status'] === 'Present') {
            $present++;
        }
    }
    $attendanceRate = $totalAttendance > 0 ? round(($present / $totalAttendance) * 100) : 0;
    
    // Count pending assignments
    $pendingAssignments = 0;
    foreach ($assignments as $assignment) {
        if ($assignment['status'] === 'Pending') {
            $pendingAssignments++;
        }
    }
    
    return [
        'gpa' => $gpa,
        'courseCount' => count($courses),
        'pendingAssignments' => $pendingAssignments,
        'attendanceRate' => $attendanceRate
    ];
}

/**
 * Load JSON data from file
 */
function loadJsonData() {
    $filePath = __DIR__ . '/data.json';
    
    if (!file_exists($filePath)) {
        // Create default data file
        $defaultData = getDefaultData();
        file_put_contents($filePath, json_encode($defaultData, JSON_PRETTY_PRINT));
        return $defaultData;
    }
    
    $content = file_get_contents($filePath);
    if ($content === false) {
        return null;
    }
    
    return json_decode($content, true);
}

/**
 * Save JSON data to file
 */
function saveJsonData($data) {
    $filePath = __DIR__ . '/data.json';
    return file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT)) !== false;
}

/**
 * Get default data structure
 */
function getDefaultData() {
    return [
        'courses' => [
            ['id' => 1, 'name' => 'Web Systems and Technologies', 'code' => 'WST101', 'credits' => 3, 'grade' => 'A', 'gradeValue' => 4.0, 'instructor' => 'Prof. Santos', 'schedule' => 'MW 10:00-11:30'],
            ['id' => 2, 'name' => 'Systems Analysis and Design', 'code' => 'SAD201', 'credits' => 3, 'grade' => 'B+', 'gradeValue' => 3.5, 'instructor' => 'Prof. Reyes', 'schedule' => 'TTh 13:00-14:30'],
            ['id' => 3, 'name' => 'Quantitative Methods', 'code' => 'QM301', 'credits' => 2, 'grade' => 'B', 'gradeValue' => 3.0, 'instructor' => 'Prof. Garcia', 'schedule' => 'MW 14:00-15:30'],
            ['id' => 4, 'name' => 'Advanced Database Systems', 'code' => 'ADS401', 'credits' => 3, 'grade' => 'A-', 'gradeValue' => 3.7, 'instructor' => 'Prof. Cruz', 'schedule' => 'TTh 10:00-11:30'],
            ['id' => 5, 'name' => 'Systems Integration and Architecture', 'code' => 'SIA501', 'credits' => 3, 'grade' => 'C+', 'gradeValue' => 2.5, 'instructor' => 'Prof. Mendoza', 'schedule' => 'F 09:00-12:00'],
            ['id' => 6, 'name' => 'Network Security', 'code' => 'NS601', 'credits' => 1, 'grade' => 'B-', 'gradeValue' => 2.7, 'instructor' => 'Prof. Torres', 'schedule' => '

            ['id' => 1, 'courseId' => 1, 'title' => 'HTML/CSS Project', 'dueDate' => '2026-08-25', 'status' => 'Pending', 'score' => null],
            ['id' => 2, 'courseId' => 1, 'title' => 'JavaScript Quiz', 'dueDate' => '2026-08-20', 'status' => 'Completed', 'score' => 92],
            ['id' => 3, 'courseId' => 2, 'title' => 'Use Case Diagram', 'dueDate' => '2026-08-22', 'status' => 'Pending', 'score' => null],
            ['id' => 4, 'courseId' => 2, 'title' => 'System Proposal', 'dueDate' => '2026-08-15', 'status' => 'Completed', 'score' => 88],
            ['id' => 5, 'courseId' => 3, 'title' => 'Statistics Homework', 'dueDate' => '2026-08-23', 'status' => 'Pending', 'score' => null],
            ['id' => 6, 'courseId' => 3, 'title' => 'Data Analysis Report', 'dueDate' => '2026-08-18', 'status' => 'Completed', 'score' => 76],
            ['id' => 7, 'courseId' => 4, 'title' => 'Database Design', 'dueDate' => '2026-08-21', 'status' => 'Pending', 'score' => null],
            ['id' => 8, 'courseId' => 4, 'title' => 'SQL Project', 'dueDate' => '2026-08-14', 'status' => 'Completed', 'score' => 94],
            ['id' => 9, 'courseId' => 5, 'title' => 'Integration Report', 'dueDate' => '2026-08-24', 'status' => 'Pending', 'score' => null],
            ['id' => 10, 'courseId' => 6, 'title' => 'Security Audit', 'dueDate' => '2026-08-26', 'status' => 'Pending', 'score' => null]
        ],
        'attendance' => [
            ['courseId' => 1, 'date' => '2026-08-18', 'status' => 'Present'],
            ['courseId' => 1, 'date' => '2026-08-16', 'status' => 'Present'],
            ['courseId' => 1, 'date' => '2026-08-14', 'status' => 'Present'],
            ['courseId' => 2, 'date' => '2026-08-18', 'status' => 'Present'],
            ['courseId' => 2, 'date' => '2026-08-16', 'status' => 'Absent'],
            ['courseId' => 2, 'date' => '2026-08-14', 'status' => 'Present'],
            ['courseId' => 3, 'date' => '2026-08-18', 'status' => 'Present'],
            ['courseId' => 3, 'date' => '2026-08-16', 'status' => 'Present'],
            ['courseId' => 4, 'date' => '2026-08-18', 'status' => 'Present'],
            ['courseId' => 4, 'date' => '2026-08-16', 'status' => 'Present'],
            ['courseId' => 5, 'date' => '2026-08-18', 'status' => 'Absent'],
            ['courseId' => 5, 'date' => '2026-08-11', 'status' => 'Present'],
            ['courseId' => 6, 'date' => '2026-08-18', 'status' => 'Present'],
            ['courseId' => 6, 'date' => '2026-08-16', 'status' => 'Present']
        ],
        'activities' => [
            ['date' => '2026-08-18 14:30', 'activity' => 'Submitted assignment for Web Systems and Technologies', 'status' => 'Completed'],
            ['date' => '2026-08-18 11:15', 'activity' => 'Attended Systems Analysis & Design lecture', 'status' => 'Present'],
            ['date' => '2026-08-17 16:00', 'activity' => 'Quiz scheduled for Friday - Quantitative Methods', 'status' => 'Pending'],
            ['date' => '2026-08-17 09:30', 'activity' => 'Project proposal approved by professor', 'status' => 'Approved'],
            ['date' => '2026-08-16 13:45', 'activity' => 'Submitted Advanced Database Systems project', 'status' => 'Completed'],
            ['date' => '2026-08-16 10:00', 'activity' => 'Missed Systems Integration and Architecture lecture', 'status' => 'Absent']
        ],
        'gpaHistory' => [
            ['semester' => '2025-1', 'gpa' => 3.20],
            ['semester' => '2025-2', 'gpa' => 3.35],
            ['semester' => '2026-1', 'gpa' => 3.30]
        ]
    ];
}
?>