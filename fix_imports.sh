#!/bin/bash

# Files that need LayoutSwitcher added
files=(
  "src/app/payments/[id]/receipt/page.tsx"
  "src/app/loans/[id]/schedule/page.tsx"
  "src/app/reports/loan-portfolio/page.tsx"
  "src/app/reports/monthly-financial/page.tsx"
  "src/app/reports/overdue-loans/page.tsx"
  "src/app/admin/collectors/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Add import after ProtectedRoute import
    sed -i '/import ProtectedRoute from/a import LayoutSwitcher from '"'"'@/components/LayoutSwitcher'"'"'' "$file"
    
    echo "Fixed import in $file"
  fi
done