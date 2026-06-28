Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path (Get-Location) "public\system-flows"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$diagrams = @(
  @{
    Slug = "admin-owner"
    Figure = "Figure 4.5 Data Flow Diagram for Admin / Owner"
    Entity = "ADMIN /`nOWNER"
    Processes = @(
      @{ No = "1"; Name = "LOGIN`nAUTHENTICATION"; In = "LOGIN CREDENTIALS"; Out = "VERIFY USER DATA"; Store = "D1"; StoreName = "USER" },
      @{ No = "2"; Name = "MANAGE USER`nACCOUNT"; In = "USER MANAGE DATA"; Out = "USER RECORDS"; Store = "D1"; StoreName = "USER" },
      @{ No = "3"; Name = "MANAGE ROLE`nACCESS"; In = "ROLE AND PERMISSION DETAILS"; Out = "ROLE RECORDS"; Store = "D2"; StoreName = "ROLES" },
      @{ No = "4"; Name = "MANAGE STAFF"; In = "STAFF MANAGE DETAILS"; Out = "STAFF RECORDS"; Store = "D3"; StoreName = "STAFF" },
      @{ No = "5"; Name = "MANAGE`nVEHICLES"; In = "VEHICLE DATA ADD / UPDATE"; Out = "VEHICLE RECORDS"; Store = "D4"; StoreName = "VEHICLES" },
      @{ No = "6"; Name = "MANAGE`nCUSTOMERS"; In = "CUSTOMER DETAILS"; Out = "CUSTOMER RECORDS"; Store = "D5"; StoreName = "CUSTOMERS" },
      @{ No = "7"; Name = "MANAGE`nRESERVATIONS"; In = "RESERVATION DETAILS"; Out = "RESERVATION RECORDS"; Store = "D6"; StoreName = "RESERVATIONS" },
      @{ No = "8"; Name = "MANAGE JOB`nORDERS"; In = "JOB ORDER DETAILS"; Out = "JOB ORDER RECORDS"; Store = "D7"; StoreName = "JOB ORDERS" },
      @{ No = "9"; Name = "MANAGE SALES`nAND PAYMENTS"; In = "SALES / PAYMENT DETAILS"; Out = "PAYMENT TRANSACTIONS"; Store = "D8"; StoreName = "SALES /`nPAYMENTS" },
      @{ No = "10"; Name = "MANAGE`nFINANCING"; In = "FINANCING DETAILS"; Out = "FINANCING RECORDS"; Store = "D9"; StoreName = "FINANCING" },
      @{ No = "11"; Name = "MANAGE`nREQUIREMENTS"; In = "REQUIREMENT DETAILS"; Out = "REQUIREMENT RECORDS"; Store = "D10"; StoreName = "REQUIREMENTS" },
      @{ No = "12"; Name = "GENERATE`nREPORTS"; In = "GENERATE DETAILS"; Out = "GENERATE REPORTS"; Store = "D11"; StoreName = "REPORTS" }
    )
  },
  @{
    Slug = "secretary"
    Figure = "Figure 4.6 Data Flow Diagram for Secretary"
    Entity = "SECRETARY"
    Processes = @(
      @{ No = "1"; Name = "LOGIN`nAUTHENTICATION"; In = "LOGIN CREDENTIALS"; Out = "VERIFY USER DATA"; Store = "D1"; StoreName = "USER" },
      @{ No = "2"; Name = "MANAGE`nVEHICLES"; In = "VEHICLE INVENTORY UPDATES"; Out = "VEHICLE RECORDS"; Store = "D2"; StoreName = "VEHICLES" },
      @{ No = "3"; Name = "MANAGE`nCUSTOMERS"; In = "CUSTOMER DETAILS"; Out = "CUSTOMER RECORDS"; Store = "D3"; StoreName = "CUSTOMERS" },
      @{ No = "4"; Name = "MANAGE`nRESERVATIONS"; In = "RESERVATION DETAILS"; Out = "RESERVATION RECORDS"; Store = "D4"; StoreName = "RESERVATIONS" },
      @{ No = "5"; Name = "MANAGE JOB`nORDERS"; In = "JOB ORDER DETAILS"; Out = "JOB ORDER RECORDS"; Store = "D5"; StoreName = "JOB ORDERS" },
      @{ No = "6"; Name = "MANAGE SALES`nAND PAYMENTS"; In = "PAYMENT DETAILS"; Out = "PAYMENT TRANSACTIONS"; Store = "D6"; StoreName = "PAYMENTS" },
      @{ No = "7"; Name = "FINANCING`nDOCUMENTATION"; In = "FINANCING DETAILS"; Out = "FINANCING RECORDS"; Store = "D7"; StoreName = "FINANCING" },
      @{ No = "8"; Name = "MANAGE`nDOCUMENTS"; In = "DOCUMENT DETAILS"; Out = "DOCUMENT RECORDS"; Store = "D8"; StoreName = "DOCUMENTS" },
      @{ No = "9"; Name = "VEHICLE`nRELEASE"; In = "RELEASE DETAILS"; Out = "RELEASE RECORDS"; Store = "D9"; StoreName = "VEHICLE`nRELEASE" },
      @{ No = "10"; Name = "GENERATE`nREPORTS"; In = "GENERATE DETAILS"; Out = "GENERATE REPORTS"; Store = "D10"; StoreName = "REPORTS" }
    )
  },
  @{
    Slug = "mechanics-car-washers"
    Figure = "Figure 4.7 Data Flow Diagram for Mechanics and Car Washers"
    Entity = "MECHANICS &`nCAR WASHERS"
    Processes = @(
      @{ No = "1"; Name = "LOGIN`nAUTHENTICATION"; In = "LOGIN CREDENTIALS"; Out = "VERIFY USER DATA"; Store = "D1"; StoreName = "USER" },
      @{ No = "2"; Name = "MANAGE JOB`nORDERS"; In = "JOB ORDER UPDATE DETAILS"; Out = "JOB ORDER RECORDS"; Store = "D2"; StoreName = "JOB ORDERS" },
      @{ No = "3"; Name = "UPDATE VEHICLE`nSTATUS"; In = "VEHICLE CONDITION DETAILS"; Out = "VEHICLE STATUS RECORDS"; Store = "D3"; StoreName = "VEHICLE`nSTATUS" },
      @{ No = "4"; Name = "PRE-SALE`nREPAIR"; In = "INSPECTION / REPAIR DETAILS"; Out = "REPAIR AND COST RECORDS"; Store = "D4"; StoreName = "PRE-SALE`nREPAIRS" },
      @{ No = "5"; Name = "UPDATE CLEANING`nSTATUS"; In = "CAR WASH / DETAILING DETAILS"; Out = "CLEANING STATUS RECORDS"; Store = "D5"; StoreName = "SERVICE`nUPDATES" }
    )
  },
  @{
    Slug = "customer"
    Figure = "Figure 4.8 Data Flow Diagram for Customer"
    Entity = "CUSTOMER"
    Processes = @(
      @{ No = "1"; Name = "LOGIN / REGISTER`nACCOUNT"; In = "LOGIN / REGISTRATION DETAILS"; Out = "VERIFY USER DATA"; Store = "D1"; StoreName = "USER" },
      @{ No = "2"; Name = "VIEW`nVEHICLES"; In = "VEHICLE VIEW DETAILS"; Out = "VEHICLE INFO"; Store = "D2"; StoreName = "VEHICLES" },
      @{ No = "3"; Name = "MANAGE`nPROFILE"; In = "CUSTOMER PROFILE DETAILS"; Out = "CUSTOMER RECORDS"; Store = "D3"; StoreName = "CUSTOMERS" },
      @{ No = "4"; Name = "MAKE`nRESERVATION"; In = "RESERVE VEHICLE DETAILS"; Out = "RESERVATION RECORDS"; Store = "D4"; StoreName = "RESERVATIONS" },
      @{ No = "5"; Name = "SUBMIT SERVICE`nREQUEST"; In = "SERVICE REQUEST DETAILS"; Out = "SERVICE REQUEST RECORDS"; Store = "D5"; StoreName = "SERVICE`nREQUESTS" },
      @{ No = "6"; Name = "UPLOAD`nDOCUMENTS"; In = "DOCUMENT UPLOAD DETAILS"; Out = "DOCUMENT RECORDS"; Store = "D6"; StoreName = "DOCUMENTS" },
      @{ No = "7"; Name = "VIEW / UPLOAD`nPAYMENTS"; In = "PAYMENT PROOF DETAILS"; Out = "PAYMENT RECORDS"; Store = "D7"; StoreName = "PAYMENTS" },
      @{ No = "8"; Name = "VIEW`nHISTORY"; In = "TRANSACTION HISTORY REQUEST"; Out = "TRANSACTION HISTORY INFO"; Store = "D8"; StoreName = "HISTORY" }
    )
  }
)

