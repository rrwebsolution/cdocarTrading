Add-Type -AssemblyName System.Drawing

$bullet = [char]0x2022

$rows = @(
  @{
    InputTitle = "User Account Details"
    InputBullets = @("Email Address", "Password", "Assign Role Access", "Update Status")
    ProcessTitle = "Manage User Account"
    OutputText = "User Account, Login Access,`nActive/Inactive User List"
  },
  @{
    InputTitle = "Secretary Details"
    InputText = "Vehicle Updates`nRegister Customer like Email,`nCustomer Name, Contact, Status"
    ProcessTitle = "Manage Secretary"
    ProcessBullets = @("Add Customer", "Process Reservation", "Create Job Order")
    OutputText = "Secretary records, update`ncustomer/vehicle records, reservation,`npayments, documents and release"
  },
  @{
    InputTitle = "Mechanic/Car-Washer"
    InputText = "Job Order, Request, Vehicle, assigned,`nRepair/Washing Status, Status`nActive/Inactive"
    ProcessTitle = "Manage Mechanic/Car-`nWasher"
    ProcessBullets = @("Update Job Order", "Update Vehicle Status")
    OutputText = "Washing/Repair Status, Order Updates`ncompleted cleaning records and`ninspection findings, vehicle condition`nupdates"
  },
  @{
    InputTitle = "Customer Details"
    InputText = "Register Customer`nUpdate Customer"
    ProcessTitle = "Customer"
    ProcessBullets = @("Browse Vehicle", "View History", "Reserve Vehicle")
    OutputText = "Customer Records , Customer Profile,`nActive Customer List"
  },
  @{
    InputTitle = "Vehicle Details"
    InputText = "Add and Update Inventory, brand,`nmodel, year, color,`nengine/chassis/plate number, mileage,`npricing, photos, location, and status"
    ProcessTitle = "Manage Vehicle"
    ProcessBullets = @("Add Vehicle", "Update Vehicle")
    OutputText = "Inventory Records, Vehicle List,`navailable/reserved/sold/sold for repair`nstatus"
  },
  @{
    InputTitle = "Reservation Details"
    InputText = "Create, View, Approve, Update,`nmonitor or cancel vehicle reservation"
    ProcessTitle = "Manage Reservation"
    OutputText = "Reservation history, approval status,`nexpiring reservation records"
  },
  @{
    Highlight = $true
    InputTitle = "Job Order Details"
    InputColumns = @(
      @("Job Order No.", "Customer/Vehicle", "Service Type", "Issue", "Priority"),
      @("Schedule", "Assigned Staff", "Labor/Cost", "Progress/Status")
    )
    ProcessText = "Create / Review / Assign`nUpdate Progress`nRecord Findings and Cost`nComplete or Cancel"
    OutputText = "Job Order Information`nStatus Report"
  },
  @{
    InputTitle = "Job Order Details"
    InputText = "Create, View, Approve, Update,`nmonitor or cancel vehicle reservation"
    ProcessTitle = "Create Job Order"
    OutputText = "Job Order Information`nStatus Report"
  },
  @{
    Highlight = $true
    InputTitle = "Vehicle Parts / Pre-Sale Repair Details"
    InputColumns = @(
      @("Affected Part", "Issue", "Repair Action", "Cost"),
      @("Photos", "Assigned Staff", "Readiness Status")
    )
    ProcessText = "Manage Parts During`nInspection / Pre-Sale Repair`nUpdate Affected Parts`nRecord Repair Actions / Costs`nVerify Condition`nMark Ready for Sale"
    OutputText = "Affected-Parts record, presale`ninspections record, repair, ready to`sale status"
  },
  @{
    InputTitle = "Payments Details"
    InputText = "receipt of payment`nreceipt number, paid date, status,`nupdate sales totals"
    ProcessTitle = "Manage Payments"
    OutputText = "Payments records, receipt, proof`nhistory, outstanding balance report"
  },
  @{
    InputTitle = "Financing"
    InputText = "Application Number, approved amount,`ndown payment, approval date,`nremarks and status"
    ProcessTitle = "Manage Financing"
    OutputText = "Financing records, financial basis`ntracking, financing approval/status`nreport."
  }
)

