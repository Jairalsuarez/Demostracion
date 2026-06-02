export default function ActivityFeed({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-lg border border-[#e4ece2] px-4 py-3 dark:border-white/10">
          <strong className="block text-sm font-semibold text-[#183325] dark:text-white">{item.title}</strong>
          <p className="mt-1 text-sm text-[#5b6d61] dark:text-white/68">{item.subtitle}</p>
        </article>
      ))}
    </div>
  );
}
