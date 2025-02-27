import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, Palette, Thermometer, History, FileText } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Body Note",
    description: "Track and visualize your pain patterns over time with our simple tools.",
    icon: Camera,
    content: (
      <div className="space-y-4">
        <p>Body Note helps you:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Document pain through photos</li>
          <li>Mark specific pain areas and types</li>
          <li>Track changes over time</li>
          <li>Generate reports for medical consultations</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Take or Upload Photos",
    description: "Capture consistent images of affected areas for accurate tracking.",
    icon: Camera,
    content: (
      <div className="space-y-4">
        <p>Tips for good documentation:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use good lighting</li>
          <li>Keep a consistent distance and angle</li>
          <li>Center the affected area in frame</li>
          <li>Previous image overlay helps maintain consistency</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Pain Types",
    description: "Use color-coded markers to indicate different types of pain.",
    icon: Palette,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Sharp/Stabbing</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>Dull/Aching</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500" />
            <span>Burning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Tingling</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            <span>Throbbing</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Pain Intensity",
    description: "Indicate how severe the pain is using the intensity slider.",
    icon: Thermometer,
    content: (
      <div className="space-y-4">
        <p>The intensity scale ranges from 1 to 5:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>1 - Mild discomfort</li>
          <li>2 - Noticeable pain</li>
          <li>3 - Moderate pain</li>
          <li>4 - Severe pain</li>
          <li>5 - Extreme pain</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Track Progress",
    description: "Review your pain history and generate reports.",
    icon: History,
    content: (
      <div className="space-y-4">
        <p>In the Gallery view, you can:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>View all past entries chronologically</li>
          <li>Compare changes over time</li>
          <li>Export comprehensive PDF reports</li>
          <li>Share history with healthcare providers</li>
        </ul>
      </div>
    ),
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OnboardingTutorial({ open, onOpenChange }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <div className="absolute top-4 right-4 flex space-x-1">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full",
                index === currentStep ? "bg-primary" : "bg-gray-200"
              )}
            />
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-primary/10">
            <step.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <DialogTitle>{step.title}</DialogTitle>
            <DialogDescription>{step.description}</DialogDescription>
          </div>
        </div>

        <div className="mt-6">{step.content}</div>

        <DialogFooter className="mt-6">
          <Button onClick={handleNext}>
            {currentStep === TUTORIAL_STEPS.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
