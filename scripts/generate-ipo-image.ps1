Add-Type -AssemblyName System.Drawing

$rows = @(
  @("User Account Details", "Register/login users, manage user accounts, update status, and assign role access", "User account records, login access, active/inactive user list"),
  @("Role and Permission Details", "Create roles, update permissions, and assign module access per user type", "Role records, permission list, access control setup"),
  @("Secretary Details", "Register customers, update vehicles, process reservations, encode sales/payments, record financing/documents/releases, and create or assign job orders", "Secretary records, updated customer/vehicle records, reservations, payments, financing, documents, and releases"),
  @("Mechanic Details", "View assigned job orders, update repair progress, record inspection findings, update vehicle condition, and document pre-sale repair actions", "Mechanic job order updates, repair records, inspection findings, vehicle condition/status updates"),
  @("Carwasher Details", "View assigned carwash job orders, update washing/detailing status, and mark cleaning services as completed", "Carwash job order updates, washing/detailing status records, completed cleaning records"),
  @("Customer Details", "Register customers, update customer profile, maintain contact/address/status", "Customer records, customer profile, active customer list"),
  @("Vehicle Details", "Add/update vehicle inventory including brand, model, year, color, engine/chassis/plate number, mileage, pricing, photos, location, and status", "Vehicle inventory records, vehicle list, available/reserved/sold/for repair status"),
  @("Reservation Details", "Create, review, approve, update, monitor, or cancel vehicle reservations", "Reservation history, approval status, expiring reservation records"),
  @("Sales Transaction Details", "Record vehicle sale, link customer/vehicle/reservation, compute total amount, paid amount, balance, payment method, and sale status", "Sales transaction records, purchase history, outstanding balance report"),
  @("Payment Details", "Record customer payments, receipt number, amount, method, proof of payment, paid date, status, and update sale totals", "Payment records, receipts, proof review status, updated customer balance"),
  @("Financing Details", "Record financing company, application number, approved amount, down payment, approval date, documents, remarks, and status", "Financing records, financial basis tracking, financing approval/status report"),
  @("Service Request Details", "Customer submits repair or maintenance request with vehicle, service type, issue, photo, progress, and status", "Service request history, repair progress status, customer service record"),
  @("Job Order Details", "Secretary creates job order from a service request or vehicle maintenance need, assigns mechanic/carwasher, schedules work, then assigned staff update repair or washing progress", "Job order records, assigned work list, repair/washing progress, service completion records"),
  @("Vehicle Parts / Pre-Sale Repair Details", "Record affected parts only during inspection or repair, including issue, action taken, repair cost, before/after photos, assigned staff, and readiness status", "Affected-parts record, pre-sale inspection record, repair record, ready-for-sale status"),
  @("Vehicle Release Details", "Verify release checklist, document status, released date, released by, remarks, and final status", "Vehicle release records, turnover checklist, released vehicle report"),
  @("Documents / Reports / Logs", "Upload/verify documents, generate reports, and record important system actions", "Document records, summary reports, system audit trail/activity logs")
)

$width = 2400
$height = 2820
$margin = 34
$titleHeight = 82
$headerHeight = 70
$rowHeight = 138
$inputWidth = 520
$processWidth = 930
$outputWidth = 840
$gap = 12

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::White)

$black = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18,18,18))
$gray = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(243,244,246))
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(18,18,18)), 4

$titleFont = New-Object System.Drawing.Font "Arial", 34, ([System.Drawing.FontStyle]::Bold)
$headerFont = New-Object System.Drawing.Font "Arial", 32, ([System.Drawing.FontStyle]::Bold)
$cellFont = New-Object System.Drawing.Font "Arial", 23, ([System.Drawing.FontStyle]::Regular)
$inputFont = New-Object System.Drawing.Font "Arial", 24, ([System.Drawing.FontStyle]::Regular)
$noteFont = New-Object System.Drawing.Font "Arial", 22, ([System.Drawing.FontStyle]::Regular)

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$center.Trimming = [System.Drawing.StringTrimming]::Word
$center.FormatFlags = 0

