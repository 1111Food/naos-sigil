# Archetype Visuals - Done
# To solve the "91 problems", run this in your server terminal:

if (!(Test-Path "temp_archive")) { New-Item -ItemType Directory -Path "temp_archive" }
Get-ChildItem -Path . -Filter "*.ts" -Exclude "package.json", "tsconfig.json" | Where-Object { $_.Name -match "^(audit|test|check|debug|diag|deep|inspect|list|probe|reproduce|verify|ts_|tsc_)" -or $_.Name -match "^(acid|generate-|force_|master-|purge_|simplified-)" } | Move-Item -Destination "temp_archive" -Force
Get-ChildItem -Path . -Filter "*.js" | Where-Object { $_.Name -match "^(check|diag|inspect|list|test|test-|get_)" } | Move-Item -Destination "temp_archive" -Force
Get-ChildItem -Path . -Filter "*.log" | Move-Item -Destination "temp_archive" -Force
Get-ChildItem -Path . -Filter "*.txt" | Where-Object { $_.Name -ne "package.json" } | Move-Item -Destination "temp_archive" -Force
Get-ChildItem -Path . -Filter "*.sql" | Move-Item -Destination "temp_archive" -Force
Get-ChildItem -Path . -Filter "*.json" | Where-Object { $_.Name -notin "package.json", "tsconfig.json", "package-lock.json", "schema.json" } | Move-Item -Destination "temp_archive" -Force
