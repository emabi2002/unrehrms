export default function PayrollLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use the global top nav instead of local navigation
  return <>{children}</>
}
