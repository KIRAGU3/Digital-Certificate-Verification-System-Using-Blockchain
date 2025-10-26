import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { EmojiEvents, WorkspacePremium } from '@mui/icons-material';
import axios from 'axios';

const TIER_CONFIG = {
  BRONZE: { color: '#CD7F32', icon: '🥉' },
  SILVER: { color: '#C0C0C0', icon: '🥈' },
  GOLD: { color: '#FFD700', icon: '🥇' },
  PLATINUM: { color: '#E5E4E2', icon: '💎' },
  DIAMOND: { color: '#B9F2FF', icon: '💠' }
};

const MEDAL_COLORS = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32'
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/rewards/leaderboard/?limit=20`);
      setLeaderboard(response.data);
    } catch (err) {
      setError('Failed to fetch leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

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

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEvents sx={{ color: 'primary.main' }} /> Global Leaderboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Top institutions by certificates issued
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Institution</strong></TableCell>
                <TableCell align="center"><strong>Certificates</strong></TableCell>
                <TableCell align="center"><strong>Points</strong></TableCell>
                <TableCell align="center"><strong>Tier</strong></TableCell>
                <TableCell align="center"><strong>Badges</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((entry) => {
                const tierConfig = entry.current_tier ? TIER_CONFIG[entry.current_tier] : null;
                const medalColor = MEDAL_COLORS[entry.rank];

                return (
                  <TableRow
                    key={entry.wallet_address}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      ...(entry.rank <= 3 && {
                        bgcolor: `${medalColor}10`
                      })
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {entry.rank <= 3 ? (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: medalColor,
                              fontWeight: 'bold'
                            }}
                          >
                            {entry.rank}
                          </Avatar>
                        ) : (
                          <Typography variant="h6" sx={{ width: 32, textAlign: 'center' }}>
                            {entry.rank}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {entry.institution_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {formatAddress(entry.wallet_address)}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {entry.total_certificates.toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {entry.reward_points.toLocaleString()}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {tierConfig ? (
                        <Chip
                          label={entry.current_tier}
                          icon={<Typography>{tierConfig.icon}</Typography>}
                          sx={{
                            bgcolor: `${tierConfig.color}20`,
                            color: tierConfig.color,
                            fontWeight: 'bold',
                            border: `1px solid ${tierConfig.color}`
                          }}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                        <WorkspacePremium sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {entry.badges_count}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {leaderboard.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No institutions on the leaderboard yet. Be the first!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
