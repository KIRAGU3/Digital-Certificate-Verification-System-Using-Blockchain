import React from 'react';
import { Container, Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { EmojiEvents, Leaderboard as LeaderboardIcon } from '@mui/icons-material';
import RewardsDashboard from '../components/RewardsDashboard';
import Leaderboard from '../components/Leaderboard';

const RewardsPage = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Rewards & Achievements
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Earn reward points and unlock exclusive NFT badges by issuing certificates.
          Compete with institutions globally on the leaderboard.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Tab
            icon={<EmojiEvents />}
            label="My Rewards"
            iconPosition="start"
          />
          <Tab
            icon={<LeaderboardIcon />}
            label="Leaderboard"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && <RewardsDashboard />}
        {activeTab === 1 && <Leaderboard />}
      </Box>
    </Container>
  );
};

export default RewardsPage;