$canvasWidth = 1320
$leftMargin = 48
$topMargin = 44
$laneHeight = 86
$processWidth = 188
$processHeight = 58
$entityWidth = 164
$storeWidth = 214
$storeHeight = 58
$entityX = 42
$processX = 500
$storeX = 980
$busX = 250
$captionGap = 48

$boxPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(45, 45, 45)), 1.5
$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(55, 55, 55)), 1.3
$plainPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(55, 55, 55)), 1.3
$linePen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 4, 5
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(32, 32, 32))
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$processBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(250, 250, 250))

$entityFont = New-Object System.Drawing.Font "Arial", 10, ([System.Drawing.FontStyle]::Bold)
$processFont = New-Object System.Drawing.Font "Arial", 8.3, ([System.Drawing.FontStyle]::Bold)
$storeFont = New-Object System.Drawing.Font "Arial", 8.5, ([System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font "Arial", 7.8, ([System.Drawing.FontStyle]::Regular)
$captionFont = New-Object System.Drawing.Font "Times New Roman", 18, ([System.Drawing.FontStyle]::Bold)

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$center.Trimming = [System.Drawing.StringTrimming]::Word

function Draw-LineWithArrow($graphics, $points) {
  for ($i = 0; $i -lt ($points.Count - 1); $i++) {
    if ($i -eq ($points.Count - 2)) {
      $graphics.DrawLine($linePen, $points[$i], $points[$i + 1])
    } else {
      $graphics.DrawLine($plainPen, $points[$i], $points[$i + 1])
    }
  }
}

function Draw-Label($graphics, $text, $x, $y, $width = 175) {
  $rect = [System.Drawing.RectangleF]::new($x - ($width / 2), $y - 10, $width, 20)
  $graphics.FillRectangle($whiteBrush, $rect)
  $graphics.DrawString($text, $labelFont, $textBrush, $rect, $center)
}

function Draw-Process($graphics, $rect, $number, $name) {
  $graphics.FillRectangle($processBrush, $rect)
  $graphics.DrawRectangle($boxPen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
  $graphics.DrawLine($boxPen, $rect.X, $rect.Y + 18, $rect.Right, $rect.Y + 18)
  $numberRect = [System.Drawing.RectangleF]::new($rect.X, $rect.Y + 1, $rect.Width, 16)
  $nameRect = [System.Drawing.RectangleF]::new($rect.X + 4, $rect.Y + 19, $rect.Width - 8, $rect.Height - 20)
  $graphics.DrawString($number, $processFont, $textBrush, $numberRect, $center)
  $graphics.DrawString($name, $processFont, $textBrush, $nameRect, $center)
}

function Draw-Store($graphics, $rect, $code, $name) {
  $graphics.FillRectangle($whiteBrush, $rect)
  $graphics.DrawRectangle($boxPen, $rect.X, $rect.Y, $rect.Width, $rect.Height)
  $graphics.DrawLine($boxPen, $rect.X + 45, $rect.Y, $rect.X + 45, $rect.Bottom)
  $codeRect = [System.Drawing.RectangleF]::new($rect.X, $rect.Y, 45, $rect.Height)
  $nameRect = [System.Drawing.RectangleF]::new($rect.X + 46, $rect.Y, $rect.Width - 46, $rect.Height)
  $graphics.DrawString($code, $storeFont, $textBrush, $codeRect, $center)
  $graphics.DrawString($name, $storeFont, $textBrush, $nameRect, $center)
}

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string]$text)
}

