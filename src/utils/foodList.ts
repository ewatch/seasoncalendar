type AvailabilityType = "freiland" | "lager" | "both";

type ListItem = {
	name: string;
	availabilityType: AvailabilityType;
};

export const escapeHtml = (value: string) =>
	value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] || char);

/*
Freiland is the normal case and gets no visible badge, only a screen reader hint.
Storage availability is spelled out as text so it does not rely on colour.
*/
export const statusBadge = function (type: AvailabilityType): string {
	if (type === "freiland") {
		return `<span class="sr-only">(Freiland)</span>`;
	}
	if (type === "lager") {
		return `<span class="shrink-0 whitespace-nowrap bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700">Lager</span>`;
	}
	return `<span class="shrink-0 whitespace-nowrap bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900"><span aria-hidden="true">+ Lager</span><span class="sr-only">(Freiland und Lager)</span></span>`;
};

export const renderFoodList = function (items: ListItem[], showStatus: boolean): string {
	if (items.length === 0) {
		return `<li class="col-span-full text-xs italic text-stone-500">Keine Auswahl verfügbar</li>`;
	}
	return items
		.map(
			(item) =>
				`<li><button type="button" class="food-item flex min-h-9 w-full items-center gap-2 border-b border-stone-100 py-1.5 text-left text-stone-700 transition hover:border-stone-300 hover:text-lima-800" data-food="${escapeHtml(item.name)}"><span class="min-w-0 flex-1 truncate text-sm tracking-wide">${escapeHtml(item.name)}</span>${showStatus ? statusBadge(item.availabilityType) : ""}</button></li>`,
		)
		.join("");
};
