/**
 * Policy 기반 권한 관리 시스템 타입 정의
 */

// Permission Action 타입
export type PermissionAction = "create" | "view" | "modify" | "delete";

// Permission Target Type
export type PermissionTargetType = "user" | "role" | "group";

// Policy Type (string 배열)
export type PolicyType = string;

// State Transition Condition (expression 문자열)
export type StateTransitionCondition = string;

// Permission Expression (평가 가능한 표현식)
export type PermissionExpression = string;

// State Diagram 노드
export interface StateNode {
	id: string;
	name: string;
	isInitial: boolean;
	isFinal: boolean;
	order: number;
}

// State Transition 엣지
export interface StateTransitionEdge {
	id: string;
	fromStateId: string;
	toStateId: string;
	condition?: string;
	order?: number;
}

// Permission 정의
export interface PermissionDef {
	id?: string;
	resource: string;
	action: PermissionAction;
	targetType: PermissionTargetType;
	targetId: string;
	expression?: PermissionExpression;
	isAllowed: boolean;
}

// State별 권한 테이블 데이터
export interface StatePermissionRow {
	id?: string;
	resource: string;
	actions: {
		create: PermissionTarget[];
		view: PermissionTarget[];
		modify: PermissionTarget[];
		delete: PermissionTarget[];
	};
}

// Permission Target (User/Role/Group)
export interface PermissionTarget {
	type: PermissionTargetType;
	id: string;
	name: string;
	expression?: PermissionExpression;
	isAllowed: boolean;
}

// Policy 전체 구조 (UI 관리용)
export interface PolicyWithStates {
	id: string;
	name: string;
	description?: string;
	types: PolicyType[];
	isActive: boolean;
	states: StateWithTransitions[];
}

export interface StateWithTransitions {
	id: string;
	name: string;
	description?: string;
	order: number;
	isInitial: boolean;
	isFinal: boolean;
	transitions: StateTransitionEdge[];
	permissions: PermissionDef[];
}

// 권한 평가 컨텍스트
export interface PermissionContext {
	userId: string;
	userRoles: string[];
	userGroups: string[];
	resource?: {
		id: string;
		type: string;
		createdBy?: string;
		[key: string]: unknown;
	};
}

// 권한 평가 결과
export interface PermissionResult {
	allowed: boolean;
	reason?: string;
	source?: "user" | "role" | "group";
}