function Add-SvgText($builder, $x, $y, $text, $className) {
  $lines = ([string]$text).Split("`n")
  $lineHeight = 12
  if ($className -eq "caption") { $lineHeight = 20 }
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
  [void]$builder.AppendLine("  <path d=`"$d`" fill=`"none`" stroke=`"#373737`" stroke-width=`"1.3`" marker-end=`"url(#arrow)`"/>")
}

foreach ($diagram in $diagrams) {
  $count = $diagram.Processes.Count
  $height = $topMargin + ($count * $laneHeight) + $captionGap + 42
  $bitmap = New-Object System.Drawing.Bitmap $canvasWidth, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::White)

  $entityHeight = [math]::Max(110, ($count * 34))
  $entityRect = [System.Drawing.RectangleF]::new($entityX, $topMargin, $entityWidth, $entityHeight)
  $graphics.FillRectangle($whiteBrush, $entityRect)
  $graphics.DrawRectangle($boxPen, $entityRect.X, $entityRect.Y, $entityRect.Width, $entityRect.Height)
  $graphics.DrawString($diagram.Entity, $entityFont, $textBrush, $entityRect, $center)

  $paths = New-Object System.Collections.Generic.List[object]

  for ($i = 0; $i -lt $count; $i++) {
    $process = $diagram.Processes[$i]
    $cy = $topMargin + 24 + ($i * $laneHeight)
    $processRect = [System.Drawing.RectangleF]::new($processX, $cy, $processWidth, $processHeight)
    $storeRect = [System.Drawing.RectangleF]::new($storeX, $cy, $storeWidth, $storeHeight)
    Draw-Process $graphics $processRect $process.No $process.Name
    Draw-Store $graphics $storeRect $process.Store $process.StoreName

    $inY = $cy + 20
    $outY = $cy + 40
    $busStemX = $busX - ($i * 7)
    if ($busStemX -lt ($entityRect.Right + 14)) { $busStemX = $entityRect.Right + 14 }
    $entityStartY = $entityRect.Top + 16 + ($i * (($entityRect.Height - 32) / [math]::Max(1, ($count - 1))))

    $pointsIn = @(
      [System.Drawing.PointF]::new($entityRect.Right, $entityStartY),
      [System.Drawing.PointF]::new($busStemX, $entityStartY),
      [System.Drawing.PointF]::new($busStemX, $inY),
      [System.Drawing.PointF]::new($processRect.Left, $inY)
    )
    Draw-LineWithArrow $graphics $pointsIn
    Draw-Label $graphics $process.In (($busStemX + $processRect.Left) / 2) ($inY - 8) 220

    $pointsOut = @(
      [System.Drawing.PointF]::new($processRect.Left, $outY),
      [System.Drawing.PointF]::new($busStemX + 16, $outY),
      [System.Drawing.PointF]::new($busStemX + 16, $entityStartY + 8),
      [System.Drawing.PointF]::new($entityRect.Right, $entityStartY + 8)
    )
    Draw-LineWithArrow $graphics $pointsOut
    Draw-Label $graphics ($process.Out -replace "RECORDS", "REPORTS") (($busStemX + 16 + $processRect.Left) / 2) ($outY + 8) 215

    $storeInY = $cy + 20
    $storeOutY = $cy + 40
    $pointsStoreIn = @(
      [System.Drawing.PointF]::new($processRect.Right, $storeInY),
      [System.Drawing.PointF]::new($storeRect.Left, $storeInY)
    )
    Draw-LineWithArrow $graphics $pointsStoreIn
    Draw-Label $graphics $process.Out (($processRect.Right + $storeRect.Left) / 2) ($storeInY - 8) 220

    $pointsStoreOut = @(
      [System.Drawing.PointF]::new($storeRect.Left, $storeOutY),
      [System.Drawing.PointF]::new($processRect.Right, $storeOutY)
    )
    Draw-LineWithArrow $graphics $pointsStoreOut
    Draw-Label $graphics $process.Out (($processRect.Right + $storeRect.Left) / 2) ($storeOutY + 8) 220

    $paths.Add([pscustomobject]@{ In = $pointsIn; Out = $pointsOut; StoreIn = $pointsStoreIn; StoreOut = $pointsStoreOut; Process = $process; ProcessRect = $processRect; StoreRect = $storeRect; InY = $inY; OutY = $outY; BusX = $busStemX; EntityY = $entityStartY })
  }

  $captionRect = [System.Drawing.RectangleF]::new(0, ($height - 46), $canvasWidth, 34)
  $graphics.DrawString($diagram.Figure, $captionFont, $textBrush, $captionRect, $center)

  $pngPath = Join-Path $outputDir "dfd-$($diagram.Slug).png"
  $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $svg = New-Object System.Text.StringBuilder
  [void]$svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$canvasWidth`" height=`"$height`" viewBox=`"0 0 $canvasWidth $height`">")
  [void]$svg.AppendLine("  <rect width=`"$canvasWidth`" height=`"$height`" fill=`"#ffffff`"/>")
  [void]$svg.AppendLine("  <defs><marker id=`"arrow`" viewBox=`"0 0 10 10`" refX=`"5`" refY=`"5`" markerWidth=`"7`" markerHeight=`"7`" orient=`"auto`"><path d=`"M 0 0 L 10 5 L 0 10 z`" fill=`"#373737`"/></marker></defs>")
  [void]$svg.AppendLine("  <style>.entity{font:700 10px Arial,sans-serif;fill:#202020}.process{font:700 8.3px Arial,sans-serif;fill:#202020}.store{font:700 8.5px Arial,sans-serif;fill:#202020}.label{font:400 7.8px Arial,sans-serif;fill:#202020}.caption{font:700 18px 'Times New Roman',serif;fill:#000}</style>")
  [void]$svg.AppendLine("  <rect x=`"$($entityRect.X)`" y=`"$($entityRect.Y)`" width=`"$($entityRect.Width)`" height=`"$($entityRect.Height)`" fill=`"#ffffff`" stroke=`"#2d2d2d`" stroke-width=`"1.5`"/>")
  Add-SvgText $svg ($entityRect.X + $entityRect.Width / 2) ($entityRect.Y + $entityRect.Height / 2) $diagram.Entity "entity"

  foreach ($path in $paths) {
    $process = $path.Process
    $processRect = $path.ProcessRect
    $storeRect = $path.StoreRect
    [void]$svg.AppendLine("  <rect x=`"$($processRect.X)`" y=`"$($processRect.Y)`" width=`"$($processRect.Width)`" height=`"$($processRect.Height)`" fill=`"#fafafa`" stroke=`"#2d2d2d`" stroke-width=`"1.5`"/>")
    [void]$svg.AppendLine("  <line x1=`"$($processRect.X)`" y1=`"$($processRect.Y + 18)`" x2=`"$($processRect.Right)`" y2=`"$($processRect.Y + 18)`" stroke=`"#2d2d2d`" stroke-width=`"1.5`"/>")
    Add-SvgText $svg ($processRect.X + $processRect.Width / 2) ($processRect.Y + 9) $process.No "process"
    Add-SvgText $svg ($processRect.X + $processRect.Width / 2) ($processRect.Y + 38) $process.Name "process"

    [void]$svg.AppendLine("  <rect x=`"$($storeRect.X)`" y=`"$($storeRect.Y)`" width=`"$($storeRect.Width)`" height=`"$($storeRect.Height)`" fill=`"#ffffff`" stroke=`"#2d2d2d`" stroke-width=`"1.5`"/>")
    [void]$svg.AppendLine("  <line x1=`"$($storeRect.X + 45)`" y1=`"$($storeRect.Y)`" x2=`"$($storeRect.X + 45)`" y2=`"$($storeRect.Bottom)`" stroke=`"#2d2d2d`" stroke-width=`"1.5`"/>")
    Add-SvgText $svg ($storeRect.X + 22.5) ($storeRect.Y + $storeRect.Height / 2) $process.Store "store"
    Add-SvgText $svg ($storeRect.X + 130) ($storeRect.Y + $storeRect.Height / 2) $process.StoreName "store"
  }

  foreach ($path in $paths) {
    $process = $path.Process
    Add-SvgPath $svg $path.In
    Add-SvgText $svg (($path.BusX + $processX) / 2) ($path.InY - 8) $process.In "label"
    Add-SvgPath $svg $path.Out
    Add-SvgText $svg (($path.BusX + 16 + $processX) / 2) ($path.OutY + 8) ($process.Out -replace "RECORDS", "REPORTS") "label"
    Add-SvgPath $svg $path.StoreIn
    Add-SvgText $svg (($processX + $processWidth + $storeX) / 2) ($path.InY - 8) $process.Out "label"
    Add-SvgPath $svg $path.StoreOut
    Add-SvgText $svg (($processX + $processWidth + $storeX) / 2) ($path.OutY + 8) $process.Out "label"
  }

  Add-SvgText $svg ($canvasWidth / 2) ($height - 29) $diagram.Figure "caption"
  [void]$svg.AppendLine("</svg>")
  [System.IO.File]::WriteAllText((Join-Path $outputDir "dfd-$($diagram.Slug).svg"), $svg.ToString())

  $graphics.Dispose()
  $bitmap.Dispose()
}

$readmePath = Join-Path $outputDir "README.md"
if (Test-Path $readmePath) {
  $readme = [System.IO.File]::ReadAllText($readmePath)
  foreach ($diagram in $diagrams) {
    $row = "| DFD - $($diagram.Figure -replace '^Figure [0-9.]+ Data Flow Diagram for ', '') | dfd-$($diagram.Slug).png | dfd-$($diagram.Slug).svg |"
    if ($readme -notmatch [regex]::Escape("dfd-$($diagram.Slug).png")) {
      $readme += [Environment]::NewLine + $row
    }
  }
  [System.IO.File]::WriteAllText($readmePath, $readme)
}

$boxPen.Dispose()
$linePen.Dispose()
$plainPen.Dispose()
$textBrush.Dispose()
$whiteBrush.Dispose()
$processBrush.Dispose()
$entityFont.Dispose()
$processFont.Dispose()
$storeFont.Dispose()
$labelFont.Dispose()
$captionFont.Dispose()
$center.Dispose()
