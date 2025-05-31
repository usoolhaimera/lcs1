import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Header, Footer } from "../../components";

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1333] via-[#2d1b4d] to-[#1a2a4f] text-white">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 gradient-text">
              User Profile
            </h1>

            <div className="glass-card p-8 rounded-2xl border border-purple-500/30">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {user?.name}
                  </h2>
                  <p className="text-white/60">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    Recently Viewed
                  </h3>
                  <p className="text-white/60">No laptops viewed yet</p>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    Favorites
                  </h3>
                  <p className="text-white/60">No favorites saved yet</p>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    Price Alerts
                  </h3>
                  <p className="text-white/60">No price alerts set</p>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                    Comparisons
                  </h3>
                  <p className="text-white/60">No comparisons saved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
