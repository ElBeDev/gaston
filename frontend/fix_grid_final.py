#!/usr/bin/env python3
"""
Script para agregar Grid al import de @mui/material
"""
import re
import os

files = [
    "src/components/EvaCommandCenter/components/PerformanceCard.js",
    "src/components/EvaCommandCenter/components/IntegrationsCard.js",
    "src/components/EvaCommandCenter/components/CommandCenter.js",
    "src/components/EvaCommandCenter/components/SystemStatusCard.js",
    "src/components/EvaCommandCenter/EvaCommandCenterDashboard.js",
    "src/components/EvaCommandCenter/EvaAutonomousDashboard.js",
    "src/components/AnalyticsWidgets.js",
    "src/components/ContactProfile.js",
    "src/components/CalendarManagerAdvanced.js",
    "src/components/EvaWhatsAppControl.js",
    "src/components/EvaMulticanalDemo.js",
    "src/components/IntelligenceDashboard.js",
    "src/components/EvaProactividadDemo.js",
    "src/components/EvaWorkflowsDemo.js",
    "src/components/EvaReunionesDemo.js",
    "src/components/EvaAutoResponsePanel.js",
    "src/pages/ContactDashboard.js",
    "src/pages/EmailPage.js",
    "src/pages/CRMPage.js",
    "src/pages/DashboardPage.js",
    "src/pages/DashboardPageOld.js",
    "src/pages/AnalyticsPage.js"
]

for file_path in files:
    if not os.path.exists(file_path):
        print(f"⚠️  No existe: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Eliminar el import de Grid from '@mui/material/Grid'
    content = re.sub(r"import Grid from '@mui/material/Grid';\n", "", content)
    
    # Buscar el import de @mui/material y agregar Grid al principio
    def add_grid_to_import(match):
        full_match = match.group(0)
        # Si ya tiene Grid, no hacemos nada
        if 'Grid' in full_match and 'Grid2' not in full_match:
            return full_match
        
        # Agregar Grid después del opening brace
        return full_match.replace('{\n', '{\n  Grid,\n', 1)
    
    # Pattern para encontrar import { ... } from '@mui/material';
    content = re.sub(
        r"import \{[^}]+\} from '@mui/material';",
        add_grid_to_import,
        content,
        flags=re.DOTALL
    )
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Actualizado: {file_path}")
    else:
        print(f"ℹ️  Sin cambios: {file_path}")

print("\n✨ Proceso completado!")
