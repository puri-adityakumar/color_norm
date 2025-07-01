import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Users, 
  Lightbulb,
  Database,
  BarChart3,
  Microscope,
  Brain,
  ChevronRight,
  ChevronDown,
  Award,
  TrendingUp,
  Eye,
  GitBranch,
  Cpu,
  Monitor,
  Code,
  FileText,
  ExternalLink
} from 'lucide-react';

const AboutPage = () => {
  const [expandedTechnique, setExpandedTechnique] = useState(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const objectives = [
    {
      icon: BarChart3,
      title: "Evaluate Normalization Techniques",
      description: "Compare five color normalization methods: Histogram Equalization, Histogram Matching, Reinhard, Macenko, and Vahadane techniques."
    },
    {
      icon: Brain,
      title: "Analyze CNN Performance",
      description: "Assess the impact of normalization on CNN classification accuracy using comprehensive metrics and structural similarity indices."
    },
    {
      icon: Monitor,
      title: "Build Interactive Tool",
      description: "Develop a user-friendly web application for real-time stain normalization to support clinical workflows."
    }
  ];

  const methodology = [
    {
      step: "01",
      title: "Dataset Preparation",
      description: "5,000 WSI patches extracted (2,500 LUAD + 2,500 LSCC) with manual ROI selection using Aperio ImageScope.",
      icon: Database
    },
    {
      step: "02", 
      title: "Color Normalization",
      description: "Applied five normalization techniques to reduce staining variability and standardize color representation.",
      icon: Eye
    },
    {
      step: "03",
      title: "Quality Evaluation",
      description: "Assessed image quality using Structural Similarity Index (SSIM) and Quaternion Structural Similarity Index (QSSIM).",
      icon: TrendingUp
    },
    {
      step: "04",
      title: "CNN Training",
      description: "Custom CNN with 3 convolutional layers trained on 70% data, validated on 15%, and tested on 15%.",
      icon: Cpu
    },
    {
      step: "05",
      title: "Performance Analysis",
      description: "Comprehensive comparison of Accuracy, Precision, Recall, and F1 Score across all normalization methods.",
      icon: BarChart3
    }
  ];

  const tools = [
    { name: "Python 3.8", description: "Core programming language", icon: Code },
    { name: "OpenCV", description: "Computer vision library", icon: Eye },
    { name: "TensorFlow & Keras", description: "Deep learning frameworks", icon: Brain },
    { name: "FastAPI", description: "Backend API framework", icon: Cpu },
    { name: "React & Tailwind", description: "Frontend development", icon: Monitor },
    { name: "Aperio ImageScope", description: "Medical image analysis", icon: Microscope }
  ];

  const techniques = [
    {
      name: "Histogram Equalization",
      accuracy: "94.2%",
      color: "from-amber-500 to-amber-600",
      overview: "A fundamental image enhancement technique that redistributes pixel intensities to achieve uniform histogram distribution across the full dynamic range.",
      methodology: "This technique transforms the cumulative distribution function (CDF) of the image to create a uniform distribution. For medical images, it enhances contrast by spreading out the most frequent intensity values.",
      advantages: [
        "Simple and computationally efficient implementation",
        "Effective for low-contrast images with poor illumination",
        "Automatic adaptation without requiring reference images",
        "Particularly effective for H&E stained images"
      ],
      limitations: [
        "May over-enhance images with already good contrast",
        "Can introduce artifacts in regions with similar intensities",
        "Global method that doesn't consider local image characteristics",
        "May alter the relative intensity relationships between stains"
      ],
      applications: "Widely used in digital pathology for preprocessing H&E stained slides, particularly effective for images with poor staining quality or uneven illumination. Commonly employed in automated diagnosis systems.",
      references: [
        {
          title: "A method for normalizing pathology images to improve feature extraction",
          url: "https://web.stanford.edu/group/rubinlab/pubs/Tam-2016-MedPhys.pdf",
          authors: "Tam et al., Stanford University"
        }
      ]
    },
    {
      name: "Histogram Matching", 
      accuracy: "91.8%",
      color: "from-yellow-500 to-yellow-600",
      overview: "A reference-based normalization technique that transforms the histogram of a source image to match that of a reference template, ensuring consistent appearance across datasets.",
      methodology: "The method involves computing the cumulative distribution functions (CDFs) of both source and reference images, then creating a mapping function that transforms source pixel intensities to match the reference distribution.",
      advantages: [
        "Preserves the overall appearance characteristics of reference images",
        "Effective for batch processing of similar tissue types",
        "Maintains structural relationships within the image",
        "Good performance with images from similar staining protocols"
      ],
      limitations: [
        "Requires careful selection of appropriate reference images",
        "Performance heavily dependent on reference image quality",
        "May introduce artifacts when source and reference differ significantly",
        "Limited effectiveness across different tissue types or staining batches"
      ],
      applications: "Particularly useful in large-scale pathology studies where consistency across multiple slides is crucial. Commonly applied in tissue microarray analysis and multi-institutional studies.",
      references: [
        {
          title: "Digital Image Processing Techniques for Medical Image Analysis",
          url: "https://ieeexplore.ieee.org/document/8967234",
          authors: "Various Authors, IEEE"
        }
      ]
    },
    {
      name: "Reinhard Method",
      accuracy: "89.5%",
      color: "from-orange-500 to-orange-600",
      overview: "A color transfer technique originally developed for computer graphics, adapted for medical imaging. It normalizes images by adjusting the mean and standard deviation of color channels in the Lab color space.",
      methodology: "The technique operates in the Lab color space, which separates luminance from chromaticity. It transfers color characteristics by matching the first and second-order statistics (mean and standard deviation) of the Lab channels between source and target images.",
      advantages: [
        "Works effectively across different color spaces",
        "Preserves luminance information while adjusting chromaticity",
        "Computationally efficient and straightforward to implement",
        "Good results for images with similar tissue composition"
      ],
      limitations: [
        "Assumes additive color model, which may not suit pathology images",
        "Limited effectiveness with highly variable staining intensities",
        "May not preserve fine color details in complex tissue structures",
        "Performance varies significantly with reference image selection"
      ],
      applications: "Used in research applications where color consistency is important but exact stain separation is not critical. Often employed as a preprocessing step in texture analysis studies.",
      references: [
        {
          title: "Color Transfer Between Images",
          url: "https://www.cs.tau.ac.il/~turkel/imagepapers/ColorTransfer.pdf",
          authors: "Reinhard et al., Computer Graphics Applications"
        }
      ]
    },
    {
      name: "Macenko Method",
      accuracy: "92.1%", 
      color: "from-amber-600 to-orange-500",
      overview: "A stain separation and normalization method specifically designed for histopathological images. It uses color deconvolution to separate individual stain contributions and normalizes their densities.",
      methodology: "The method employs Beer-Lambert law to model light absorption through stained tissue. It identifies stain vectors through optical density analysis and normalizes each stain component independently using predefined percentile-based targets.",
      advantages: [
        "Specifically designed for histopathological applications",
        "Separates individual stain contributions effectively",
        "Robust to variations in staining protocols",
        "Maintains biological relevance of stain intensities"
      ],
      limitations: [
        "Requires knowledge of stain types present in images",
        "Computationally more complex than global methods",
        "May struggle with heavily contaminated or poorly stained slides",
        "Performance depends on accurate stain vector estimation"
      ],
      applications: "Widely adopted in digital pathology research and clinical applications. Particularly effective for H&E stained slides and immunohistochemistry applications requiring precise stain separation.",
      references: [
        {
          title: "A Method for Normalizing Histology Slides for Quantitative Analysis",
          url: "https://ieeexplore.ieee.org/document/5193250",
          authors: "Macenko et al., IEEE ISBI"
        }
      ]
    },
    {
      name: "Vahadane Method",
      accuracy: "93.7%",
      color: "from-yellow-600 to-amber-600",
      overview: "An advanced stain normalization technique that uses sparse non-negative matrix factorization to separate stain contributions and achieve robust normalization across diverse pathological images.",
      methodology: "The method models stain separation as a sparse coding problem, using non-negative matrix factorization with sparsity constraints. It learns stain-specific dictionaries and normalizes images by enforcing consistent stain density distributions.",
      advantages: [
        "Superior performance with diverse staining conditions",
        "Robust to staining artifacts and contamination",
        "Adaptive learning of stain characteristics",
        "Excellent results across different tissue types and laboratories"
      ],
      limitations: [
        "Computationally intensive requiring optimization procedures",
        "More complex implementation compared to traditional methods",
        "Requires careful parameter tuning for optimal performance",
        "May need adaptation for novel staining protocols"
      ],
      applications: "State-of-the-art method for research applications requiring high precision. Particularly valuable in multi-institutional studies and automated diagnosis systems where robustness is critical.",
      references: [
        {
          title: "Structure-Preserving Color Normalization and Sparse Stain Separation",
          url: "https://ieeexplore.ieee.org/document/7164042",
          authors: "Vahadane et al., IEEE TMI"
        }
      ]
    }
  ];

  const toggleTechnique = (index) => {
    setExpandedTechnique(expandedTechnique === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                <BookOpen className="w-4 h-4 mr-2" />
                Research Documentation
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-accent-900 mb-6"
            >
              About Our Research
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-accent-600 leading-relaxed"
            >
              Comprehensive analysis of color normalization techniques for improving 
              lung carcinoma classification accuracy in whole slide images through 
              advanced machine learning approaches.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section-padding bg-white/70 backdrop-blur-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-accent-900 mb-6">Problem Statement</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-2">Color Inconsistencies</h3>
                    <p className="text-accent-600">Lung cancer diagnosis using Whole Slide Images is hindered by color variations due to inconsistent staining and imaging protocols.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-2">Classification Accuracy</h3>
                    <p className="text-accent-600">These inconsistencies negatively impact the accuracy of automated classification systems such as CNNs.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-2">Need for Standardization</h3>
                    <p className="text-accent-600">There is a critical need for effective color normalization techniques to standardize images and improve diagnostic reliability.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-8">
                <div className="w-full h-full bg-white/90 rounded-xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <Microscope className="w-20 h-20 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-accent-900 mb-2">WSI Challenges</h3>
                    <p className="text-accent-600">Staining variability affects diagnostic accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="section-padding bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">Research Objectives</h2>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              Our study focuses on three main objectives to advance medical image analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {objectives.map((objective, index) => (
              <motion.div
                key={index}
                className="card p-8 hover-lift text-center bg-white/80 backdrop-blur-sm border border-amber-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-amber-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <objective.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-accent-900 mb-4">{objective.title}</h3>
                <p className="text-accent-600 leading-relaxed">{objective.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section-padding bg-white/70 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">Research Methodology</h2>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              Our systematic approach to evaluating color normalization techniques
            </p>
          </div>
          
          <div className="space-y-8">
            {methodology.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col lg:flex-row items-center gap-8"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`flex-shrink-0 order-2 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {step.step}
                  </div>
                </div>
                
                <div className={`flex-1 order-1 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="card p-8 bg-white/80 backdrop-blur-sm border border-amber-100">
                    <div className="flex items-center mb-4">
                      <step.icon className="w-6 h-6 text-amber-600 mr-3" />
                      <h3 className="text-2xl font-semibold text-accent-900">{step.title}</h3>
                    </div>
                    <p className="text-accent-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Normalization Techniques */}
      <section className="section-padding bg-gradient-to-br from-yellow-50/50 to-amber-50/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">Normalization Techniques</h2>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              Detailed analysis of five state-of-the-art color normalization methods with research-backed insights
            </p>
          </div>
          
          <div className="space-y-6">
            {techniques.map((technique, index) => (
              <motion.div
                key={index}
                className="card bg-white/80 backdrop-blur-sm border border-amber-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-amber-50/50 transition-colors duration-200"
                  onClick={() => toggleTechnique(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${technique.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-accent-900">{technique.name}</h3>
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                            Accuracy: {technique.accuracy}
                          </span>
                        </div>
                        <p className="text-accent-600">{technique.overview}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {expandedTechnique === index ? (
                        <ChevronDown className="w-5 h-5 text-accent-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-accent-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedTechnique === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-amber-100"
                  >
                    <div className="p-6 space-y-6">
                      {/* Methodology */}
                      <div>
                        <h4 className="text-lg font-semibold text-accent-900 mb-3 flex items-center">
                          <Brain className="w-5 h-5 mr-2 text-amber-600" />
                          Methodology
                        </h4>
                        <p className="text-accent-600 leading-relaxed">{technique.methodology}</p>
                      </div>

                      {/* Advantages & Limitations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-accent-900 mb-3 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Advantages
                          </h4>
                          <ul className="space-y-2">
                            {technique.advantages.map((advantage, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-accent-600 text-sm">{advantage}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-accent-900 mb-3 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-orange-600" />
                            Limitations
                          </h4>
                          <ul className="space-y-2">
                            {technique.limitations.map((limitation, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-accent-600 text-sm">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Applications */}
                      <div>
                        <h4 className="text-lg font-semibold text-accent-900 mb-3 flex items-center">
                          <Microscope className="w-5 h-5 mr-2 text-amber-600" />
                          Clinical Applications
                        </h4>
                        <p className="text-accent-600 leading-relaxed">{technique.applications}</p>
                      </div>

                      {/* References */}
                      <div>
                        <h4 className="text-lg font-semibold text-accent-900 mb-3 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-amber-600" />
                          References
                        </h4>
                        <div className="space-y-2">
                          {technique.references.map((ref, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                              <ExternalLink className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <div>
                                <a 
                                  href={ref.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-amber-700 hover:text-amber-800 font-medium text-sm"
                                >
                                  {ref.title}
                                </a>
                                <p className="text-xs text-accent-500">{ref.authors}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools & Technologies */}
      <section className="section-padding bg-white/70 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">Tools & Technologies</h2>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              Cutting-edge technologies used in our research and development
          </p>
        </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                className="card p-6 hover-lift text-center bg-white/80 backdrop-blur-sm border border-amber-100"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <tool.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-accent-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-accent-600">{tool.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Information */}
      <section className="section-padding bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-accent-900 mb-6">Dataset & Materials</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-2">Image Dataset</h3>
                    <p className="text-accent-600">5,000 annotated image patches (512×512 px) from lung cancer WSIs, including 2,500 adenocarcinoma and 2,500 squamous cell carcinoma samples.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-2">Data Source</h3>
                    <p className="text-accent-600">Sourced from The Cancer Imaging Archive (TCIA) under ICMR-funded project with proper ethical approvals.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Microscope className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent-900 mb-2">Annotation Process</h3>
                    <p className="text-accent-600">Manual ROI extraction using Aperio ImageScope software with expert pathologist validation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="card p-6 text-center bg-white/80 backdrop-blur-sm border border-amber-100">
                <div className="text-3xl font-bold text-amber-600 mb-2">2,500</div>
                <div className="text-sm text-accent-600">Adenocarcinoma Samples</div>
              </div>
              <div className="card p-6 text-center bg-white/80 backdrop-blur-sm border border-amber-100">
                <div className="text-3xl font-bold text-yellow-600 mb-2">2,500</div>
                <div className="text-sm text-accent-600">Squamous Cell Samples</div>
              </div>
              <div className="card p-6 text-center bg-white/80 backdrop-blur-sm border border-amber-100">
                <div className="text-3xl font-bold text-orange-600 mb-2">512×512</div>
                <div className="text-sm text-accent-600">Pixel Resolution</div>
              </div>
              <div className="card p-6 text-center bg-white/80 backdrop-blur-sm border border-amber-100">
                <div className="text-3xl font-bold text-amber-700 mb-2">70/15/15</div>
                <div className="text-sm text-accent-600">Train/Val/Test Split</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Future Work */}
      <section className="section-padding bg-white/70 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-accent-900 mb-4">Impact & Future Directions</h2>
            <p className="text-xl text-accent-600 max-w-3xl mx-auto">
              Our research contributes to advancing automated medical image analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-accent-900 mb-6">Clinical Impact</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-accent-600">Improved diagnostic reliability through standardized image preprocessing</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-accent-600">Enhanced automated classification systems for pathology</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-accent-600">Support for real-time clinical decision making</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-accent-900 mb-6">Future Research</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-accent-600">Extension to other cancer types and tissue samples</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-accent-600">Integration with advanced deep learning architectures</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-accent-600">Development of real-time processing capabilities</p>
                </div>
              </div>
            </div>
        </div>
      </div>
      </section>
    </div>
  );
};

export default AboutPage; 