$width = 1024
$margin = 8
$columnGap = 40
$rowGap = 18
$headerHeight = 50
$normalHeight = 132
$highlightHeight = 146
$colWidth = [math]::Floor(($width - ($margin * 2) - ($columnGap * 2)) / 3)
$height = $margin + $headerHeight + $rowGap

foreach ($row in $rows) {
  $height += $(if ($row.Highlight) { $highlightHeight } else { $normalHeight }) + $rowGap
}

$height += 2

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::White)

$blackBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 15, 15))
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$blackPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(15, 15, 15)), 1.4
$bluePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(61, 122, 169)), 1.4

$headerFont = New-Object System.Drawing.Font "Arial", 20, ([System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font "Arial", 12, ([System.Drawing.FontStyle]::Bold)
$bodyFont = New-Object System.Drawing.Font "Arial", 11.5, ([System.Drawing.FontStyle]::Regular)
$smallFont = New-Object System.Drawing.Font "Arial", 10.5, ([System.Drawing.FontStyle]::Regular)

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$center.Trimming = [System.Drawing.StringTrimming]::Word

$topCenter = New-Object System.Drawing.StringFormat
$topCenter.Alignment = [System.Drawing.StringAlignment]::Center
$topCenter.LineAlignment = [System.Drawing.StringAlignment]::Near
$topCenter.Trimming = [System.Drawing.StringTrimming]::Word

function Draw-Box($graphics, $rect, $pen, $brush) {
  $graphics.FillRectangle($brush, $rect)
  $graphics.DrawRectangle($pen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
}

function Draw-CenteredText($graphics, $rect, $text, $font, $brush, $format) {
  $graphics.DrawString([string]$text, $font, $brush, $rect, $format)
}

function Draw-TitledCell($graphics, $rect, $title, $text, $bullets, $fontTitle, $fontBody, $brush, $format, $bulletChar) {
  $titleRect = New-Object System.Drawing.RectangleF ($rect.X + 10), ($rect.Y + 9), ($rect.Width - 20), 34
  $graphics.DrawString([string]$title, $fontTitle, $brush, $titleRect, $format)

  $bodyRect = New-Object System.Drawing.RectangleF ($rect.X + 16), ($rect.Y + 45), ($rect.Width - 32), ($rect.Height - 54)

  if ($bullets -and $bullets.Count -gt 0) {
    $lines = ($bullets | ForEach-Object { "$bulletChar  $_" }) -join "`n"
    $left = New-Object System.Drawing.StringFormat
    $left.Alignment = [System.Drawing.StringAlignment]::Near
    $left.LineAlignment = [System.Drawing.StringAlignment]::Near
    $graphics.DrawString($lines, $fontBody, $brush, $bodyRect, $left)
    $left.Dispose()
    return
  }

  $graphics.DrawString([string]$text, $fontBody, $brush, $bodyRect, $format)
}

function Draw-TwoColumnBullets($graphics, $rect, $title, $columns, $fontTitle, $fontBody, $brush, $format, $bulletChar) {
  $titleRect = New-Object System.Drawing.RectangleF ($rect.X + 8), ($rect.Y + 9), ($rect.Width - 16), 38
  $graphics.DrawString([string]$title, $fontTitle, $brush, $titleRect, $format)

  $left = New-Object System.Drawing.StringFormat
  $left.Alignment = [System.Drawing.StringAlignment]::Near
  $left.LineAlignment = [System.Drawing.StringAlignment]::Near

  $columnWidth = ($rect.Width - 24) / 2
  for ($i = 0; $i -lt $columns.Count; $i++) {
    $x = $rect.X + 14 + ($i * $columnWidth)
    $bodyRect = New-Object System.Drawing.RectangleF $x, ($rect.Y + 50), ($columnWidth - 6), ($rect.Height - 58)
    $lines = ($columns[$i] | ForEach-Object { "$bulletChar  $_" }) -join "`n"
    $graphics.DrawString($lines, $fontBody, $brush, $bodyRect, $left)
  }

  $left.Dispose()
}

$xInput = $margin
$xProcess = $xInput + $colWidth + $columnGap
$xOutput = $xProcess + $colWidth + $columnGap
$y = $margin

foreach ($header in @(@("INPUT", $xInput), @("PROCESS", $xProcess), @("OUTPUT", $xOutput))) {
  $rect = New-Object System.Drawing.RectangleF $header[1], $y, $colWidth, $headerHeight
  Draw-Box $graphics $rect $blackPen $whiteBrush
  Draw-CenteredText $graphics $rect $header[0] $headerFont $blackBrush $center
}

$y += $headerHeight + $rowGap

foreach ($row in $rows) {
  $rowHeight = if ($row.Highlight) { $highlightHeight } else { $normalHeight }
  $pen = if ($row.Highlight) { $bluePen } else { $blackPen }

  $inputRect = New-Object System.Drawing.RectangleF $xInput, $y, $colWidth, $rowHeight
  $processRect = New-Object System.Drawing.RectangleF $xProcess, $y, $colWidth, $rowHeight
  $outputRect = New-Object System.Drawing.RectangleF $xOutput, $y, $colWidth, $rowHeight

  foreach ($rect in @($inputRect, $processRect, $outputRect)) {
    Draw-Box $graphics $rect $pen $whiteBrush
  }

  if ($row.InputColumns) {
    Draw-TwoColumnBullets $graphics $inputRect $row.InputTitle $row.InputColumns $titleFont $smallFont $blackBrush $topCenter $bullet
  } else {
    Draw-TitledCell $graphics $inputRect $row.InputTitle $row.InputText $row.InputBullets $titleFont $bodyFont $blackBrush $topCenter $bullet
  }

  if ($row.ProcessBullets) {
    Draw-TitledCell $graphics $processRect $row.ProcessTitle "" $row.ProcessBullets $titleFont $bodyFont $blackBrush $topCenter $bullet
  } elseif ($row.ProcessTitle) {
    Draw-CenteredText $graphics $processRect $row.ProcessTitle $bodyFont $blackBrush $center
  } else {
    Draw-CenteredText $graphics $processRect $row.ProcessText $bodyFont $blackBrush $center
  }

  Draw-CenteredText $graphics $outputRect $row.OutputText $bodyFont $blackBrush $center
  $y += $rowHeight + $rowGap
}

$output = Join-Path (Get-Location) "updated-ipo-cdo-car-trading.png"
$bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string] $text)
}

