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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recovery Dashboard</h1>
      </div>

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