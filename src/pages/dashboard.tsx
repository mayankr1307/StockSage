import { useAuth } from "../contexts/AuthContext";
import { withAuth } from "../components/withAuth";
import { useRouter } from "next/router";
import StockNews from "../components/StockNews";

function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-0">
            <div className="flex items-center justify-center sm:justify-start">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide py-2">
                📈 Stock Prediction
              </h1>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-4 py-2 sm:py-0">
              <span className="text-sm sm:text-base text-blue-100 truncate max-w-[200px]">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-medium hover:bg-blue-400 transition-colors duration-200 whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-blue-800 border-b pb-2 border-blue-100">
              Market Overview
            </h2>
            {/* Add your stock prediction components here */}
            <div className="mb-6 sm:mb-8">
              <p className="text-gray-500">
                Stock prediction features coming soon...
              </p>
            </div>

            {/* News Section */}
            <StockNews />
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
