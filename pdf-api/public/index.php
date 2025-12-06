<?php
// pdf-api/public/index.php

require_once __DIR__ . '/../vendor/autoload.php';

use Mpdf\Mpdf;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Debugging: log input and HTML
function debug_log($msg) {
    file_put_contents(__DIR__ . '/../debug.log', '[PDF-API DEBUG] ' . $msg . PHP_EOL, FILE_APPEND);
}

// Log raw input
$rawInput = file_get_contents('php://input');
debug_log('Raw input: ' . $rawInput);
$input = json_decode($rawInput, true);
if (!$input) {
    http_response_code(400);
    debug_log('Invalid JSON input');
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}
debug_log('Parsed input: ' . print_r($input, true));

// Load HTML template
$templatePath = dirname(__DIR__, 2) . '/export-template.html';
if (!file_exists($templatePath)) {
    http_response_code(500);
    echo json_encode(['error' => 'HTML template not found']);
    exit;
}
$htmlTemplate = file_get_contents($templatePath);

// Simple variable replacement (Handlebars-style {{var}})
function renderTemplate($template, $data) {
    foreach ($data as $key => $value) {
        if (is_scalar($value)) {
            $template = str_replace('{{' . $key . '}}', htmlspecialchars((string)$value), $template);
        }
    }
    // Remove any unreplaced variables
    $template = preg_replace('/{{[^}]+}}/', '', $template);
    return $template;
}

// For groupedCutPlans, we need to repeat the block
function renderGroupedCutPlans($template, $groupedCutPlans) {
    if (!preg_match('/{{#each groupedCutPlans}}(.*?){{\/each}}/s', $template, $matches)) {
        return $template;
    }
    $block = $matches[1];
    $rendered = '';
    foreach ($groupedCutPlans as $plan) {
        $planBlock = $block;
        foreach ($plan as $key => $value) {
            if ($key === 'diagram') {
                $planBlock = preg_replace('/{{#if diagram}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/', $value ? $value : '$2', $planBlock);
                $planBlock = str_replace('{{{diagram}}}', $value, $planBlock);
            } else {
                $planBlock = str_replace('{{' . $key . '}}', htmlspecialchars((string)$value), $planBlock);
            }
        }
        // Remove any unreplaced variables in the block
        $planBlock = preg_replace('/{{[^}]+}}/', '', $planBlock);
        $rendered .= $planBlock;
    }
    return str_replace($matches[0], $rendered, $template);
}

// Prepare data for template
$data = $input;
if (!isset($data['date'])) {
    $data['date'] = date('d/m/Y');
}
if (!isset($data['groupedCutPlans'])) {
    $data['groupedCutPlans'] = [];
}

// Render groupedCutPlans block
$html = renderGroupedCutPlans($htmlTemplate, $data['groupedCutPlans']);
debug_log('HTML after groupedCutPlans: ' . $html);
// Render remaining variables
$html = renderTemplate($html, $data);
debug_log('Final HTML: ' . $html);

// Generate PDF
try {
    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'orientation' => 'P',
    ]);
    $mpdf->WriteHTML($html);
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="cutting_diagram.pdf"');
    echo $mpdf->Output('', 'S');
    exit;
} catch (Exception $e) {
    http_response_code(500);
    debug_log('PDF generation failed: ' . $e->getMessage());
    echo json_encode(['error' => 'PDF generation failed', 'details' => $e->getMessage()]);
    exit;
} 