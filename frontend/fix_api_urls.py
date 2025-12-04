#!/usr/bin/env python3
"""
Script para reemplazar URLs hardcodeadas con getApiUrl()
"""
import re
import os

def fix_file(filepath):
    """Actualiza un archivo para usar getApiUrl en lugar de URLs hardcodeadas"""
    print(f"📝 Procesando: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = 0
    
    # Patrón 1: fetch('http://localhost:3002/path')
    pattern1 = r"fetch\('http://localhost:3002(/[^']+)'\)"
    def replace1(match):
        path = match.group(1)
        return f"fetch(getApiUrl('{path}'))"
    
    new_content = re.sub(pattern1, replace1, content)
    if new_content != content:
        changes += content.count('http://localhost:3002') - new_content.count('http://localhost:3002')
        content = new_content
    
    # Patrón 2: fetch(`http://localhost:3002/path/${var}`)
    pattern2 = r"fetch\(`http://localhost:3002(/[^`]+)`\)"
    def replace2(match):
        path = match.group(1)
        return f"fetch(getApiUrl(`{path}`))"
    
    new_content = re.sub(pattern2, replace2, content)
    if new_content != content:
        changes += original_content.count('http://localhost:3002') - new_content.count('http://localhost:3002')
        content = new_content
    
    # Patrón 3: const response = await axios.get('http://localhost:3002/path')
    pattern3 = r"axios\.(get|post|put|delete|patch)\('http://localhost:3002(/[^']+)'"
    def replace3(match):
        method = match.group(1)
        path = match.group(2)
        return f"axios.{method}(getApiUrl('{path}')"
    
    new_content = re.sub(pattern3, replace3, content)
    if new_content != content:
        changes += 1
        content = new_content
    
    # Patrón 4: axios.get(`http://localhost:3002/path/${var}`)
    pattern4 = r"axios\.(get|post|put|delete|patch)\(`http://localhost:3002(/[^`]+)`"
    def replace4(match):
        method = match.group(1)
        path = match.group(2)
        return f"axios.{method}(getApiUrl(`{path}`)"
    
    new_content = re.sub(pattern4, replace4, content)
    if new_content != content:
        changes += 1
        content = new_content
    
    if content != original_content:
        # Guardar archivo actualizado
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Actualizado: {changes} referencias cambiadas")
        return True
    else:
        print(f"⏭️  Sin cambios necesarios")
        return False

def main():
    # Lista de archivos a procesar
    files_to_process = [
        'src/components/CalendarManager.js',
        'src/components/CalendarManagerAdvanced.js',
        'src/components/EmailManagerAdvanced.js',
        'src/components/EvaAutoResponsePanel.js',
        'src/components/EvaWhatsAppControl.js',
    ]
    
    total_updated = 0
    for filepath in files_to_process:
        if os.path.exists(filepath):
            if fix_file(filepath):
                total_updated += 1
        else:
            print(f"❌ No existe: {filepath}")
    
    print(f"\n✨ Completado! {total_updated} archivos actualizados")

if __name__ == '__main__':
    main()
