// View helpers that turn a raw kohvisort DB row into template-friendly fields,
// keeping logic out of the Nunjucks markup.

export function roastImage(rostitase) {
  const r = (rostitase || "").toLowerCase();
  if (r.includes("tume")) return "dark-roast";
  if (r.includes("keskmine-hele")) return "light-roast";
  if (r.includes("keskmine")) return "medium-roast";
  if (r.includes("hele")) return "light-roast";
  return "medium-roast";
}

export function decorate(coffee) {
  return {
    ...coffee,
    img: roastImage(coffee.rostitase),
    origin: (coffee.paritolu || "").split(",")[0].trim(),
    priceFmt: Number(coffee.hind).toFixed(2),
    notes:
      typeof coffee.maitseprofiil === "string"
        ? coffee.maitseprofiil.split(",").map((s) => s.trim()).filter(Boolean)
        : coffee.maitseprofiil || []
  };
}