$titleRect = New-Object System.Drawing.RectangleF 0, 14, $width, 52
$graphics.DrawString("CDO Car Trading Management System - Updated IPO", $titleFont, $black, $titleRect, $center)

$x1 = $margin
$x2 = $x1 + $inputWidth + $gap
$x3 = $x2 + $processWidth + $gap
$y = $titleHeight

function Draw-BoxText($graphics, $rect, $text, $font, $brush, $format) {
  $graphics.DrawString($text, $font, $brush, $rect, $format)
}

foreach ($header in @(@("INPUT", $x1, $inputWidth), @("PROCESS", $x2, $processWidth), @("OUTPUT", $x3, $outputWidth))) {
  $rect = New-Object System.Drawing.RectangleF $header[1], $y, $header[2], $headerHeight
  $graphics.FillRectangle($gray, $rect)
  $graphics.DrawRectangle($pen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
  Draw-BoxText $graphics $rect $header[0] $headerFont $black $center
}

$y += $headerHeight + $gap

foreach ($row in $rows) {
  $rectInput = New-Object System.Drawing.RectangleF $x1, $y, $inputWidth, $rowHeight
  $rectProcess = New-Object System.Drawing.RectangleF $x2, $y, $processWidth, $rowHeight
  $rectOutput = New-Object System.Drawing.RectangleF $x3, $y, $outputWidth, $rowHeight

  foreach ($rect in @($rectInput, $rectProcess, $rectOutput)) {
    $graphics.FillRectangle($white, $rect)
    $graphics.DrawRectangle($pen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
  }

  $padInput = New-Object System.Drawing.RectangleF ($rectInput.X + 18), ($rectInput.Y + 10), ($rectInput.Width - 36), ($rectInput.Height - 20)
  $padProcess = New-Object System.Drawing.RectangleF ($rectProcess.X + 22), ($rectProcess.Y + 10), ($rectProcess.Width - 44), ($rectProcess.Height - 20)
  $padOutput = New-Object System.Drawing.RectangleF ($rectOutput.X + 22), ($rectOutput.Y + 10), ($rectOutput.Width - 44), ($rectOutput.Height - 20)

  Draw-BoxText $graphics $padInput $row[0] $inputFont $black $center
  Draw-BoxText $graphics $padProcess $row[1] $cellFont $black $center
  Draw-BoxText $graphics $padOutput $row[2] $cellFont $black $center

  $y += $rowHeight + $gap
}

$noteRect = New-Object System.Drawing.RectangleF 80, ($height - 70), ($width - 160), 44
$graphics.DrawString("Note: Vehicle Parts is not a separate inventory module in the current code; parts are recorded only as affected parts during pre-sale repair or job-order work.", $noteFont, $black, $noteRect, $center)

$output = Join-Path (Get-Location) "updated-ipo-cdo-car-trading.png"
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string] $text)
}

function Split-ForSvg($text, $maxLength) {
  $lines = New-Object System.Collections.Generic.List[string]
  $current = ""

  foreach ($word in ([string] $text).Split(" ")) {
    if ($current.Length -eq 0) {
      $current = $word
    } elseif (($current.Length + 1 + $word.Length) -le $maxLength) {
      $current = "$current $word"
    } else {
      $lines.Add($current)
      $current = $word
    }
  }

  if ($current.Length -gt 0) {
    $lines.Add($current)
  }

  return $lines
}

function Add-SvgBoxText($builder, $x, $y, $w, $h, $text, $className, $maxLength, $lineHeight) {
  $lines = Split-ForSvg $text $maxLength
  $centerX = $x + ($w / 2)
  $startY = $y + ($h / 2) - ((($lines.Count - 1) * $lineHeight) / 2) + 8
  [void] $builder.AppendLine("  <text x=`"$centerX`" y=`"$startY`" text-anchor=`"middle`" class=`"$className`">")

  for ($i = 0; $i -lt $lines.Count; $i++) {
    $dy = if ($i -eq 0) { 0 } else { $lineHeight }
    [void] $builder.AppendLine("    <tspan x=`"$centerX`" dy=`"$dy`">$(Escape-Svg $lines[$i])</tspan>")
  }

  [void] $builder.AppendLine("  </text>")
}

