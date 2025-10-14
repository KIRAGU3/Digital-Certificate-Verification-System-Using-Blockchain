import React, { createContext, useContext, useState, useEffect } from 'react';

const OnboardingContext = createContext();

const ONBOARDING_STORAGE_KEY = 'certificate_onboarding_state';

export const OnboardingProvider = ({ children }) => {
    const [onboardingState, setOnboardingState] = useState(() => {
        const savedState = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        return savedState ? JSON.parse(savedState) : {
            hasSeenHomeWelcome: false,
            completedSteps: [],
            tourEnabled: true,
            helpTooltipsEnabled: true,
            lastVisitedRoute: null,
        };
    });

    useEffect(() => {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(onboardingState));
    }, [onboardingState]);

    const markStepComplete = (stepId) => {
        setOnboardingState(prev => ({
            ...prev,
            completedSteps: [...new Set([...prev.completedSteps, stepId])],
        }));
    };

    const setHomeWelcomeSeen = () => {
        setOnboardingState(prev => ({
            ...prev,
            hasSeenHomeWelcome: true,
        }));
    };

    const toggleTour = () => {
        setOnboardingState(prev => ({
            ...prev,
            tourEnabled: !prev.tourEnabled,
        }));
    };

    const toggleHelpTooltips = () => {
        setOnboardingState(prev => ({
            ...prev,
            helpTooltipsEnabled: !prev.helpTooltipsEnabled,
        }));
    };

    const updateLastVisitedRoute = (route) => {
        setOnboardingState(prev => ({
            ...prev,
            lastVisitedRoute: route,
        }));
    };

    const resetOnboarding = () => {
        setOnboardingState({
            isFirstVisit: true,
            completedSteps: [],
            hasSeenWelcome: false,
            tourEnabled: true,
            helpTooltipsEnabled: true,
            lastVisitedRoute: null,
        });
    };

    const value = {
        ...onboardingState,
        markStepComplete,
        setHomeWelcomeSeen,
        toggleTour,
        toggleHelpTooltips,
        updateLastVisitedRoute,
        resetOnboarding,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};

export default OnboardingContext;