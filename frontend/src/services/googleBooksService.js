import axios from 'axios';

class GoogleBooksService {
  constructor() {
    this.baseURL = 'https://www.googleapis.com/books/v1/volumes';
    // Note: In production, you should use your Google Books API key
    // For development, we'll use the API without a key (limited requests)
    this.apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY || '';
  }

  async searchBooks(query, maxResults = 20) {
    try {
      const params = new URLSearchParams({
        q: query,
        maxResults: maxResults.toString(),
        printType: 'books'
      });

      // Add API key if available
      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await axios.get(`${this.baseURL}?${params.toString()}`);
      
      return this.formatBooks(response.data.items || []);
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  formatBooks(items) {
    return items.map(item => {
      const volumeInfo = item.volumeInfo || {};
      const imageLinks = volumeInfo.imageLinks || {};
      
      return {
        id: item.id,
        title: volumeInfo.title || 'Unknown Title',
        authors: volumeInfo.authors || ['Unknown Author'],
        description: volumeInfo.description || 'No description available',
        publishedDate: volumeInfo.publishedDate || 'Unknown',
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories || [],
        language: volumeInfo.language || 'en',
        isbn: this.extractISBN(volumeInfo.industryIdentifiers || []),
        thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || 'https://via.placeholder.com/150',
        previewLink: volumeInfo.previewLink || '',
        infoLink: volumeInfo.infoLink || '',
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0,
        publisher: volumeInfo.publisher || 'Unknown Publisher'
      };
    });
  }

  extractISBN(identifiers) {
    // Try to find ISBN-13 first, then ISBN-10
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    if (isbn13) return isbn13.identifier;
    
    const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
    if (isbn10) return isbn10.identifier;
    
    return '';
  }

  async getBookDetails(bookId) {
    try {
      const params = new URLSearchParams();
      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await axios.get(`${this.baseURL}/${bookId}?${params.toString()}`);
      return this.formatBooks([response.data])[0];
    } catch (error) {
      console.error('Error getting book details:', error);
      throw error;
    }
  }
}

export default new GoogleBooksService();
