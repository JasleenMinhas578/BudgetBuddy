import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuBarChart2, LuTrendingUp, LuBot, LuShieldCheck, LuSparkles } from 'react-icons/lu';
import '../styles/main.css';
import BudgetBuddyLogo from '../components/UI/BudgetBuddyLogo';

export default function Landing() {
  return (
    <div className="landing-container">
      <div className="landing-bg">
        <div className="bg-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <nav className="landing-nav">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="nav-brand"
        >
          <BudgetBuddyLogo size={40} />
          <h1 className="logo">BudgetBuddy</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="nav-links"
        >
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link primary">Get Started</Link>
        </motion.div>
      </nav>

      <main className="landing-main">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hero"
        >
          <div className="hero-content">
            <div className="hero-badge"><LuSparkles size={14} /> AI-Powered Budget Tracking</div>
            <h1 className="hero-title">
              Master Your <span className="accent">Financial Future</span>
            </h1>
            <p className="hero-subtitle">
              Transform your spending habits with intelligent expense tracking,
              beautiful visualizations, and an AI assistant that gives you
              personalized financial insights.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn btn-primary btn-hero">
                Start for Free
              </Link>
              <Link to="/login" className="btn btn-secondary btn-hero">
                Sign In
              </Link>
            </div>
            <p className="hero-trust">Free to use · No credit card required</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-visual"
          >
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dot red"></div>
                <div className="preview-dot yellow"></div>
                <div className="preview-dot green"></div>
                <span className="preview-title">BudgetBuddy Dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-total">
                  <span className="preview-label">Spent this month</span>
                  <span className="preview-amount">$2,847.50</span>
                </div>
                <div className="preview-chart">
                  <div className="chart-bar bar-1"></div>
                  <div className="chart-bar bar-2"></div>
                  <div className="chart-bar bar-3"></div>
                  <div className="chart-bar bar-4"></div>
                  <div className="chart-bar bar-5"></div>
                </div>
                <div className="preview-categories">
                  <div className="preview-cat"><span className="cat-dot food"></span>Food $840</div>
                  <div className="preview-cat"><span className="cat-dot transport"></span>Transport $320</div>
                  <div className="preview-cat"><span className="cat-dot other"></span>Other $1,687</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="how-it-works"
        >
          <div className="features-header">
            <h2>How It Works</h2>
            <p>Get started in minutes, not hours</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Sign Up Free</h3>
              <p className="step-desc">Create your account in seconds. No credit card needed, ever.</p>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Log Your Expenses</h3>
              <p className="step-desc">Add transactions manually. Smart categorization does the sorting for you.</p>
            </div>
            <div className="step-connector">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Get Insights</h3>
              <p className="step-desc">See where your money goes with charts, reports, and AI-powered summaries.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat-pill">No hidden fees</div>
          <div className="stat-pill">Works on all devices</div>
          <div className="stat-pill">Bank-level encryption</div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="features"
        >
          <div className="features-header">
            <h2>Why Choose BudgetBuddy?</h2>
            <p>Everything you need to take control of your finances</p>
          </div>

          <div className="features-grid">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="feature-icon"><LuBarChart2 size={32} /></div>
              <h3>Smart Expense Tracking</h3>
              <p>Log and categorize every transaction with intelligent auto-suggestions and smart categorization.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="feature-icon"><LuTrendingUp size={32} /></div>
              <h3>Beautiful Analytics</h3>
              <p>Understand your spending patterns with stunning charts, graphs, and detailed financial reports.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="feature-icon"><LuBot size={32} /></div>
              <h3>AI Financial Assistant</h3>
              <p>Chat with your budget. Ask "Where did I overspend?" and get instant, personalized answers powered by AI.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="feature-card"
            >
              <div className="feature-icon"><LuShieldCheck size={32} /></div>
              <h3>Secure & Private</h3>
              <p>Your financial data is protected with bank-level security and complete privacy controls.</p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <BudgetBuddyLogo size={44} />
            <h3>BudgetBuddy</h3>
            <p>Simple, smart budgeting for everyone.</p>
          </div>
          <div className="footer-nav">
            <Link to="/signup">Get Started</Link>
            <Link to="/login">Sign In</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 BudgetBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
