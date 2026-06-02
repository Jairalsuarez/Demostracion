export default function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined select-none leading-none ${className}`.trim()} aria-hidden="true">{name}</span>;
}
