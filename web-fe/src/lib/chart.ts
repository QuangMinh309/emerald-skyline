export type XYPoint = { x: number; y: number };

export function buildLinearScale(
	d0: number,
	d1: number,
	r0: number,
	r1: number,
) {
	const denom = d1 - d0 || 1;
	const m = (r1 - r0) / denom;
	return (v: number) => r0 + (v - d0) * m;
}

export function buildPoints(
	values: number[],
	x: (i: number) => number,
	y: (v: number) => number,
): XYPoint[] {
	return values.map((v, i) => ({ x: x(i), y: y(v) }));
}

export function niceStep(
	range: number,
	targetTicks: number,
	options?: { minStep?: number; multipleOf?: number },
) {
	const minStep = options?.minStep ?? 1;
	const multipleOf = options?.multipleOf; // vd 5

	if (!Number.isFinite(range) || range <= 0) return minStep;

	const rough = range / Math.max(targetTicks, 1);

	if (!Number.isFinite(rough) || rough <= minStep) return minStep;

	const pow = Math.pow(10, Math.floor(Math.log10(rough)));
	const err = rough / pow;

	// 1,2,5,10
	let mult = 1;
	if (err >= 7.5) mult = 10;
	else if (err >= 3.5) mult = 5;
	else if (err >= 1.5) mult = 2;

	let step = mult * pow;

	step = Math.max(minStep, Math.round(step));

	if (multipleOf && step >= multipleOf) {
		step = Math.max(multipleOf, Math.round(step / multipleOf) * multipleOf);
	}

	return step;
}

export function niceDomain(
	min: number,
	max: number,
	targetTicks = 5,
	options?: { minStep?: number; multipleOf?: number },
) {
	if (!Number.isFinite(min) || !Number.isFinite(max))
		return { min: 0, max: 1, step: 1 };

	if (min === max) {
		const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
		min -= pad;
		max += pad;
	}

	const step = niceStep(max - min, targetTicks, options);

	const niceMin = Math.floor(min / step) * step;
	const niceMax = Math.ceil(max / step) * step;

	return { min: niceMin, max: niceMax, step };
}

export function buildNiceTicks(
	min: number,
	max: number,
	targetTicks = 5,
	options?: { minStep?: number; multipleOf?: number },
) {
	const d = niceDomain(min, max, targetTicks, options);

	const ticks: number[] = [];
	for (let v = d.min; v <= d.max + d.step * 0.5; v += d.step)
		ticks.push(Math.round(v));

	// loại trùng + sort
	return Array.from(new Set(ticks)).sort((a, b) => a - b);
}
