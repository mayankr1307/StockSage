import { useAuth } from "../contexts/AuthContext";
import { withAuth } from "../components/withAuth";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface Prediction {
  id: string;
  symbol: string;
  predictedPrice: string;
  lastPrice: string;
  createdAt: string;
  interval: string;
  actualPrice?: string;
}

function History() {
  const router = useRouter();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchPredictions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/get-predictions?userId=${user.uid}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch predictions`);
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch predictions"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateActualPrices = async () => {
    if (!user || updating) return;

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/update-actual-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Failed to update actual prices"
        );
      }

      if (responseData.updatedCount > 0) {
        await fetchPredictions();
      }
    } catch (err) {
      console.error("Error updating actual prices:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update actual prices"
      );
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [user]);

  // Check for updates every 5 minutes if there are pending predictions
  useEffect(() => {
    if (!predictions.length) return;

    // Check if there are any pending predictions
    const hasPendingPredictions = predictions.some((p) => !p.actualPrice);

    if (!hasPendingPredictions) return;

    const intervalId = setInterval(updateActualPrices, 5 * 60 * 1000);

    // Initial check
    updateActualPrices();

    return () => clearInterval(intervalId);
  }, [predictions]);

  const calculateAccuracy = (predicted: string, actual: string) => {
    const predictedNum = parseFloat(predicted);
    const actualNum = parseFloat(actual);
    const percentageDiff = Math.abs(
      ((predictedNum - actualNum) / actualNum) * 100
    );
    return (100 - percentageDiff).toFixed(2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-purple-600 to-purple-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-purple-500 bg-opacity-20 hover:bg-opacity-30 text-white font-medium transition-all duration-200"
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
            <h1 className="text-xl font-bold text-white">Prediction History</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-purple-800">
              Your Past Predictions
            </h2>
            {updating && (
              <div className="flex items-center text-sm text-purple-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Updating prices...
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interval
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Price
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prediction
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.length === 0 ? (
                    <tr>
                      <td
                        className="px-6 py-4 text-sm text-gray-500"
                        colSpan={6}
                      >
                        No prediction history available yet.
                      </td>
                    </tr>
                  ) : (
                    predictions.map((prediction) => (
                      <tr key={prediction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(prediction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-800">
                          {prediction.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prediction.interval}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(prediction.lastPrice).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(prediction.predictedPrice).toFixed(2)}
                          <span
                            className={`ml-2 ${
                              parseFloat(prediction.predictedPrice) >
                              parseFloat(prediction.lastPrice)
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {parseFloat(prediction.predictedPrice) >
                            parseFloat(prediction.lastPrice)
                              ? "↑"
                              : "↓"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {prediction.actualPrice ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {calculateAccuracy(
                                prediction.predictedPrice,
                                prediction.actualPrice
                              )}
                              % Accuracy
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default withAuth(History);
