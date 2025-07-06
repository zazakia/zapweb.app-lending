#!/bin/bash

# List of pages to update (excluding main page.tsx, login, and already updated pages)
pages=(
  "src/app/settings/page.tsx"
  "src/app/loans/[id]/schedule/page.tsx"
  "src/app/payments/[id]/receipt/page.tsx"
  "src/app/reports/loan-portfolio/page.tsx"
  "src/app/reports/monthly-financial/page.tsx"
  "src/app/reports/overdue-loans/page.tsx"
  "src/app/admin/collectors/page.tsx"
)

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    echo "Updating $page..."
    
    # Add LayoutSwitcher import after ProtectedRoute import
    sed -i "/import ProtectedRoute from '@\/components\/ProtectedRoute'/a import LayoutSwitcher from '@/components/LayoutSwitcher'" "$page"
    
    # Wrap the content component with LayoutSwitcher
    sed -i 's/<ProtectedRoute\([^>]*\)>\s*<\([^>]*\)>\s*<\/ProtectedRoute>/<ProtectedRoute\1>\n      <LayoutSwitcher>\n        <\2>\n      <\/LayoutSwitcher>\n    <\/ProtectedRoute>/g' "$page"
    
    echo "Updated $page"
  else
    echo "File $page not found, skipping..."
  fi
done

echo "Layout updates completed!"