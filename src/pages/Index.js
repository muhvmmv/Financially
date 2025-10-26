import { Link } from "react-router-dom";
import HeroImg from "../assets/Hero.jpg";
import budgetImg from "../assets/budget.jpg";
import phoneImg from "../assets/phone.jpg";
import { 
  PieChart, 
  TrendingUp,  
  PiggyBank, 
  Target, 
  BarChart, 
  Bell, 
  FileText, Star 
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans w-full overflow-x-hidden">
      {/* Navigation - Navy Blue Background */}
      <header className="w-full bg-blue-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="text-yellow-400 w-8 h-8" />
          <span className="text-2xl font-bold font-display tracking-tight text-white">Financially</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2 rounded-full text-white ring-2 ring-yellow-400 hover:bg-blue-800 transition font-semibold text-base">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2 rounded-full bg-yellow-400 text-blue-900 font-semibold text-base hover:bg-yellow-300 transition shadow-gold">
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center justify-between pt-12 pb-6 animate-fade-in max-w-7xl mx-auto px-6 w-full">
        <div className="lg:w-1/2 w-full lg:pr-10">
          <div className="inline-flex items-center gap-2 mb-4 bg-blue-800 text-yellow-400 px-4 py-1 rounded-full">
            <Star className="w-4 h-4" />
            <span className="text-sm font-semibold">FINANCIAL MANAGEMENT</span>
          </div>
          
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-blue-900 mb-6 leading-tight text-left">
            Take Control of Your <span className="text-yellow-500">Financial Future</span>
          </h1>
          
          <p className="text-xl text-blue-800 mb-8 text-left">
            Track all your spending, set smart budgets, and visualize your financial growth in one platform.
          </p>
          
          <div className="mt-8 flex flex-col gap-6 items-start">
            <div className="flex gap-4 items-center">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
               <PieChart className="text-yellow-500 w-5 h-5" />
             </div>
              <div>
               <span className="font-semibold text-blue-900 text-lg">Comprehensive Tracking</span>
                <p className="text-blue-700 text-sm">
                   See all your accounts in a single place.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="text-yellow-500 w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-blue-900 text-lg">Personal Insights</span>
                <p className="text-blue-700 text-sm">
                  Understand where your money goes with smart breakdowns.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <PiggyBank className="text-yellow-500 w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-blue-900 text-lg">Set Budgets</span>
                <p className="text-blue-700 text-sm">
                  Create and manage budgets to control your spending habits.
                </p>
              </div>
            </div>
          </div>

        </div>
        
        <div className="lg:w-1/2 w-full flex justify-center mt-10 lg:mt-0">
          <img
            src= {HeroImg}  // put your image in public folder or import it
            alt="Hero"
            className="w-full h-96 object-cover rounded-xl"
          />
        </div>

      </section>

      {/* Feature Cards */}
      <section className="py-14 px-6 w-full bg-blue-50 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-blue-900 mb-3">Powerful Financial Tools</h2>
            <p className="text-blue-700 max-w-2xl mx-auto">Everything you need to manage your wealth effectively</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white shadow-card rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all group border-2 border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mb-5">
                <PieChart className="text-yellow-400 w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-blue-900">Unified Dashboard</h2>
              <p className="text-blue-700">All your accounts in one place</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white shadow-card rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all group border-2 border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mb-5">
                <TrendingUp className="text-yellow-400 w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-blue-900">Wealth Analytics</h2>
              <p className="text-blue-700">Discover financial patterns</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white shadow-card rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all group border-2 border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mb-5">
                <PiggyBank className="text-yellow-400 w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-blue-900">Budgeting</h2>
              <p className="text-blue-700">Spending control</p>
            </div>
            
            {/* Card 4 */}
            <div className="bg-white shadow-card rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all group border-2 border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center mb-5">
                <Bell className="text-yellow-400 w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-blue-900">Smart Alerts</h2>
              <p className="text-blue-700">Real-time notifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Insights Section */}
      <section className="py-20 px-6 w-full bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Block 1: Text left, Image right */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
            <div className="lg:w-1/2 w-full">
              <div className="inline-flex items-center gap-2 mb-4 bg-blue-800 text-yellow-400 px-4 py-1 rounded-full">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-semibold">ADVANCED BUDGETING</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-blue-900 mb-6 leading-tight">
                Advanced Budgeting Tools
              </h2>
              <p className="text-xl text-blue-800 mb-8">
                Create custom budgets that adapt to your spending patterns and financial goals. 
                Get notified before you exceed limits and track your progress effortlessly.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <span className="text-lg text-blue-900">Customizable spending categories</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <span className="text-lg text-blue-900">Real-time budget tracking</span>
                </li>
              </ul>
            </div>
            
              <div className="lg:w-1/2 w-full flex justify-center">
                <img
                  src={budgetImg}
                  alt="Budget Management"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
          
          {/* Block 2: Text center, Image below */}
          <div className="flex flex-col items-center text-center mb-20">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 mb-4 bg-blue-800 text-yellow-400 px-4 py-1 rounded-full">
                <Target className="w-4 h-4" />
                <span className="text-sm font-semibold">SAVINGS & GOALS</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-blue-900 mb-6 leading-tight">
                Achieve Your Financial Goals
              </h2>
              <p className="text-xl text-blue-800 mb-8 max-w-2xl mx-auto">
                Set, track, and achieve your financial dreams with personalized saving plans and 
                progress tracking. Watch your goals become reality.
              </p>
            </div>
            
            <div className="lg:w-1/2 w-full flex justify-center">
                <img
                  src={phoneImg}
                  alt="Budget Management"
                  className="w-full h-auto rounded-xl"
                />
              </div>
          </div>
          
          {/* Block 3: Text right, Image left */}
          <div className="flex flex-col items-center justify-center text-center gap-6 py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-4 bg-blue-800 text-yellow-400 px-4 py-1 rounded-full">
                <BarChart className="w-4 h-4" />
                <span className="text-sm font-semibold">SPENDING HABITS</span>
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-blue-900 mb-6 leading-tight">
                Understand Your Spending Patterns
              </h2>
              <p className="text-xl text-blue-800 mb-8">
                Identify trends in your spending behavior. Make smarter decisions with visual insights.
              </p>
              <div className="mb-8">
                <p className="text-blue-900 font-semibold text-lg mb-4">Top Spending Categories</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-800">Shopping</span>
                      <span className="font-bold text-blue-900">42% ($2,425)</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2.5 rounded-full" 
                        style={{ width: '42%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-800">Groceries</span>
                      <span className="font-bold text-blue-900">28% ($485)</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full" 
                        style={{ width: '28%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-blue-800">Dining & Drinks</span>
                      <span className="font-bold text-blue-900">15% ($162)</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full" 
                        style={{ width: '15%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-200 bg-white py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center md:justify-between gap-6 text-sm">
          <div className="flex items-center gap-3">
            <PieChart className="text-blue-900 w-5 h-5" />
            <span className="font-bold font-display text-blue-900">Financially</span>
            <span className="text-gray-500">© 2025, All Rights Reserved</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <a href="mailto:muhammadnasirdeen00@gmail.com" className="text-blue-900 hover:text-yellow-500 font-medium transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