$svg = New-Object System.Text.StringBuilder
[void] $svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$width`" height=`"$height`" viewBox=`"0 0 $width $height`">")
[void] $svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"#ffffff`"/>")
[void] $svg.AppendLine("  <style>")
[void] $svg.AppendLine("    .header { font: 700 20px Arial, Helvetica, sans-serif; fill: #0f0f0f; }")
[void] $svg.AppendLine("    .title { font: 700 12px Arial, Helvetica, sans-serif; fill: #0f0f0f; }")
[void] $svg.AppendLine("    .body { font: 11.5px Arial, Helvetica, sans-serif; fill: #0f0f0f; }")
[void] $svg.AppendLine("    .small { font: 10.5px Arial, Helvetica, sans-serif; fill: #0f0f0f; }")
[void] $svg.AppendLine("  </style>")

function Add-SvgRect($builder, $x, $y, $w, $h, $stroke) {
  [void] $builder.AppendLine("  <rect x=`"$x`" y=`"$y`" width=`"$w`" height=`"$h`" fill=`"#ffffff`" stroke=`"$stroke`" stroke-width=`"1.4`"/>")
}

function Add-SvgTextLines($builder, $x, $y, $lines, $className, $anchor, $lineHeight) {
  [void] $builder.AppendLine("  <text x=`"$x`" y=`"$y`" text-anchor=`"$anchor`" class=`"$className`">")
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $dy = if ($i -eq 0) { 0 } else { $lineHeight }
    [void] $builder.AppendLine("    <tspan x=`"$x`" dy=`"$dy`">$(Escape-Svg $lines[$i])</tspan>")
  }
  [void] $builder.AppendLine("  </text>")
}

function Split-SvgLines($text) {
  return @(([string]$text).Split("`n"))
}

$svgY = $margin
foreach ($header in @(@("INPUT", $xInput), @("PROCESS", $xProcess), @("OUTPUT", $xOutput))) {
  Add-SvgRect $svg $header[1] $svgY $colWidth $headerHeight "#0f0f0f"
  Add-SvgTextLines $svg ($header[1] + ($colWidth / 2)) ($svgY + 32) @($header[0]) "header" "middle" 18
}

$svgY += $headerHeight + $rowGap

foreach ($row in $rows) {
  $rowHeight = if ($row.Highlight) { $highlightHeight } else { $normalHeight }
  $stroke = if ($row.Highlight) { "#3d7aa9" } else { "#0f0f0f" }

  foreach ($x in @($xInput, $xProcess, $xOutput)) {
    Add-SvgRect $svg $x $svgY $colWidth $rowHeight $stroke
  }

  Add-SvgTextLines $svg ($xInput + ($colWidth / 2)) ($svgY + 22) @($row.InputTitle) "title" "middle" 14
  if ($row.InputColumns) {
    for ($i = 0; $i -lt $row.InputColumns.Count; $i++) {
      $x = $xInput + 18 + ($i * (($colWidth - 24) / 2))
      $lines = $row.InputColumns[$i] | ForEach-Object { "$bullet  $_" }
      Add-SvgTextLines $svg $x ($svgY + 48) $lines "small" "start" 16
    }
  } elseif ($row.InputBullets) {
    $lines = $row.InputBullets | ForEach-Object { "$bullet  $_" }
    Add-SvgTextLines $svg ($xInput + 34) ($svgY + 52) $lines "body" "start" 18
  } else {
    Add-SvgTextLines $svg ($xInput + ($colWidth / 2)) ($svgY + 58) (Split-SvgLines $row.InputText) "body" "middle" 16
  }

  if ($row.ProcessBullets) {
    Add-SvgTextLines $svg ($xProcess + ($colWidth / 2)) ($svgY + 22) @($row.ProcessTitle) "title" "middle" 14
    $lines = $row.ProcessBullets | ForEach-Object { "$bullet  $_" }
    Add-SvgTextLines $svg ($xProcess + 70) ($svgY + 58) $lines "body" "start" 18
  } elseif ($row.ProcessTitle) {
    Add-SvgTextLines $svg ($xProcess + ($colWidth / 2)) ($svgY + ($rowHeight / 2)) (Split-SvgLines $row.ProcessTitle) "body" "middle" 18
  } else {
    Add-SvgTextLines $svg ($xProcess + ($colWidth / 2)) ($svgY + 42) (Split-SvgLines $row.ProcessText) "body" "middle" 18
  }

  Add-SvgTextLines $svg ($xOutput + ($colWidth / 2)) ($svgY + 54) (Split-SvgLines $row.OutputText) "body" "middle" 18
  $svgY += $rowHeight + $rowGap
}

[void] $svg.AppendLine("</svg>")
$svgOutput = Join-Path (Get-Location) "updated-ipo-cdo-car-trading.svg"
[System.IO.File]::WriteAllText($svgOutput, $svg.ToString())

$graphics.Dispose()
$bitmap.Dispose()
$headerFont.Dispose()
$titleFont.Dispose()
$bodyFont.Dispose()
$smallFont.Dispose()
$blackBrush.Dispose()
$whiteBrush.Dispose()
$blackPen.Dispose()
$bluePen.Dispose()
$center.Dispose()
$topCenter.Dispose()
