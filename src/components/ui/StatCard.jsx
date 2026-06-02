export default function StatCard({ label, value, detail, accent = "green" }) {
  const accents = {
    green: "border-[#dce8df] bg-white dark:border-[#222] dark:bg-[#0a0a0a]",
    orange: "border-[#dce8df] bg-white dark:border-[#222] dark:bg-[#0a0a0a]",
    yellow: "border-[#dce8df] bg-white dark:border-[#222] dark:bg-[#0a0a0a]",
  };

  return (
    <article className={`rounded-lg border p-5 ${accents[accent] || accents.green}`}>
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#516657] dark:text-[#aaa]">{label}</span>
      <strong className="mt-3 block text-2xl font-semibold text-[#0f1f16] dark:text-white">{value}</strong>
      {detail ? <p className="mt-2 text-sm text-[#516657] dark:text-[#aaa]">{detail}</p> : null}
    </article>
  );
}
