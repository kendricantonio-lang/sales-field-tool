Add-Type -AssemblyName System.Drawing

function New-Icon {
    param(
        [int]$Size,
        [string]$OutPath,
        [bool]$Padded = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

    $bgColor = [System.Drawing.ColorTranslator]::FromHtml('#2563eb')
    $g.Clear($bgColor)

    $textColor = [System.Drawing.Color]::White
    $fontSize = if ($Padded) { $Size * 0.28 } else { $Size * 0.42 }
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush($textColor)

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $g.DrawString('SF', $font, $brush, $rect, $format)

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$iconsDir = Join-Path $PSScriptRoot '..\public\icons'
New-Icon -Size 192 -OutPath (Join-Path $iconsDir 'icon-192.png')
New-Icon -Size 512 -OutPath (Join-Path $iconsDir 'icon-512.png')
New-Icon -Size 512 -OutPath (Join-Path $iconsDir 'icon-512-maskable.png') -Padded $true
New-Icon -Size 180 -OutPath (Join-Path $iconsDir 'apple-touch-icon.png')

Write-Host 'Icons generated in' $iconsDir
