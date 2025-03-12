import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { type Exercise, type ExerciseCategory } from "@shared/schema";

interface ExerciseWithCategory extends Exercise {
  category: ExerciseCategory;
}

export default function Exercises() {
  const { data: exercises, isLoading } = useQuery<ExerciseWithCategory[]>({
    queryKey: ["/api/exercises"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Group exercises by category
  const exercisesByCategory = exercises?.reduce((acc, exercise) => {
    const categoryName = exercise.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(exercise);
    return acc;
  }, {} as Record<string, ExerciseWithCategory[]>);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-x-4">
        <h1 className="text-4xl font-bold tracking-tight">Exercise Tracking</h1>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Log Workout
        </Button>
      </div>

      <div className="grid gap-6">
        {exercisesByCategory && Object.entries(exercisesByCategory).map(([category, exercises]) => (
          <Card key={category} className="bg-white rounded-lg shadow-sm">
            <CardHeader className="border-b bg-white">
              <CardTitle className="text-xl font-semibold">{category}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="py-4 first:pt-4 last:pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Checkbox />
                        <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                      </div>
                      {exercise.description && (
                        <p className="text-sm text-gray-500 ml-7">{exercise.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {exercise.sets && (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-16 text-center" 
                            placeholder={exercise.sets.toString()}
                          />
                          <span className="text-sm text-gray-500">sets</span>
                        </div>
                      )}
                      {exercise.reps && (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-16 text-center" 
                            placeholder={exercise.reps.toString()}
                          />
                          <span className="text-sm text-gray-500">reps</span>
                        </div>
                      )}
                      {exercise.duration && (
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-16 text-center" 
                            placeholder={exercise.duration.toString()}
                          />
                          <span className="text-sm text-gray-500">sec</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}