import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';
import TermsOfService from './pages/TermsOfService';
import BlogPage from './pages/BlogPage';
import VerifyCertificate from './pages/VerifyCertificate';
import Footer from './components/Footer';
import { ThemeProvider } from './theme/ThemeProvider';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { Web3Provider } from './contexts/Web3Context';
import CertificateIssuancePage from './pages/CertificateIssuancePage';
import RewardsPage from './pages/RewardsPage';

function App() {
  return (
    <ThemeProvider>
      <Web3Provider>
        <OnboardingProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verify" element={<VerifyCertificate />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/issue" element={<CertificateIssuancePage />} />
                <Route path="/rewards" element={<RewardsPage />} />
              </Routes>
              <Footer />
            </MainLayout>
          </Router>
        </OnboardingProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;
