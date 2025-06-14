// 10.js - Home section content
const homeData = {
  newsFeed: [
    {
      id: 1,
      title: "New Movie Release: The Last Stand",
      content: "Check out the latest action-packed movie now available in our Movies section!",
      image: "https://via.placeholder.com/600x400/2b3c57/ffffff?text=New+Release",
      date: "2023-11-15",
      type: "announcement"
    },
    {
      id: 2,
      title: "Season 3 of Shadow Hunters Now Available",
      content: "All episodes of the popular series are now streaming in our Series section.",
      image: "https://via.placeholder.com/600x400/4a6fa5/ffffff?text=New+Season",
      date: "2023-11-10",
      type: "update"
    },
    {
      id: 3,
      title: "Weekly Movie Recommendation",
      content: "This week we recommend 'The Dark Knight' - a masterpiece of superhero cinema.",
      image: "https://via.placeholder.com/600x400/5a9bd8/ffffff?text=Recommendation",
      date: "2023-11-05",
      type: "recommendation"
    }
  ],
  featuredContent: [
    {
      type: "movie",
      id: 0, // Index in movieData array
      title: "Featured Movie of the Week"
    },
    {
      type: "series",
      id: 0, // Index in seriesData array
      title: "Featured Series of the Month"
    }
  ]
};