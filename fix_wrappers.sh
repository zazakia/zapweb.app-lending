#!/bin/bash

# Files that need LayoutSwitcher wrapper
files=(
  "src/app/loans/[id]/schedule/page.tsx"
  "src/app/reports/loan-portfolio/page.tsx"
  "src/app/reports/monthly-financial/page.tsx"
  "src/app/reports/overdue-loans/page.tsx"
  "src/app/admin/collectors/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing wrapper in $file..."
    
    # Replace the ProtectedRoute pattern with LayoutSwitcher wrapper
    sed -i 's|<ProtectedRoute\([^>]*\)>\s*<\([^>]*\)>\s*</ProtectedRoute>|<ProtectedRoute\1>\n      <LayoutSwitcher>\n        <\2>\n      </LayoutSwitcher>\n    </ProtectedRoute>|g' "$file"
    
    echo "Fixed wrapper in $file"
  fi
done