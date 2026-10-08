Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bg = [System.Drawing.ColorTranslator]::FromHtml('#F7F4EC')
$green = [System.Drawing.ColorTranslator]::FromHtml('#183F36')
$navy = [System.Drawing.ColorTranslator]::FromHtml('#25384A')
$soft = [System.Drawing.ColorTranslator]::FromHtml('#E8EFE9')
$graphics.Clear($bg)

$greenBrush = New-Object System.Drawing.SolidBrush($green)
$navyBrush = New-Object System.Drawing.SolidBrush($navy)
$softBrush = New-Object System.Drawing.SolidBrush($soft)

$graphics.FillRectangle($greenBrush, 0, 0, 1200, 18)
$graphics.FillRectangle($softBrush, 820, 82, 300, 430)
$logoPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\src\assets\hanjibung-logo.png'))
$logo = [System.Drawing.Image]::FromFile($logoPath)
$graphics.DrawImage($logo, (New-Object System.Drawing.Rectangle(827, 135, 286, 258)))

$labelFont = New-Object System.Drawing.Font('Malgun Gothic', 23, [System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font('Malgun Gothic', 54, [System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font('Malgun Gothic', 25, [System.Drawing.FontStyle]::Regular)
$smallFont = New-Object System.Drawing.Font('Malgun Gothic', 20, [System.Drawing.FontStyle]::Bold)

$graphics.DrawString('비영리단체 한지붕', $labelFont, $greenBrush, 76, 84)
$graphics.DrawString("남는 공간을 살피고,`n세대가 함께 살아갈`n기준을 만듭니다.", $titleFont, $greenBrush, (New-Object System.Drawing.RectangleF(70, 145, 720, 270)))
$graphics.DrawString('상담 · 교육 · 조사로 만드는 주거상생 공익정보', $bodyFont, $navyBrush, 76, 484)
$graphics.DrawString('HANJIBUNG.KR', $smallFont, $greenBrush, 78, 548)
$captionFormat = New-Object System.Drawing.StringFormat
$captionFormat.Alignment = [System.Drawing.StringAlignment]::Center
$graphics.DrawString('함께 쓰는 공간', $smallFont, $greenBrush, (New-Object System.Drawing.RectangleF(830, 446, 280, 48)), $captionFormat)

$target = Join-Path $PSScriptRoot '..\src\assets\og-default.png'
$target = [System.IO.Path]::GetFullPath($target)
$bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)

$labelFont.Dispose()
$titleFont.Dispose()
$bodyFont.Dispose()
$smallFont.Dispose()
$greenBrush.Dispose()
$navyBrush.Dispose()
$softBrush.Dispose()
$captionFormat.Dispose()
$logo.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output $target
