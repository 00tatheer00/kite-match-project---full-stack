// Small, low-key developer credit (website footer + admin sidebar).
export const DEVELOPER = {
  name: 'Tech4Edges',
  phoneDisplay: '0327 5792600',
  phoneTel: '+923275792600',
};

export default function DeveloperCredit({ className = '' }) {
  return (
    <p className={`text-[11px] leading-snug ${className}`}>
      Designed &amp; developed by <span className="font-semibold">{DEVELOPER.name}</span>
      {' · '}
      <a href={`tel:${DEVELOPER.phoneTel}`} className="hover:underline" aria-label={`Call ${DEVELOPER.name}`}>
        {DEVELOPER.phoneDisplay}
      </a>
    </p>
  );
}
