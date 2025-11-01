/**
 * Permission Expression 평가기
 * 
 * expression 문자열을 평가하여 권한 적용 여부를 결정합니다.
 * 주의: 실제 프로덕션에서는 Sandbox 환경에서 실행하거나
 * AST 파서를 사용하여 안전하게 평가해야 합니다.
 */

import type { PermissionContext, PermissionExpression } from "./types";

/**
 * Expression을 평가합니다.
 * 
 * @param expression - 평가할 expression 문자열
 * @param context - 권한 평가 컨텍스트 (user, roles, groups, resource 등)
 * @returns 평가 결과 (true/false)
 * 
 * @example
 * evaluateExpression("user.roles.includes('admin')", context)
 * evaluateExpression("resource.createdBy === user.id", context)
 * evaluateExpression("user.groups.includes('managers')", context)
 */
export function evaluateExpression(
	expression: PermissionExpression,
	context: PermissionContext
): boolean {
	if (!expression || expression.trim() === "") {
		return true; // expression이 없으면 항상 true (무조건 적용)
	}

	try {
		// 안전한 평가를 위한 컨텍스트 객체 생성
		const evalContext = {
			user: {
				id: context.userId,
				roles: context.userRoles,
				groups: context.userGroups,
			},
			resource: context.resource || {},
		};

		// 주의: 실제 프로덕션에서는 더 안전한 평가 방법 사용 권장
		// 예: expression-parser, vm2 (Node.js), 또는 커스텀 AST 파서
		const result = new Function(
			"user",
			"resource",
			`return ${expression}`
		)(evalContext.user, evalContext.resource);

		return Boolean(result);
	} catch (error) {
		console.error("Expression evaluation error:", error, { expression });
		return false; // 평가 실패 시 거부
	}
}

/**
 * State Transition 조건을 평가합니다.
 * 
 * @param condition - 전이 조건 expression
 * @param context - 평가 컨텍스트
 * @returns 조건 만족 여부
 */
export function evaluateTransitionCondition(
	condition: string | null | undefined,
	context: PermissionContext
): boolean {
	if (!condition) {
		return true; // 조건이 없으면 항상 전이 가능
	}

	return evaluateExpression(condition, context);
}

