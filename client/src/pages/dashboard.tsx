import { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInjurySchema, type Injury } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query existing injuries
  const { data: injuries, isLoading } = useQuery<Injury[]>({
    queryKey: ["/api/injuries"],
    queryFn: async () => {
      const res = await fetch("/api/injuries");
      if (!res.ok) throw new Error("Failed to fetch injuries");
      return res.json();
    },
  });

  // Mutation for creating new injuries
  const createInjuryMutation = useMutation({
    mutationFn: async (data: Omit<Injury, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/injuries", data);
      return res.json();
    },
    onSuccess: (newInjury) => {
      queryClient.invalidateQueries({ queryKey: ["/api/injuries"] });
      toast({
        title: "Success",
        description: "Injury created successfully",
      });
      setIsDialogOpen(false);
      navigate(`/recovery/${newInjury.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create injury",
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertInjurySchema),
    defaultValues: {
      name: "",
      description: "",
      dateOfInjury: new Date().toISOString().split('T')[0],
      userId: user?.id,
      status: "active"
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // Convert the date string to a proper ISO date string
      const formattedData = {
        ...data,
        dateOfInjury: new Date(data.dateOfInjury).toISOString(),
      };
      createInjuryMutation.mutate(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to create injury. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recovery Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your recovery journey
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Injury
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Injury</DialogTitle>
              <DialogDescription>
                Enter the details of your injury to start tracking your recovery
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sprained Ankle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how the injury occurred..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfInjury"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Injury</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createInjuryMutation.isPending}
                >
                  {createInjuryMutation.isPending
                    ? "Creating..."
                    : "Create Injury Record"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>Loading injuries...</p>
        ) : injuries?.length === 0 ? (
          <p>No injuries recorded yet. Add your first injury to start tracking.</p>
        ) : (
          injuries?.map((injury) => (
            <Card key={injury.id} className="cursor-pointer hover:bg-accent/50" onClick={() => navigate(`/recovery/${injury.id}`)}>
              <CardHeader className="pb-4">
                <CardTitle>{injury.name}</CardTitle>
                <CardDescription>
                  Added on {new Date(injury.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Status: {injury.status}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}