$svg = New-Object System.Text.StringBuilder
[void] $svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$width`" height=`"$height`" viewBox=`"0 0 $width $height`">")
[void] $svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"#ffffff`"/>")
[void] $svg.AppendLine("  <style>")
[void] $svg.AppendLine("    .title { font: 700 34px Arial, Helvetica, sans-serif; fill: #111111; }")
[void] $svg.AppendLine("    .head { font: 700 32px Arial, Helvetica, sans-serif; fill: #111111; }")
[void] $svg.AppendLine("    .input { font: 24px Arial, Helvetica, sans-serif; fill: #111111; }")
[void] $svg.AppendLine("    .cell { font: 23px Arial, Helvetica, sans-serif; fill: #111111; }")
[void] $svg.AppendLine("    .note { font: 22px Arial, Helvetica, sans-serif; fill: #111111; }")
[void] $svg.AppendLine("    .box { fill: #ffffff; stroke: #111111; stroke-width: 4; }")
[void] $svg.AppendLine("    .header-box { fill: #f3f4f6; stroke: #111111; stroke-width: 4; }")
[void] $svg.AppendLine("  </style>")
[void] $svg.AppendLine("  <text x=`"$($width / 2)`" y=`"52`" text-anchor=`"middle`" class=`"title`">CDO Car Trading Management System - Updated IPO</text>")

$svgY = $titleHeight
foreach ($header in @(@("INPUT", $x1, $inputWidth), @("PROCESS", $x2, $processWidth), @("OUTPUT", $x3, $outputWidth))) {
  [void] $svg.AppendLine("  <rect x=`"$($header[1])`" y=`"$svgY`" width=`"$($header[2])`" height=`"$headerHeight`" class=`"header-box`"/>")
  Add-SvgBoxText $svg $header[1] $svgY $header[2] $headerHeight $header[0] "head" 20 28
}

$svgY += $headerHeight + $gap

foreach ($row in $rows) {
  foreach ($rect in @(@($x1, $inputWidth), @($x2, $processWidth), @($x3, $outputWidth))) {
    [void] $svg.AppendLine("  <rect x=`"$($rect[0])`" y=`"$svgY`" width=`"$($rect[1])`" height=`"$rowHeight`" class=`"box`"/>")
  }

  Add-SvgBoxText $svg ($x1 + 18) ($svgY + 10) ($inputWidth - 36) ($rowHeight - 20) $row[0] "input" 26 28
  Add-SvgBoxText $svg ($x2 + 22) ($svgY + 10) ($processWidth - 44) ($rowHeight - 20) $row[1] "cell" 58 27
  Add-SvgBoxText $svg ($x3 + 22) ($svgY + 10) ($outputWidth - 44) ($rowHeight - 20) $row[2] "cell" 52 27
  $svgY += $rowHeight + $gap
}

Add-SvgBoxText $svg 80 ($height - 70) ($width - 160) 44 "Note: Vehicle Parts is not a separate inventory module in the current code; parts are recorded only as affected parts during pre-sale repair or job-order work." "note" 140 24
[void] $svg.AppendLine("</svg>")

$svgOutput = Join-Path (Get-Location) "updated-ipo-cdo-car-trading.svg"
[System.IO.File]::WriteAllText($svgOutput, $svg.ToString())

$graphics.Dispose()
$bitmap.Dispose()
$titleFont.Dispose()
$headerFont.Dispose()
$cellFont.Dispose()
$inputFont.Dispose()
$noteFont.Dispose()
$black.Dispose()
$gray.Dispose()
$white.Dispose()
$pen.Dispose()
