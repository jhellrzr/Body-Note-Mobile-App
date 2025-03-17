import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityLogForm({ open, onOpenChange }: Props) {
  const [date, setDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<InsertActivityLog>({
    resolver: zodResolver(insertActivityLogSchema),
    defaultValues: {
      date: date,
      steps: undefined,
      activity: "",
      painLevel: undefined,
      symptoms: ""
    },
  });

  // Reset form when drawer is opened
  useEffect(() => {
    if (open) {
      const today = new Date();
      setDate(today);
      form.reset({
        date: today,
        steps: undefined,
        activity: "",
        painLevel: undefined,
        symptoms: ""
      });
    }
  }, [open, form]);

  async function onSubmit(data: InsertActivityLog) {
    try {
      const formData = {
        ...data,
        date
      };

      console.log('Submitting form data:', formData);

      const response = await fetch("/api/activity-logs", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.message || 'Failed to save activity log');
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/activity-logs"] });

      toast({
        title: "Success",
        description: "Activity log saved successfully"
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to log activity:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save activity log"
      });
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Log Daily Activity</DrawerTitle>
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
                              field.onChange(newDate);
                            }
                          }}
                          initialFocus
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
            Save Activity Log
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