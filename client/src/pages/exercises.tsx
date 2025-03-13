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
  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  const { data: categories, isLoading: loadingCategories } = useQuery<ExerciseCategory[]>({
    queryKey: ["/api/exercise-categories"],
  });

  if (isLoading || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Group exercises by category
  const exercisesByCategory = exercises?.reduce((acc, exercise) => {
    const category = categories?.find(c => c.id === exercise.categoryId);
    if (category) {
      if (!acc[category.name]) {
        acc[category.name] = [];
      }
      acc[category.name].push({...exercise, category});
    }
    return acc;
  }, {} as Record<string, ExerciseWithCategory[]>);

  // Sort categories by orderIndex
  const sortedCategories = categories?.sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-x-4">
        <h1 className="text-4xl font-bold tracking-tight">Nightly Injury Prevention Routine</h1>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Log Workout
        </Button>
      </div>

      <div className="grid gap-6">
        {sortedCategories?.map((category) => (
          <Card key={category.id} className="bg-white rounded-lg shadow-sm">
            <CardHeader className="border-b bg-white">
              <CardTitle className="text-xl font-semibold">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {exercisesByCategory?.[category.name]?.map((exercise) => (
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
                            placeholder={(exercise.duration / 60).toString()}
                          />
                          <span className="text-sm text-gray-500">min</span>
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