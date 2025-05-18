export const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' }
];

interface StockQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
}

export async function searchStockSymbols(query: string): Promise<Array<{ symbol: string; name: string }>> {
  if (!query) return POPULAR_STOCKS;

  try {
    const response = await fetch(`/api/stock-search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error('Stock search request failed');
    }

    const data = await response.json();
    return data.map((quote: StockQuote) => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname || quote.symbol
    }));
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    return [];
  }
} 