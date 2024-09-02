export const getAvailableInMonth = function(data: any, month: string) {
    const availableInMonth: any = {
        vegetables: [],
        fruits: [],
        herbs: [],
        salads: []
    };

    for (const category in data.availability) {
        for (const item in data.availability[category]) {
            if (data.availability[category][item].months.includes(month)) {
                if(category === "vegetables") {
                    availableInMonth[category].push({"name": item, "details": data.availability[category][item]});
                }
                else {
                    availableInMonth[category].push(item);
                }
            }
        }
    }

    return availableInMonth;
}

