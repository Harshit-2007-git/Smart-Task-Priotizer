import { TaskProvider } from "@/lib/task-context"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  )
}
