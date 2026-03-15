export const RelationshipType = {
	SPOUSE: "SPOUSE",
	CHILD: "CHILD",
	PARTNER: "PARTNER",
} as const;
// cái này dành cho select option
export const RelationshipTypeOptions = [
	{ value: RelationshipType.SPOUSE, label: "Vợ/Chồng" },
	{ value: RelationshipType.CHILD, label: "Con" },
	{ value: RelationshipType.PARTNER, label: "Ở ghép" },
];
