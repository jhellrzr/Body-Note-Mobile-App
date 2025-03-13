import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { insertActivityLogSchema, type InsertActivityLog } from "@shared/schema";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
  id: number;
  date: string;
  steps?: number;
  activity: string;
  painLevel?: number;
  symptoms: string;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLog?: ActivityLog;
}

export function ActivityLogForm({ open, onOpenChange, editLog }: Props) {
  // Initialize with the local date
  const [date, setDate] = useState<Date>(
    editLog ? parseISO(editLog.date) : new Date()
  );
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to check for existing log on the selected date
  const { data: activityLogs } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs"],
    enabled: open && !editLog, // Only fetch when drawer is open and not editing
  });

  const form = useForm<InsertActivityLog>({
    resolver: zodResolver(insertActivityLogSchema),
    defaultValues: {
      date: editLog?.date || format(new Date(), 'yyyy-MM-dd'),
      steps: editLog?.steps,
      activity: editLog?.activity || "",
      painLevel: editLog?.painLevel,
      symptoms: editLog?.symptoms || "",
      notes: editLog?.notes || null
    },
  });

  // Effect to check for existing log when date changes
  useEffect(() => {
    if (!activityLogs || editLog) return; // Skip if we're editing an existing log

    const selectedDate = format(date, 'yyyy-MM-dd');
    const existingLog = activityLogs.find(log => log.date === selectedDate);

    if (existingLog) {
      // If there's an existing log for this date, populate the form with the existing data
      form.reset({
        date: existingLog.date,
        steps: existingLog.steps,
        activity: existingLog.activity,
        painLevel: existingLog.painLevel,
        symptoms: existingLog.symptoms,
        notes: existingLog.notes
      });
      toast({
        title: "Existing Log Found",
        description: "Loading existing log for this date."
      });
    }
  }, [date, activityLogs, editLog, form]);

  // Reset form when editLog changes
  useEffect(() => {
    if (editLog) {
      setDate(parseISO(editLog.date));
      form.reset({
        date: editLog.date,
        steps: editLog.steps,
        activity: editLog.activity,
        painLevel: editLog.painLevel,
        symptoms: editLog.symptoms,
        notes: editLog.notes
      });
    }
  }, [editLog, form]);

  // Handle drawer close
  const handleDrawerClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form to default values
      form.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        steps: undefined,
        activity: "",
        painLevel: undefined,
        symptoms: "",
        notes: null
      });
      setDate(new Date());
    }
    onOpenChange(isOpen);
  };

  async function onSubmit(data: InsertActivityLog) {
    try {
      const url = editLog 
        ? `/api/activity-logs/${editLog.id}`
        : "/api/activity-logs";

      const method = editLog ? "PUT" : "POST";

      // Format the date in local timezone
      const localDate = format(date, 'yyyy-MM-dd');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          date: localDate
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editLog ? 'update' : 'save'} activity log`);
      }

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });

      toast({
        title: "Success",
        description: `Activity log ${editLog ? 'updated' : 'saved'} successfully`
      });

      // Reset form and close drawer
      handleDrawerClose(false);
    } catch (error) {
      console.error("Failed to log activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editLog ? 'update' : 'save'} activity log`
      });
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleDrawerClose}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>{editLog ? 'Edit Activity Log' : 'Log Daily Activity'}</DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="p-3 border rounded-lg bg-background">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            if (newDate) {
                              setDate(newDate);
                              // Format the date in local timezone
                              field.onChange(format(newDate, 'yyyy-MM-dd'));
                            }
                          }}
                          disabled={false}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Steps</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of steps"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="What activities did you do?" 
                        {...field} 
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Level (0-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={5}
                        step={0.5}
                        placeholder="Pain level"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any symptoms or notes"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DrawerFooter className="px-4 border-t">
          <Button type="submit" className="w-full" onClick={form.handleSubmit(onSubmit)}>
            {editLog ? 'Update Activity Log' : 'Save Activity Log'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}