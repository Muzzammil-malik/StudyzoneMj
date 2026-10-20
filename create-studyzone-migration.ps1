$backup = "C:\Users\Abdul Malik\Downloads\db_cluster-22-09-2026@07-37-27\db_cluster-22-09-2026@07-37-27.backup"
$output = "C:\Users\Abdul Malik\desktop\StudyzoneMJ\StudyzoneMj\StudyZone_old_data_migration.sql"

$newAdminId = "15be69ea-2d6a-45d6-abeb-b1b575cfc6ba"
$oldAdminId = "00d7ff51-1214-496b-ab6e-ad9191335a52"

$tables = @(
    "semesters",
    "subjects",
    "resource_categories",
    "folders",
    "resources",
    "feedback",
    "settings"
)

Write-Host "Reading old backup..." -ForegroundColor Cyan
$sql = [System.IO.File]::ReadAllText($backup)

$builder = New-Object System.Text.StringBuilder

[void]$builder.AppendLine("-- ============================================================")
[void]$builder.AppendLine("-- StudyZone MJCET - OLD DATABASE DATA RECOVERY")
[void]$builder.AppendLine("-- Generated from the old Supabase database backup")
[void]$builder.AppendLine("-- Old Auth/Admin is intentionally NOT imported")
[void]$builder.AppendLine("-- ============================================================")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("BEGIN;")
[void]$builder.AppendLine("")

# Clear current catalog/data in dependency-safe order.
[void]$builder.AppendLine("-- Clear current/new StudyZone data")
[void]$builder.AppendLine("DELETE FROM public.bookmarks;")
[void]$builder.AppendLine("DELETE FROM public.resources;")
[void]$builder.AppendLine("DELETE FROM public.folders;")
[void]$builder.AppendLine("DELETE FROM public.subjects;")
[void]$builder.AppendLine("DELETE FROM public.resource_categories;")
[void]$builder.AppendLine("DELETE FROM public.semesters;")
[void]$builder.AppendLine("DELETE FROM public.feedback;")
[void]$builder.AppendLine("DELETE FROM public.settings;")
[void]$builder.AppendLine("")

foreach ($table in $tables) {

    Write-Host "Extracting public.$table ..." -ForegroundColor Yellow

    $pattern = "(?s)COPY\s+public\.$table\s*\((.*?)\)\s+FROM stdin;\s*\r?\n(.*?)\r?\n\\\."

    $match = [regex]::Match(
        $sql,
        $pattern,
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    if (-not $match.Success) {
        Write-Warning "COPY block NOT FOUND for public.$table"
        continue
    }

    $columns = $match.Groups[1].Value.Trim()
    $data = $match.Groups[2].Value

    # For resources, replace only the created_by column value.
    if ($table -eq "resources") {

        $columnList = $columns -split ",\s*" | ForEach-Object { $_.Trim() }

        $createdByIndex = [Array]::IndexOf($columnList, "created_by")

        if ($createdByIndex -lt 0) {
            throw "Could not find created_by column in resources COPY block."
        }

        $rows = $data -split "\r?\n"

        for ($i = 0; $i -lt $rows.Count; $i++) {

            if ([string]::IsNullOrWhiteSpace($rows[$i])) {
                continue
            }

            $fields = $rows[$i] -split "`t", -1

            if ($fields.Count -gt $createdByIndex) {

                if ($fields[$createdByIndex] -eq $oldAdminId) {
                    $fields[$createdByIndex] = $newAdminId
                }

                $rows[$i] = $fields -join "`t"
            }
        }

        $data = $rows -join "`r`n"
    }

    [void]$builder.AppendLine("-- ------------------------------------------------------------")
    [void]$builder.AppendLine("-- public.$table")
    [void]$builder.AppendLine("-- ------------------------------------------------------------")
    [void]$builder.AppendLine("COPY public.$table ($columns) FROM stdin;")
    [void]$builder.AppendLine($data)
    [void]$builder.AppendLine("\.")
    [void]$builder.AppendLine("")
}

[void]$builder.AppendLine("COMMIT;")
[void]$builder.AppendLine("")
[void]$builder.AppendLine("-- Recovery complete.")

[System.IO.File]::WriteAllText(
    $output,
    $builder.ToString(),
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Migration file created successfully!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host $output -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Nothing has been imported into Supabase yet." -ForegroundColor Yellow
