#!/bin/bash

# Vendor Form Aggressive Testing Script
# This script validates all implementation changes

set -e

FRONTEND_DIR="/Users/safayavatsal/Downloads/Deuex/Accordo-AI/Accordo-ai-frontend"
cd "$FRONTEND_DIR"

echo "=================================================="
echo "🧪 VENDOR FORM AGGRESSIVE TESTING"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Test function
run_test() {
    local test_name="$1"
    local command="$2"

    ((TOTAL++))
    echo -n "Test $TOTAL: $test_name ... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

echo "=================================================="
echo "📁 FILE EXISTENCE TESTS"
echo "=================================================="

# Test 1: Check BasicAndCompanyInfo exists
run_test "BasicAndCompanyInfo.tsx exists" \
    "test -f src/components/VendorForm/BasicAndCompanyInfo.tsx"

# Test 2: Check LocationDetails exists
run_test "LocationDetails.tsx exists" \
    "test -f src/components/VendorForm/LocationDetails.tsx"

# Test 3: Check FinancialAndBanking exists
run_test "FinancialAndBanking.tsx exists" \
    "test -f src/components/VendorForm/FinancialAndBanking.tsx"

# Test 4: Check ContactAndDocuments exists
run_test "ContactAndDocuments.tsx exists" \
    "test -f src/components/VendorForm/ContactAndDocuments.tsx"

# Test 5: Check useAutoSave hook exists
run_test "useAutoSave.ts hook exists" \
    "test -f src/hooks/useAutoSave.ts"

# Test 6: Check VendorFormContainer was modified
run_test "VendorFormContainer.tsx exists" \
    "test -f src/components/VendorForm/VendorFormContainer.tsx"

# Test 7: Check VendorReview was modified
run_test "VendorReview.tsx exists" \
    "test -f src/components/VendorForm/VendorReview.tsx"

# Test 8: Check test plan documentation
run_test "Test plan documentation exists" \
    "test -f VENDOR_FORM_TEST_PLAN.md"

# Test 9: Check implementation summary
run_test "Implementation summary exists" \
    "test -f VENDOR_FORM_IMPLEMENTATION_SUMMARY.md"

echo ""
echo "=================================================="
echo "🔍 IMPORT VALIDATION TESTS"
echo "=================================================="

# Test 10: Check BasicAndCompanyInfo is imported in VendorFormContainer
run_test "BasicAndCompanyInfo imported in container" \
    "grep -q 'import BasicAndCompanyInfo' src/components/VendorForm/VendorFormContainer.tsx"

# Test 11: Check LocationDetails is imported
run_test "LocationDetails imported in container" \
    "grep -q 'import LocationDetails' src/components/VendorForm/VendorFormContainer.tsx"

# Test 12: Check FinancialAndBanking is imported
run_test "FinancialAndBanking imported in container" \
    "grep -q 'import FinancialAndBanking' src/components/VendorForm/VendorFormContainer.tsx"

# Test 13: Check ContactAndDocuments is imported
run_test "ContactAndDocuments imported in container" \
    "grep -q 'import ContactAndDocuments' src/components/VendorForm/VendorFormContainer.tsx"

# Test 14: Check useAutoSave is imported
run_test "useAutoSave hook imported in container" \
    "grep -q 'import.*useAutoSave' src/components/VendorForm/VendorFormContainer.tsx"

# Test 15: Check old components are NOT imported
run_test "Old VendorBasicInformation NOT imported" \
    "! grep -q 'import VendorBasicInformation' src/components/VendorForm/VendorFormContainer.tsx"

# Test 16: Check old VendorGeneralInformation NOT imported
run_test "Old VendorGeneralInformation NOT imported" \
    "! grep -q 'import VendorGeneralInformation' src/components/VendorForm/VendorFormContainer.tsx"

echo ""
echo "=================================================="
echo "🎯 COMPONENT STRUCTURE TESTS"
echo "=================================================="

# Test 17: BasicAndCompanyInfo has form validation
run_test "BasicAndCompanyInfo has validation schema" \
    "grep -q 'validationSchema' src/components/VendorForm/BasicAndCompanyInfo.tsx"

# Test 18: LocationDetails has address fields
run_test "LocationDetails has address field" \
    "grep -q 'address' src/components/VendorForm/LocationDetails.tsx"

# Test 19: FinancialAndBanking has currency field
run_test "FinancialAndBanking has currency field" \
    "grep -q 'typeOfCurrency' src/components/VendorForm/FinancialAndBanking.tsx"

# Test 20: ContactAndDocuments has drag-drop
run_test "ContactAndDocuments has drag-drop handlers" \
    "grep -q 'handleDragOver' src/components/VendorForm/ContactAndDocuments.tsx"

# Test 21: ContactAndDocuments has file validation
run_test "ContactAndDocuments has file validation" \
    "grep -q 'validateFile' src/components/VendorForm/ContactAndDocuments.tsx"

# Test 22: VendorFormContainer has 5 steps
run_test "VendorFormContainer has 5 steps defined" \
    "grep -q 'id: 5' src/components/VendorForm/VendorFormContainer.tsx"

# Test 23: VendorFormContainer doesn't have 7 steps
run_test "VendorFormContainer doesn't reference step 7" \
    "! grep -q 'id: 7' src/components/VendorForm/VendorFormContainer.tsx"

# Test 24: useAutoSave hook has loadSaved function
run_test "useAutoSave has loadSaved function" \
    "grep -q 'loadSaved' src/hooks/useAutoSave.ts"

echo ""
echo "=================================================="
echo "💅 STYLING TESTS"
echo "=================================================="

# Test 25: VendorFormContainer has bg-gray-100
run_test "Container has bg-gray-100 styling" \
    "grep -q 'bg-gray-100' src/components/VendorForm/VendorFormContainer.tsx"

# Test 26: Form cards have shadow-sm
run_test "Form cards have shadow-sm styling" \
    "grep -q 'shadow-sm' src/components/VendorForm/VendorFormContainer.tsx"

# Test 27: Max width is 4xl
run_test "Max width is max-w-4xl" \
    "grep -q 'max-w-4xl' src/components/VendorForm/VendorFormContainer.tsx"

# Test 28: ContactAndDocuments has drag styling
run_test "Drag zone has blue styling on drag" \
    "grep -q 'border-blue-500' src/components/VendorForm/ContactAndDocuments.tsx"

echo ""
echo "=================================================="
echo "⚛️ REACT/TYPESCRIPT TESTS"
echo "=================================================="

# Test 29: All components export default
run_test "BasicAndCompanyInfo exports default" \
    "grep -q 'export default BasicAndCompanyInfo' src/components/VendorForm/BasicAndCompanyInfo.tsx"

run_test "LocationDetails exports default" \
    "grep -q 'export default LocationDetails' src/components/VendorForm/LocationDetails.tsx"

run_test "FinancialAndBanking exports default" \
    "grep -q 'export default FinancialAndBanking' src/components/VendorForm/FinancialAndBanking.tsx"

run_test "ContactAndDocuments exports default" \
    "grep -q 'export default ContactAndDocuments' src/components/VendorForm/ContactAndDocuments.tsx"

# Test 30: useAutoSave exports hook
run_test "useAutoSave exports hook" \
    "grep -q 'export const useAutoSave' src/hooks/useAutoSave.ts"

echo ""
echo "=================================================="
echo "🔧 FUNCTIONALITY TESTS"
echo "=================================================="

# Test 31: Auto-save has interval parameter
run_test "useAutoSave has interval parameter" \
    "grep -q 'interval' src/hooks/useAutoSave.ts"

# Test 32: Auto-save has localStorage
run_test "useAutoSave uses localStorage" \
    "grep -q 'localStorage' src/hooks/useAutoSave.ts"

# Test 33: File upload has max size validation
run_test "File upload validates max size (10MB)" \
    "grep -q '10.*1024.*1024' src/components/VendorForm/ContactAndDocuments.tsx"

# Test 34: File upload has type validation
run_test "File upload validates file types" \
    "grep -q 'allowedTypes' src/components/VendorForm/ContactAndDocuments.tsx"

# Test 35: Step navigation checks max step
run_test "Navigation checks step <= 5" \
    "grep -q 'currentStep < 5' src/components/VendorForm/VendorFormContainer.tsx"

echo ""
echo "=================================================="
echo "🎨 FORM SECTIONS TESTS"
echo "=================================================="

# Test 36: BasicAndCompanyInfo has two sections
run_test "BasicAndCompanyInfo has Contact Details section" \
    "grep -q 'Contact Details' src/components/VendorForm/BasicAndCompanyInfo.tsx"

run_test "BasicAndCompanyInfo has Company Information section" \
    "grep -q 'Company Information' src/components/VendorForm/BasicAndCompanyInfo.tsx"

# Test 37: VendorReview has review cards
run_test "VendorReview has Step 1 review card" \
    "grep -q 'Step 1: Basic & Company Information' src/components/VendorForm/VendorReview.tsx"

run_test "VendorReview has Step 2 review card" \
    "grep -q 'Step 2: Location Details' src/components/VendorForm/VendorReview.tsx"

run_test "VendorReview has Step 3 review card" \
    "grep -q 'Step 3: Financial & Banking' src/components/VendorForm/VendorReview.tsx"

run_test "VendorReview has Step 4 review card" \
    "grep -q 'Step 4: Contact & Documents' src/components/VendorForm/VendorReview.tsx"

echo ""
echo "=================================================="
echo "📦 BUILD VALIDATION"
echo "=================================================="

# Test 38: Check for syntax errors with TypeScript (quick check)
echo -n "Test $((TOTAL+1)): TypeScript syntax check ... "
((TOTAL++))
if npx tsc --noEmit --skipLibCheck 2>&1 | grep -q "src/components/VendorForm.*error"; then
    echo -e "${RED}✗ FAILED${NC}"
    echo "   TypeScript errors found in VendorForm components"
    ((FAILED++))
else
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
fi

echo ""
echo "=================================================="
echo "🔒 SECURITY & VALIDATION TESTS"
echo "=================================================="

# Test 39: Email validation pattern exists
run_test "Email validation pattern exists" \
    "grep -q '@.*\\+.*\\[a-zA-Z\\]' src/components/VendorForm/BasicAndCompanyInfo.tsx"

# Test 40: Phone validation pattern exists
run_test "Phone validation pattern exists" \
    "grep -q '\\[0-9\\].*10' src/components/VendorForm/BasicAndCompanyInfo.tsx"

# Test 41: File type restrictions exist
run_test "File type restrictions defined" \
    "grep -q 'pdf\\|doc\\|docx\\|jpg\\|png' src/components/VendorForm/ContactAndDocuments.tsx"

echo ""
echo "=================================================="
echo "🧩 INTEGRATION TESTS"
echo "=================================================="

# Test 42: Toast notifications imported
run_test "Toast notifications imported in container" \
    "grep -q 'react-hot-toast' src/components/VendorForm/VendorFormContainer.tsx"

# Test 43: API calls use authApi
run_test "Components use authApi for requests" \
    "grep -q 'authApi' src/components/VendorForm/BasicAndCompanyInfo.tsx"

# Test 44: Navigation uses react-router
run_test "Navigation uses useNavigate" \
    "grep -q 'useNavigate' src/components/VendorForm/VendorFormContainer.tsx"

echo ""
echo "=================================================="
echo "📊 FINAL RESULTS"
echo "=================================================="
echo ""
echo -e "Total Tests:   ${TOTAL}"
echo -e "Passed:        ${GREEN}${PASSED}${NC}"
echo -e "Failed:        ${RED}${FAILED}${NC}"
echo -e "Success Rate:  $((PASSED * 100 / TOTAL))%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}=================================================="
    echo "✅ ALL TESTS PASSED!"
    echo "🚀 Vendor form refactoring is ready for manual testing"
    echo "==================================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Navigate to: http://localhost:5001/vendor-management/add-vendor"
    echo "2. Test the 5-step form flow"
    echo "3. Verify drag-and-drop file upload"
    echo "4. Check auto-save functionality"
    echo "5. Review form submission"
    exit 0
else
    echo -e "${RED}=================================================="
    echo "❌ SOME TESTS FAILED"
    echo "⚠️  Please review failed tests above"
    echo "==================================================${NC}"
    exit 1
fi
