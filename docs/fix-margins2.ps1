Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = "d:\repos\findhypnotherapy\docs\reference.docx"
$extractPath = "d:\repos\findhypnotherapy\docs\reference_temp"

# Clean up if exists
if (Test-Path $extractPath) { Remove-Item -Recurse -Force $extractPath }

# Extract
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $extractPath)

# Read document.xml
$docPath = Join-Path $extractPath "word\document.xml"
[xml]$doc = Get-Content $docPath

# Find or create sectPr (section properties) and add page margins
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$body = $doc.SelectSingleNode("//w:body", $ns)
$sectPr = $body.SelectSingleNode("w:sectPr", $ns)

if (-not $sectPr) {
    $sectPr = $doc.CreateElement("w", "sectPr", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
    $body.AppendChild($sectPr) | Out-Null
}

# Remove existing pgMar if present
$existingPgMar = $sectPr.SelectSingleNode("w:pgMar", $ns)
if ($existingPgMar) { $sectPr.RemoveChild($existingPgMar) | Out-Null }

# Add page margins (1440 twips = 1 inch)
$pgMar = $doc.CreateElement("w", "pgMar", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$pgMar.SetAttribute("top", "http://schemas.openxmlformats.org/wordprocessingml/2006/main", "1440")
$pgMar.SetAttribute("right", "http://schemas.openxmlformats.org/wordprocessingml/2006/main", "1440")
$pgMar.SetAttribute("bottom", "http://schemas.openxmlformats.org/wordprocessingml/2006/main", "1440")
$pgMar.SetAttribute("left", "http://schemas.openxmlformats.org/wordprocessingml/2006/main", "1440")
$sectPr.AppendChild($pgMar) | Out-Null

# Save
$doc.Save($docPath)

# Remove old docx and recreate
Remove-Item $zipPath -Force
[System.IO.Compression.ZipFile]::CreateFromDirectory($extractPath, $zipPath)

# Cleanup
Remove-Item -Recurse -Force $extractPath

Write-Host "Margins set to 1 inch successfully"
