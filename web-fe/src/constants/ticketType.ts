export const TicketType = {
	INCIDENT: "INCIDENT",
	MAINTENANCE: "MAINTENANCE",
} as const;
// cái này là enum trong ts
export type TicketType = (typeof TicketType)[keyof typeof TicketType];

// cái này dành cho select option
export const TicketTypeOptions = [
	{ value: TicketType.MAINTENANCE, label: "Bảo trì" },
	{ value: TicketType.INCIDENT, label: "Sự cố" },
];
