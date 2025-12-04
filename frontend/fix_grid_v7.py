#!/usr/bin/env python3
"""
Script para actualizar imports de Grid2 a Grid en MUI v7
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
    
    # Reemplazar la línea de importación de Grid2
    content = re.sub(
        r"import Grid2 from '@mui/material/Unstable_Grid2';",
        "import Grid from '@mui/material/Grid';",
        content
    )
    
    # Reemplazar <Grid2 con <Grid
    content = re.sub(r'<Grid2\s', '<Grid ', content)
    
    # Reemplazar </Grid2> con </Grid>
    content = re.sub(r'</Grid2>', '</Grid>', content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Actualizado: {file_path}")
    else:
        print(f"ℹ️  Sin cambios: {file_path}")

print("\n✨ Proceso completado!")
