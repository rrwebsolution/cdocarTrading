Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path (Get-Location) "public\system-flows"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$flows = @(
  @{
    Slug = "admin-owner"
    Caption = "Proposed System Flow of the Admin / Owner"
    Steps = @(
      "Start",
      "Login to system",
      "Manage users and roles",
      "Monitor dashboard",
      "Manage staff, vehicles, customers, reservations, job orders, sales and payments",
      "Approve records and verify requirements",
      "Generate system reports",
      "End"
    )
  },
  @{
    Slug = "secretary"
    Caption = "Proposed System Flow of the Secretary"
    Steps = @(
      "Start",
      "Login to system",
      "Register or update customer and vehicle records",
      "Create reservations and verify documents",
      "Create job orders and sales/payment records",
      "Prepare financing, document, and vehicle release records",
      "Generate operational reports",
      "End"
    )
  },
  @{
    Slug = "mechanics-car-washers"
    Caption = "Proposed System Flow of the Mechanics and Car Washers"
    Steps = @(
      "Start",
      "Login to system",
      "View assigned job orders",
      "Inspect vehicle and perform repair, cleaning, or detailing",
      "Record findings, parts/actions, cost, and photos",
      "Update vehicle condition and work status",
      "Mark job order complete and notify admin/secretary",
      "End"
    )
  },
  @{
    Slug = "customer"
    Caption = "Proposed System Flow of the Customer"
    Steps = @(
      "Start",
      "Login or register account",
      "Browse available vehicles and view details",
      "Submit reservation or service request",
      "Upload required documents and payment proof",
      "Receive approval and status updates",
      "View payments, transaction history, and vehicle release documents",
      "End"
    )
  }
)

$width = 900
$topMargin = 48
$bottomMargin = 92
$stepGap = 42
$processHeight = 78
$terminalHeight = 52
$captionGap = 32
$boxWidth = 520
$terminalWidth = 150

$fontFamily = "Arial"
$captionFont = New-Object System.Drawing.Font $fontFamily, 18, ([System.Drawing.FontStyle]::Bold)
$stepFont = New-Object System.Drawing.Font $fontFamily, 15, ([System.Drawing.FontStyle]::Bold)
$smallFont = New-Object System.Drawing.Font $fontFamily, 13, ([System.Drawing.FontStyle]::Bold)

$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(20, 24, 31))
$captionBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Black)
$boxBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 249, 250))
$backgroundBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(176, 180, 184)), 2
$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(126, 132, 138)), 2
$linePen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 6

$centerFormat = New-Object System.Drawing.StringFormat
$centerFormat.Alignment = [System.Drawing.StringAlignment]::Center
$centerFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
$centerFormat.Trimming = [System.Drawing.StringTrimming]::Word

function Get-StepHeight($index, $count) {
  if ($index -eq 0 -or $index -eq ($count - 1)) {
    return $terminalHeight
  }

  return $processHeight
}

function Draw-RoundedRectangle($graphics, $brush, $pen, $rect, $radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc(($rect.Right - $diameter), $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc(($rect.Right - $diameter), ($rect.Bottom - $diameter), $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, ($rect.Bottom - $diameter), $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $graphics.FillPath($brush, $path)
  $graphics.DrawPath($pen, $path)
  $path.Dispose()
}

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string]$text)
}

function Wrap-SvgText($text, $maxChars) {
  $words = ([string]$text).Split(" ")
  $lines = New-Object System.Collections.Generic.List[string]
  $current = ""

  foreach ($word in $words) {
    $candidate = if ($current.Length -eq 0) { $word } else { "$current $word" }
    if ($candidate.Length -gt $maxChars -and $current.Length -gt 0) {
      $lines.Add($current)
      $current = $word
    } else {
      $current = $candidate
    }
  }

  if ($current.Length -gt 0) {
    $lines.Add($current)
  }

  return $lines.ToArray()
}

