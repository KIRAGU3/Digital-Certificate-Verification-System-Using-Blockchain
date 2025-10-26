import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack
} from '@mui/material';
import {
  EmojiEvents,
  Stars,
  Verified,
  TrendingUp,
  WorkspacePremium
} from '@mui/icons-material';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

const TIER_CONFIG = {
  BRONZE: { color: '#CD7F32', icon: '🥉', minCerts: 10 },
  SILVER: { color: '#C0C0C0', icon: '🥈', minCerts: 50 },
  GOLD: { color: '#FFD700', icon: '🥇', minCerts: 100 },
  PLATINUM: { color: '#E5E4E2', icon: '💎', minCerts: 250 },
  DIAMOND: { color: '#B9F2FF', icon: '💠', minCerts: 500 }
};

const RewardsDashboard = () => {
  const { account } = useWeb3();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (account) {
      fetchRewardStats();
    }
  }, [account]);

  const fetchRewardStats = async () => {
    if (!account) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/rewards/institutions/${account}/stats/`
      );
      setStats(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setStats({
          institution: {
            name: 'New Institution',
            wallet_address: account,
            total_certificates: 0,
            reward_points: 0,
            current_tier: null,
            next_milestone: 10,
            milestone_progress: 0
          },
          badges: [],
          milestones: [],
          recent_transactions: []
        });
      } else {
        setError('Failed to fetch reward statistics');
        console.error('Error fetching rewards:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <Alert severity="info">
        Please connect your wallet to view your rewards dashboard
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return null;
  }

  const { institution, badges, milestones, recent_transactions } = stats;
  const currentTierConfig = institution.current_tier ? TIER_CONFIG[institution.current_tier] : null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WorkspacePremium /> Rewards Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  Total Certificates
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {institution.total_certificates}
                </Typography>
                {currentTierConfig && (
                  <Chip
                    label={institution.current_tier}
                    icon={<Typography>{currentTierConfig.icon}</Typography>}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  Reward Points
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {institution.reward_points.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Stars />
                  <Typography variant="body2">
                    +10 per certificate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ color: 'white' }}>
                <Typography variant="h6" gutterBottom>
                  NFT Badges Earned
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {badges.length}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents />
                  <Typography variant="body2">
                    Achievement Unlocked
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {institution.next_milestone && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp /> Next Milestone
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {institution.total_certificates} / {institution.next_milestone} certificates
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={institution.milestone_progress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'primary.main',
                      borderRadius: 5
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {institution.milestone_progress}% complete
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {badges.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents /> NFT Badges
                </Typography>
                <List>
                  {badges.map((badge, index) => {
                    const tierConfig = TIER_CONFIG[badge.tier];
                    return (
                      <React.Fragment key={badge.token_id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: tierConfig?.color || 'primary.main' }}>
                              {tierConfig?.icon || '🏆'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {badge.tier} Badge
                                </Typography>
                                <Chip
                                  label={`#${badge.token_id}`}
                                  size="small"
                                  icon={<Verified fontSize="small" />}
                                />
                              </Box>
                            }
                            secondary={
                              <Stack spacing={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                  Earned at {badge.certificate_count} certificates
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {badge.transaction_hash.substring(0, 20)}...
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {recent_transactions.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {recent_transactions.map((tx, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={tx.description}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" color="success.main">
                                +{tx.points} points
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {badges.length === 0 && milestones.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <EmojiEvents sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Start Earning Rewards!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Issue certificates to earn reward points and unlock NFT badges at milestones
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RewardsDashboard;
