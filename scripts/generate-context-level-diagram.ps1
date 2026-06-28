Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path (Get-Location) "public\system-flows"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$width = 1900
$height = 1220
$systemRect = [System.Drawing.RectangleF]::new(760, 475, 380, 220)
$entities = @{
  Admin = [System.Drawing.RectangleF]::new(95, 70, 260, 210)
  Secretary = [System.Drawing.RectangleF]::new(1545, 70, 260, 210)
  Customer = [System.Drawing.RectangleF]::new(95, 790, 260, 210)
  Mechanic = [System.Drawing.RectangleF]::new(1545, 790, 260, 210)
}

$adminInputs = @(
  "LOGIN CREDENTIALS DETAILS",
  "USER AND ROLE DETAILS",
  "STAFF MANAGEMENT DETAILS",
  "VEHICLE DATA DETAILS",
  "CUSTOMER DETAILS",
  "RESERVATION DETAILS",
  "JOB ORDER DATA DETAILS",
  "SALES, PAYMENT AND REPORT REQUEST DETAILS"
)

$adminOutputs = @(
  "DASHBOARD MONITORING INFO",
  "USER ACCOUNT AND ROLE INFO",
  "STAFF INFO",
  "VEHICLE INVENTORY INFO",
  "CUSTOMER INFO",
  "RESERVATION INFO",
  "JOB ORDER INFO",
  "SALES, PAYMENTS AND REPORT INFO"
)

$secretaryInputs = @(
  "LOGIN CREDENTIALS DETAILS",
  "MANAGE VEHICLE DETAILS",
  "MANAGE CUSTOMER DETAILS",
  "MANAGE RESERVATION DETAILS",
  "MANAGE JOB ORDER DETAILS",
  "MANAGE SALES AND PAYMENT DETAILS",
  "FINANCING DOCUMENTATION DETAILS",
  "VEHICLE RELEASE AND DOCUMENT DETAILS"
)

$secretaryOutputs = @(
  "PROFILE INFO",
  "VEHICLE INVENTORY INFO",
  "CUSTOMER INFO",
  "RESERVATION INFO",
  "JOB ORDER INFO",
  "PAYMENTS INFO",
  "DOCUMENT AND FINANCING INFO",
  "VEHICLE RELEASE AND REPORT INFO"
)

$customerInputs = @(
  "LOGIN / REGISTRATION DETAILS",
  "CUSTOMER PROFILE DETAILS",
  "RESERVE VEHICLE DETAILS",
  "SERVICE REQUEST DETAILS",
  "DOCUMENT UPLOAD DETAILS",
  "PAYMENT PROOF DETAILS"
)

$customerOutputs = @(
  "PROFILE INFO",
  "VIEW VEHICLE INFO",
  "RESERVATION STATUS INFO",
  "PAYMENTS INFO",
  "DOCUMENT STATUS INFO",
  "SERVICE UPDATE AND HISTORY INFO"
)

$mechanicInputs = @(
  "LOGIN CREDENTIALS DETAILS",
  "JOB ORDER UPDATE DETAILS",
  "INSPECTION FINDINGS DETAILS",
  "REPAIR STATUS DETAILS",
  "CAR WASHING / DETAILING STATUS DETAILS",
  "VEHICLE CONDITION AND COST DETAILS"
)

$mechanicOutputs = @(
  "PROFILE INFO",
  "ASSIGNED JOB ORDER INFORMATION",
  "SERVICE REQUEST INFORMATION",
  "VEHICLE INFO",
  "WORK PRIORITY INFO",
  "COMPLETION NOTIFICATION INFO"
)

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::White)

$boxBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$systemBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 249, 250))
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 28, 28))
$lineBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(70, 70, 70))
$boxPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 40, 40)), 2
$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 70, 70)), 1.6
$linePen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 4, 5
$plainPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 70, 70)), 1.6

