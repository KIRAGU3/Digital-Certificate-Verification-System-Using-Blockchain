import { useState, useEffect } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';

const useTour = (steps, tourId) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const { completedSteps, markStepComplete, tourEnabled } = useOnboarding();

    useEffect(() => {
        // Check if this tour should start automatically
        if (tourEnabled && !completedSteps.includes(tourId)) {
            setIsOpen(true);
        }
    }, [tourEnabled, completedSteps, tourId]);

    const closeTour = () => {
        setIsOpen(false);
        markStepComplete(tourId);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            closeTour();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        closeTour();
    };

    return {
        isOpen,
        currentStep,
        setIsOpen,
        handleNext,
        handlePrev,
        handleSkip,
    };
};

export default useTour;