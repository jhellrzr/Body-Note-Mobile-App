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
      <h1 className="text-3xl font-bold">Recovery Dashboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Pain Level</TableHead>
                <TableHead>Symptoms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{log.steps?.toLocaleString()}</TableCell>
                  <TableCell>{log.activity}</TableCell>
                  <TableCell>{log.painLevel}</TableCell>
                  <TableCell>{log.symptoms}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
