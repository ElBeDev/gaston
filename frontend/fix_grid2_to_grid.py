#!/usr/bin/env python3
"""
Script para reemplazar 'Grid2 as Grid' con 'Grid' en imports de MUI
Esto es para MUI v7 donde Grid ya es Grid2 por defecto
"""
import re
import os

# Buscar todos los archivos .js en src
for root, dirs, files in os.walk('src'):
    for file in files:
        if not file.endswith('.js'):
            continue
        
        file_path = os.path.join(root, file)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Reemplazar 'Grid2 as Grid,' con 'Grid,'
        content = re.sub(r'Grid2 as Grid,', 'Grid,', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Actualizado: {file_path}")

print("\n✨ Proceso completado!")
