#!/bin/bash
# /scripts/sync-android.sh
# Sincroniza cambios de app.json a android/ de forma segura
# USO: bash scripts/sync-android.sh

set -e  # Detener si cualquier comando falla

echo "🔒 Haciendo backup de archivos críticos..."

# Backup de archivos que expo prebuild puede sobreescribir
BACKUP_DIR=".android-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

cp android/app/build.gradle "$BACKUP_DIR/build.gradle"
cp -r android/app/src/main/res/mipmap-hdpi "$BACKUP_DIR/mipmap-hdpi" 2>/dev/null || true
cp -r android/app/src/main/res/mipmap-mdpi "$BACKUP_DIR/mipmap-mdpi" 2>/dev/null || true
cp -r android/app/src/main/res/mipmap-xhdpi "$BACKUP_DIR/mipmap-xhdpi" 2>/dev/null || true
cp -r android/app/src/main/res/mipmap-xxhdpi "$BACKUP_DIR/mipmap-xxhdpi" 2>/dev/null || true
cp -r android/app/src/main/res/mipmap-xxxhdpi "$BACKUP_DIR/mipmap-xxxhdpi" 2>/dev/null || true
cp android/app/src/main/res/values/ic_launcher_background.xml \
   "$BACKUP_DIR/ic_launcher_background.xml" 2>/dev/null || true

echo "✅ Backup guardado en: $BACKUP_DIR"
echo ""
echo "🔄 Ejecutando expo prebuild (sin --clean)..."

npx expo prebuild --platform android

echo ""
echo "🔍 Verificando build.gradle..."

# Verificar si el fix de duplicados sigue presente
if grep -q "whenTaskAdded" android/app/build.gradle; then
    echo "✅ Fix de duplicados presente en build.gradle"
else
    echo "⚠️  Fix eliminado por prebuild — restaurando..."
    cat >> android/app/build.gradle << 'GRADLE_FIX'

// ─────────────────────────────────────────────────────────────────────────────
// FIX PERMANENTE: Elimina recursos duplicados generados por Expo/Metro
// No eliminar este bloque — es necesario para builds locales con Android Studio
// ─────────────────────────────────────────────────────────────────────────────
tasks.whenTaskAdded { task ->
    if (task.name.contains("merge") && task.name.contains("Resources")) {
        task.doFirst {
            def drawablesDir = new File(projectDir, "src/main/res/")
            drawablesDir.eachDir { dir ->
                if (dir.name.startsWith("drawable-") || dir.name.startsWith("mipmap-") || dir.name == "raw") {
                    def filesByName = [:]
                    dir.eachFile { file ->
                        // 1. Eliminar duplicados de Metro (node_modules, assets_)
                        if (file.name.contains("node_modules") || file.name.contains("assets_")) {
                            println "🗑️  Eliminando recurso duplicado (Metro): ${file.name}"
                            file.delete()
                            return
                        }
                        
                        // 2. Eliminar duplicados por extensión (logo.png vs logo.webp)
                        def baseName = file.name.lastIndexOf('.').with { it != -1 ? file.name.substring(0, it) : file.name }
                        if (filesByName.containsKey(baseName)) {
                            def existingFile = filesByName[baseName]
                            // Priorizar PNG sobre WEBP si hay conflicto
                            if (file.name.endsWith(".webp") && existingFile.name.endsWith(".png")) {
                                println "🗑️  Eliminando conflictivo WEBP: ${file.name} (existe PNG)"
                                file.delete()
                            } else if (file.name.endsWith(".png") && existingFile.name.endsWith(".webp")) {
                                println "🗑️  Eliminando conflictivo WEBP: ${existingFile.name} (existe PNG)"
                                existingFile.delete()
                                filesByName[baseName] = file
                            }
                        } else {
                            filesByName[baseName] = file
                        }
                    }
                }
            }
        }
    }
}
GRADLE_FIX
    echo "✅ Fix restaurado automáticamente"
fi

echo ""
echo "✅ Sincronización completa. Ahora en Android Studio:"
echo "   File → Sync Project with Gradle Files"
echo "   Build → Generate Signed Bundle/APK"