$entityFont = New-Object System.Drawing.Font "Arial", 13, ([System.Drawing.FontStyle]::Bold)
$systemFont = New-Object System.Drawing.Font "Arial", 12.5, ([System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font "Arial", 8.2, ([System.Drawing.FontStyle]::Bold)
$captionFont = New-Object System.Drawing.Font "Times New Roman", 18, ([System.Drawing.FontStyle]::Bold)

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$center.Trimming = [System.Drawing.StringTrimming]::Word

function Draw-Entity($graphics, $rect, $label) {
  $graphics.FillRectangle($boxBrush, $rect)
  $graphics.DrawRectangle($boxPen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
  $labelRect = [System.Drawing.RectangleF]::new($rect.X + 8, $rect.Y + 8, $rect.Width - 16, $rect.Height - 16)
  $graphics.DrawString($label, $entityFont, $textBrush, $labelRect, $center)
}

function Draw-Polyline($graphics, $points) {
  for ($i = 0; $i -lt ($points.Count - 1); $i++) {
    if ($i -eq ($points.Count - 2)) {
      $graphics.DrawLine($linePen, $points[$i], $points[$i + 1])
    } else {
      $graphics.DrawLine($plainPen, $points[$i], $points[$i + 1])
    }
  }
}

function Draw-Label($graphics, $x, $y, $text, $width = 240) {
  $rect = [System.Drawing.RectangleF]::new($x - ($width / 2), $y - 10, $width, 20)
  $graphics.FillRectangle([System.Drawing.Brushes]::White, $rect)
  $graphics.DrawString($text, $labelFont, $lineBrush, $rect, $center)
}

function Add-Path($list, $points, $label, $labelX, $labelY, $labelWidth = 240) {
  $list.Add([pscustomobject]@{
    Points = $points
    Label = $label
    LabelX = $labelX
    LabelY = $labelY
    LabelWidth = $labelWidth
  })
}

$paths = New-Object System.Collections.Generic.List[object]

for ($i = 0; $i -lt $adminInputs.Count; $i++) {
  $y = 74 + ($i * 22)
  $xLane = $systemRect.Left - 265 + ($i * 36)
  $endX = $systemRect.Left + 22 + ($i * 40)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($entities.Admin.Right, $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $systemRect.Top - 28),
    [System.Drawing.PointF]::new($endX, $systemRect.Top)
  ) $adminInputs[$i] (($entities.Admin.Right + $xLane) / 2) ($y - 8) 275
}

for ($i = 0; $i -lt $adminOutputs.Count; $i++) {
  $y = $systemRect.Top + 26 + ($i * 20)
  $xLane = $entities.Admin.Left + 35 + ($i * 24)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($systemRect.Left, $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $entities.Admin.Bottom),
    [System.Drawing.PointF]::new($xLane, $entities.Admin.Bottom - 1)
  ) $adminOutputs[$i] (($systemRect.Left + $xLane) / 2) ($y - 7) 245
}

for ($i = 0; $i -lt $secretaryInputs.Count; $i++) {
  $y = 74 + ($i * 22)
  $xLane = $systemRect.Right + 265 - ($i * 36)
  $endX = $systemRect.Right - 22 - ($i * 40)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($entities.Secretary.Left, $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $systemRect.Top - 28),
    [System.Drawing.PointF]::new($endX, $systemRect.Top)
  ) $secretaryInputs[$i] (($entities.Secretary.Left + $xLane) / 2) ($y - 8) 285
}

for ($i = 0; $i -lt $secretaryOutputs.Count; $i++) {
  $y = $systemRect.Top + 26 + ($i * 20)
  $xLane = $entities.Secretary.Right - 35 - ($i * 24)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($systemRect.Right, $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $entities.Secretary.Bottom),
    [System.Drawing.PointF]::new($xLane, $entities.Secretary.Bottom - 1)
  ) $secretaryOutputs[$i] (($systemRect.Right + $xLane) / 2) ($y - 7) 250
}

for ($i = 0; $i -lt $customerInputs.Count; $i++) {
  $y = $entities.Customer.Bottom - 12 - ($i * 28)
  $xLane = $systemRect.Left - 260 + ($i * 44)
  $endX = $systemRect.Left + 45 + ($i * 50)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($entities.Customer.Right, $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $systemRect.Bottom + 28),
    [System.Drawing.PointF]::new($endX, $systemRect.Bottom)
  ) $customerInputs[$i] (($entities.Customer.Right + $xLane) / 2) ($y - 8) 250
}

for ($i = 0; $i -lt $customerOutputs.Count; $i++) {
  $y = $systemRect.Bottom + 38 + ($i * 24)
  $targetY = $entities.Customer.Top + 30 + ($i * 27)
  $xLane = $entities.Customer.Right + 35 + ($i * 28)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($systemRect.Left + 36 + ($i * 42), $systemRect.Bottom),
    [System.Drawing.PointF]::new($systemRect.Left + 36 + ($i * 42), $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $targetY),
    [System.Drawing.PointF]::new($entities.Customer.Right, $targetY)
  ) $customerOutputs[$i] (($systemRect.Left + $xLane) / 2) ($y - 7) 230
}

