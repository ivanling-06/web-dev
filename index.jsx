import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  X,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Mail,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  Phone,
  Layout,
  ExternalLink,
  XCircle,
} from 'lucide-react';

// --- CUSTOM HOOKS & UTILITIES ---

// Scroll Animations Hook
const useOnScreen = (rootMargin = '0px', once = true) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(entry.target);
        }
      },
      { rootMargin }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(entry.target);
    };
  }, [rootMargin, once]);

  return [ref, isVisible];
};

// Number Increment Animation Component
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useOnScreen('0px', true);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const endValue = parseInt(end.replace(/,/g, ''), 10);

    const timer = setInterval(() => {
      start += Math.ceil(endValue / 100);
      if (start >= endValue) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Scroll Fade-In Component
const ScrollFadeIn = ({ children, delay = '0ms', className = '' }) => {
  const [ref, isVisible] = useOnScreen('-50px');
  const animationClass = isVisible
    ? `opacity-100 translate-y-0 scale-100`
    : `opacity-0 translate-y-12 scale-95`;

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${animationClass} ${className}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

const SectionHeader = ({ title, subtitle, center = true }) => (
  <div className={`mb-16 ${center ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading tracking-tight drop-shadow-lg">
      {title}
    </h2>
    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-body leading-relaxed">
      {subtitle}
    </p>
    <div
      className={`h-1 w-24 bg-gradient-to-r from-cyan-500 to-violet-500 mt-8 rounded-full ${center ? 'mx-auto' : ''}`}
    ></div>
  </div>
);

// --- ANIMATED WIREFRAME BACKGROUND ---
const WireframeMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let points = [];
    let rotation = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createSphere = (radius, count) => {
      const pts = [];
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = phi * i;
        pts.push({
          x: Math.cos(theta) * r * radius,
          y: y * radius,
          z: Math.sin(theta) * r * radius,
        });
      }
      return pts;
    };

    points = createSphere(Math.min(width, height) * 0.4, 200);

    const animate = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      rotation += 0.002;

      const cx = width / 2;
      const cy = height / 2;

      // 3D Rotation
      const rotatedPoints = points.map(p => {
        const x1 = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
        const z1 = p.z * Math.cos(rotation) + p.x * Math.sin(rotation);
        const y2 =
          p.y * Math.cos(rotation * 0.5) - z1 * Math.sin(rotation * 0.5);
        const z2 =
          z1 * Math.cos(rotation * 0.5) + p.y * Math.sin(rotation * 0.5);

        return { x: x1, y: y2, z: z2 };
      });

      // Draw Connections (Wireframe)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      for (let i = 0; i < rotatedPoints.length; i++) {
        const p1 = rotatedPoints[i];
        for (let j = i + 1; j < rotatedPoints.length; j++) {
          const p2 = rotatedPoints[j];
          const dist =
            (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2;
          if (dist < 4000) {
            const scale1 = 400 / (400 + p1.z);
            const scale2 = 400 / (400 + p2.z);
            ctx.moveTo(cx + p1.x * scale1, cy + p1.y * scale1);
            ctx.lineTo(cx + p2.x * scale2, cy + p2.y * scale2);
          }
        }
      }
      ctx.stroke();

      // Draw Points
      rotatedPoints.forEach(p => {
        const scale = 400 / (400 + p.z);
        const alpha = (p.z + 200) / 400;
        ctx.beginPath();
        ctx.arc(cx + p.x * scale, cy + p.y * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 58, 237, ${Math.max(0.1, alpha)})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
    />
  );
};

// --- CLIENT MARQUEE COMPONENT ---

const ClientMarquee = () => {
  const clients = [
    'Aura Interiors',
    'Luxe & Co. Salon',
    'Zenith Corp',
    'Velocity Freight',
    'Blue Mountain Coffee',
    'The Data Nexus',
    'Apollo Gyms',
    'Skyline Legal',
    'Global Finance Group',
    'Evergreen Estates',
  ];

  return (
    <section className="py-12 bg-slate-900 border-t border-b border-slate-800 overflow-hidden">
      <div className="flex w-full whitespace-nowrap marquee-container">
        <style jsx="true">{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .marquee-content {
            display: flex;
            animation: scroll 30s linear infinite;
            padding-right: 2rem; /* Ensure seamless loop space */
          }
          .marquee-container:hover .marquee-content {
            animation-play-state: paused;
          }
        `}</style>
        {/* Duplicate the content for seamless scrolling effect */}
        <div className="marquee-content">
          {[...clients, ...clients].map((client, index) => (
            <div
              key={index}
              className="flex items-center mx-10 opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="text-4xl font-extrabold text-slate-700 font-heading">
                {client}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CORE LAYOUT COMPONENTS ---

const Header = ({ scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Services', id: 'services' },
    { name: 'Work', id: 'work' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'FAQ', id: 'faq' },
  ];

  return (
    <>
      <style>
        {`
                    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
                    
                    .font-heading { font-family: 'Space Grotesk', sans-serif; }
                    .font-body { font-family: 'IBM Plex Sans', sans-serif; }
                    
                    .text-gradient {
                        background: linear-gradient(to right, #22d3ee, #a78bfa);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .bg-gradient-primary {
                        background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
                    }
                    html { scroll-behavior: smooth; }

                    /* Custom scrollbar for mock website modal */
                    .custom-scroll-y::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scroll-y::-webkit-scrollbar-track {
                        background: #1e293b; /* slate-800 */
                    }
                    .custom-scroll-y::-webkit-scrollbar-thumb {
                        background: #64748b; /* slate-500 */
                        border-radius: 4px;
                    }
                    .custom-scroll-y::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8; /* slate-400 */
                    }
                `}
      </style>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-slate-950/90 backdrop-blur-md border-slate-800 py-3' : 'bg-transparent border-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div
            className="flex items-center space-x-2 font-heading font-bold text-2xl text-white cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>
              Apex<span className="text-cyan-400">Digital</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className="text-slate-300 hover:text-cyan-400 font-medium font-body transition-colors text-sm uppercase tracking-wider"
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold font-heading hover:bg-cyan-50 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Get Started
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar (retained for responsiveness) */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-950 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
            <span className="font-heading font-bold text-2xl text-white">
              Menu
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="flex flex-col space-y-6 flex-grow">
            {navItems.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setIsOpen(false);
                  scrollToSection(item.id);
                }}
                className="text-2xl font-heading text-left text-white hover:text-cyan-400"
              >
                {item.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              scrollToSection('contact');
            }}
            className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold text-lg font-heading mt-auto"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </>
  );
};

// --- HERO SECTION ---

const Hero = ({ scrollToSection }) => {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-950 min-h-[90vh] flex items-center"
    >
      {/* Background image for hero section */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1510511459019-5ffe77d6a718?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}
      ></div>
      <WireframeMesh /> {/* Wireframe mesh on top of the image */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center w-full">
        <ScrollFadeIn delay="0ms">
          <div className="inline-flex items-center space-x-2 bg-slate-900/80 border border-slate-700 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm shadow-lg cursor-default">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Trusted Digital Partners
            </span>
          </div>
        </ScrollFadeIn>

        <ScrollFadeIn delay="100ms">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white font-heading leading-tight mb-8 drop-shadow-2xl">
            Unlocking Your <br />
            <span className="text-gradient">Digital Potential</span>
          </h1>
        </ScrollFadeIn>

        <ScrollFadeIn delay="200ms">
          <p className="text-xl md:text-2xl text-slate-300 font-body max-w-3xl mx-auto mb-12 leading-relaxed">
            Custom Website Development, SEO Dominance, and Reputation
            Management. The pillars of modern business success.
          </p>
        </ScrollFadeIn>

        <ScrollFadeIn delay="300ms">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto bg-gradient-primary text-white px-8 py-4 rounded-full font-bold font-heading text-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all transform hover:-translate-y-1"
            >
              Get Your Free Analysis
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold font-heading text-white border border-slate-700 hover:bg-slate-800/80 backdrop-blur-sm transition-all flex items-center justify-center group"
            >
              View Pricing
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </ScrollFadeIn>

        {/* Stats / Social Proof with CountUp */}
        <ScrollFadeIn
          delay="500ms"
          className="mt-20 pt-10 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 md:gap-20 bg-slate-950/50 backdrop-blur-sm rounded-xl mx-auto max-w-5xl"
        >
          {[
            { label: 'Client Websites', val: 250, suffix: '+' },
            { label: 'Average Rating', val: 4.9, suffix: '/5' },
            { label: 'Keywords Ranked', val: 12000, suffix: '+' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center transform hover:scale-110 transition-transform duration-300 cursor-default"
            >
              <div className="text-4xl md:text-5xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                {/* Special handling for 4.9 average rating without counting up */}
                {stat.val === 4.9 ? (
                  <span>4.9/5</span>
                ) : (
                  <CountUp end={stat.val.toString()} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-sm text-cyan-500 font-body uppercase tracking-widest mt-2 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </ScrollFadeIn>
      </div>
    </section>
  );
};

// --- SERVICES SECTION (Distinct Categories) ---

const Services = () => {
  const serviceCategories = [
    {
      title: 'Website Development',
      icon: Layout,
      desc: 'We build custom, high-speed, and secure websites engineered for lead generation and brand authority. No templates, just performance.',
      features: [
        'Custom High-Performance Code',
        'Mobile-First Architecture',
        'Conversion Rate Optimization',
        'Speed Optimization (90+ Score)',
      ],
      cta: 'View Web Portfolio',
      bgImage:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'SEO (Search Engine Optimization)',
      icon: TrendingUp,
      desc: 'Dominate search results and capture high-intent traffic. We handle all aspects: technical, content, and high-authority link building.',
      features: [
        'Technical SEO Audits',
        'High-Authority Backlinks',
        'Keyword Dominance Strategy',
        'Content Marketing Engines',
      ],
      cta: 'See SEO Results',
      bgImage:
        'https://images.unsplash.com/photo-1557426602-ef6f53e7d58a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      title: 'Google Review Management',
      icon: Shield,
      desc: 'Protect and enhance your online reputation. Automated systems to generate positive reviews and manage negative feedback effectively.',
      features: [
        'Automated Review Generation',
        'Negative Review Filtering',
        'Review Removal (Terms Violation)',
        '24/7 Sentiment Monitoring',
      ],
      cta: 'Fix Your Reviews',
      bgImage:
        'https://images.unsplash.com/photo-1549923746-c50fdd43f550?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

  return (
    <section id="services" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Our Three Core Services"
          subtitle="We deliver specialized expertise in three distinct, non-mixed disciplines for maximum impact."
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {serviceCategories.map((s, i) => (
            <ScrollFadeIn key={i} delay={`${i * 150}ms`} className="h-full">
              <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-500 group h-full flex flex-col overflow-hidden">
                {/* Background Image for Service Card */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundImage: `url(${s.bgImage})` }}
                ></div>
                <div className="absolute inset-0 bg-slate-900 opacity-80 group-hover:opacity-90 transition-opacity"></div>{' '}
                {/* Overlay */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gradient-primary transition-colors duration-500 shadow-lg">
                    <s.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 font-heading">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 font-body text-sm mb-6 flex-grow">
                    {s.desc}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {s.features.map((f, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-slate-400 group-hover:text-slate-300 transition-colors"
                      >
                        <Check className="w-5 h-5 mr-3 text-cyan-500 flex-shrink-0" />
                        <span className="font-body text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-3 rounded-xl border border-slate-700 text-white font-bold font-heading hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center group-hover:border-white">
                    {s.cta} <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- PORTFOLIO / WORK PREVIEW MODAL ---

const WebsitePreviewModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const isSalon = type === 'salon';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-6xl h-[85vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
        <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="bg-slate-950 px-4 py-1.5 rounded-md text-slate-400 text-xs font-mono flex items-center min-w-[300px] justify-center">
            <Layout className="w-3 h-3 mr-2 text-cyan-400" />
            {isSalon
              ? 'luxesalon-demo.apex.digital'
              : 'modern-interiors.apex.digital'}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Mock Website Content - Now with real images */}
        <div className="flex-grow overflow-y-auto bg-white custom-scroll-y">
          <img
            src={
              isSalon
                ? 'https://images.unsplash.com/photo-1596462502278-27ddab558e07?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                : 'https://images.unsplash.com/photo-1618220179428-2279fa769614?q=80&w=2932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }
            alt={
              isSalon
                ? 'Luxe & Co. Salon Website Preview'
                : 'Aura Interiors Website Preview'
            }
            className="w-full h-auto object-cover"
          />
          <div className="max-w-5xl mx-auto p-12 text-gray-800">
            <h2 className="text-3xl font-bold font-heading mb-4">
              {isSalon ? 'Luxe & Co. Salon' : 'Aura Interiors'}
            </h2>
            <p className="text-lg mb-6">
              {isSalon
                ? 'Elevating the salon experience with bespoke hair services in a chic, modern setting.'
                : 'Crafting harmonious and functional living spaces with a focus on minimalist design principles.'}
            </p>
            <ul className="list-disc list-inside space-y-2 mb-8 text-gray-700">
              <li>Responsive design across all devices</li>
              <li>Integrated booking system / Project gallery</li>
              <li>Optimized for fast load times</li>
              <li>Enhanced user experience & engagement</li>
            </ul>
            <button
              className={`px-6 py-3 rounded-full text-white font-bold ${isSalon ? 'bg-pink-600 hover:bg-pink-700' : 'bg-stone-800 hover:bg-stone-900'} transition`}
            >
              Explore Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- INTERACTIVE WORK / REVIEWS SECTION ---

const Work = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState('salon');

  const openPreview = type => {
    setCurrentType(type);
    setModalOpen(true);
  };

  return (
    <section id="work" className="py-24 bg-slate-900 relative">
      <WebsitePreviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={currentType}
      />

      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Client Testimonials & Portfolio"
          subtitle="Real results for real businesses. See how we transform digital footprints."
        />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Case 1: Interior Design (Fixed truncated code) */}
          <ScrollFadeIn delay="0ms">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 group">
              <div
                className="h-64 relative cursor-pointer"
                onClick={() => openPreview('interior')}
              >
                <img
                  src="https://images.unsplash.com/photo-1618220179428-2279fa769614?q=80&w=2932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Aura Interiors Website Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center text-sm transform group-hover:scale-105 transition-transform">
                    View Demo <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-heading font-bold text-violet-400 mb-3">
                  Aura Interiors
                </h3>
                <p className="text-lg text-slate-400 mb-4 font-body">
                  Full website rebuild and localized SEO strategy increased
                  high-value quote requests by{' '}
                  <span className="text-white font-bold">185%</span> in six
                  months.
                </p>
                <div className="flex items-center space-x-2 text-cyan-500 font-bold text-sm">
                  <Users className="w-5 h-5" />
                  <span>Interior Design / Local SEO</span>
                </div>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Case 2: Hair Salon */}
          <ScrollFadeIn delay="150ms">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 group">
              <div
                className="h-64 relative cursor-pointer"
                onClick={() => openPreview('salon')}
              >
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27ddab558e07?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Luxe & Co. Salon Website Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center text-sm transform group-hover:scale-105 transition-transform">
                    View Demo <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-3xl font-heading font-bold text-cyan-400 mb-3">
                  Luxe & Co. Salon
                </h3>
                <p className="text-lg text-slate-400 mb-4 font-body">
                  Implemented automated review generation and optimized booking
                  funnel, leading to a{' '}
                  <span className="text-white font-bold">
                    4.9/5 star rating
                  </span>{' '}
                  and a 30% reduction in missed appointments.
                </p>
                <div className="flex items-center space-x-2 text-violet-500 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Reputation Management / Conversion Optimization</span>
                </div>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
};

// --- PRICING SECTION ---

const Pricing = () => {
  const [selectedService, setSelectedService] = useState('web');

  const pricingPlans = {
    web: [
      {
        name: 'Starter Site',
        price: '2,500',
        desc: 'Foundation for new businesses. 5-page static build, optimized for speed.',
        features: [
          '5-Page Custom Design',
          'Mobile Optimization',
          'Basic SEO Setup',
          '1 Month Support',
        ],
        highlight: false,
      },
      {
        name: 'Business Engine',
        price: '4,900',
        desc: 'The standard for growing businesses. Focused on lead generation and integration.',
        features: [
          '10-Page Custom Build',
          'Advanced CRM Integration',
          'Conversion Optimized Forms',
          '6 Months Priority Support',
        ],
        highlight: true,
      },
      {
        name: 'Apex Platform',
        price: '8,000+',
        desc: 'Enterprise-grade solution. Full e-commerce, custom functionality, and scalable architecture.',
        features: [
          'Unlimited Pages',
          'Custom Application Development',
          'Full E-commerce Integration',
          '1 Year Dedicated Support',
        ],
        highlight: false,
      },
    ],
    seo: [
      {
        name: 'Local Focus',
        price: '999',
        desc: 'Dominate local search results (Google Maps, 3-Pack). Perfect for local service providers.',
        features: [
          '5 Key Service Areas',
          'Google My Business Optimization',
          'Citation Audit & Build',
          'Monthly Reporting',
        ],
        highlight: false,
      },
      {
        name: 'Regional Authority',
        price: '2,499',
        desc: 'Aggressive SEO for competitive markets across multiple cities or regions.',
        features: [
          '15 Key Service Areas',
          'Advanced Technical SEO',
          'High-Authority Link Building (5/mo)',
          'Quarterly Strategy Review',
        ],
        highlight: true,
      },
      {
        name: 'National Scale',
        price: '5,000+',
        desc: 'For businesses targeting national or international markets with high-volume keywords.',
        features: [
          'Unlimited Keywords',
          'Content Creation Engine',
          'Aggressive Link Building',
          'Dedicated SEO Analyst',
        ],
        highlight: false,
      },
    ],
  };

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title="Transparent Pricing Structures"
          subtitle="No hidden fees, no confusing tiers. Choose the service you need and the package that fits your ambition."
        />

        {/* Tab Switcher */}
        <ScrollFadeIn className="flex justify-center mb-16">
          <div className="flex bg-slate-800 p-1 rounded-full border border-slate-700 shadow-xl">
            <button
              onClick={() => setSelectedService('web')}
              className={`px-8 py-3 rounded-full font-bold font-heading transition-all text-sm uppercase tracking-wider ${
                selectedService === 'web'
                  ? 'bg-gradient-primary text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Website Development
            </button>
            <button
              onClick={() => setSelectedService('seo')}
              className={`px-8 py-3 rounded-full font-bold font-heading transition-all text-sm uppercase tracking-wider ${
                selectedService === 'seo'
                  ? 'bg-gradient-primary text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SEO Services
            </button>
          </div>
        </ScrollFadeIn>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans[selectedService].map((plan, i) => (
            <ScrollFadeIn key={i} delay={`${i * 100}ms`} className="h-full">
              <div
                className={`p-8 rounded-3xl h-full flex flex-col transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-slate-900 border-2 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)] transform scale-[1.02]'
                    : 'bg-slate-900 border border-slate-800 hover:border-violet-500/50'
                }`}
              >
                <span
                  className={`text-sm font-bold uppercase tracking-widest mb-4 ${plan.highlight ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                  {plan.highlight ? 'Recommended' : 'Standard'}
                </span>

                <h3 className="text-3xl font-heading font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-400 font-body mb-8 flex-grow">
                  {plan.desc}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-heading font-extrabold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-xl text-slate-400 ml-2 font-body">
                    {plan.price.includes('+') ? '' : '/ one-time'}
                  </span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-slate-300">
                      <Check className="w-5 h-5 mr-3 text-violet-400 flex-shrink-0" />
                      <span className="font-body text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl font-bold text-lg font-heading transition-all mt-auto ${
                    plan.highlight
                      ? 'bg-gradient-primary text-white hover:opacity-90 shadow-lg shadow-violet-500/30'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {plan.highlight ? 'Start with Apex' : 'Select Plan'}
                </button>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FAQ SECTION ---

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-slate-800 last:border-b-0">
    <button
      className="flex justify-between items-center w-full py-5 text-left transition-colors hover:text-cyan-400"
      onClick={onClick}
    >
      <span className="text-xl font-heading font-medium text-white pr-4">
        {question}
      </span>
      <ChevronDown
        className={`w-6 h-6 text-cyan-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0'}`}
    >
      <p className="text-slate-400 font-body leading-relaxed pl-2 pb-4 text-md">
        {answer}
      </p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How long does a typical website development project take?',
      a: "For our 'Business Engine' package, typical turnaround is 4-6 weeks from initial concept to launch. Complex 'Apex Platform' projects can take 8-12 weeks, depending on custom features and client responsiveness.",
    },
    {
      q: 'What results can I expect from your SEO services?',
      a: "We focus on tangible results: increased organic traffic, higher keyword rankings, and ultimately, more qualified leads. While we don't guarantee specific ranking spots (no ethical agency can), we guarantee a measurable improvement in domain authority and search visibility within 3-4 months.",
    },
    {
      q: 'What technology stack do you use for website builds?',
      a: 'We primarily build custom solutions using React, Next.js, and modern headless CMS platforms, ensuring maximum performance, speed, and scalability. This delivers superior Core Web Vitals scores compared to traditional platforms.',
    },
    {
      q: 'Is ongoing maintenance included after the website launch?',
      a: 'All packages include a period of free post-launch support. After that, we offer affordable monthly maintenance retainers covering security updates, technical monitoring, and minor content adjustments to keep your site running perfectly.',
    },
  ];

  const handleClick = index => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-slate-900 relative">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="We've answered the most common inquiries to help you make an informed decision."
        />

        <ScrollFadeIn className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-8 shadow-2xl">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.q}
              answer={faq.a}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </ScrollFadeIn>
      </div>
    </section>
  );
};

// --- CONTACT SECTION ---

const Contact = () => {
  const [formStatus, setFormStatus] = useState(null); // 'idle', 'loading', 'success', 'error'

  const handleSubmit = e => {
    e.preventDefault();
    setFormStatus('loading');
    // Mock API call simulation
    setTimeout(() => {
      // Simulate success 80% of the time, failure 20%
      if (Math.random() > 0.2) {
        setFormStatus('success');
        e.target.reset();
      } else {
        setFormStatus('error');
      }
    }, 1500);
  };

  return (
    <section
      id="contact"
      className="py-24 bg-slate-950 relative overflow-hidden"
    >
      {/* Contact Section Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}
      ></div>
      <div className="absolute inset-0 bg-slate-950/80"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <SectionHeader
          title="Ready to Build Your Apex?"
          subtitle="Schedule your complimentary 15-minute digital strategy analysis today. Zero pressure, maximum insights."
        />

        <div className="grid md:grid-cols-2 gap-12 bg-slate-900/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl">
          {/* Contact Info */}
          <ScrollFadeIn delay="0ms">
            <h3 className="text-3xl font-heading font-bold text-white mb-6">
              Contact Information
            </h3>
            <p className="text-slate-400 font-body text-lg mb-8">
              Reach out to our strategy team directly or use the form to submit
              a detailed request. We typically respond within 1 business day.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-cyan-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 font-bold">Email</p>
                  <a
                    href="mailto:strategy@apex.digital"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    strategy@apex.digital
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-violet-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 font-bold">Phone</p>
                  <a
                    href="tel:+1-800-555-0199"
                    className="text-slate-400 hover:text-violet-400 transition-colors"
                  >
                    +1 (800) 555-0199
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Zap className="w-6 h-6 text-cyan-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 font-bold">Headquarters</p>
                  <p className="text-slate-400">
                    100 Tech Tower, Suite 404, Digital City, CA 90210
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-700">
              <h4 className="text-white font-heading font-semibold mb-3">
                Operating Hours
              </h4>
              <p className="text-slate-400 font-body">
                Mon - Fri: 8:00 AM - 6:00 PM (PST)
              </p>
            </div>
          </ScrollFadeIn>

          {/* Contact Form */}
          <ScrollFadeIn delay="150ms">
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { name: 'name', label: 'Full Name', type: 'text' },
                { name: 'email', label: 'Work Email', type: 'email' },
                { name: 'company', label: 'Company Name', type: 'text' },
                { name: 'phone', label: 'Phone Number', type: 'tel' },
              ].map(field => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-slate-300 mb-2 font-body"
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors font-body"
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-300 mb-2 font-body"
                >
                  Tell us about your project goals
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors font-body resize-none"
                  placeholder="I'm looking for a new website and want to rank higher on Google..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold text-lg font-heading hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
              >
                {formStatus === 'loading' ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : formStatus === 'success' ? (
                  <Check className="w-6 h-6 mr-2" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                {formStatus === 'loading'
                  ? 'Sending...'
                  : formStatus === 'success'
                    ? 'Request Sent!'
                    : 'Submit Request'}
              </button>

              {formStatus === 'error' && (
                <p className="text-red-400 text-center font-body mt-4">
                  Submission failed. Please try again or call us directly.
                </p>
              )}
            </form>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
};

// --- FOOTER ---

const Footer = ({ scrollToSection }) => (
  <footer className="bg-slate-900 border-t border-slate-800 py-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Logo & Mission */}
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center space-x-2 font-heading font-bold text-2xl text-white mb-4">
            <Zap className="w-6 h-6 text-cyan-400" />
            <span>
              Apex<span className="text-cyan-400">Digital</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 font-body max-w-xs">
            Elevating businesses through elite digital strategy, custom
            development, and search dominance.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-heading font-bold text-white mb-4">
            Navigation
          </h4>
          <ul className="space-y-3 text-sm">
            {['hero', 'services', 'work', 'pricing', 'faq'].map(id => (
              <li key={id}>
                <button
                  onClick={() => scrollToSection(id)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors font-body"
                >
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-heading font-bold text-white mb-4">
            Services
          </h4>
          <ul className="space-y-3 text-sm text-slate-400 font-body">
            <li>Website Development</li>
            <li>SEO Strategy</li>
            <li>Reputation Management</li>
            <li>Conversion Optimization</li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-lg font-heading font-bold text-white mb-4">
            Connect
          </h4>
          <ul className="space-y-3 text-sm text-slate-400 font-body">
            <li>
              <a href="#" className="hover:text-violet-400 transition-colors">
                LinkedIn
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-violet-400 transition-colors">
                Twitter (X)
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-violet-400 transition-colors">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-500 font-body">
          &copy; {new Date().getFullYear()} Apex Digital. All rights reserved. |{' '}
          <a href="#" className="hover:text-cyan-400">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  </footer>
);

// --- MAIN APP COMPONENT ---

const App = () => {
  // Function to handle scrolling to a section
  const scrollToSection = id => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate scroll position, adjusting for fixed header (approx 80px)
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-body">
      <Header scrollToSection={scrollToSection} />
      <main>
        <Hero scrollToSection={scrollToSection} />
        <ClientMarquee />
        <Services />
        <Work />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default App;
