import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Users, Briefcase, Star, ArrowRight, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Users,
    title: "Hire Skilled College Students",
    description: "Access student profiles created on Workzy. See only details students provide themselves.",
    image: "https://images.unsplash.com/photo-1596784326488-23581279e33d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBmcmVlbGFuY2VyfGVufDF8fHx8MTc1ODUwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Briefcase,
    title: "Simple & Fast",
    description: "Post your job, review real proposals, and hire the right student when you are ready.",
    image: "https://images.unsplash.com/photo-1670851050245-d861fd433d06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NTg0NDYwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    icon: Star,
    title: "Direct UPI Payments",
    description: "Pay students quickly with a simple Razorpay-backed direct payment workflow. Workzy starts with 0% platform commission.",
    image: "https://images.unsplash.com/photo-1716703432455-3045789de738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1ODUyNzUwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto bg-card shadow-xl border-0">
        <div className="relative overflow-hidden">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="p-8 text-center"
          >
            <div className="mb-8">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h2 className="text-2xl mb-4 text-foreground">
              {slide.title}
            </h2>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {slide.description}
            </p>

            <div className="flex justify-center space-x-2 mb-8">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button onClick={onComplete} variant="ghost" className="text-muted-foreground">
                Skip
              </Button>

              <Button onClick={nextSlide} className="flex items-center gap-2">
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </Card>
    </div>
  );
}
