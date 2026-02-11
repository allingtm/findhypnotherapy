$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("d:\repos\findhypnotherapy\docs\reference.docx")

# Set 1 inch margins (72 points = 1 inch)
$doc.PageSetup.TopMargin = 72
$doc.PageSetup.BottomMargin = 72
$doc.PageSetup.LeftMargin = 72
$doc.PageSetup.RightMargin = 72

$doc.Save()
$doc.Close()
$word.Quit()
Write-Host "Margins updated successfully"
