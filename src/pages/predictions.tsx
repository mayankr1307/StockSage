import { useAuth } from "../contexts/AuthContext";
import { withAuth } from "../components/withAuth";
import { useRouter } from "next/router";

function Predictions() {
  const router = useRouter();

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
            <div className="max-w-xl">
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Stock Symbol
              </label>
              <input
                type="text"
                id="symbol"
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                Get Prediction
              </button>
            </div>

            {/* Prediction results will be shown here */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Prediction Results
              </h3>
              <p className="text-gray-500">
                Enter a stock symbol above to get predictions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(Predictions);
