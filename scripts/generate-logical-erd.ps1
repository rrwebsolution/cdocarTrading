Add-Type -AssemblyName System.Drawing

$outputDir = Join-Path (Get-Location) "public\system-flows"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$width = 2350
$height = 1650
$tableWidth = 285
$headerHeight = 24
$rowHeight = 18
$fontFamily = "Arial"

$tables = @(
  @{
    Name = "cdo_car_trading_roles"; X = 520; Y = 1185
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "name", ""),
      @("text", "description", ""),
      @("varchar(255)", "status", ""),
      @("longtext", "permissions", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_users"; X = 805; Y = 1105
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("bigint(20) unsigned", "role_id", "FK"),
      @("varchar(255)", "name", ""),
      @("varchar(255)", "email", ""),
      @("varchar(255)", "username", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "email_verified_at", ""),
      @("varchar(255)", "password", ""),
      @("varchar(100)", "remember_token", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_staff"; X = 200; Y = 1110
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("bigint(20) unsigned", "user_id", "FK"),
      @("varchar(255)", "name", ""),
      @("varchar(255)", "email", ""),
      @("varchar(255)", "contact", ""),
      @("varchar(255)", "position", ""),
      @("varchar(255)", "schedule", ""),
      @("varchar(255)", "activity", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_customers"; X = 730; Y = 410
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("bigint(20) unsigned", "user_id", "FK"),
      @("varchar(255)", "name", ""),
      @("varchar(255)", "email", ""),
      @("varchar(255)", "contact", ""),
      @("text", "address", ""),
      @("varchar(255)", "valid_id_type", ""),
      @("varchar(255)", "valid_id_number", ""),
      @("varchar(255)", "valid_id_url", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_vehicles"; X = 1580; Y = 460
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "name", ""),
      @("varchar(255)", "stock_no", ""),
      @("varchar(255)", "brand", ""),
      @("varchar(255)", "model", ""),
      @("smallint unsigned", "year", ""),
      @("varchar(255)", "variant", ""),
      @("varchar(255)", "color", ""),
      @("varchar(255)", "transmission", ""),
      @("varchar(255)", "fuel_type", ""),
      @("varchar(255)", "engine_number", ""),
      @("varchar(255)", "chassis_number", ""),
      @("varchar(255)", "plate_number", ""),
      @("int unsigned", "mileage", ""),
      @("decimal(12,2)", "purchase_price", ""),
      @("decimal(12,2)", "selling_price", ""),
      @("decimal(12,2)", "reservation_fee", ""),
      @("varchar(255)", "location", ""),
      @("varchar(255)", "condition", ""),
      @("varchar(255)", "or_cr_number", ""),
      @("date", "registration_expiry", ""),
      @("varchar(255)", "insurance", ""),
      @("varchar(255)", "photo_url", ""),
      @("longtext", "interior_photo_urls", ""),
      @("longtext", "exterior_photo_urls", ""),
      @("text", "description", ""),
      @("text", "features", ""),
      @("text", "remarks", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_reservations"; X = 1190; Y = 125
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("decimal(12,2)", "amount", ""),
      @("date", "reserved_at", ""),
      @("date", "expires_at", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_sales_transactions"; X = 1585; Y = 70
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("bigint(20) unsigned", "reservation_id", "FK"),
      @("varchar(255)", "payment_method", ""),
      @("decimal(12,2)", "total_amount", ""),
      @("decimal(12,2)", "paid_amount", ""),
      @("decimal(12,2)", "balance", ""),
      @("longtext", "financing_details", ""),
      @("varchar(255)", "status", ""),
      @("date", "sold_at", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_payments"; X = 455; Y = 25
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "receipt_number", ""),
      @("bigint(20) unsigned", "sales_transaction_id", "FK"),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("decimal(12,2)", "amount", ""),
      @("varchar(255)", "method", ""),
      @("varchar(255)", "proof_url", ""),
      @("varchar(255)", "status", ""),
      @("date", "paid_at", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_deed_of_sales"; X = 845; Y = 45
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "sales_transaction_id", "FK"),
      @("date", "generated_at", ""),
      @("longtext", "document_data", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_financing_records"; X = 455; Y = 430
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("bigint(20) unsigned", "sales_transaction_id", "FK"),
      @("varchar(255)", "financing_company", ""),
      @("varchar(255)", "application_number", ""),
      @("decimal(12,2)", "approved_amount", ""),
      @("decimal(12,2)", "down_payment", ""),
      @("date", "approved_at", ""),
      @("longtext", "documents", ""),
      @("text", "remarks", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_service_requests"; X = 1135; Y = 500
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("varchar(255)", "service_type", ""),
      @("text", "issue", ""),
      @("varchar(255)", "photo_url", ""),
      @("varchar(255)", "progress", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_job_orders"; X = 30; Y = 80
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "service_request_id", "FK"),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("bigint(20) unsigned", "assigned_staff_id", "FK"),
      @("varchar(255)", "activity", ""),
      @("varchar(255)", "repair_status", ""),
      @("varchar(255)", "washing_status", ""),
      @("text", "maintenance_record", ""),
      @("date", "scheduled_at", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_pre_sale_repairs"; X = 20; Y = 610
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("bigint(20) unsigned", "assigned_staff_id", "FK"),
      @("text", "issue", ""),
      @("varchar(255)", "affected_part", ""),
      @("text", "action_taken", ""),
      @("decimal(12,2)", "cost", ""),
      @("date", "inspected_at", ""),
      @("date", "completed_at", ""),
      @("varchar(255)", "before_photo_url", ""),
      @("varchar(255)", "after_photo_url", ""),
      @("text", "remarks", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_vehicle_releases"; X = 1160; Y = 1030
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("bigint(20) unsigned", "vehicle_id", "FK"),
      @("bigint(20) unsigned", "sales_transaction_id", "FK"),
      @("varchar(255)", "checklist_status", ""),
      @("varchar(255)", "document_status", ""),
      @("longtext", "checklist", ""),
      @("date", "released_at", ""),
      @("varchar(255)", "released_by", ""),
      @("text", "remarks", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  },
  @{
    Name = "cdo_car_trading_system_documents"; X = 1970; Y = 430
    Fields = @(
      @("bigint(20) unsigned", "id", "PK"),
      @("varchar(255)", "reference", ""),
      @("varchar(255)", "documentable_type", ""),
      @("bigint(20) unsigned", "documentable_id", ""),
      @("bigint(20) unsigned", "customer_id", "FK"),
      @("varchar(255)", "title", ""),
      @("varchar(255)", "type", ""),
      @("varchar(255)", "owner_name", ""),
      @("varchar(255)", "file_url", ""),
      @("date", "uploaded_at", ""),
      @("varchar(255)", "verified_by", ""),
      @("date", "verified_at", ""),
      @("text", "remarks", ""),
      @("varchar(255)", "status", ""),
      @("timestamp", "created_at", ""),
      @("timestamp", "updated_at", "")
    )
  }
)

$relationships = @(
  @("cdo_car_trading_roles", "cdo_car_trading_users", "role_id", "1", "M"),
  @("cdo_car_trading_users", "cdo_car_trading_staff", "user_id", "1", "0..1"),
  @("cdo_car_trading_users", "cdo_car_trading_customers", "user_id", "1", "0..1"),
  @("cdo_car_trading_customers", "cdo_car_trading_payments", "customer_id", "1", "M"),
  @("cdo_car_trading_sales_transactions", "cdo_car_trading_payments", "sales_transaction_id", "1", "M"),
  @("cdo_car_trading_sales_transactions", "cdo_car_trading_deed_of_sales", "sales_transaction_id", "1", "1"),
  @("cdo_car_trading_customers", "cdo_car_trading_financing_records", "customer_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_financing_records", "vehicle_id", "1", "M"),
  @("cdo_car_trading_sales_transactions", "cdo_car_trading_financing_records", "sales_transaction_id", "1", "0..1"),
  @("cdo_car_trading_customers", "cdo_car_trading_reservations", "customer_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_reservations", "vehicle_id", "1", "M"),
  @("cdo_car_trading_customers", "cdo_car_trading_service_requests", "customer_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_service_requests", "vehicle_id", "1", "M"),
  @("cdo_car_trading_service_requests", "cdo_car_trading_job_orders", "service_request_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_job_orders", "vehicle_id", "1", "M"),
  @("cdo_car_trading_staff", "cdo_car_trading_job_orders", "assigned_staff_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_pre_sale_repairs", "vehicle_id", "1", "M"),
  @("cdo_car_trading_staff", "cdo_car_trading_pre_sale_repairs", "assigned_staff_id", "1", "M"),
  @("cdo_car_trading_reservations", "cdo_car_trading_sales_transactions", "reservation_id", "0..1", "1"),
  @("cdo_car_trading_customers", "cdo_car_trading_sales_transactions", "customer_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_sales_transactions", "vehicle_id", "1", "M"),
  @("cdo_car_trading_customers", "cdo_car_trading_vehicle_releases", "customer_id", "1", "M"),
  @("cdo_car_trading_vehicles", "cdo_car_trading_vehicle_releases", "vehicle_id", "1", "M"),
  @("cdo_car_trading_sales_transactions", "cdo_car_trading_vehicle_releases", "sales_transaction_id", "1", "0..1"),
  @("cdo_car_trading_customers", "cdo_car_trading_system_documents", "customer_id", "1", "M")
)

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::White)

$linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(135, 135, 135)), 1.25
$boxPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(165, 165, 165)), 1
$headerBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(238, 238, 238))
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 35, 35))
$relationBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(92, 92, 92))
$titleFont = New-Object System.Drawing.Font $fontFamily, 8.6, ([System.Drawing.FontStyle]::Bold)
$cellFont = New-Object System.Drawing.Font $fontFamily, 7.1, ([System.Drawing.FontStyle]::Regular)
$keyFont = New-Object System.Drawing.Font $fontFamily, 7.1, ([System.Drawing.FontStyle]::Bold)
$captionFont = New-Object System.Drawing.Font "Times New Roman", 18, ([System.Drawing.FontStyle]::Bold)
$noteFont = New-Object System.Drawing.Font $fontFamily, 8, ([System.Drawing.FontStyle]::Italic)

$center = New-Object System.Drawing.StringFormat
$center.Alignment = [System.Drawing.StringAlignment]::Center
$center.LineAlignment = [System.Drawing.StringAlignment]::Center
$center.Trimming = [System.Drawing.StringTrimming]::Word

$left = New-Object System.Drawing.StringFormat
$left.Alignment = [System.Drawing.StringAlignment]::Near
$left.LineAlignment = [System.Drawing.StringAlignment]::Center
$left.Trimming = [System.Drawing.StringTrimming]::Character

function Get-TableRect($table) {
  $tableHeight = $headerHeight + ($table.Fields.Count * $rowHeight)
  return [System.Drawing.RectangleF]::new($table.X, $table.Y, $tableWidth, $tableHeight)
}

$tableMap = @{}
foreach ($table in $tables) {
  $tableMap[$table.Name] = $table
}

function Get-Anchor($from, $to) {
  $fromRect = Get-TableRect $from
  $toRect = Get-TableRect $to
  $fromCenterX = $fromRect.X + ($fromRect.Width / 2)
  $fromCenterY = $fromRect.Y + ($fromRect.Height / 2)
  $toCenterX = $toRect.X + ($toRect.Width / 2)
  $toCenterY = $toRect.Y + ($toRect.Height / 2)

  if ([math]::Abs($fromCenterX - $toCenterX) -ge [math]::Abs($fromCenterY - $toCenterY)) {
    if ($fromCenterX -lt $toCenterX) {
      return @(
        [System.Drawing.PointF]::new($fromRect.Right, $fromCenterY),
        [System.Drawing.PointF]::new($toRect.Left, $toCenterY)
      )
    }
    return @(
      [System.Drawing.PointF]::new($fromRect.Left, $fromCenterY),
      [System.Drawing.PointF]::new($toRect.Right, $toCenterY)
    )
  }

  if ($fromCenterY -lt $toCenterY) {
    return @(
      [System.Drawing.PointF]::new($fromCenterX, $fromRect.Bottom),
      [System.Drawing.PointF]::new($toCenterX, $toRect.Top)
    )
  }

  return @(
    [System.Drawing.PointF]::new($fromCenterX, $fromRect.Top),
    [System.Drawing.PointF]::new($toCenterX, $toRect.Bottom)
  )
}

function Draw-Relationship($graphics, $from, $to, $fromCard, $toCard) {
  $anchors = Get-Anchor $from $to
  $start = $anchors[0]
  $end = $anchors[1]
  $midX = ($start.X + $end.X) / 2
  $midY = ($start.Y + $end.Y) / 2

  if ([math]::Abs($start.X - $end.X) -ge [math]::Abs($start.Y - $end.Y)) {
    $graphics.DrawLine($linePen, $start.X, $start.Y, $midX, $start.Y)
    $graphics.DrawLine($linePen, $midX, $start.Y, $midX, $end.Y)
    $graphics.DrawLine($linePen, $midX, $end.Y, $end.X, $end.Y)
  } else {
    $graphics.DrawLine($linePen, $start.X, $start.Y, $start.X, $midY)
    $graphics.DrawLine($linePen, $start.X, $midY, $end.X, $midY)
    $graphics.DrawLine($linePen, $end.X, $midY, $end.X, $end.Y)
  }

  $graphics.FillEllipse($relationBrush, $start.X - 3, $start.Y - 3, 6, 6)
  $graphics.FillEllipse($relationBrush, $end.X - 3, $end.Y - 3, 6, 6)
  $graphics.DrawString($fromCard, $noteFont, $relationBrush, [System.Drawing.RectangleF]::new($start.X - 20, $start.Y - 17, 40, 16), $center)
  $graphics.DrawString($toCard, $noteFont, $relationBrush, [System.Drawing.RectangleF]::new($end.X - 20, $end.Y + 1, 40, 16), $center)
}

function Draw-Table($graphics, $table) {
  $rect = Get-TableRect $table
  $graphics.FillRectangle($whiteBrush, $rect)
  $graphics.DrawRectangle($boxPen, $rect.X, $rect.Y, $rect.Width, $rect.Height)

  $headerRect = [System.Drawing.RectangleF]::new($rect.X, $rect.Y, $rect.Width, $headerHeight)
  $graphics.FillRectangle($headerBrush, $headerRect)
  $graphics.DrawRectangle($boxPen, $headerRect.X, $headerRect.Y, $headerRect.Width, $headerRect.Height)
  $graphics.DrawString($table.Name, $titleFont, $textBrush, $headerRect, $center)

  $typeWidth = 96
  $keyWidth = 32
  $nameX = $rect.X + $typeWidth
  $keyX = $rect.Right - $keyWidth
  $graphics.DrawLine($boxPen, $nameX, $rect.Y + $headerHeight, $nameX, $rect.Bottom)
  $graphics.DrawLine($boxPen, $keyX, $rect.Y + $headerHeight, $keyX, $rect.Bottom)

  for ($i = 0; $i -lt $table.Fields.Count; $i++) {
    $field = $table.Fields[$i]
    $y = $rect.Y + $headerHeight + ($i * $rowHeight)
    $graphics.DrawLine($boxPen, $rect.X, $y, $rect.Right, $y)
    $typeRect = [System.Drawing.RectangleF]::new($rect.X + 4, $y, $typeWidth - 8, $rowHeight)
    $nameRect = [System.Drawing.RectangleF]::new($nameX + 4, $y, ($keyX - $nameX - 8), $rowHeight)
    $keyRect = [System.Drawing.RectangleF]::new($keyX, $y, $keyWidth, $rowHeight)
    $graphics.DrawString($field[0], $cellFont, $textBrush, $typeRect, $left)
    $graphics.DrawString($field[1], $(if ($field[2]) { $keyFont } else { $cellFont }), $textBrush, $nameRect, $left)
    $graphics.DrawString($field[2], $keyFont, $textBrush, $keyRect, $center)
  }
}

foreach ($relationship in $relationships) {
  Draw-Relationship $graphics $tableMap[$relationship[0]] $tableMap[$relationship[1]] $relationship[3] $relationship[4]
}

foreach ($table in $tables) {
  Draw-Table $graphics $table
}

$legendRect = [System.Drawing.RectangleF]::new(50, 50, 460, 40)
$graphics.DrawString("Database schema ERD based on cdo_car_trading tables. PK = Primary Key, FK = Foreign Key.", $noteFont, $relationBrush, $legendRect, $left)

$captionRect = [System.Drawing.RectangleF]::new(0, ($height - 58), $width, 40)
$graphics.DrawString("Logical Entity-Relationship Diagram", $captionFont, $textBrush, $captionRect, $center)

$pngPath = Join-Path $outputDir "logical-erd.png"
$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

function Escape-Svg($text) {
  return [System.Security.SecurityElement]::Escape([string]$text)
}

function Add-SvgText($builder, $x, $y, $text, $className, $anchor = "middle") {
  [void]$builder.AppendLine("  <text x=`"$x`" y=`"$y`" text-anchor=`"$anchor`" dominant-baseline=`"middle`" class=`"$className`">$(Escape-Svg $text)</text>")
}

function Add-SvgRelationship($builder, $from, $to, $fromCard, $toCard) {
  $anchors = Get-Anchor $from $to
  $start = $anchors[0]
  $end = $anchors[1]
  $midX = ($start.X + $end.X) / 2
  $midY = ($start.Y + $end.Y) / 2
  if ([math]::Abs($start.X - $end.X) -ge [math]::Abs($start.Y - $end.Y)) {
    $points = "$($start.X),$($start.Y) $midX,$($start.Y) $midX,$($end.Y) $($end.X),$($end.Y)"
  } else {
    $points = "$($start.X),$($start.Y) $($start.X),$midY $($end.X),$midY $($end.X),$($end.Y)"
  }
  [void]$builder.AppendLine("  <polyline points=`"$points`" fill=`"none`" stroke=`"#878787`" stroke-width=`"1.25`"/>")
  [void]$builder.AppendLine("  <circle cx=`"$($start.X)`" cy=`"$($start.Y)`" r=`"3`" fill=`"#5c5c5c`"/>")
  [void]$builder.AppendLine("  <circle cx=`"$($end.X)`" cy=`"$($end.Y)`" r=`"3`" fill=`"#5c5c5c`"/>")
  Add-SvgText $builder $start.X ($start.Y - 12) $fromCard "note"
  Add-SvgText $builder $end.X ($end.Y + 12) $toCard "note"
}

function Add-SvgTable($builder, $table) {
  $rect = Get-TableRect $table
  $typeWidth = 96
  $keyWidth = 32
  $nameX = $rect.X + $typeWidth
  $keyX = $rect.Right - $keyWidth

  [void]$builder.AppendLine("  <rect x=`"$($rect.X)`" y=`"$($rect.Y)`" width=`"$($rect.Width)`" height=`"$($rect.Height)`" fill=`"#ffffff`" stroke=`"#a5a5a5`" stroke-width=`"1`"/>")
  [void]$builder.AppendLine("  <rect x=`"$($rect.X)`" y=`"$($rect.Y)`" width=`"$($rect.Width)`" height=`"$headerHeight`" fill=`"#eeeeee`" stroke=`"#a5a5a5`" stroke-width=`"1`"/>")
  Add-SvgText $builder ($rect.X + $rect.Width / 2) ($rect.Y + $headerHeight / 2) $table.Name "title"
  [void]$builder.AppendLine("  <line x1=`"$nameX`" y1=`"$($rect.Y + $headerHeight)`" x2=`"$nameX`" y2=`"$($rect.Bottom)`" stroke=`"#a5a5a5`" stroke-width=`"1`"/>")
  [void]$builder.AppendLine("  <line x1=`"$keyX`" y1=`"$($rect.Y + $headerHeight)`" x2=`"$keyX`" y2=`"$($rect.Bottom)`" stroke=`"#a5a5a5`" stroke-width=`"1`"/>")

  for ($i = 0; $i -lt $table.Fields.Count; $i++) {
    $field = $table.Fields[$i]
    $y = $rect.Y + $headerHeight + ($i * $rowHeight)
    [void]$builder.AppendLine("  <line x1=`"$($rect.X)`" y1=`"$y`" x2=`"$($rect.Right)`" y2=`"$y`" stroke=`"#a5a5a5`" stroke-width=`"1`"/>")
    Add-SvgText $builder ($rect.X + 4) ($y + $rowHeight / 2) $field[0] "cell" "start"
    Add-SvgText $builder ($nameX + 4) ($y + $rowHeight / 2) $field[1] $(if ($field[2]) { "key" } else { "cell" }) "start"
    Add-SvgText $builder ($keyX + ($keyWidth / 2)) ($y + $rowHeight / 2) $field[2] "key"
  }
}

$svg = New-Object System.Text.StringBuilder
[void]$svg.AppendLine("<svg xmlns=`"http://www.w3.org/2000/svg`" width=`"$width`" height=`"$height`" viewBox=`"0 0 $width $height`">")
[void]$svg.AppendLine("  <rect width=`"$width`" height=`"$height`" fill=`"#ffffff`"/>")
[void]$svg.AppendLine("  <style>.title{font:700 8.6px Arial,sans-serif;fill:#232323}.cell{font:400 7.1px Arial,sans-serif;fill:#232323}.key{font:700 7.1px Arial,sans-serif;fill:#232323}.note{font:italic 8px Arial,sans-serif;fill:#5c5c5c}.caption{font:700 18px 'Times New Roman',serif;fill:#000}</style>")

foreach ($relationship in $relationships) {
  Add-SvgRelationship $svg $tableMap[$relationship[0]] $tableMap[$relationship[1]] $relationship[3] $relationship[4]
}

foreach ($table in $tables) {
  Add-SvgTable $svg $table
}

Add-SvgText $svg 50 68 "Database schema ERD based on cdo_car_trading tables. PK = Primary Key, FK = Foreign Key." "note" "start"
Add-SvgText $svg ($width / 2) ($height - 36) "Logical Entity-Relationship Diagram" "caption"
[void]$svg.AppendLine("</svg>")
[System.IO.File]::WriteAllText((Join-Path $outputDir "logical-erd.svg"), $svg.ToString())

$readmePath = Join-Path $outputDir "README.md"
if (Test-Path $readmePath) {
  $readme = [System.IO.File]::ReadAllText($readmePath)
  if ($readme -notmatch "logical-erd") {
    $readme += [Environment]::NewLine + "| Logical ERD | logical-erd.png | logical-erd.svg |"
    [System.IO.File]::WriteAllText($readmePath, $readme)
  }
}

$graphics.Dispose()
$bitmap.Dispose()
$linePen.Dispose()
$boxPen.Dispose()
$headerBrush.Dispose()
$whiteBrush.Dispose()
$textBrush.Dispose()
$relationBrush.Dispose()
$titleFont.Dispose()
$cellFont.Dispose()
$keyFont.Dispose()
$captionFont.Dispose()
$noteFont.Dispose()
$center.Dispose()
$left.Dispose()
