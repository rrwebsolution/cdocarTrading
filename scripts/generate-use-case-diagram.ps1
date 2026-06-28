Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path (Get-Location) "public\system-flows"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$width = 1800
$height = 1180
$boundary = [System.Drawing.RectangleF]::new(255, 70, 1290, 990)

$actors = @{
  Admin = @{ Label = "ADMIN /`nOWNER"; X = 95; Y = 245 }
  Secretary = @{ Label = "SECRETARY"; X = 95; Y = 735 }
  Mechanic = @{ Label = "MECHANICS &`nCAR WASHERS"; X = 1695; Y = 285 }
  Customer = @{ Label = "CUSTOMER"; X = 1695; Y = 760 }
}

$useCases = @{
  Login = @{ Label = "LOGIN"; X = 900; Y = 165; W = 155; H = 54 }
  Dashboard = @{ Label = "VIEW DASHBOARD`nAND ANALYTICS"; X = 470; Y = 225; W = 235; H = 62 }
  Users = @{ Label = "MANAGE USER`nACCOUNTS"; X = 455; Y = 315; W = 205; H = 62 }
  Roles = @{ Label = "MANAGE ROLES`nAND PERMISSIONS"; X = 470; Y = 420; W = 225; H = 62 }
  Staff = @{ Label = "MANAGE STAFF"; X = 490; Y = 525; W = 190; H = 58 }
  Reports = @{ Label = "GENERATE`nREPORTS"; X = 500; Y = 640; W = 180; H = 58 }
  Requirements = @{ Label = "MANAGE`nREQUIREMENTS"; X = 515; Y = 760; W = 205; H = 62 }

  Vehicles = @{ Label = "MANAGE VEHICLE`nINVENTORY"; X = 885; Y = 235; W = 225; H = 62 }
  Customers = @{ Label = "MANAGE CUSTOMER`nRECORDS"; X = 885; Y = 345; W = 225; H = 62 }
  Reservations = @{ Label = "PROCESS`nRESERVATIONS"; X = 885; Y = 455; W = 215; H = 62 }
  JobOrders = @{ Label = "MANAGE JOB`nORDERS"; X = 885; Y = 565; W = 205; H = 62 }
  SalesPayments = @{ Label = "PROCESS SALES`nAND PAYMENTS"; X = 885; Y = 675; W = 225; H = 62 }
  Financing = @{ Label = "HANDLE FINANCING`nDOCUMENTATION"; X = 885; Y = 785; W = 245; H = 62 }
  Documents = @{ Label = "MANAGE`nDOCUMENTS"; X = 885; Y = 895; W = 195; H = 62 }
  Release = @{ Label = "PROCESS VEHICLE`nRELEASE"; X = 1185; Y = 815; W = 225; H = 62 }

  BrowseVehicles = @{ Label = "BROWSE AVAILABLE`nVEHICLES"; X = 1240; Y = 250; W = 235; H = 62 }
  ViewDetails = @{ Label = "VIEW VEHICLE`nDETAILS"; X = 1280; Y = 360; W = 205; H = 58 }
  Register = @{ Label = "REGISTER`nACCOUNT"; X = 1220; Y = 465; W = 180; H = 58 }
  Profile = @{ Label = "MANAGE PROFILE"; X = 1210; Y = 565; W = 200; H = 58 }
  Reserve = @{ Label = "RESERVE`nVEHICLE"; X = 1215; Y = 665; W = 180; H = 58 }
  UploadDocs = @{ Label = "UPLOAD REQUIRED`nDOCUMENTS"; X = 1225; Y = 775; W = 225; H = 62 }
  Pay = @{ Label = "VIEW / UPLOAD`nPAYMENTS"; X = 1265; Y = 940; W = 225; H = 62 }
  History = @{ Label = "VIEW TRANSACTION`nHISTORY"; X = 1020; Y = 1005; W = 225; H = 62 }
  ServiceRequest = @{ Label = "SUBMIT SERVICE`nREQUEST"; X = 650; Y = 1005; W = 215; H = 62 }

  AssignedJobs = @{ Label = "VIEW ASSIGNED`nJOB ORDERS"; X = 1200; Y = 150; W = 225; H = 62 }
  UpdateProgress = @{ Label = "UPDATE JOB ORDER`nPROGRESS"; X = 1375; Y = 500; W = 245; H = 62 }
  Inspection = @{ Label = "RECORD INSPECTION`nFINDINGS"; X = 1385; Y = 610; W = 245; H = 62 }
  RepairCleaning = @{ Label = "UPDATE REPAIR /`nCLEANING STATUS"; X = 1375; Y = 720; W = 245; H = 62 }
  VehicleCondition = @{ Label = "UPDATE VEHICLE`nCONDITION"; X = 1125; Y = 625; W = 225; H = 62 }
  WorkComplete = @{ Label = "MARK WORK`nCOMPLETED"; X = 1115; Y = 735; W = 205; H = 62 }
}

