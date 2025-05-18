import { useEffect, useState } from "react";
import { Card, Typography, Grid, Box, CircularProgress } from "@mui/material";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const StockNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        setNews(data.articles.slice(0, 6)); // Display top 6 news items
      } catch (err) {
        setError("Failed to load news");
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress style={{ color: "#1e40af" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          color: "#1e40af",
          fontWeight: 600,
          borderBottom: "2px solid #dbeafe",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        📰 Market News
      </Typography>
      <Grid container spacing={3}>
        {news.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                ":hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
            >
              <Box sx={{ display: "flex", p: 2 }}>
                {item.urlToImage && (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      flexShrink: 0,
                      borderRadius: 1,
                      overflow: "hidden",
                      mr: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${item.urlToImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "contrast(0.95) brightness(0.97)",
                      }}
                    />
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      color: "#1e40af",
                      fontWeight: 600,
                      fontSize: "1rem",
                      lineHeight: 1.4,
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  mt: "auto",
                  borderTop: "1px solid #f1f5f9",
                  p: 2,
                  pt: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  {new Date(item.publishedAt).toLocaleDateString()} •{" "}
                  {item.source.name}
                </Typography>
                <Typography variant="body2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Read more →
                  </a>
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StockNews;
