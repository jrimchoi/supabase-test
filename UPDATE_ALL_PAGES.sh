#!/bin/bash

# 이 스크립트는 모든 관리 페이지에 pageSize 처리를 추가하는 가이드입니다
# 각 페이지별로 수동으로 업데이트가 필요합니다

echo "📝 모든 관리 페이지에 다음 기능을 추가해야 합니다:"
echo ""
echo "1. pageSize URL 파라미터 처리"
echo "2. 페이지 레이아웃에 flex-col과 높이 제한 추가"
echo "3. Pagination 컴포넌트에 pageSize prop 전달"
echo "4. List 컴포넌트에 스크롤 기능 추가"
echo ""
echo "✅ 완료된 페이지:"
echo "  - Policy (/admin/policies)"
echo ""
echo "🔄 업데이트 필요한 페이지:"
echo "  - Role (/admin/roles)"
echo "  - Group (/admin/groups)"
echo "  - Type (/admin/types)"
echo "  - Attribute (/admin/attributes)"
echo "  - State (/admin/states)"
echo "  - Permission (/admin/permissions)"
echo "  - StateTransition (/admin/transitions)"
echo "  - BusinessObject (/admin/business-objects)"

