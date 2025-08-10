import React from 'react';

function DetailedAnalysisModal({ isOpen, onClose, analysisData }) {
  if (!isOpen || !analysisData) return null;

  // Safely destructure with fallback values
  const BasicAnalysis = analysisData.BasicAnalysis || {};
  const DetailedStats = analysisData.DetailedStats || {};
  const ReadingGoalProgress = analysisData.ReadingGoalProgress || {};

  // Provide default values for all required fields
  const safeBasicAnalysis = {
    completionRate: BasicAnalysis.completionRate || 0,
    readingPattern: BasicAnalysis.readingPattern || "Building your reading foundation",
    recommendations: BasicAnalysis.recommendations || ["Start with books that interest you"],
    readingSpeed: BasicAnalysis.readingSpeed || "Add more books to track your pace",
    favoriteGenres: BasicAnalysis.favoriteGenres || ["Discovering preferences"],
    readingStreak: BasicAnalysis.readingStreak || 0,
    motivationalInsight: BasicAnalysis.motivationalInsight || "Every book you read makes you smarter!"
  };

  const safeDetailedStats = {
    TotalBooks: DetailedStats.TotalBooks || 0,
    BooksThisYear: DetailedStats.BooksThisYear || 0,
    BooksThisMonth: DetailedStats.BooksThisMonth || 0,
    AverageReadingPace: DetailedStats.AverageReadingPace || 0,
    FavoritePercentage: DetailedStats.FavoritePercentage || 0
  };

  const safeReadingGoalProgress = {
    MonthlyProgress: ReadingGoalProgress.MonthlyProgress || 0,
    YearlyProgress: ReadingGoalProgress.YearlyProgress || 0,
    Suggestions: ReadingGoalProgress.Suggestions || ["Start your reading journey today!"]
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-4xl max-h-[90vh] overflow-y-auto w-full bg-black/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-glass-primary">🤖 Detailed AI Reading Analysis</h2>
          <button
            onClick={onClose}
            className="text-glass-secondary hover:text-glass-primary transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {/* Reading Statistics */}
          <section>
            <h3 className="text-2xl font-semibold text-glass-primary mb-4 flex items-center">
              📊 Reading Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{safeDetailedStats.TotalBooks}</div>
                <div className="text-glass-secondary text-sm">Total Books</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{safeDetailedStats.BooksThisYear}</div>
                <div className="text-glass-secondary text-sm">Books This Year</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{safeDetailedStats.BooksThisMonth}</div>
                <div className="text-glass-secondary text-sm">Books This Month</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{safeDetailedStats.AverageReadingPace}</div>
                <div className="text-glass-secondary text-sm">Books/Month</div>
              </div>
            </div>
          </section>

          {/* Reading Patterns */}
          <section>
            <h3 className="text-2xl font-semibold text-glass-primary mb-4 flex items-center">
              🔍 Reading Patterns & Insights
            </h3>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-glass-primary mb-3">📈 Completion Analysis</h4>
                  <p className="text-glass-secondary mb-2">
                    <strong>Completion Rate:</strong> {safeBasicAnalysis.completionRate}%
                  </p>
                  <p className="text-glass-secondary mb-2">
                    <strong>Favorite Rate:</strong> {safeDetailedStats.FavoritePercentage}%
                  </p>
                  <p className="text-glass-secondary">
                    <strong>Reading Pattern:</strong> {safeBasicAnalysis.readingPattern}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-glass-primary mb-3">⚡ Reading Speed</h4>
                  <p className="text-glass-secondary mb-4">{safeBasicAnalysis.readingSpeed}</p>
                  
                  {safeBasicAnalysis.favoriteGenres && safeBasicAnalysis.favoriteGenres.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold text-glass-primary mb-3">❤️ Favorite Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {safeBasicAnalysis.favoriteGenres.map((genre, index) => (
                          <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* AI Recommendations */}
          <section>
            <h3 className="text-2xl font-semibold text-glass-primary mb-4 flex items-center">
              💡 AI Recommendations
            </h3>
            <div className="space-y-4">
              {safeBasicAnalysis.recommendations && safeBasicAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-emerald-400 mr-3 mt-1">•</span>
                    <p className="text-emerald-200">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Goal Progress */}
          <section>
            <h3 className="text-2xl font-semibold text-glass-primary mb-4 flex items-center">
              🎯 Goal Progress & Suggestions
            </h3>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-glass-primary mb-3">Progress This Period</h4>
                  <p className="text-glass-secondary mb-2">
                    <strong>Monthly Progress:</strong> {safeReadingGoalProgress.MonthlyProgress} books
                  </p>
                  <p className="text-glass-secondary">
                    <strong>Yearly Progress:</strong> {safeReadingGoalProgress.YearlyProgress} books
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-glass-primary mb-3">Smart Suggestions</h4>
                  <div className="space-y-2">
                    {safeReadingGoalProgress.Suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">→</span>
                        <p className="text-glass-secondary text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Motivational Section */}
          {BasicAnalysis.motivationalInsight && (
            <section>
              <h3 className="text-2xl font-semibold text-glass-primary mb-4 flex items-center">
                🌟 Motivation & Encouragement
              </h3>
              <div className="bg-gradient-to-r from-indigo-500/15 to-purple-600/15 border border-indigo-400/30 rounded-lg p-6 text-center">
                <p className="text-lg text-indigo-200 italic">"{BasicAnalysis.motivationalInsight}"</p>
              </div>
            </section>
          )}

          {/* Reading Streak */}
          {BasicAnalysis.readingStreak > 0 && (
            <section>
              <h3 className="text-2xl font-semibold text-glass-primary mb-4 flex items-center">
                🔥 Reading Streak
              </h3>
              <div className="bg-gradient-to-r from-orange-500/15 to-red-600/15 border border-orange-400/30 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">{BasicAnalysis.readingStreak}</div>
                <p className="text-orange-200">Days of consistent reading!</p>
              </div>
            </section>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-semibold"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailedAnalysisModal;