$links = @(
  @{ Actor = "Admin"; Uses = @("Login", "Dashboard", "Users", "Roles", "Staff", "Vehicles", "Customers", "Reservations", "JobOrders", "SalesPayments", "Financing", "Requirements", "Reports") },
  @{ Actor = "Secretary"; Uses = @("Login", "Vehicles", "Customers", "Reservations", "JobOrders", "SalesPayments", "Financing", "Documents", "Release", "Reports") },
  @{ Actor = "Mechanic"; Uses = @("Login", "AssignedJobs", "UpdateProgress", "Inspection", "RepairCleaning", "VehicleCondition", "WorkComplete") },
  @{ Actor = "Customer"; Uses = @("Login", "Register", "BrowseVehicles", "ViewDetails", "Profile", "Reserve", "UploadDocs", "Pay", "History", "ServiceRequest") }
)

$includeLinks = @(
  @{ From = "Reserve"; To = "UploadDocs"; Label = "<<include>>" },
  @{ From = "SalesPayments"; To = "Financing"; Label = "<<include>>" },
  @{ From = "JobOrders"; To = "AssignedJobs"; Label = "<<include>>" },
  @{ From = "ServiceRequest"; To = "JobOrders"; Label = "<<include>>" },
  @{ From = "Release"; To = "Documents"; Label = "<<include>>" },
  @{ From = "Reports"; To = "Dashboard"; Label = "<<include>>" }
)

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::White)

$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(235, 235, 235)), 1
$boxPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(40, 40, 40)), 1.6
$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(55, 55, 55)), 1.15
$dashPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 90, 90)), 1.1
$dashPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
$dashPen.CustomEndCap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 4, 5
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 24, 24))
$systemBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(252, 252, 252))
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)

$actorFont = New-Object System.Drawing.Font "Arial", 9.5, ([System.Drawing.FontStyle]::Bold)
$caseFont = New-Object System.Drawing.Font "Arial", 8.5, ([System.Drawing.FontStyle]::Bold)
$titleFont = New-Object System.Drawing.Font "Arial", 13, ([System.Drawing.FontStyle]::Bold)
$labelFont = New-Object System.Drawing.Font "Arial", 8, ([System.Drawing.FontStyle]::Italic)
$captionFont = New-Object System.Drawing.Font "Times New Roman", 18, ([System.Drawing.FontStyle]::Bold)

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$center.Trimming = [System.Drawing.StringTrimming]::Word

function Draw-Actor($graphics, $actor) {
  $x = [float]$actor.X
  $y = [float]$actor.Y
  $graphics.DrawEllipse($boxPen, $x - 14, $y - 48, 28, 28)
  $graphics.DrawLine($boxPen, $x, $y - 20, $x, $y + 34)
  $graphics.DrawLine($boxPen, $x - 34, $y - 4, $x + 34, $y - 4)
  $graphics.DrawLine($boxPen, $x, $y + 34, $x - 30, $y + 76)
  $graphics.DrawLine($boxPen, $x, $y + 34, $x + 30, $y + 76)
  $rect = [System.Drawing.RectangleF]::new($x - 70, $y + 82, 140, 40)
  $graphics.DrawString($actor.Label, $actorFont, $textBrush, $rect, $center)
}

function Draw-UseCase($graphics, $case) {
  $rect = [System.Drawing.RectangleF]::new($case.X - ($case.W / 2), $case.Y - ($case.H / 2), $case.W, $case.H)
  $graphics.FillEllipse($whiteBrush, $rect)
  $graphics.DrawEllipse($boxPen, $rect)
  $graphics.DrawString($case.Label, $caseFont, $textBrush, $rect, $center)
}

function Get-ActorPoint($actorName) {
  $actor = $actors[$actorName]
  if ($actor.X -lt ($width / 2)) {
    return [System.Drawing.PointF]::new($actor.X + 34, $actor.Y - 4)
  }
  return [System.Drawing.PointF]::new($actor.X - 34, $actor.Y - 4)
}

function Get-CasePoint($caseName, $actorName) {
  $case = $useCases[$caseName]
  $dx = $actors[$actorName].X - $case.X
  if ($dx -lt 0) {
    return [System.Drawing.PointF]::new($case.X - ($case.W / 2), $case.Y)
  }
  return [System.Drawing.PointF]::new($case.X + ($case.W / 2), $case.Y)
}

