import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';  // Ensure you have this file for CSS

const YOUTUBE_API_KEY = 'AIzaSyCQ7x-7p8lVReas7fem250odh08TBigdME';  // Replace with your YouTube API key

function App() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('relevance');
  const [pageToken, setPageToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [prevPageToken, setPrevPageToken] = useState(null);
  const [query, setQuery] = useState('new songs');

  useEffect(() => {
    fetchVideos();
  }, [sortOption, pageToken, query]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=10&order=${sortOption}&pageToken=${pageToken}`
      );

      const videoIds = response.data.items.map(video => video.id.videoId);
      const statsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${videoIds.join(',')}&part=statistics`
      );

      const videoDataWithStats = response.data.items.map((video, index) => ({
        ...video,
        statistics: statsResponse.data.items[index].statistics,
      }));

      setVideos(videoDataWithStats);
      setNextPageToken(response.data.nextPageToken);
      setPrevPageToken(response.data.prevPageToken);
      setLoading(false);
    } catch (err) {
      setError('Error fetching data from YouTube API');
      setLoading(false);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPageToken('');
    fetchVideos();
  };

  const handleNextPage = () => {
    if (nextPageToken) {
      setPageToken(nextPageToken);
    }
  };

  const handlePrevPage = () => {
    if (prevPageToken) {
      setPageToken(prevPageToken);
    }
  };

  return (
    <div className="App">
      <h1>YouTube Search</h1>

      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search for videos..."
          style={{ width: '300px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', marginLeft: '10px' }}>
          Search
        </button>
      </form>

      <div>
        <label>Sort by: </label>
        <select onChange={handleSortChange} value={sortOption}>
          <option value="relevance">Relevance</option>
          <option value="date">Date</option>
          <option value="viewCount">View Count</option>
          <option value="likeCount">Like Count</option>
          <option value="commentCount">Comment Count</option>
        </select>
      </div>

      {loading ? (
        <div className="spinner">
          <p>Loading...</p>
        </div>
      ) : (
        <table border="1" className="video-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Description</th>
              <th>Published Date</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id.videoId}>
                <td>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      className="thumbnail"
                    />
                  </a>
                </td>
                <td>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {video.snippet.title}
                  </a>
                </td>
                <td className="description">
                  {video.snippet.description}
                </td>
                <td>{new Date(video.snippet.publishedAt).toLocaleDateString()}</td>
                <td>{video.statistics?.viewCount || 'N/A'}</td>
                <td>{video.statistics?.likeCount || 'N/A'}</td>
                <td>{video.statistics?.commentCount || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={!prevPageToken}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={!nextPageToken}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
