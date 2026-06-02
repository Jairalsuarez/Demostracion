export default function SectionBlock({ title, description, action, children }) {
  return (
    <section className="space-y-4 rounded-lg border border-[#dce8df] bg-white p-5 shadow-[0_12px_34px_rgba(47,168,79,0.04)] dark:border-[#222] dark:bg-[#0a0a0a]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0f1f16] dark:text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[#516657] dark:text-[#aaa]">{description}</p> : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
