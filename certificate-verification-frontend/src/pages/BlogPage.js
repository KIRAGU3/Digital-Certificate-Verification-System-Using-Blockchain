import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import {
  CalendarToday,
  Category
} from '@mui/icons-material';

const BlogPage = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();

  const featuredPost = {
    title: 'The Future of Certificate Verification: Blockchain Technology',
    excerpt: 'Discover how blockchain is revolutionizing the way we verify and validate certificates in the digital age.',
    image: '/blog/featured.jpg',
    author: 'John Smith',
    date: 'March 15, 2024',
    category: 'Technology',
    readTime: '5 min read'
  };

  const blogPosts = [
    {
      title: 'Enhancing Security in Digital Certificates',
      excerpt: 'Learn about the latest security measures in digital certificate verification.',
      image: '/blog/security.jpg',
      author: 'Sarah Johnson',
      date: 'March 10, 2024',
      category: 'Security',
      readTime: '4 min read'
    },
    {
      title: 'Blockchain in Education: A New Era',
      excerpt: 'How educational institutions are adopting blockchain for certificate management.',
      image: '/blog/education.jpg',
      author: 'Michael Chen',
      date: 'March 5, 2024',
      category: 'Education',
      readTime: '6 min read'
    },
    {
      title: 'The Impact of AI on Certificate Verification',
      excerpt: 'Exploring the role of artificial intelligence in modern certificate verification systems.',
      image: '/blog/ai.jpg',
      author: 'Emily Davis',
      date: 'February 28, 2024',
      category: 'AI',
      readTime: '7 min read'
    },
    {
      title: 'Building Trust in Digital Credentials',
      excerpt: 'Understanding the importance of trust in digital certificate verification.',
      image: '/blog/trust.jpg',
      author: 'David Wilson',
      date: 'February 20, 2024',
      category: 'Trust',
      readTime: '5 min read'
    }
  ];

  const categories = [
    'Technology',
    'Security',
    'Education',
    'AI',
    'Trust',
    'Blockchain'
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" gutterBottom>
          Blog & News
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
          Stay updated with the latest insights and developments in blockchain certificate verification
        </Typography>

        {/* Featured Post */}
        <Card sx={{ mb: 6, borderRadius: 2 }}>
          <CardActionArea>
            <Grid container>
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  height="400"
                  image={featuredPost.image}
                  alt={featuredPost.title}
                  sx={{ height: '100%', objectFit: 'cover' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Chip
                    label={featuredPost.category}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="h4" gutterBottom>
                    {featuredPost.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {featuredPost.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Avatar sx={{ mr: 2 }}>{featuredPost.author[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle2">{featuredPost.author}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">{featuredPost.date}</Typography>
                        <Typography variant="caption" sx={{ mx: 1 }}>•</Typography>
                        <Typography variant="caption">{featuredPost.readTime}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </CardActionArea>
        </Card>

        {/* Categories */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                variant="outlined"
                clickable
                icon={<Category sx={{ fontSize: 16 }} />}
              />
            ))}
          </Box>
        </Box>

        {/* Blog Posts Grid */}
        <Grid container spacing={4}>
          {blogPosts.map((post, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.image}
                    alt={post.title}
                  />
                  <CardContent>
                    <Chip
                      label={post.category}
                      color="primary"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {post.excerpt}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Avatar sx={{ mr: 2, width: 32, height: 32 }}>{post.author[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle2">{post.author}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                          <Typography variant="caption">{post.date}</Typography>
                          <Typography variant="caption" sx={{ mx: 1 }}>•</Typography>
                          <Typography variant="caption">{post.readTime}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BlogPage; 