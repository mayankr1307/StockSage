import { useAuth } from "../contexts/AuthContext";
import { withAuth } from "../components/withAuth";
import { useRouter } from "next/router";

function History() {
  const router = useRouter();

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
            <div className="w-24"></div>{" "}
            {/* Adjusted spacer for better alignment */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6 text-purple-800 border-b pb-2 border-purple-100">
            Your Past Predictions
          </h2>

          {/* Sample prediction history table */}
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
                    Prediction
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                    No prediction history available yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(History);