function Add-SvgText($builder, $x, $y, $text, $className, $maxChars) {
  $lines = Wrap-SvgText $text $maxChars
  $lineHeight = 18
  $firstY = $y - (($lines.Count - 1) * $lineHeight / 2)
  [void]$builder.AppendLine("  <text x=`"$x`" y=`"$firstY`" text-anchor=`"middle`" dominant-baseline=`"middle`" class=`"$className`">")
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $dy = if ($i -eq 0) { 0 } else { $lineHeight }
    [void]$builder.AppendLine("    <tspan x=`"$x`" dy=`"$dy`">$(Escape-Svg $lines[$i])</tspan>")
  }
  [void]$builder.AppendLine("  </text>")
}

foreach ($flow in $flows) {
  $count = $flow.Steps.Count
  $contentHeight = 0
  for ($i = 0; $i -lt $count; $i++) {
    $contentHeight += Get-StepHeight $i $count
    if ($i -lt ($count - 1)) {
      $contentHeight += $stepGap
    }
  }

  $height = $topMargin + $contentHeight + $captionGap + $bottomMargin
  $centerX = [math]::Floor($width / 2)
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.FillRectangle($backgroundBrush, 0, 0, $width, $height)

  $y = $topMargin
  $centers = @()

  for ($i = 0; $i -lt $count; $i++) {
    $step = $flow.Steps[$i]
    $stepHeight = Get-StepHeight $i $count
    $isTerminal = $i -eq 0 -or $i -eq ($count - 1)
    $stepWidth = if ($isTerminal) { $terminalWidth } else { $boxWidth }
    $x = $centerX - ($stepWidth / 2)
    $rect = New-Object System.Drawing.RectangleF $x, $y, $stepWidth, $stepHeight
    $radius = if ($isTerminal) { 24 } else { 7 }
    Draw-RoundedRectangle $graphics $boxBrush $borderPen $rect $radius
    $font = if ($isTerminal) { $smallFont } else { $stepFont }
    $graphics.DrawString($step, $font, $textBrush, $rect, $centerFormat)
    $centers += [pscustomobject]@{ Top = $y; Bottom = $y + $stepHeight; Center = $y + ($stepHeight / 2) }
    $y += $stepHeight + $stepGap
  }

  for ($i = 0; $i -lt ($centers.Count - 1); $i++) {
    $graphics.DrawLine($linePen, $centerX, $centers[$i].Bottom + 4, $centerX, $centers[$i + 1].Top - 8)
  }

  $captionRect = New-Object System.Drawing.RectangleF 20, ($height - $bottomMargin + 18), ($width - 40), 40
  $graphics.DrawString($flow.Caption, $captionFont, $captionBrush, $captionRect, $centerFormat)

  $pngPath = Join-Path $outputDir "proposed-flow-$($flow.Slug).png"
  $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $svg = New-Object System.Text.StringBuilder
  [void]$svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$width`" height=`"$height`" viewBox=`"0 0 $width $height`">")
  [void]$svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"#ffffff`"/>")
  [void]$svg.AppendLine("  <defs>")
  [void]$svg.AppendLine("    <marker id=`"arrow`" viewBox=`"0 0 10 10`" refX=`"5`" refY=`"5`" markerWidth=`"7`" markerHeight=`"7`" orient=`"auto-start-reverse`">")
  [void]$svg.AppendLine("      <path d=`"M 0 0 L 10 5 L 0 10 z`" fill=`"#7e848a`"/>")
  [void]$svg.AppendLine("    </marker>")
  [void]$svg.AppendLine("  </defs>")
  [void]$svg.AppendLine("  <style>")
  [void]$svg.AppendLine("    .step { font: 700 15px Arial, Helvetica, sans-serif; fill: #14181f; }")
  [void]$svg.AppendLine("    .terminal { font: 700 13px Arial, Helvetica, sans-serif; fill: #14181f; }")
  [void]$svg.AppendLine("    .caption { font: 700 18px 'Times New Roman', serif; fill: #000000; }")
  [void]$svg.AppendLine("  </style>")

  $y = $topMargin
  $svgCenters = @()

  for ($i = 0; $i -lt $count; $i++) {
    $step = $flow.Steps[$i]
    $stepHeight = Get-StepHeight $i $count
    $isTerminal = $i -eq 0 -or $i -eq ($count - 1)
    $stepWidth = if ($isTerminal) { $terminalWidth } else { $boxWidth }
    $x = $centerX - ($stepWidth / 2)
    $radius = if ($isTerminal) { 24 } else { 7 }
    [void]$svg.AppendLine("  <rect x=`"$x`" y=`"$y`" width=`"$stepWidth`" height=`"$stepHeight`" rx=`"$radius`" fill=`"#f8f9fa`" stroke=`"#b0b4b8`" stroke-width=`"2`"/>")
    Add-SvgText $svg $centerX ($y + ($stepHeight / 2)) $step $(if ($isTerminal) { "terminal" } else { "step" }) $(if ($isTerminal) { 16 } else { 46 })
    $svgCenters += [pscustomobject]@{ Top = $y; Bottom = $y + $stepHeight }
    $y += $stepHeight + $stepGap
  }

  for ($i = 0; $i -lt ($svgCenters.Count - 1); $i++) {
    $lineY1 = $svgCenters[$i].Bottom + 4
    $lineY2 = $svgCenters[$i + 1].Top - 10
    [void]$svg.AppendLine("  <line x1=`"$centerX`" y1=`"$lineY1`" x2=`"$centerX`" y2=`"$lineY2`" stroke=`"#7e848a`" stroke-width=`"2`" marker-end=`"url(#arrow)`"/>")
  }

  Add-SvgText $svg $centerX ($height - $bottomMargin + 40) $flow.Caption "caption" 80
  [void]$svg.AppendLine("</svg>")

  $svgPath = Join-Path $outputDir "proposed-flow-$($flow.Slug).svg"
  [System.IO.File]::WriteAllText($svgPath, $svg.ToString())

  $graphics.Dispose()
  $bitmap.Dispose()
}

$markdown = @(
  "# Proposed System Flows",
  "",
  "Updated system flows generated from the current CDO Car Trading user modules.",
  "",
  "| User | PNG | SVG |",
  "| --- | --- | --- |",
  "| Admin / Owner | proposed-flow-admin-owner.png | proposed-flow-admin-owner.svg |",
  "| Secretary | proposed-flow-secretary.png | proposed-flow-secretary.svg |",
  "| Mechanics and Car Washers | proposed-flow-mechanics-car-washers.png | proposed-flow-mechanics-car-washers.svg |",
  "| Customer | proposed-flow-customer.png | proposed-flow-customer.svg |"
) -join [Environment]::NewLine

[System.IO.File]::WriteAllText((Join-Path $outputDir "README.md"), $markdown)

$captionFont.Dispose()
$stepFont.Dispose()
$smallFont.Dispose()
$textBrush.Dispose()
$captionBrush.Dispose()
$boxBrush.Dispose()
$backgroundBrush.Dispose()
$borderPen.Dispose()
$linePen.Dispose()
$centerFormat.Dispose()
