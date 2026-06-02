export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d8e2d7] px-5 py-8 text-center dark:border-white/10">
      <h3 className="text-lg font-semibold text-[#183325] dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#5b6d61] dark:text-white/65">{description}</p>
    </div>
  );
}
