import { useAuth } from "../contexts/AuthContext";
import { withAuth } from "../components/withAuth";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";
import { searchStockSymbols, POPULAR_STOCKS } from "../utils/stockUtils";
import debounce from "lodash/debounce";

const INTERVALS = [
  { value: "1min", label: "1 Minute" },
  { value: "5min", label: "5 Minutes" },
  { value: "15min", label: "15 Minutes" },
  { value: "30min", label: "30 Minutes" },
  { value: "45min", label: "45 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "2h", label: "2 Hours" },
  { value: "4h", label: "4 Hours" },
  { value: "1day", label: "1 Day" },
  { value: "1week", label: "1 Week" },
  { value: "1month", label: "1 Month" },
];

interface RSIData {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange: string;
    type: string;
  };
  values: Array<{
    datetime: string;
    rsi: string;
  }>;
  status: string;
  timeSeries: Array<{
    datetime: string;
    close: string;
    high: string;
    low: string;
    open: string;
  }>;
  prediction: {
    nextDay: string;
    lastPrice: string;
  };
}

function Predictions() {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [interval, setInterval] = useState("1day");
  const [suggestions, setSuggestions] =
    useState<Array<{ symbol: string; name: string }>>(POPULAR_STOCKS);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsiData, setRsiData] = useState<RSIData | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    // Initialize with popular stocks
    setSuggestions(POPULAR_STOCKS);
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setSearchLoading(false);
        return;
      }
      try {
        const results = await searchStockSymbols(query);
        setSuggestions(results);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymbol(value);
    setShowSuggestions(true);
    setSearchLoading(true);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion: {
    symbol: string;
    name: string;
  }) => {
    setSymbol(suggestion.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getPrediction = async () => {
    if (!symbol) {
      setError("Please enter a stock symbol");
      return;
    }

    setLoading(true);
    setError(null);
    setRsiData(null);

    try {
      const response = await fetch(
        `/api/stock-data?symbol=${symbol}&interval=${interval}`
      );
      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch stock data");
      }

      setRsiData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prediction"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-white font-medium transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Dashboard</span>
            </button>
            <h1 className="text-xl font-bold text-white">Stock Predictions</h1>
            <div className="w-24"></div>{" "}
            {/* Adjusted spacer for better alignment */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6 text-blue-800 border-b pb-2 border-blue-100">
            Get Stock Predictions
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={searchRef}>
                <label
                  htmlFor="symbol"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stock Symbol
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="symbol"
                    value={symbol}
                    onChange={handleSymbolChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Enter stock symbol or company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-blue-900 font-medium placeholder-gray-400"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-600">
                        {symbol ? "Search Results" : "Popular Stocks"}
                      </p>
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-100 last:border-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <span className="font-medium text-blue-800">
                          {suggestion.symbol}
                        </span>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="text-gray-700">{suggestion.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="interval"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Time Interval
                </label>
                <select
                  id="interval"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-blue-900 font-medium"
                >
                  {INTERVALS.map((int) => (
                    <option key={int.value} value={int.value}>
                      {int.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={getPrediction}
                disabled={loading}
                className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  "Get Prediction"
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {rsiData && (
              <div className="mt-8 space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">
                    {rsiData.meta.symbol} - {rsiData.meta.type} (
                    {rsiData.meta.exchange})
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Currency</p>
                      <p className="text-lg font-medium text-blue-800">
                        {rsiData.meta.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Interval</p>
                      <p className="text-lg font-medium text-blue-800">
                        {rsiData.meta.interval}
                      </p>
                    </div>
                  </div>

                  {/* Price Prediction Section */}
                  <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-100">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-blue-900">
                        Price Prediction
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">
                          Last Closing Price
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${rsiData.prediction.lastPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Predicted Next Close
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${rsiData.prediction.nextDay}
                        </p>
                        <p className="text-sm text-blue-500 mt-1">
                          {Number(rsiData.prediction.nextDay) >
                          Number(rsiData.prediction.lastPrice)
                            ? "↗ Expected to rise"
                            : "↘ Expected to fall"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Note:</span> This
                        prediction is based on historical data and technical
                        analysis. Market conditions can change rapidly and past
                        performance does not guarantee future results.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Understanding RSI Signals
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                        <span className="text-red-600 text-sm">⚠️</span>
                      </div>
                      <div>
                        <p className="font-medium text-red-600">
                          Overbought (RSI &gt; 70)
                        </p>
                        <p className="text-gray-600 text-sm">
                          The asset may be overvalued and could be due for a
                          price correction (potential sell signal).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                        <span className="text-green-600 text-sm">💡</span>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">
                          Oversold (RSI &lt; 30)
                        </p>
                        <p className="text-gray-600 text-sm">
                          The asset may be undervalued and could be due for a
                          price increase (potential buy signal).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                        <span className="text-gray-600 text-sm">ℹ️</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">
                          Neutral (RSI between 30-70)
                        </p>
                        <p className="text-gray-600 text-sm">
                          The asset is trading in a normal range without extreme
                          buying or selling pressure.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Note:</span> RSI signals
                      should not be used in isolation. Consider other technical
                      indicators, fundamental analysis, and market conditions
                      before making investment decisions.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900">
                      Historical Data
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Close Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Change
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            RSI Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Signal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rsiData.values.slice(0, 10).map((value, index) => {
                          const rsiValue = Number(value.rsi);
                          const currentPrice = Number(
                            rsiData.timeSeries[index].close
                          );
                          const previousPrice =
                            index < rsiData.timeSeries.length - 1
                              ? Number(rsiData.timeSeries[index + 1].close)
                              : currentPrice;
                          const priceChange =
                            ((currentPrice - previousPrice) / previousPrice) *
                            100;

                          let signal = "Neutral";
                          let signalColor = "text-gray-600";

                          if (rsiValue > 70) {
                            signal = "Overbought";
                            signalColor = "text-red-600";
                          } else if (rsiValue < 30) {
                            signal = "Oversold";
                            signalColor = "text-green-600";
                          }

                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(value.datetime)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                $
                                {Number(
                                  rsiData.timeSeries[index].close
                                ).toFixed(2)}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                  priceChange >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {priceChange >= 0 ? "↑" : "↓"}{" "}
                                {Math.abs(priceChange).toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                                {rsiValue.toFixed(2)}
                              </td>
                              <td
                                className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${signalColor}`}
                              >
                                {signal}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(Predictions);
