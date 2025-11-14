const addGte = (date: string) => {
	if (!date) {
		return {};
	}
	return { $gte: new Date(date) };
};

const addLte = (date: string) => {
	if (!date) {
		return {};
	}
	return { $lte: new Date(date) };
};

const buildDateFilter = (startDate: string, endDate: string) => {
	if (!startDate && !endDate) {
		return {};
	}
	return {
		createdAt: {
			...addGte(startDate),
			...addLte(endDate),
		},
	};
};
export default buildDateFilter;
