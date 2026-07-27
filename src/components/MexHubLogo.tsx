/** Logo hub MEX — outline (mesmo desenho do app mobile). */
type MexHubLogoProps = {
  size?: number
  className?: string
}

export function MexHubLogo({ size = 16, className }: MexHubLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <line x1="512" y1="404" x2="512" y2="246" stroke="currentColor" strokeWidth="40" strokeLinecap="round" opacity="0.45" />
      <line x1="620" y1="512" x2="778" y2="512" stroke="currentColor" strokeWidth="40" strokeLinecap="round" opacity="0.45" />
      <line x1="512" y1="620" x2="512" y2="778" stroke="currentColor" strokeWidth="40" strokeLinecap="round" opacity="0.45" />
      <line x1="404" y1="512" x2="246" y2="512" stroke="currentColor" strokeWidth="40" strokeLinecap="round" opacity="0.45" />
      <line x1="592" y1="432" x2="726" y2="298" stroke="currentColor" strokeWidth="34" strokeLinecap="round" opacity="0.28" />
      <line x1="592" y1="592" x2="726" y2="726" stroke="currentColor" strokeWidth="34" strokeLinecap="round" opacity="0.28" />
      <line x1="432" y1="592" x2="298" y2="726" stroke="currentColor" strokeWidth="34" strokeLinecap="round" opacity="0.28" />
      <line x1="432" y1="432" x2="298" y2="298" stroke="currentColor" strokeWidth="34" strokeLinecap="round" opacity="0.28" />
      <circle cx="512" cy="512" r="108" stroke="currentColor" strokeWidth="52" fill="none" />
      <circle cx="512" cy="512" r="26" fill="currentColor" />
      <circle cx="512" cy="200" r="46" stroke="#F59E0B" strokeWidth="48" fill="none" />
      <circle cx="824" cy="512" r="46" stroke="#F59E0B" strokeWidth="48" fill="none" />
      <circle cx="512" cy="824" r="46" stroke="#F59E0B" strokeWidth="48" fill="none" />
      <circle cx="200" cy="512" r="46" stroke="#F59E0B" strokeWidth="48" fill="none" />
      <circle cx="268" cy="268" r="30" stroke="currentColor" strokeWidth="40" fill="none" opacity="0.65" />
      <circle cx="756" cy="268" r="30" stroke="currentColor" strokeWidth="40" fill="none" opacity="0.65" />
      <circle cx="756" cy="756" r="30" stroke="currentColor" strokeWidth="40" fill="none" opacity="0.65" />
      <circle cx="268" cy="756" r="30" stroke="currentColor" strokeWidth="40" fill="none" opacity="0.65" />
    </svg>
  )
}
