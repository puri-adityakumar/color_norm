import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  Target, 
  Award,
  Eye,
  Brain,
  BarChart3,
  Microscope,
  ChevronDown,
  Play,
  GitBranch,
  TrendingUp,
  Shield
} from 'lucide-react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const teamMembers = [
    { name: "Aditya Kumar Puri", code: "BWU/MCA/23/049", roll: "23010201045" },
    { name: "Sunny Kumar Singh", code: "BWU/MCA/23/016", roll: "23010201015" },
    { name: "Md Ahasanul Haque", code: "BWU/MCA/23/015", roll: "23010201014" },
    { name: "Muskan Kumari", code: "BWU/MCA/23/022", roll: "23010201020" },
    { name: "Suryasnata Mohanty", code: "BWU/MCA/23/021", roll: "23010201019" }
  ];

  const techniques = [
    { name: "Histogram Equalization", accuracy: "94.2%", color: "bg-amber-500" },
    { name: "Histogram Matching", accuracy: "91.8%", color: "bg-yellow-500" },
    { name: "Reinhard Method", accuracy: "89.5%", color: "bg-orange-500" },
    { name: "Macenko Method", accuracy: "92.1%", color: "bg-amber-600" },
    { name: "Vahadane Method", accuracy: "93.7%", color: "bg-yellow-600" }
  ];

  const stats = [
    { number: "5,000", label: "Image Patches", icon: Microscope },
    { number: "5", label: "Normalization Techniques", icon: GitBranch },
    { number: "94.2%", label: "Best Accuracy", icon: TrendingUp },
    { number: "512×512", label: "Pixel Resolution", icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-amber-200/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <Award className="w-4 h-4 mr-2" />
                MCA Research Project - Team MCA23A006
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-accent-900 mb-6 leading-tight"
            >
              Advanced{' '}
              <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Color Normalization</span>
              {' '}for Medical Imaging
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-accent-600 mb-8 leading-relaxed"
            >
              Comparative Analysis of Color Normalization Techniques for 
              <br className="hidden md:block" />
              Lung Carcinoma Classification using Whole Slide Images
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link to="/normalise" className="btn btn-primary btn-large hover-glow group bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-0 shadow-lg shadow-amber-500/25">
                Try Live Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="btn btn-secondary btn-large hover-lift group bg-white/80 text-amber-700 border-amber-200 hover:bg-amber-50">
                <Play className="w-5 h-5 mr-2" />
                About
            </Link>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="text-sm text-accent-500"
            >
              <p>Brainware University • Department of Computational Sciences</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-amber-500" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white/70 backdrop-blur-sm border-t border-amber-100">
        <div className="container-custom">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-accent-900 mb-2">{stat.number}</div>
                <div className="text-sm text-accent-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Techniques Overview */}
      <section className="section-padding bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">
              Normalization Techniques Analyzed
            </h2>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              We evaluated five state-of-the-art color normalization methods 
              to standardize histopathological images and improve CNN performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techniques.map((technique, index) => (
              <motion.div
                key={index}
                className="card p-6 hover-lift hover-glow bg-white/80 backdrop-blur-sm border border-amber-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 ${technique.color} rounded-lg mb-4 flex items-center justify-center`}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-accent-900 mb-2">{technique.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-accent-600">Classification Accuracy</span>
                  <span className="text-lg font-bold text-accent-900">{technique.accuracy}</span>
                </div>
                <div className="w-full bg-amber-200/50 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${technique.color}`} 
                    style={{ width: technique.accuracy }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Highlights */}
      <section className="section-padding bg-white/70 backdrop-blur-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-accent-900 mb-6">
                Breakthrough Research in Medical AI
              </h2>
              <p className="text-lg text-accent-600 mb-8">
                Our comprehensive study addresses the critical challenge of color inconsistencies 
                in histopathological images, which significantly impact the accuracy of automated 
                diagnostic systems.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-1">Problem Identification</h3>
                    <p className="text-accent-600">Color variations in WSIs due to inconsistent staining protocols hinder automated classification systems.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-1">AI-Powered Solution</h3>
                    <p className="text-accent-600">Comprehensive evaluation of normalization techniques using CNN-based classification metrics.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-1">Clinical Impact</h3>
                    <p className="text-accent-600">Improved diagnostic reliability through standardized image preprocessing workflows.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-8">
                <div className="w-full h-full bg-white/90 rounded-xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <Microscope className="w-20 h-20 text-amber-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-accent-900 mb-2">5,000 WSI Patches</h3>
                    <p className="text-accent-600">Adenocarcinoma & Squamous Cell Carcinoma</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-gradient-to-br from-yellow-50/50 to-amber-50/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">Research Team</h2>
            <p className="text-xl text-accent-600">
              Meet the dedicated researchers behind this groundbreaking study
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="card p-6 text-center hover-lift bg-white/80 backdrop-blur-sm border border-amber-100 w-72 flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-accent-900 mb-1">{member.name}</h3>
                <p className="text-sm text-accent-600 mb-1">{member.code}</p>
                <p className="text-xs text-accent-500">Roll: {member.roll}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white/70 backdrop-blur-sm border-t border-amber-100">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">
              Ready to Explore Color Normalization?
            </h2>
            <p className="text-xl text-accent-600 mb-8">
              Experience our interactive tool and see the impact of different 
              normalization techniques on medical images.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/normalise" className="btn btn-primary btn-large hover-glow group bg-gradient-to-r from-amber-600 to-yellow-600 text-white border-0 shadow-lg shadow-amber-500/25">
                Start Normalizing
                <Zap className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Link>
              <Link to="/about" className="btn btn-ghost btn-large hover-lift text-amber-700 hover:bg-amber-50">
                About Us
            </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 