function Draw-Association($graphics, $actorName, $caseName) {
  $start = Get-ActorPoint $actorName
  $end = Get-CasePoint $caseName $actorName
  $graphics.DrawLine($linePen, $start, $end)
}

function Draw-Include($graphics, $fromName, $toName, $label) {
  $from = $useCases[$fromName]
  $to = $useCases[$toName]
  $start = [System.Drawing.PointF]::new($from.X, $from.Y)
  $end = [System.Drawing.PointF]::new($to.X, $to.Y)
  $graphics.DrawLine($dashPen, $start, $end)
  $rect = [System.Drawing.RectangleF]::new((($from.X + $to.X) / 2) - 45, (($from.Y + $to.Y) / 2) - 10, 90, 20)
  $graphics.FillRectangle($whiteBrush, $rect)
  $graphics.DrawString($label, $labelFont, $textBrush, $rect, $center)
}

for ($x = 0; $x -lt $width; $x += 22) {
  $graphics.DrawLine($gridPen, $x, 0, $x, $height)
}
for ($y = 0; $y -lt $height; $y += 22) {
  $graphics.DrawLine($gridPen, 0, $y, $width, $y)
}

$graphics.FillRectangle($systemBrush, $boundary)
$graphics.DrawRectangle($boxPen, $boundary.X, $boundary.Y, $boundary.Width, $boundary.Height)
$titleRect = [System.Drawing.RectangleF]::new($boundary.X, $boundary.Y + 10, $boundary.Width, 26)
$graphics.DrawString("CDO Car Trading Inventory and Sales Management System", $titleFont, $textBrush, $titleRect, $center)

foreach ($linkSet in $links) {
  foreach ($caseName in $linkSet.Uses) {
    Draw-Association $graphics $linkSet.Actor $caseName
  }
}

foreach ($include in $includeLinks) {
  Draw-Include $graphics $include.From $include.To $include.Label
}

foreach ($caseName in $useCases.Keys) {
  Draw-UseCase $graphics $useCases[$caseName]
}

foreach ($actorName in $actors.Keys) {
  Draw-Actor $graphics $actors[$actorName]
}

$captionRect = [System.Drawing.RectangleF]::new(0, 1115, $width, 40)
$graphics.DrawString("Figure 4.9 Use Case Diagram", $captionFont, $textBrush, $captionRect, $center)

$pngPath = Join-Path $outputDir "use-case-diagram.png"
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string]$text)
}

