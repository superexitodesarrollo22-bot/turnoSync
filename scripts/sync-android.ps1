# /scripts/sync-android.ps1
# Sincroniza cambios de app.json a android/ de forma segura (Version PowerShell para Windows)
# USO: .\scripts\sync-android.ps1

$ErrorActionPreference = "Stop"

Write-Host "[BACKUP] Haciendo backup de archivos criticos..." -ForegroundColor Cyan

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = ".android-backup-$Timestamp"
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

Copy-Item "android/app/build.gradle" "$BackupDir/build.gradle" -ErrorAction SilentlyContinue
Copy-Item -Path "android/app/src/main/res/mipmap-hdpi" -Destination "$BackupDir/mipmap-hdpi" -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "android/app/src/main/res/mipmap-mdpi" -Destination "$BackupDir/mipmap-mdpi" -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "android/app/src/main/res/mipmap-xhdpi" -Destination "$BackupDir/mipmap-xhdpi" -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "android/app/src/main/res/mipmap-xxhdpi" -Destination "$BackupDir/mipmap-xxhdpi" -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "android/app/src/main/res/mipmap-xxxhdpi" -Destination "$BackupDir/mipmap-xxxhdpi" -Recurse -ErrorAction SilentlyContinue
Copy-Item "android/app/src/main/res/values/ic_launcher_background.xml" "$BackupDir/ic_launcher_background.xml" -ErrorAction SilentlyContinue

Write-Host "SUCCESS: Backup guardado en: $BackupDir" -ForegroundColor Green
Write-Host ""
Write-Host "[SYNC] Ejecutando expo prebuild (sin --clean)..." -ForegroundColor Cyan

npx expo prebuild --platform android

Write-Host ""
Write-Host "[CHECK] Verificando build.gradle..." -ForegroundColor Cyan

$BuildGradlePath = "android/app/build.gradle"
$Content = Get-Content $BuildGradlePath -Raw

if ($Content -match "whenTaskAdded") {
    Write-Host "SUCCESS: Fix de duplicados presente en build.gradle" -ForegroundColor Green
} else {
    Write-Host "WARNING: Fix eliminado por prebuild - restaurando..." -ForegroundColor Yellow
    
    $FixPath = Join-Path $PSScriptRoot "gradle-fix.txt"
    if (Test-Path $FixPath) {
        $GradleFix = Get-Content $FixPath -Raw
        Add-Content -Path $BuildGradlePath -Value "`n$GradleFix"
        Write-Host "SUCCESS: Fix restaurado automaticamente desde gradle-fix.txt" -ForegroundColor Green
    } else {
        Write-Error "ERROR: No se encontro scripts/gradle-fix.txt"
    }
}

Write-Host ""
Write-Host "SUCCESS: Sincronizacion completa. Ahora en Android Studio:" -ForegroundColor Green
Write-Host "   File -> Sync Project with Gradle Files"
Write-Host "   Build -> Generate Signed Bundle/APK"
