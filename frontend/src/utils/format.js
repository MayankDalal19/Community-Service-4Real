const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const moneyFmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatDate = (v) => (v ? dateFmt.format(new Date(v)) : "-");
export const formatMoney = (v) => moneyFmt.format(Number(v) || 0);
// <input type="date"> needs YYYY-MM-DD
export const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");
export const today = () => new Date().toISOString().slice(0, 10);
