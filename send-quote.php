<?php
/**
 * Stallion Contracting — quote request handler (runs on Hostinger).
 * Emails each request to the office and keeps a private backup copy of every lead.
 * The website calls this with fetch() and expects JSON; a plain form post is
 * redirected to /thank-you/ instead.
 */

const TO_EMAIL   = 'info@stallioncontracting.ca';
const FROM_EMAIL = 'no-reply@stallioncontracting.ca';
const SITE_NAME  = 'Stallion Contracting website';

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function finish(bool $ok, string $message, bool $json): void {
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        if (!$ok) http_response_code(400);
        echo json_encode(['success' => $ok ? 'true' : 'false', 'message' => $message]);
    } else {
        header('Location: ' . ($ok ? '/thank-you/' : '/#quote'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    finish(false, 'Please use the quote form on the website.', $wantsJson);
}

// Spam trap: real visitors never fill the hidden "_honey" field.
if (trim($_POST['_honey'] ?? '') !== '') {
    finish(true, 'Thanks!', $wantsJson);
}

function field(string $key, int $max = 500): string {
    $v = trim((string)($_POST[$key] ?? ''));
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
}

$lead = [
    'Name'               => field('name', 120),
    'Phone'              => field('phone', 40),
    'Email'              => field('email', 160),
    'Project type'       => field('project_type', 80),
    'Space size'         => field('space_size', 80),
    'Timeline'           => field('timeline', 80),
    'Drawings / permits' => field('drawings_permits', 80),
    'Details'            => field('details', 2000),
    'Page'               => field('page', 120),
];

if ($lead['Name'] === '' || $lead['Phone'] === '') {
    finish(false, 'Please enter your name and phone number.', $wantsJson);
}
$email = filter_var($lead['Email'], FILTER_VALIDATE_EMAIL) ?: '';

$when = (new DateTime('now', new DateTimeZone('America/Edmonton')))->format('Y-m-d g:i A T');

// 1) Private backup copy of every lead (outside the public web folder when possible).
$dir = dirname(__DIR__) . '/stallion-leads';
if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
    $dir = __DIR__ . '/.leads';
    if (!is_dir($dir)) @mkdir($dir, 0750, true);
    @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
}
$csv = $dir . '/leads.csv';
$isNew = !file_exists($csv);
if ($fh = @fopen($csv, 'a')) {
    if ($isNew) fputcsv($fh, array_merge(['Received'], array_keys($lead)));
    fputcsv($fh, array_merge([$when], array_values($lead)));
    fclose($fh);
}

// 2) Email to the office.
$lines = ["New quote request from the website — $when", ''];
foreach ($lead as $label => $value) {
    if ($value !== '') $lines[] = str_pad($label . ':', 21) . $value;
}
$lines[] = '';
$lines[] = 'Reply to this email or call the client back.';
$body = implode("\n", $lines);

$subject = 'New quote request: ' . ($lead['Project type'] ?: 'Website') . ' — ' . $lead['Name'];
$subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers = [
    'From: ' . SITE_NAME . ' <' . FROM_EMAIL . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];
if ($email) $headers[] = 'Reply-To: ' . $lead['Name'] . ' <' . $email . '>';

$sent = @mail(TO_EMAIL, $subject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);

if (!$sent && !file_exists($csv)) {
    finish(false, 'Sorry — we could not send your request. Please call 587.834.4444.', $wantsJson);
}
finish(true, 'Thanks — your request was received.', $wantsJson);