for ($i = 0; $i -lt $mechanicInputs.Count; $i++) {
  $y = $entities.Mechanic.Bottom - 12 - ($i * 28)
  $xLane = $systemRect.Right + 260 - ($i * 44)
  $endX = $systemRect.Right - 45 - ($i * 50)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($entities.Mechanic.Left, $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $systemRect.Bottom + 28),
    [System.Drawing.PointF]::new($endX, $systemRect.Bottom)
  ) $mechanicInputs[$i] (($entities.Mechanic.Left + $xLane) / 2) ($y - 8) 280
}

for ($i = 0; $i -lt $mechanicOutputs.Count; $i++) {
  $y = $systemRect.Bottom + 38 + ($i * 24)
  $targetY = $entities.Mechanic.Top + 30 + ($i * 27)
  $xLane = $entities.Mechanic.Left - 35 - ($i * 28)
  Add-Path $paths @(
    [System.Drawing.PointF]::new($systemRect.Right - 36 - ($i * 42), $systemRect.Bottom),
    [System.Drawing.PointF]::new($systemRect.Right - 36 - ($i * 42), $y),
    [System.Drawing.PointF]::new($xLane, $y),
    [System.Drawing.PointF]::new($xLane, $targetY),
    [System.Drawing.PointF]::new($entities.Mechanic.Left, $targetY)
  ) $mechanicOutputs[$i] (($systemRect.Right + $xLane) / 2) ($y - 7) 240
}

Draw-Entity $graphics $entities.Admin "ADMIN / OWNER"
Draw-Entity $graphics $entities.Secretary "SECRETARY"
Draw-Entity $graphics $entities.Customer "CUSTOMER"
Draw-Entity $graphics $entities.Mechanic "MECHANICS AND`nCAR WASHERS"

$graphics.FillRectangle($systemBrush, $systemRect)
$graphics.DrawRectangle($boxPen, $systemRect.X, $systemRect.Y, $systemRect.Width, $systemRect.Height)
$systemText = "WEB AND MOBILE-BASED`nINVENTORY AND SALES`nMANAGEMENT SYSTEM`nFOR CDO CAR TRADING"
$graphics.DrawString($systemText, $systemFont, $textBrush, $systemRect, $center)

foreach ($path in $paths) {
  Draw-Polyline $graphics $path.Points
  Draw-Label $graphics $path.LabelX $path.LabelY $path.Label $path.LabelWidth
}

$captionRect = [System.Drawing.RectangleF]::new(0, 1135, $width, 45)
$graphics.DrawString("Context Level Diagram of the CDO Car Trading Inventory and Sales Management System", $captionFont, $textBrush, $captionRect, $center)

$pngPath = Join-Path $outputDir "context-level-diagram.png"
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string]$text)
}

