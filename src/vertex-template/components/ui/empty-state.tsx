import type { ReactNode } from "react"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  )
}

