$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try {
    $listener.Start()
    Write-Output "Server listening on http://localhost:$port/"
} catch {
    Write-Error $_
    exit 1
}

$baseDir = "C:\Users\Nouman Ahmed\.gemini\antigravity\scratch\car-dealer-marketplace"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $reqPath = $context.Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($reqPath)) { $reqPath = "index.html" }
        $filePath = Join-Path $baseDir $reqPath

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html"  { "text/html; charset=utf-8" }
                ".css"   { "text/css; charset=utf-8" }
                ".js"    { "application/javascript; charset=utf-8" }
                ".json"  { "application/json; charset=utf-8" }
                ".png"   { "image/png" }
                ".jpg"   { "image/jpeg" }
                ".jpeg"  { "image/jpeg" }
                ".webp"  { "image/webp" }
                ".gif"   { "image/gif" }
                ".ico"   { "image/x-icon" }
                ".woff2" { "font/woff2" }
                ".svg"   { "image/svg+xml" }
                default  { "application/octet-stream" }
            }
            $context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            $context.Response.Headers["Pragma"] = "no-cache"
            $context.Response.Headers["X-Content-Type-Options"] = "nosniff"
            $context.Response.ContentType = $mime
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $context.Response.StatusCode = 404
        }
        $context.Response.Close()
    } catch {
        # continue handling requests
    }
}
