"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, AlertTriangle, Activity, Clock } from "lucide-react"

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: "healthy" | "warning" | "critical"
  history: number[]
}

interface MaintenanceTask {
  id: string
  name: string
  description: string
  frequency: string
  lastPerformed: string
  nextDue: string
  priority: "low" | "medium" | "high"
}

export const MaintenanceStep: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = React.useState<SystemMetric[]>([
    {
      name: "Transaction Throughput",
      value: 156,
      unit: "tx/min",
      status: "healthy",
      history: [120, 132, 145, 138, 156],
    },
    {
      name: "Average Block Time",
      value: 2.3,
      unit: "seconds",
      status: "healthy",
      history: [2.5, 2.4, 2.3, 2.3, 2.3],
    },
    {
      name: "API Response Time",
      value: 187,
      unit: "ms",
      status: "healthy",
      history: [210, 205, 195, 190, 187],
    },
    {
      name: "Memory Usage",
      value: 78,
      unit: "%",
      status: "warning",
      history: [65, 68, 72, 75, 78],
    },
    {
      name: "Disk Space",
      value: 82,
      unit: "%",
      status: "warning",
      history: [70, 73, 76, 79, 82],
    },
  ])

  const [maintenanceTasks, setMaintenanceTasks] = React.useState<MaintenanceTask[]>([
    {
      id: "backup",
      name: "Database Backup",
      description: "Full backup of all transaction data and user information",
      frequency: "Daily",
      lastPerformed: "2023-06-14",
      nextDue: "2023-06-15",
      priority: "high",
    },
    {
      id: "update",
      name: "Security Patches",
      description: "Apply latest security patches to all systems",
      frequency: "Weekly",
      lastPerformed: "2023-06-10",
      nextDue: "2023-06-17",
      priority: "high",
    },
    {
      id: "optimize",
      name: "Database Optimization",
      description: "Optimize database queries and indexes",
      frequency: "Weekly",
      lastPerformed: "2023-06-12",
      nextDue: "2023-06-19",
      priority: "medium",
    },
    {
      id: "logs",
      name: "Log Rotation",
      description: "Rotate and archive system logs",
      frequency: "Weekly",
      lastPerformed: "2023-06-13",
      nextDue: "2023-06-20",
      priority: "low",
    },
  ])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Maintenance & Monitoring
        </CardTitle>
        <CardDescription>System health monitoring and maintenance schedule</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monitoring">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Metrics
                </h3>
                <span className="text-sm text-gray-500">Last updated: Just now</span>
              </div>

              <div className="space-y-3">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{metric.name}</h4>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          metric.status === "healthy"
                            ? "bg-green-100 text-green-800"
                            : metric.status === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-sm text-gray-500">{metric.unit}</span>
                    </div>

                    <div className="mt-2 flex items-end gap-1 h-10">
                      {metric.history.map((value, i) => (
                        <div
                          key={i}
                          className={`w-full rounded-sm ${
                            metric.status === "healthy"
                              ? "bg-green-500"
                              : metric.status === "warning"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            height: `${(value / Math.max(...metric.history)) * 100}%`,
                            opacity: 0.5 + ((i + 1) / metric.history.length) * 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="font-medium">System Alerts</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Memory usage approaching threshold (78%)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Disk space usage approaching threshold (82%)
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduled Tasks
                </h3>
                <span className="text-sm text-gray-500">4 upcoming tasks</span>
              </div>

              <div className="space-y-3">
                {maintenanceTasks.map((task) => (
                  <div key={task.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{task.name}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <div>Frequency: {task.frequency}</div>
                      <div>Last performed: {task.lastPerformed}</div>
                      <div>Next due: {task.nextDue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Maintenance Best Practices</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Regularly update security patches and dependencies</li>
                <li>Monitor system resources and scale as needed</li>
                <li>Implement automated backups with off-site storage</li>
                <li>Conduct regular security audits</li>
                <li>Document all maintenance procedures for team reference</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default MaintenanceStep