function Add-SvgText($builder, $x, $y, $text, $className) {
  $lines = ([string]$text).Split("`n")
  $lineHeight = 12
  if ($className -eq "caption") { $lineHeight = 20 }
  if ($className -eq "title") { $lineHeight = 16 }
  $firstY = $y - (($lines.Count - 1) * $lineHeight / 2)
  [void]$builder.AppendLine("  <text x=`"$x`" y=`"$firstY`" text-anchor=`"middle`" dominant-baseline=`"middle`" class=`"$className`">")
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $dy = if ($i -eq 0) { 0 } else { $lineHeight }
    [void]$builder.AppendLine("    <tspan x=`"$x`" dy=`"$dy`">$(Escape-Svg $lines[$i])</tspan>")
  }
  [void]$builder.AppendLine("  </text>")
}

function Add-SvgActor($builder, $actor) {
  $x = [float]$actor.X
  $y = [float]$actor.Y
  [void]$builder.AppendLine("  <circle cx=`"$x`" cy=`"$($y - 34)`" r=`"14`" fill=`"#ffffff`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
  [void]$builder.AppendLine("  <line x1=`"$x`" y1=`"$($y - 20)`" x2=`"$x`" y2=`"$($y + 34)`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
  [void]$builder.AppendLine("  <line x1=`"$($x - 34)`" y1=`"$($y - 4)`" x2=`"$($x + 34)`" y2=`"$($y - 4)`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
  [void]$builder.AppendLine("  <line x1=`"$x`" y1=`"$($y + 34)`" x2=`"$($x - 30)`" y2=`"$($y + 76)`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
  [void]$builder.AppendLine("  <line x1=`"$x`" y1=`"$($y + 34)`" x2=`"$($x + 30)`" y2=`"$($y + 76)`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
  Add-SvgText $builder $x ($y + 102) $actor.Label "actor"
}

function Add-SvgAssociation($builder, $actorName, $caseName) {
  $start = Get-ActorPoint $actorName
  $end = Get-CasePoint $caseName $actorName
  [void]$builder.AppendLine("  <line x1=`"$($start.X)`" y1=`"$($start.Y)`" x2=`"$($end.X)`" y2=`"$($end.Y)`" stroke=`"#373737`" stroke-width=`"1.15`"/>")
}

$svg = New-Object System.Text.StringBuilder
[void]$svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$width`" height=`"$height`" viewBox=`"0 0 $width $height`">")
[void]$svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"#ffffff`"/>")
[void]$svg.AppendLine("  <defs><pattern id=`"grid`" width=`"22`" height=`"22`" patternUnits=`"userSpaceOnUse`"><path d=`"M 22 0 L 0 0 0 22`" fill=`"none`" stroke=`"#ebebeb`" stroke-width=`"1`"/></pattern><marker id=`"arrow`" viewBox=`"0 0 10 10`" refX=`"5`" refY=`"5`" markerWidth=`"7`" markerHeight=`"7`" orient=`"auto`"><path d=`"M 0 0 L 10 5 L 0 10 z`" fill=`"#5a5a5a`"/></marker></defs>")
[void]$svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"url(#grid)`"/>")
[void]$svg.AppendLine("  <style>.actor{font:700 9.5px Arial,sans-serif;fill:#181818}.case{font:700 8.5px Arial,sans-serif;fill:#181818}.title{font:700 13px Arial,sans-serif;fill:#181818}.include{font:italic 8px Arial,sans-serif;fill:#181818}.caption{font:700 18px 'Times New Roman',serif;fill:#000}</style>")
[void]$svg.AppendLine("  <rect x=`"$($boundary.X)`" y=`"$($boundary.Y)`" width=`"$($boundary.Width)`" height=`"$($boundary.Height)`" fill=`"#fcfcfc`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
Add-SvgText $svg ($boundary.X + $boundary.Width / 2) ($boundary.Y + 23) "CDO Car Trading Inventory and Sales Management System" "title"

foreach ($linkSet in $links) {
  foreach ($caseName in $linkSet.Uses) {
    Add-SvgAssociation $svg $linkSet.Actor $caseName
  }
}

foreach ($include in $includeLinks) {
  $from = $useCases[$include.From]
  $to = $useCases[$include.To]
  [void]$svg.AppendLine("  <line x1=`"$($from.X)`" y1=`"$($from.Y)`" x2=`"$($to.X)`" y2=`"$($to.Y)`" stroke=`"#5a5a5a`" stroke-width=`"1.1`" stroke-dasharray=`"6 5`" marker-end=`"url(#arrow)`"/>")
  $labelX = ($from.X + $to.X) / 2
  $labelY = ($from.Y + $to.Y) / 2
  [void]$svg.AppendLine("  <rect x=`"$($labelX - 45)`" y=`"$($labelY - 10)`" width=`"90`" height=`"20`" fill=`"#ffffff`"/>")
  Add-SvgText $svg $labelX $labelY $include.Label "include"
}

foreach ($caseName in $useCases.Keys) {
  $case = $useCases[$caseName]
  [void]$svg.AppendLine("  <ellipse cx=`"$($case.X)`" cy=`"$($case.Y)`" rx=`"$($case.W / 2)`" ry=`"$($case.H / 2)`" fill=`"#ffffff`" stroke=`"#282828`" stroke-width=`"1.6`"/>")
  Add-SvgText $svg $case.X $case.Y $case.Label "case"
}

foreach ($actorName in $actors.Keys) {
  Add-SvgActor $svg $actors[$actorName]
}

Add-SvgText $svg ($width / 2) 1136 "Figure 4.9 Use Case Diagram" "caption"
[void]$svg.AppendLine("</svg>")
[System.IO.File]::WriteAllText((Join-Path $outputDir "use-case-diagram.svg"), $svg.ToString())

$readmePath = Join-Path $outputDir "README.md"
if (Test-Path $readmePath) {
  $readme = [System.IO.File]::ReadAllText($readmePath)
  if ($readme -notmatch "use-case-diagram") {
    $readme += [Environment]::NewLine + "| Use Case Diagram | use-case-diagram.png | use-case-diagram.svg |"
    [System.IO.File]::WriteAllText($readmePath, $readme)
  }
}

$graphics.Dispose()
$bitmap.Dispose()
$gridPen.Dispose()
$boxPen.Dispose()
$linePen.Dispose()
$dashPen.Dispose()
$textBrush.Dispose()
$systemBrush.Dispose()
$whiteBrush.Dispose()
$actorFont.Dispose()
$caseFont.Dispose()
$titleFont.Dispose()
$labelFont.Dispose()
$captionFont.Dispose()
$center.Dispose()
