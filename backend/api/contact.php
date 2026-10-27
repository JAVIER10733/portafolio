<?php
// Permitir solicitudes solo desde tu dominio (seguridad básica CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// 1. Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

// 2. Obtener los datos JSON enviados por el JS
$data = json_decode(file_get_contents('php://input'), true);

// 3. Validar que los datos existan
if (!$data || empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos"]);
    exit;
}

// 4. Protección básica contra inyección y limpieza de datos
$name = htmlspecialchars(trim($data['name']));
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars(trim($data['subject']));
$message = htmlspecialchars(trim($data['message']));

// Validar formato de correo
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Correo electrónico inválido"]);
    exit;
}

// 5. Configurar tu correo real AQUÍ
$to = "tu.correo@ejemplo.com"; // ⚠️ CAMBIA ESTO POR TU CORREO REAL
$email_subject = "Nuevo mensaje del portafolio: " . $subject;

// 6. Construir el cuerpo del correo
$email_body = "Has recibido un nuevo mensaje de tu portafolio web.\n\n";
$email_body .= "Nombre: " . $name . "\n";
$email_body .= "Correo: " . $email . "\n";
$email_body .= "Asunto: " . $subject . "\n\n";
$email_body .= "Mensaje:\n" . $message . "\n";

// 7. Cabeceras del correo para que no caiga en Spam
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// 8. Enviar el correo
if (mail($to, $email_subject, $email_body, $headers)) {
    http_response_code(200);
    echo json_encode(["success" => "Mensaje enviado correctamente"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Error del servidor al enviar el correo"]);
}
?>