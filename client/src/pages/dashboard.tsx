import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { type ActivityLog } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: activityLogs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Sort logs by date in ascending order for the chart
  const sortedLogs = [...(activityLogs || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedLogs.map(log => ({
    date: format(new Date(log.date), 'MMM d'),
    painLevel: log.painLevel || 0,
    steps: log.steps || 0
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recovery Dashboard</h1>
      </div>

      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Pain Level Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="painLevel" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Activity Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px] font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Steps</TableHead>
                <TableHead className="font-semibold">Activity</TableHead>
                <TableHead className="font-semibold">Pain Level</TableHead>
                <TableHead className="font-semibold">Symptoms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {format(new Date(log.date), 'MMM d')}
                  </TableCell>
                  <TableCell>{log.steps?.toLocaleString() ?? '-'}</TableCell>
                  <TableCell>{log.activity || '-'}</TableCell>
                  <TableCell>{log.painLevel?.toFixed(1) ?? '-'}</TableCell>
                  <TableCell>{log.symptoms || 'No symptoms'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}