function Add-SvgText($builder, $x, $y, $text, $className, $maxWidth = 260) {
  [void]$builder.AppendLine("  <rect x=`"$($x - ($maxWidth / 2))`" y=`"$($y - 10)`" width=`"$maxWidth`" height=`"20`" fill=`"#ffffff`"/>")
  [void]$builder.AppendLine("  <text x=`"$x`" y=`"$y`" text-anchor=`"middle`" dominant-baseline=`"middle`" class=`"$className`">$(Escape-Svg $text)</text>")
}

function Add-SvgBoxText($builder, $x, $y, $text, $className) {
  $lines = ([string]$text).Split("`n")
  $lineHeight = 18
  $firstY = $y - (($lines.Count - 1) * $lineHeight / 2)
  [void]$builder.AppendLine("  <text x=`"$x`" y=`"$firstY`" text-anchor=`"middle`" dominant-baseline=`"middle`" class=`"$className`">")
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $dy = if ($i -eq 0) { 0 } else { $lineHeight }
    [void]$builder.AppendLine("    <tspan x=`"$x`" dy=`"$dy`">$(Escape-Svg $lines[$i])</tspan>")
  }
  [void]$builder.AppendLine("  </text>")
}

function Add-SvgPath($builder, $points) {
  $d = "M $($points[0].X) $($points[0].Y)"
  for ($i = 1; $i -lt $points.Count; $i++) {
    $d += " L $($points[$i].X) $($points[$i].Y)"
  }
  [void]$builder.AppendLine("  <path d=`"$d`" fill=`"none`" stroke=`"#464646`" stroke-width=`"1.6`" marker-end=`"url(#arrow)`"/>")
}

$svg = New-Object System.Text.StringBuilder
[void]$svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$width`" height=`"$height`" viewBox=`"0 0 $width $height`">")
[void]$svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"#ffffff`"/>")
[void]$svg.AppendLine("  <defs><marker id=`"arrow`" viewBox=`"0 0 10 10`" refX=`"5`" refY=`"5`" markerWidth=`"7`" markerHeight=`"7`" orient=`"auto`"><path d=`"M 0 0 L 10 5 L 0 10 z`" fill=`"#464646`"/></marker></defs>")
[void]$svg.AppendLine("  <style>.entity{font:700 13px Arial,sans-serif;fill:#1c1c1c}.system{font:700 12.5px Arial,sans-serif;fill:#1c1c1c}.label{font:700 8.2px Arial,sans-serif;fill:#464646}.caption{font:700 18px 'Times New Roman',serif;fill:#1c1c1c}</style>")

foreach ($key in @("Admin", "Secretary", "Customer", "Mechanic")) {
  $rect = $entities[$key]
  [void]$svg.AppendLine("  <rect x=`"$($rect.X)`" y=`"$($rect.Y)`" width=`"$($rect.Width)`" height=`"$($rect.Height)`" fill=`"#ffffff`" stroke=`"#282828`" stroke-width=`"2`"/>")
}

[void]$svg.AppendLine("  <rect x=`"$($systemRect.X)`" y=`"$($systemRect.Y)`" width=`"$($systemRect.Width)`" height=`"$($systemRect.Height)`" fill=`"#f8f9fa`" stroke=`"#282828`" stroke-width=`"2`"/>")
Add-SvgBoxText $svg ($entities.Admin.X + $entities.Admin.Width / 2) ($entities.Admin.Y + $entities.Admin.Height / 2) "ADMIN / OWNER" "entity"
Add-SvgBoxText $svg ($entities.Secretary.X + $entities.Secretary.Width / 2) ($entities.Secretary.Y + $entities.Secretary.Height / 2) "SECRETARY" "entity"
Add-SvgBoxText $svg ($entities.Customer.X + $entities.Customer.Width / 2) ($entities.Customer.Y + $entities.Customer.Height / 2) "CUSTOMER" "entity"
Add-SvgBoxText $svg ($entities.Mechanic.X + $entities.Mechanic.Width / 2) ($entities.Mechanic.Y + $entities.Mechanic.Height / 2) "MECHANICS AND`nCAR WASHERS" "entity"
Add-SvgBoxText $svg ($systemRect.X + $systemRect.Width / 2) ($systemRect.Y + $systemRect.Height / 2) $systemText "system"

foreach ($path in $paths) {
  Add-SvgPath $svg $path.Points
  Add-SvgText $svg $path.LabelX $path.LabelY $path.Label "label" $path.LabelWidth
}

Add-SvgBoxText $svg ($width / 2) 1158 "Context Level Diagram of the CDO Car Trading Inventory and Sales Management System" "caption"
[void]$svg.AppendLine("</svg>")
[System.IO.File]::WriteAllText((Join-Path $outputDir "context-level-diagram.svg"), $svg.ToString())

$readmePath = Join-Path $outputDir "README.md"
if (Test-Path $readmePath) {
  $readme = [System.IO.File]::ReadAllText($readmePath)
  if ($readme -notmatch "context-level-diagram") {
    $readme += [Environment]::NewLine + "| Context Level Diagram | context-level-diagram.png | context-level-diagram.svg |"
    [System.IO.File]::WriteAllText($readmePath, $readme)
  }
}

$graphics.Dispose()
$bitmap.Dispose()
$boxBrush.Dispose()
$systemBrush.Dispose()
$textBrush.Dispose()
$lineBrush.Dispose()
$boxPen.Dispose()
$linePen.Dispose()
$plainPen.Dispose()
$entityFont.Dispose()
$systemFont.Dispose()
$labelFont.Dispose()
$captionFont.Dispose()
$center.Dispose()
