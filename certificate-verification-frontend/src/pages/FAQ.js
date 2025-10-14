import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();

  const faqItems = [
    {
      question: 'What is blockchain certificate verification?',
      answer: 'Blockchain certificate verification is a secure and tamper-proof method of validating digital certificates using blockchain technology. It ensures the authenticity and integrity of certificates by storing their information on a decentralized ledger.'
    },
    {
      question: 'How do I verify a certificate?',
      answer: 'To verify a certificate, simply enter the certificate ID or upload the certificate file on our verification page. Our system will check the blockchain and provide you with the verification results instantly.'
    },
    {
      question: 'Is my certificate information secure?',
      answer: 'Yes, we use advanced encryption and blockchain technology to ensure your certificate information remains secure. The data is stored on a decentralized network, making it virtually impossible to tamper with.'
    },
    {
      question: 'What types of certificates can be verified?',
      answer: 'Our platform supports various types of certificates including educational certificates, professional certifications, training certificates, and more. Contact us if you need to verify a specific type of certificate.'
    },
    {
      question: 'How long does the verification process take?',
      answer: 'The verification process is typically instant. Once you submit the certificate for verification, our system will check the blockchain and provide results immediately.'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Frequently Asked Questions
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }} align="center">
          Find answers to common questions about our blockchain certificate verification service
        </Typography>

        {faqItems.map((item, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6">{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};

export default FAQ; 