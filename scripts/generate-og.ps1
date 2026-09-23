Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bg = [System.Drawing.ColorTranslator]::FromHtml('#F7F4EC')
$green = [System.Drawing.ColorTranslator]::FromHtml('#183F36')
$navy = [System.Drawing.ColorTranslator]::FromHtml('#25384A')
$soft = [System.Drawing.ColorTranslator]::FromHtml('#E8EFE9')
$graphics.Clear($bg)

$greenBrush = New-Object System.Drawing.SolidBrush($green)
$navyBrush = New-Object System.Drawing.SolidBrush($navy)
$softBrush = New-Object System.Drawing.SolidBrush($soft)
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$greenPen = New-Object System.Drawing.Pen($green, 5)

$graphics.FillRectangle($greenBrush, 0, 0, 1200, 18)
$graphics.FillRectangle($softBrush, 820, 82, 300, 430)
$graphics.DrawRectangle($greenPen, 855, 224, 230, 215)
$graphics.DrawLine($greenPen, 835, 226, 970, 110)
$graphics.DrawLine($greenPen, 970, 110, 1105, 226)
$graphics.DrawLine($greenPen, 970, 226, 970, 439)
$graphics.DrawLine($greenPen, 855, 330, 1085, 330)
$graphics.FillRectangle($navyBrush, 970, 330, 115, 109)

$labelFont = New-Object System.Drawing.Font('Malgun Gothic', 23, [System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font('Malgun Gothic', 54, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font('Malgun Gothic', 25, [System.Drawing.FontStyle]::Regular)
$smallFont = New-Object System.Drawing.Font('Malgun Gothic', 20, [System.Drawing.FontStyle]::Bold)

$graphics.DrawString('비영리단체 한지붕', $labelFont, $greenBrush, 76, 84)
$graphics.DrawString("남는 공간을 살피고,`n세대가 함께 살아갈`n기준을 만듭니다.", $titleFont, $greenBrush, (New-Object System.Drawing.RectangleF(70, 145, 720, 270)))
$graphics.DrawString('상담 · 교육 · 조사로 만드는 주거상생 공익정보', $bodyFont, $navyBrush, 76, 484)
$graphics.DrawString('HANJIBUNG.KR', $smallFont, $greenBrush, 78, 548)
$graphics.DrawString('함께 쓰는 공간', $smallFont, $whiteBrush, 986, 367)

$target = Join-Path $PSScriptRoot '..\src\assets\og-default.png'
$target = [System.IO.Path]::GetFullPath($target)
$bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

$labelFont.Dispose()
$titleFont.Dispose()
$bodyFont.Dispose()
$smallFont.Dispose()
$greenPen.Dispose()
$greenBrush.Dispose()
$navyBrush.Dispose()
$softBrush.Dispose()
$whiteBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output $target
