// frontend/src/pages/public/FrontPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft,
  Star, Coffee, UtensilsCrossed, Calendar, Clock, ArrowRight,
  Sparkles, Award, Heart, Gift, Newspaper, Crown, MapPinned, ExternalLink
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const FrontPage = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState('Popular');
  
  // 🚀 LOGIN MODAL STATES
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const navigate = useNavigate();

  // Dark Theme Apply & Cleanup (Taaki Dashboard ka design kharab na ho)
  useEffect(() => {
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    const originalBodyBg = document.body.style.backgroundColor;
    const originalOverflowX = document.body.style.overflowX;

    document.documentElement.style.backgroundColor = '#0d0a08';
    document.documentElement.style.width = '100%';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.backgroundColor = '#0d0a08';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.documentElement.style.backgroundColor = originalHtmlBg;
      document.body.style.backgroundColor = originalBodyBg;
      document.body.style.overflowX = originalOverflowX;
    };
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🚀 LOGIN HANDLE FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', data.username);

        // Role ke hisaab se dashboard par bhej dein
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/staff/dashboard');
        }
      } else {
        setLoginError(data.detail || 'Invalid username or password');
      }
    } catch (err) {
      setLoginError('Server connection error. Backend chalu hai?');
    }
  };

  const pages = useMemo(() => [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'noble', label: 'Noble Horse' },
    { id: 'events', label: 'Events' },
    { id: 'gifting', label: 'Gifting' },
    { id: 'whatsnew', label: "What's New" },
    { id: 'contact', label: 'Contact' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
  ], []);

  const sliderDrinks = [
    {
      name: 'Signature Cappuccino', category: 'Hot Coffee', price: '₹150',
      desc: 'Velvety foam with rich espresso notes from our master baristas.',
      image: 'https://static.wixstatic.com/media/2596c5_a53e287f5f3d4faeb80431b1c50f84b9~mv2.jpg/v1/fill/w_600,h_700,al_c,q_90,enc_avif,quality_auto/2596c5_a53e287f5f3d4faeb80431b1c50f84b9~mv2.jpg'
    },
    {
      name: 'Royal Cold Coffee', category: 'Cold Coffee', price: '₹180',
      desc: 'Chilled espresso swirled with creamy milk and rich chocolate.',
      image: 'https://static.wixstatic.com/media/84575a_f2d843082cf4448085617a5da0bc6b53~mv2.png/v1/fill/w_600,h_700,al_c,q_95,enc_avif,quality_auto/84575a_f2d843082cf4448085617a5da0bc6b53~mv2.png'
    },
    {
      name: 'Classic Café Latte', category: 'Hot Coffee', price: '₹160',
      desc: 'Silky steamed milk poured over a perfect double espresso shot.',
      image: 'https://static.wixstatic.com/media/2596c5_d410a77bde2b4265b80e464a12b0bb5b~mv2.jpg/v1/fill/w_600,h_700,al_c,q_90,enc_avif,quality_auto/2596c5_d410a77bde2b4265b80e464a12b0bb5b~mv2.jpg'
    },
    {
      name: 'Oreo Premium Shake', category: 'Shakes', price: '₹190',
      desc: 'Creamy vanilla blended with crushed Oreo cookies & whipped cream.',
      image: 'https://static.wixstatic.com/media/2596c5_44880c9c25c041db88985d901281ec08~mv2.jpg/v1/fill/w_600,h_700,al_c,q_90,enc_avif,quality_auto/2596c5_44880c9c25c041db88985d901281ec08~mv2.jpg'
    },
    {
      name: 'Strawberry Bliss', category: 'Shakes', price: '₹170',
      desc: 'Fresh strawberries blended with ice cream and chilled milk.',
      image: 'https://static.wixstatic.com/media/2596c5_912fd5b3f35b422b8577bf20b00cd708~mv2.jpg/v1/fill/w_600,h_700,al_c,q_90,enc_avif,quality_auto/2596c5_912fd5b3f35b422b8577bf20b00cd708~mv2.jpg'
    },
  ];

  const fullMenu = {
    Popular: [
      { name: 'Potato Sandwich', img: 'https://static.wixstatic.com/media/2596c5_5dbcc6e90f9b484b91fb1200fc5efb22~mv2.jpg/v1/crop/x_6,y_0,w_641,h_614/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Aloo%20sandwich_jfif.jpg', price: '₹120' },
      { name: 'Blueberry Muffin', img: 'https://static.wixstatic.com/media/2596c5_73a46d661ed345258e9aaa4c7906f899~mv2.jpg/v1/crop/x_0,y_207,w_736,h_704/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Vegan%20Blueberry%20and%20Coconut%20Muffins%20_%20Cupful%20of%20Kale_jfif.jpg', price: '₹90' },
      { name: 'Bun Samosa', img: 'https://static.wixstatic.com/media/2596c5_002313e78e1c415a8e39947a953cb0d4~mv2.jpg/v1/crop/x_0,y_0,w_500,h_290/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Samosa%20Pav_jfif.jpg', price: '₹70' },
      { name: 'Aloo Puff', img: 'https://static.wixstatic.com/media/2596c5_e7f09cd4f62042148070e6b0f1153b72~mv2.jpg/v1/crop/x_0,y_302,w_736,h_390/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Veg%20Puff%20-%20Indian%20Bakery-Style%20Recipe%20-%20Carve%20Your%20Craving_jfif.jpg', price: '₹60' },
      { name: 'Maggi Masala', img: 'https://static.wixstatic.com/media/2596c5_626f387392324bd385102464b1ee5a8d~mv2.jpg/v1/crop/x_42,y_0,w_192,h_183/fill/w_400,h_380,al_c,lg_1,q_90,enc_avif,quality_auto/Maggie.jpg', price: '₹100' },
      { name: 'Paneer Kulcha', img: 'https://static.wixstatic.com/media/2596c5_0685242ce84849f49237f2ed69730342~mv2.jpg/v1/crop/x_0,y_42,w_437,h_416/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Paneer%20Stuffed%20Kulcha%20Sandwich_jfif.jpg', price: '₹160' },
      { name: 'Aloo Kachori', img: 'https://static.wixstatic.com/media/2596c5_f3bf5c8296804a9d9cf4c49e32b1b357~mv2.jpg/v1/crop/x_198,y_333,w_438,h_407/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Urad%20Dal%20Kachori_jfif.jpg', price: '₹80' },
      { name: 'Veg Burger', img: 'https://static.wixstatic.com/media/2596c5_24d0763822214da8a267ceb93718f696~mv2.jpg/v1/crop/x_0,y_12,w_735,h_700/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Veggie%20Burger%20Recipe%20_%20Veg%20Aloo%20Tikki%20Burger%20-%20VegeCravings_jfif.jpg', price: '₹140' },
    ],
    'Non-Veg': [
      { name: 'Egg Sandwich', img: 'https://static.wixstatic.com/media/2596c5_0cd892cd47be494eb812b7f0c05658ec~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Gluten-Free%20Croque%20Madame_jfif.jpg', price: '₹140' },
      { name: 'Bread Omelette', img: 'https://static.wixstatic.com/media/2596c5_6c5df27924c440f0901c4db502718eb8~mv2.jpeg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-24%20at%205_23_30%20PM.jpeg', price: '₹110' },
      { name: 'Chicken Tikka Sandwich', img: 'https://static.wixstatic.com/media/2596c5_3b7989f52731452aaf3f3056b35794d0~mv2.jpg/v1/crop/x_0,y_238,w_736,h_675/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Tandoori%20Chicken%20Cheese%20Sandwiches_jfif.jpg', price: '₹220' },
      { name: 'Boiled Eggs', img: 'https://static.wixstatic.com/media/2596c5_61538f60d51c42d9a1d92a926af522c7~mv2.jpg/v1/crop/x_0,y_35,w_500,h_271/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/Perfect%20Hard%20Boiled%20Eggs%20Instant%20Pot_jfif.jpg', price: '₹60' },
    ],
    Coffee: [
      { name: 'Cappuccino', img: 'https://static.wixstatic.com/media/2596c5_a53e287f5f3d4faeb80431b1c50f84b9~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_a53e287f5f3d4faeb80431b1c50f84b9~mv2.jpg', price: '₹150' },
      { name: 'Black Coffee', img: 'https://static.wixstatic.com/media/850a9c_6372c518468640ccba0663e739425df5~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/850a9c_6372c518468640ccba0663e739425df5~mv2.jpg', price: '₹120' },
      { name: 'Café Latte', img: 'https://static.wixstatic.com/media/2596c5_d410a77bde2b4265b80e464a12b0bb5b~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_d410a77bde2b4265b80e464a12b0bb5b~mv2.jpg', price: '₹160' },
      { name: 'Cold Coffee', img: 'https://static.wixstatic.com/media/84575a_f2d843082cf4448085617a5da0bc6b53~mv2.png/v1/fill/w_400,h_380,al_c,q_95,enc_avif,quality_auto/84575a_f2d843082cf4448085617a5da0bc6b53~mv2.png', price: '₹180' },
    ],
    Shakes: [
      { name: 'Oreo Shake', img: 'https://static.wixstatic.com/media/2596c5_44880c9c25c041db88985d901281ec08~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_44880c9c25c041db88985d901281ec08~mv2.jpg', price: '₹190' },
      { name: 'Strawberry Shake', img: 'https://static.wixstatic.com/media/2596c5_912fd5b3f35b422b8577bf20b00cd708~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_912fd5b3f35b422b8577bf20b00cd708~mv2.jpg', price: '₹170' },
      { name: 'Blueberry Shake', img: 'https://static.wixstatic.com/media/2596c5_f8e8f081c9bc4170a56a26394c772f54~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_f8e8f081c9bc4170a56a26394c772f54~mv2.jpg', price: '₹180' },
      { name: 'Kitkat Shake', img: 'https://static.wixstatic.com/media/2596c5_2904b1c4f0834308aa6a0e65083ae714~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_2904b1c4f0834308aa6a0e65083ae714~mv2.jpg', price: '₹200' },
    ],
    Combos: [
      { name: 'Sandwich + Muffin Combo', img: 'https://static.wixstatic.com/media/2596c5_c4727398e0b440cea885102ef9aba4c7~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_c4727398e0b440cea885102ef9aba4c7~mv2.jpg', price: '₹220' },
      { name: 'Pizza + Drink Combo', img: 'https://static.wixstatic.com/media/2596c5_32c1af61cc0e4455b6ee3bf25cdda5c2~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/pexels-pablo-macedo-287472-845811.jpg', price: '₹260' },
      { name: 'Muffin + Cold Drink Combo', img: 'https://static.wixstatic.com/media/2596c5_23e9ed4fd0a6443898a11a16014e0552~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/2596c5_23e9ed4fd0a6443898a11a16014e0552~mv2.jpg', price: '₹180' },
      { name: 'Donut + Coffee Combo', img: 'https://static.wixstatic.com/media/2596c5_293c59d69f224324ac1567bf51a8f6fd~mv2.jpg/v1/fill/w_400,h_380,al_c,q_90,enc_avif,quality_auto/22%20Tasty%20Recipes%20to%20Celebrate%20National%20Donut%20Day_jfif.jpg', price: '₹210' },
    ],
  };

  const nobleHorses = [
    { title: "Rani Lakshmibai's Horse Badal", text: "Symbolized her bravery during the Indian Rebellion of 1857. Badal was her loyal companion in battles against British forces. Together, they faced challenges, inspiring troops with courage. In the Siege of Jhansi, Badal carried Rani Lakshmibai into the fray. Their bond epitomized resistance and freedom.", img: "https://static.wixstatic.com/media/2596c5_fe0757206a7a4e0c9fd46f402d680399~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
    { title: "Neapolitan Horse: A Symbol of Elegance", text: "Napoleon Bonaparte, the renowned French military leader and emperor, indeed had a special relationship with his horse. His most famous horse was Marengo, named after the Battle of Marengo in Italy, where Napoleon won a significant victory in 1800.", img: "https://static.wixstatic.com/media/2596c5_ee2bc3b3d8f54e8fa781348900e7512a~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
    { title: "Alexander's Horse: A Steed of Legend", text: "A Legendary Bond: Bucephalus and Alexander shared a bond that transcended mere master and steed, with Alexander reportedly taming the wild horse when he was just a young prince. Battlefield Triumphs through the Persian Empire conquests cemented his legacy as a legendary warhorse.", img: "https://static.wixstatic.com/media/2596c5_34751881c546410486bcff3025ddc937~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
    { title: "Guru Gobind Singh's Horse: A Tale of Loyalty", text: "As the faithful mount galloped alongside Guru Gobind Singh, it seemed to embody the very spirit of loyalty and courage. Through countless battles and trials, the bond between master and horse only grew stronger, inspiring awe and admiration among all who witnessed their partnership.", img: "https://static.wixstatic.com/media/2596c5_9184f9ea693f40aaa35e80405170757c~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
    { title: "Chatrapati Shivaji & his Horse: A Tale of Valor", text: "In the heart of the Sahyadri Mountains, Chattrapati Shivaji Maharaj ruled with valor. His trusted companion, Veerabhadraka, shared his every triumph and trial. Together, they rode into battles, their bond unyielding, inspiring victory against the odds.", img: "https://static.wixstatic.com/media/2596c5_bbe069818eb74cef86bb6f7ab7cdd1c2~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
    { title: "Maharana Pratap and Chetak: A Tale of Courage", text: "Maharana Pratap's connection with his horse mirrored his indomitable spirit. Together, they braved countless battles, their bond unyielding in the face of adversity. Stories of their valor spread far and wide, inspiring generations of warriors.", img: "https://static.wixstatic.com/media/2596c5_78fd397667f84dc98adf77c2dcf5adbc~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
    { title: "Lord Shree Krishna and Sudarshana: Divine Bond", text: "Sudarshana's unwavering loyalty and companionship never waned, even during Lord Krishna's exile in Dwarka. In the mystical land of Vrindavan, Lord Krishna shared a special bond with Sudarshana, his divine horse, traversing enchanting forests together.", img: "https://static.wixstatic.com/media/2596c5_443688c6f7644d58bbf6e1066d091177~mv2.jpg/v1/fill/w_500,h_600,al_c,q_90,enc_avif,quality_auto/Rottaler_jfif.jpg" },
  ];

  const partners = [
    { name: 'Nihal Foundation', desc: 'Empowering Lives, Inspiring Change. Promoting human values, integrating identity, and empowering through cultural and spiritual learning. We foster cross-cultural understanding with exchange programs and advocate for retired horses\' welfare.' },
    { name: 'student|space', desc: 'Dedicated to enhancing student achievement and success. Our software tracks progress, boosts retention rates, and supports seamless transfers and degree completion.' },
    { name: 'Duke Horse Riding Club', desc: 'Where passion meets elegance in the heart of Gurgaon, Haryana. The club offers horse riding lessons, trail riding, and equestrian events for beginners and advanced riders.' },
    { name: 'Caballo Loco Art Gallery', desc: 'In collaboration with Polo Café, we celebrate the grace and power of these magnificent creatures through captivating artwork. Explore curated horse-themed masterpieces.' },
  ];

  const blogPosts = [
    { title: 'The Best Café in Gurugram: Polo Café', desc: 'Step into Polo Café and prepare to be enchanted by an atmosphere that exudes warmth and sophistication. As the premier culinary destination in Gurugram, Polo Café has earned a reputation for excellence.', img: 'https://static.wixstatic.com/media/2596c5_74b6169376094f868b283978f0d07ff1~mv2.jpg/v1/fill/w_600,h_400,al_c,q_90,enc_avif,quality_auto/pexels-anurag-upadhyay-168783412-10958529.jpg' },
    { title: 'Palette & Pour: Where Art Meets Coffee', desc: 'At Polo Café, we believe in the power of art to elevate the dining experience. From live painting sessions to art exhibitions, there\'s always something exciting happening.', img: 'https://static.wixstatic.com/media/2596c5_0a4e4b9946eb492bbed0a18900155bf6~mv2.jpeg/v1/crop/x_0,y_142,w_963,h_822/fill/w_600,h_400,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-08%20at%206_03_04%20PM%20(1).jpeg' },
    { title: "Polo Café's Cup of Excellence", desc: 'Our coffee menu is a testament to our commitment to quality and innovation. From rich espressos to creamy cappuccinos, each cup is meticulously crafted to perfection.', img: 'https://static.wixstatic.com/media/2596c5_d410a77bde2b4265b80e464a12b0bb5b~mv2.jpg/v1/fill/w_600,h_400,al_c,q_90,enc_avif,quality_auto/Caf%C3%A9_jfif.jpg' },
    { title: 'From Meetings to Celebrations: Book Our Venue', desc: 'Planning a special event or business meeting? Look no further than Polo Café. Whether you\'re hosting a birthday or corporate meeting, our team ensures every detail is taken care of.', img: 'https://static.wixstatic.com/media/2596c5_dd5e2b00e4a541d0a18c9d21137badd1~mv2.jpeg/v1/fill/w_600,h_400,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-01%20at%2011_19_07%20AM.jpeg' },
    { title: 'Ride into Serenity with Polo Café', desc: 'For a truly unique experience, embark on a horse ride with Polo Café. Explore the scenic beauty of Gurugram while savoring the finest coffee and cuisine.', img: 'https://static.wixstatic.com/media/2596c5_2e99e015ee724e8b9126c8b9024bc830~mv2.jpg/v1/crop/x_0,y_57,w_400,h_352/fill/w_600,h_400,al_c,q_90,enc_avif,quality_auto/Pololine_jfif.jpg' },
    { title: 'Journey into Creativity: Art and Coffee', desc: 'Polo Café presents a curated collection celebrating the intersection of art and coffee. Join us for an exhibition where you can explore captivating artworks while enjoying your favorite brew.', img: 'https://static.wixstatic.com/media/2596c5_620933be7734442b864d913cc9644b52~mv2.jpg/v1/fill/w_600,h_400,al_c,q_90,enc_avif,quality_auto/pexels-chevanon-302899.jpg' },
  ];

  /* NO max-width, NO mx-auto — pure full-width with only side padding */
  const Container = ({ children, className = '' }) => (
    <div className={`w-full px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>
  );

  const SectionBadge = ({ children }) => (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-amber-300 backdrop-blur-md">
      <Sparkles size={12} className="text-amber-400" />
      <span>{children}</span>
    </div>
  );

  const PageHeader = ({ badge, title, subtitle }) => (
    <div className="text-center max-w-5xl mx-auto space-y-4 mb-14 px-4">
      {badge && <SectionBadge>{badge}</SectionBadge>}
      <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">{title}</h1>
      {subtitle && <p className="text-stone-400 text-base sm:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  );

  const ContentCard = ({ children, className = '' }) => (
    <article className={`rounded-3xl border border-white/10 bg-gradient-to-b from-[#19130f] to-[#15100c] p-6 sm:p-8 lg:p-10 shadow-xl ${className}`}>{children}</article>
  );

  const DrinkSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const nextSlide = () => setActiveIndex((p) => (p + 1) % sliderDrinks.length);
    const prevSlide = () => setActiveIndex((p) => (p - 1 + sliderDrinks.length) % sliderDrinks.length);
    
    useEffect(() => { 
      if (isHovered) return; 
      const t = setInterval(nextSlide, 4500); 
      return () => clearInterval(t); 
    }, [isHovered]);

    const getCardStyles = (i) => {
      const d = (i - activeIndex + sliderDrinks.length) % sliderDrinks.length;
      if (d === 0) return { transform: 'translateX(0) scale(1) rotateY(0deg)', zIndex: 30, opacity: 1 };
      if (d === 1 || d === -(sliderDrinks.length - 1)) return { transform: 'translateX(58%) scale(0.82) rotateY(-22deg)', zIndex: 20, opacity: 0.55 };
      if (d === sliderDrinks.length - 1 || d === -1) return { transform: 'translateX(-58%) scale(0.82) rotateY(22deg)', zIndex: 20, opacity: 0.55 };
      return { transform: 'scale(0.5)', opacity: 0, pointerEvents: 'none' };
    };

    return (
      <div className="relative w-full max-w-xl mx-auto py-4" style={{ perspective: '1300px' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="relative w-full h-[420px] sm:h-[460px] flex items-center justify-center">
          {sliderDrinks.map((drink, idx) => (
            <div key={idx} onClick={() => setActiveIndex(idx)} className="absolute w-[280px] sm:w-[320px] rounded-3xl overflow-hidden cursor-pointer border border-white/15 bg-[#1a1410] transition-all duration-700 ease-out shadow-2xl" style={getCardStyles(idx)}>
              <div className="relative h-64 overflow-hidden bg-stone-900">
                <img src={drink.image} alt={drink.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410] via-transparent to-black/30" />
                <span className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-400/20">{drink.category}</span>
                <span className="absolute top-4 right-4 rounded-full bg-amber-500 text-stone-950 font-bold px-3 py-1 text-sm shadow-lg">{drink.price}</span>
              </div>
              <div className="p-5 text-center">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">{drink.name}</h3>
                <p className="mt-2 text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed">{drink.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between w-full max-w-xs mx-auto mt-4 z-30">
          <button onClick={prevSlide} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-amber-500 hover:text-stone-950 hover:scale-110 active:scale-95"><ChevronLeft size={22} /></button>
          <div className="flex items-center gap-2">
            {sliderDrinks.map((_, idx) => (
              <button key={idx} onClick={() => setActiveIndex(idx)} className={`h-2 rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-8 bg-amber-400 shadow-lg shadow-amber-400/50' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
            ))}
          </div>
          <button onClick={nextSlide} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-amber-500 hover:text-stone-950 hover:scale-110 active:scale-95"><ChevronRight size={22} /></button>
        </div>
      </div>
    );
  };

  /* ====== HEADER ====== */
  const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#120e0b]/90 backdrop-blur-xl">
      <Container>
        <div className="flex h-20 items-center justify-between gap-4">
          <button onClick={() => handlePageChange('home')} className="flex items-center gap-3 group text-left shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 shadow-lg shadow-orange-900/40 transition group-hover:scale-105">
              <img src="https://static.wixstatic.com/media/2596c5_38d2441599bc439fba1acd6213107147~mv2.png/v1/fill/w_91,h_73,al_c,q_95,usm_0.66_1.00_0.01,enc_avif,quality_auto/PoloCafe_png.png" alt="Polo cafe logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-serif text-xl xl:text-2xl font-bold tracking-wider text-white block leading-none">Polo Cafe</span>
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-amber-400 block mt-1">Gurugram • Sec 56</span>
            </div>
          </button>

          <nav className="hidden xl:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {pages.map((page) => (
              <button key={page.id} onClick={() => handlePageChange(page.id)}
                className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-300 whitespace-nowrap ${currentPage === page.id ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-md scale-105' : 'text-stone-300 hover:text-white hover:bg-white/5'}`}>
                {page.label}
              </button>
            ))}
          </nav>

          <div className="hidden xl:block">
            {/* 🚀 MODAL OPEN BUTTON */}
            <button onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-2.5 text-sm font-bold text-amber-300 transition hover:border-amber-400 hover:bg-amber-400 hover:text-stone-950">
              <span>Sign In</span>
            </button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white xl:hidden">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#120e0b]/98 backdrop-blur-2xl xl:hidden max-h-[80vh] overflow-y-auto w-full">
          <Container className="py-6 space-y-2">
            {pages.map((page) => (
              <button key={page.id} onClick={() => handlePageChange(page.id)}
                className={`w-full rounded-2xl px-5 py-3.5 text-left text-base font-bold transition flex items-center justify-between ${currentPage === page.id ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-lg' : 'bg-white/5 text-stone-200 hover:bg-white/10'}`}>
                <span>{page.label}</span>
                <ChevronRight size={18} className={currentPage === page.id ? 'text-stone-950' : 'text-stone-500'} />
              </button>
            ))}
            <div className="pt-4 border-t border-white/10">
              {/* 🚀 MODAL OPEN BUTTON (Mobile) */}
              <button onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-4 text-center font-bold text-stone-950 shadow-xl flex items-center justify-center gap-2">
                <span>Sign In</span>
              </button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );

  /* ====== HOME PAGE ====== */
  const HomePage = () => (
    <main className="w-full bg-[#0d0a08]">
      <section className="relative w-full overflow-hidden min-h-[calc(100vh-5rem)] flex items-center py-12 lg:py-16">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
        <Container className="relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <SectionBadge>Best Cafe in Gurugram</SectionBadge>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1]">
                Best cafe in <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">Gurgaon Sector 56</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Sip, Savor, and Relax on Golf Course Road. At Polo Cafe, every cup of coffee is an experience — crafted by passionate baristas using only the finest beans and ingredients.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button onClick={() => handlePageChange('menu')} className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-base font-bold text-stone-950 shadow-xl shadow-amber-500/20 transition hover:scale-105 flex items-center gap-2">
                  <span>Explore Menu</span><ArrowRight size={18} />
                </button>
                <button onClick={() => handlePageChange('contact')} className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40">
                  Visit Us
                </button>
              </div>
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div><div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">7+</div><div className="text-xs text-stone-400 uppercase tracking-wider mt-0.5">Years Serving</div></div>
                <div><div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">50+</div><div className="text-xs text-stone-400 uppercase tracking-wider mt-0.5">Specialties</div></div>
                <div><div className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">4.9★</div><div className="text-xs text-stone-400 uppercase tracking-wider mt-0.5">Guest Rating</div></div>
              </div>
            </div>
            <DrinkSlider />
          </div>
        </Container>
      </section>

      <section className="w-full py-16 bg-[#15100c] border-y border-white/5">
        <div className="text-center mb-10 px-4">
          <SectionBadge>Cafe Favorites</SectionBadge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-4">Crafted With Love</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
          {[
            { src: 'https://static.wixstatic.com/media/2596c5_24d0763822214da8a267ceb93718f696~mv2.jpg/v1/fit/w_1200,h_800,q_90,enc_avif,quality_auto/2596c5_24d0763822214da8a267ceb93718f696~mv2.jpg', label: 'Veg Burger' },
            { src: 'https://static.wixstatic.com/media/84575a_d75623e0d7d14ed08fc33dec34405504~mv2.png/v1/fit/w_1200,h_800,q_90,enc_avif,quality_auto/84575a_d75623e0d7d14ed08fc33dec34405504~mv2.png', label: 'Cappuccino' },
            { src: 'https://static.wixstatic.com/media/84575a_e830e82cfeea48dc916340b42ebaf197~mv2.png/v1/fit/w_1200,h_800,q_90,enc_avif,quality_auto/84575a_e830e82cfeea48dc916340b42ebaf197~mv2.png', label: 'Sandwich' },
          ].map((item, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden group">
              <img src={item.src} alt={item.label} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white font-serif text-2xl font-bold">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <SectionBadge>Our Story</SectionBadge>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">The Premier Cafe on Golf Course Road</h2>
              <p className="text-stone-300 leading-relaxed">Cosied amidst the vibrant streets of Gurugram, Polo Café stands tall as a beacon of warmth, hospitality, and unparalleled dining experiences. For over seven years, we've been proudly serving the community with our exquisite coffee blends, delectable treats, and inviting ambiance.</p>
              <button onClick={() => handlePageChange('about')} className="rounded-full bg-amber-400 text-stone-950 font-bold px-6 py-3 inline-flex items-center gap-2 hover:bg-amber-300 transition">
                <span>Read More</span><ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-0 w-full">
              <img src="https://static.wixstatic.com/media/2596c5_dd5e2b00e4a541d0a18c9d21137badd1~mv2.jpeg/v1/fill/w_900,h_1100,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-01%20at%2011_19_07%20AM.jpeg" alt="Cafe interior" className="w-full h-full object-cover" />
              <img src="https://static.wixstatic.com/media/2596c5_bc00a35cff4041b7ada71b3df7a92917~mv2.jpeg/v1/fill/w_900,h_1100,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-06%20at%2010_50_24%20AM.jpeg" alt="Cafe event" className="w-full h-full object-cover mt-10" />
            </div>
          </div>
        </Container>
      </section>

      <section className="w-full py-20 bg-[#15100c] border-y border-white/5">
        <Container>
          <PageHeader badge="Why Choose Us" title="Why Choose Polo Cafe" />
        </Container>
        <div className="grid grid-cols-1 md:grid-cols-3 w-full mb-10">
          <img src="https://static.wixstatic.com/media/39d656_3289311097d44ec0b92e0b21c2eb93bd~mv2.jpg/v1/fill/w_1200,h_700,al_c,q_90,enc_avif,quality_auto/39d656_3289311097d44ec0b92e0b21c2eb93bd~mv2.jpg" alt="Cold coffee" className="w-full h-80 md:h-96 object-cover" />
          <img src="https://static.wixstatic.com/media/39d656_0839af85a00e4e54adb5ad1a8ae08a60~mv2.png/v1/fill/w_1200,h_700,al_c,q_95,enc_avif,quality_auto/39d656_0839af85a00e4e54adb5ad1a8ae08a60~mv2.png" alt="Snack" className="w-full h-80 md:h-96 object-cover" />
          <img src="https://static.wixstatic.com/media/39d656_053fc3fdd3a64267b893201d9cb3790e~mv2.jpg/v1/fill/w_1200,h_700,al_c,q_90,enc_avif,quality_auto/39d656_053fc3fdd3a64267b893201d9cb3790e~mv2.jpg" alt="Milk shakes" className="w-full h-80 md:h-96 object-cover" />
        </div>
        <Container>
          <p className="text-stone-300 leading-relaxed text-center max-w-5xl mx-auto">At Polo Cafe, we think a fabulous cafe is not just about coffee — it's about making an experience worth returning for. Strategically placed on Golf Course Road in Sector 56, Gurugram, we're accessible to friends, families, and working professionals alike. Our skilled baristas prepare each cup with love, from indulgent cappuccinos to delightfully chilled cold coffee. Combine your drink with our comforting sandwiches or decadent shakes. With hidden nooks for solo work, cozy seating for reunions, and a friendly atmosphere — Polo Cafe is a community hotspot relied upon by locals for more than seven years.</p>
        </Container>
      </section>

      <section className="w-full py-20">
        <Container>
          <PageHeader badge="Collaborations" title="Our Partners" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((p, i) => (
              <ContentCard key={i} className="hover:border-amber-400/40 transition">
                <h3 className="font-serif text-xl font-bold text-amber-300 mb-3">{p.name}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{p.desc}</p>
              </ContentCard>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );

  /* ====== MENU PAGE ====== */
  const MenuPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Artisanal Offerings" title="Menu at Polo Cafe" subtitle="Coffee, snacks, shakes, non-veg favorites & combo deals — handcrafted fresh every day." />
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {Object.keys(fullMenu).map((cat) => (
            <button key={cat} onClick={() => setActiveMenuCategory(cat)}
              className={`rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 ${activeMenuCategory === cat ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20 scale-105' : 'border border-white/10 bg-white/5 text-stone-300 hover:border-white/30 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {fullMenu[activeMenuCategory].map((item, idx) => (
            <div key={idx} className="rounded-3xl border border-white/10 bg-[#17120e] overflow-hidden flex flex-col group hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-1 shadow-xl">
              <div className="relative h-48 sm:h-56 overflow-hidden bg-stone-900">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17120e] via-transparent to-black/40" />
                <span className="absolute bottom-3 right-3 rounded-xl bg-stone-900/90 backdrop-blur-md border border-white/10 text-amber-400 font-bold px-3 py-1 text-sm">{item.price}</span>
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );

  /* ====== NOBLE HORSE PAGE ====== */
  const NoblePage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Heritage Series" title="Noble Horse" subtitle="Timeless tales celebrating the legendary bond between iconic riders and their majestic steeds." />
        <div className="space-y-8">
          {nobleHorses.map((h, i) => (
            <article key={i} className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#19130f] to-[#15100c] overflow-hidden grid lg:grid-cols-3 shadow-xl hover:border-amber-400/30 transition">
              <div className="lg:col-span-2 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2"><Crown size={18} className="text-amber-400" /><span className="text-xs font-bold uppercase tracking-widest text-amber-400">Legend #{i + 1}</span></div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">{h.title}</h2>
                <p className="text-stone-300 leading-relaxed">{h.text}</p>
              </div>
              <div className="h-64 lg:h-auto"><img src={h.img} alt={h.title} className="w-full h-full object-cover" /></div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );

  /* ====== EVENTS PAGE ====== */
  const EventsPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Cultural Calendar" title="Events at Polo Cafe" subtitle="Horse riding, coffee evenings, art collections, exhibitions & equine therapy." />
      </Container>
      <div className="space-y-10">
        <article className="w-full border border-white/10 bg-gradient-to-b from-[#19130f] to-[#15100c] overflow-hidden shadow-xl">
          <div className="grid sm:grid-cols-2 w-full">
            <img src="https://static.wixstatic.com/media/850a9c_d0e2efd3b49541109d2c168bbf8040bc~mv2.jpg/v1/fill/w_1200,h_700,al_c,q_90,enc_avif,quality_auto/850a9c_d0e2efd3b49541109d2c168bbf8040bc~mv2.jpg" alt="Duke Horse Riding Club" className="w-full h-56 sm:h-80 object-cover" />
            <img src="https://static.wixstatic.com/media/2596c5_7cd9ff1945a24151b970d21159532088~mv2.jpeg/v1/fill/w_1200,h_700,al_c,q_90,enc_avif,quality_auto/2596c5_7cd9ff1945a24151b970d21159532088~mv2.jpeg" alt="Horse riders" className="w-full h-56 sm:h-80 object-cover" />
          </div>
          <div className="p-6 sm:p-8 lg:px-10">
            <h2 className="font-serif text-3xl font-bold text-white mb-5">Great Cafe for Horse Riders</h2>
            <p className="text-stone-300 leading-relaxed max-w-6xl">Join us at Duke Horse Riding Club for an unforgettable experience! Delight in horse rides offered in partnership with Duke Horse Riding Club, where elegance meets excitement. Saddle up and explore picturesque landscapes while basking in the thrill of equestrian adventure. Perfect for both beginners and seasoned riders, our events promise unforgettable memories.</p>
          </div>
        </article>
        <Container>
          <ContentCard>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">Coffee Evenings</h2>
            <p className="text-stone-300 leading-relaxed">Indulge in the perfect evening retreat at Polo Cafe! Join us for our exclusive coffee events, where every sip is a moment of pure delight. Savor the rich aroma and flavors of our carefully crafted brews while basking in the cozy ambiance. From classic espressos to decadent lattes, our menu has something for every coffee lover.</p>
          </ContentCard>
        </Container>
        <article className="w-full border border-white/10 bg-gradient-to-b from-[#19130f] to-[#15100c] overflow-hidden shadow-xl">
          <div className="grid sm:grid-cols-3 w-full">
            <img src="https://static.wixstatic.com/media/2596c5_b0aec706758e46d9aa7195eb4690aefd~mv2.jpeg/v1/crop/x_0,y_88,w_1183,h_906/fill/w_800,h_600,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-18%20at%2010_05_00%20AM%20(1).jpeg" alt="Double horse" className="w-full h-48 sm:h-72 object-cover" />
            <img src="https://static.wixstatic.com/media/2596c5_2d68c96292d043029420a42e597ed3bf~mv2.jpeg/v1/fill/w_800,h_600,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-18%20at%2010_04_10%20AM.jpeg" alt="Wild horse" className="w-full h-48 sm:h-72 object-cover" />
            <img src="https://static.wixstatic.com/media/2596c5_34b62500c1154c53812e89ed25463c7a~mv2.jpeg/v1/fill/w_800,h_600,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-17%20at%204_22_35%20PM%20(1).jpeg" alt="Single horse" className="w-full h-48 sm:h-72 object-cover" />
          </div>
          <div className="p-6 sm:p-8 lg:px-10">
            <h2 className="font-serif text-3xl font-bold text-white mb-5">Horse Art Collection</h2>
            <p className="text-stone-300 leading-relaxed max-w-6xl">Experience the elegant fusion of equestrian charm and artistic expression at Polo Café's Horse Art Collection. Discover a curated selection of captivating artworks celebrating the beauty and grace of horses. From vibrant paintings to intricate sculptures, each piece evokes the spirit of the noble steed.</p>
          </div>
        </article>
        <Container>
          <ContentCard>
            <h2 className="font-serif text-3xl font-bold text-white mb-4">Horse Art Exhibition</h2>
            <p className="text-stone-300 leading-relaxed">Step into a realm of equine elegance at Polo Café's Horse Art Exhibition. Explore a captivating showcase of artworks celebrating the majesty of horses. From breathtaking paintings to exquisite sculptures, each piece tells a unique story of beauty and grace.</p>
          </ContentCard>
        </Container>
        <article className="w-full border border-white/10 bg-gradient-to-b from-[#19130f] to-[#15100c] overflow-hidden shadow-xl">
          <div className="grid lg:grid-cols-3 w-full">
            <img src="https://static.wixstatic.com/media/2596c5_841ea4508f70488db5117ba13d35c9d1~mv2.jpg/v1/fill/w_800,h_700,al_c,q_90,enc_avif,quality_auto/2596c5_841ea4508f70488db5117ba13d35c9d1~mv2.jpg" alt="Equine therapy" className="w-full h-56 lg:h-80 object-cover" />
            <img src="https://static.wixstatic.com/media/2596c5_6b539164303e4c9fb45d248cb2002eb5~mv2.jpg/v1/fill/w_800,h_700,al_c,q_90,enc_avif,quality_auto/Equine%20Myofascial%20Release_jfif.jpg" alt="Equine therapy 2" className="w-full h-56 lg:h-80 object-cover" />
            <div className="flex items-center p-6 sm:p-8 lg:px-10 bg-[#19130f]">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white mb-4">Equine Therapy</h2>
                <p className="text-stone-300 leading-relaxed text-sm">Embark on a journey of healing with our Equine Therapy event. Discover the transformative power of connecting with horses in a serene environment. Under experienced therapists, participants engage in activities promoting emotional well-being and resilience.</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );

  /* ====== GIFTING PAGE ====== */
  const GiftingPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Gifting Collection" title="Polo Café Gifting" subtitle="Corporate, festive, and horse art inspired gifting curated with Caballo Loco Art Gallery." />
        <ContentCard className="mb-8">
          <p className="text-stone-300 leading-relaxed">Explore our diverse collection of corporate and festive gifts inspired by horse art and elevate your gifting experience with "Caballo Loco Art Gallery". Whether you're looking to make a lasting impression in the boardroom or create cherished memories at home, we have the perfect gift for every occasion.</p>
        </ContentCard>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Award, title: 'Corporate Gifting', desc: 'Elevate your corporate gifting with our exquisite collection. Discover small paintings (0.5 x 0.5 ft) by talented artists, ideal for offices. Also explore custom-printed cups with logos and artwork — memorable, personalized gifts.' },
            { icon: Heart, title: 'Horse Art Focus', desc: 'For those captivated by the beauty of horses, indulge in our curated selection of horse-themed artworks. From spirited stallions galloping across landscapes to intimate portrayals of horse and rider — each piece captures finesse and artistry.' },
            { icon: Gift, title: 'Festive Gifting', desc: 'Celebrate tradition and heroism with paintings honouring Indian warriors like Chatrapati Shivaji Maharaj, Maharana Pratap, and Guru Gobind Singh — whose valor continues to inspire generations.' },
          ].map((item, i) => (
            <ContentCard key={i} className="hover:border-amber-400/40 transition">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-400 mb-5"><item.icon size={26} /></div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-stone-400 leading-relaxed text-sm">{item.desc}</p>
            </ContentCard>
          ))}
        </div>
      </Container>
    </main>
  );

  /* ====== WHAT'S NEW PAGE ====== */
  const WhatsNewPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Launching Soon" title="Caballo Loco Art Gallery" subtitle="An unforgettable experience filled with excitement, creativity, and camaraderie." />
        <ContentCard className="mb-8 max-w-5xl mx-auto">
          <p className="text-stone-300 leading-relaxed mb-6">Our launch event promises to be an unforgettable experience filled with excitement, creativity, and camaraderie. Here's what you can expect:</p>
          <ul className="space-y-4">
            {[
              { title: 'Art Exhibition', desc: 'Immerse yourself in a world of equine-inspired artistry — sculptures, paintings, and crafts.' },
              { title: 'Live Demonstrations', desc: 'Witness the magic of creation as talented artisans demonstrate their craft live.' },
              { title: 'Interactive Workshops', desc: 'Hands-on workshops where you can try sculpting, painting, and horse-themed crafts under expert guidance.' },
              { title: 'Special Guests', desc: 'Rub shoulders with esteemed guests from equestrian and art communities, including renowned artists and advocates.' },
              { title: 'Culinary Delights', desc: 'Indulge in gourmet treats and refreshments inspired by the elegance of equestrian culture.' },
            ].map((item, i) => (
              <li key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-stone-950 font-bold">{i + 1}</div>
                <div>
                  <h4 className="font-bold text-amber-300 mb-1">{item.title}</h4>
                  <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </ContentCard>
        <div className="text-center">
          <button onClick={() => handlePageChange('contact')} className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 font-bold text-stone-950 shadow-xl inline-flex items-center gap-2 hover:scale-105 transition">
            <span>Book Your Spot</span><ArrowRight size={18} />
          </button>
        </div>
      </Container>
    </main>
  );

  /* ====== CONTACT PAGE ====== */
  const ContactPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Get In Touch" title="Contact Polo Cafe" subtitle="Visit, call, email, or find us on the map at Baani Building." />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ContentCard>
              <h2 className="font-serif text-2xl font-bold text-white mb-4 flex items-center gap-2"><MapPinned className="text-amber-400" size={22} /> Visit Us</h2>
              <div className="space-y-3 text-stone-300">
                <p className="flex items-start gap-3"><MapPin size={18} className="text-amber-400 shrink-0 mt-1" /> Baani Building, Sector 55-56 Metro Station, Gurugram, INDIA</p>
                <p className="flex items-center gap-3"><Phone size={18} className="text-amber-400 shrink-0" /> <a href="tel:01244218400" className="hover:text-amber-300 transition">0124-4218400</a></p>
                <p className="flex items-center gap-3"><Mail size={18} className="text-amber-400 shrink-0" /> <a href="mailto:hello@polocafe.in" className="hover:text-amber-300 transition">hello@polocafe.in</a></p>
                <p className="flex items-center gap-3"><Clock size={18} className="text-amber-400 shrink-0" /> Open Daily: 8:00 AM – 11:00 PM</p>
              </div>
            </ContentCard>
            <ContentCard>
              <h2 className="font-serif text-2xl font-bold text-white mb-4">Send a Message</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition" />
                <input type="email" placeholder="Your Email" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition" />
                <textarea rows={4} placeholder="Your Message" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition resize-none" />
                <button className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 font-bold text-stone-950 shadow-xl hover:scale-[1.02] transition">Send Message</button>
              </div>
            </ContentCard>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl overflow-hidden border border-white/10 h-[400px] lg:h-[500px]">
              <iframe 
                title="Polo Cafe Location"
                src="https://maps.google.com/maps?q=Polo%20Cafe,%20Sector%2056,%20Gurugram&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
                className="w-full h-full grayscale-[20%] contrast-125 rounded-3xl"
              />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );

  /* ====== BLOG PAGE ====== */
  const BlogPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="Stories & Updates" title="Polo Cafe Blog" subtitle="Discover the latest from Polo Cafe — events, art, coffee culture and more." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <article key={i} className="rounded-3xl border border-white/10 bg-[#17120e] overflow-hidden group hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-1 shadow-xl">
              <div className="relative h-52 overflow-hidden bg-stone-900">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17120e] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-3">{post.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed line-clamp-3">{post.desc}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-amber-400 text-sm font-bold hover:text-amber-300 transition">Read More <ArrowRight size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );

  /* ====== ABOUT PAGE ====== */
  const AboutPage = () => (
    <main className="w-full bg-[#0d0a08] py-10 pb-24">
      <Container>
        <PageHeader badge="About Us" title="The Polo Cafe Story" subtitle="More than a café — a community hub built on passion, art, and the love of great coffee." />
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-5">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">Seven Years of Brewing Happiness</h2>
            <p className="text-stone-300 leading-relaxed">Nestled in the vibrant heart of Sector 56, Gurugram, Polo Café has been a beloved gathering spot for over seven years. What started as a small coffee corner has blossomed into a full-fledged café experience — complete with artisanal brews, wholesome snacks, horse riding partnerships, and a growing art gallery.</p>
            <p className="text-stone-300 leading-relaxed">Our mission is simple: create a space where people feel at home. Whether you're a solo freelancer, a group of friends catching up, or a family celebrating a special occasion — Polo Café welcomes you with open arms and a perfectly brewed cup.</p>
          </div>
          <div className="grid grid-cols-2 gap-0 w-full">
            <img src="https://static.wixstatic.com/media/2596c5_dd5e2b00e4a541d0a18c9d21137badd1~mv2.jpeg/v1/fill/w_900,h_1100,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-01%20at%2011_19_07%20AM.jpeg" alt="Cafe" className="w-full h-full object-cover" />
            <img src="https://static.wixstatic.com/media/2596c5_bc00a35cff4041b7ada71b3df7a92917~mv2.jpeg/v1/fill/w_900,h_1100,al_c,q_90,enc_avif,quality_auto/WhatsApp%20Image%202024-05-06%20at%2010_50_24%20AM.jpeg" alt="Event" className="w-full h-full object-cover mt-10" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Coffee, title: 'Artisanal Coffee', desc: 'Every cup is crafted with precision — from bean selection to the final pour. Our baristas are trained to deliver consistency and excellence.' },
            { icon: UtensilsCrossed, title: 'Fresh Kitchen', desc: 'Our kitchen prepares everything fresh daily. From sandwiches to shakes, quality ingredients meet creative recipes.' },
            { icon: Heart, title: 'Community First', desc: 'We believe a café is more than food and drinks. It\'s about connections — between people, art, culture, and the love of shared experiences.' },
          ].map((item, i) => (
            <ContentCard key={i} className="hover:border-amber-400/40 transition text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-400 mb-5 mx-auto"><item.icon size={26} /></div>
              <h3 className="font-serif text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-stone-400 leading-relaxed text-sm">{item.desc}</p>
            </ContentCard>
          ))}
        </div>
      </Container>
    </main>
  );

  /* ====== FOOTER — FULL WIDTH ====== */
  const Footer = () => (
    <footer className="w-full bg-[#0a0806] border-t border-white/10">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 shadow-lg shadow-orange-900/40">
                  <Coffee className="text-stone-950" size={22} />
                </div>
                <div>
                  <span className="font-serif text-xl font-bold tracking-wider text-white block leading-none">Polo Cafe</span>
                  <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-amber-400 block mt-1">Gurugram • Sec 56</span>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">Sip, Savor, and Relax. The best café experience on Golf Course Road, Gurugram.</p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://www.facebook.com/PoloCafe.India/" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:bg-amber-400 hover:text-stone-950 hover:border-amber-400 transition"><FaFacebookF size={16} /></a>
                <a href="https://www.instagram.com/polocafeindia/" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:bg-amber-400 hover:text-stone-950 hover:border-amber-400 transition"><FaInstagram size={16} /></a>
                <a href="https://in.linkedin.com/in/polo-cafe-127065305" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:bg-amber-400 hover:text-stone-950 hover:border-amber-400 transition"><FaLinkedinIn size={16} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {pages.slice(0, 5).map((p) => (
                  <li key={p.id}><button onClick={() => handlePageChange(p.id)} className="text-stone-400 hover:text-amber-300 transition text-sm flex items-center gap-2"><ChevronRight size={14} className="text-amber-500/50" />{p.label}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white mb-4">Explore</h4>
              <ul className="space-y-2.5">
                {pages.slice(5).map((p) => (
                  <li key={p.id}><button onClick={() => handlePageChange(p.id)} className="text-stone-400 hover:text-amber-300 transition text-sm flex items-center gap-2"><ChevronRight size={14} className="text-amber-500/50" />{p.label}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-stone-400 text-sm">
                <li className="flex items-start gap-2"><MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />Baani Building, Golf Course Road, Sector 56, Gurugram</li>
                <li className="flex items-center gap-2"><Phone size={16} className="text-amber-400 shrink-0" />0124-4218400</li>
                <li className="flex items-center gap-2"><Mail size={16} className="text-amber-400 shrink-0" />hello@polocafe.in</li>
                <li className="flex items-center gap-2"><Clock size={16} className="text-amber-400 shrink-0" />8:00 AM – 11:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">© {new Date().getFullYear()} Polo Cafe. All rights reserved.</p>
            <p className="text-stone-600 text-xs">Crafted with ❤️ in Gurugram</p>
          </div>
        </div>
      </Container>
    </footer>
  );

  /* ====== RENDER ====== */
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'menu': return <MenuPage />;
      case 'noble': return <NoblePage />;
      case 'events': return <EventsPage />;
      case 'gifting': return <GiftingPage />;
      case 'whatsnew': return <WhatsNewPage />;
      case 'contact': return <ContactPage />;
      case 'blog': return <BlogPage />;
      case 'about': return <AboutPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a08] w-full overflow-x-hidden text-white" style={{ maxWidth: '100vw' }}>
      <Header />
      {renderPage()}
      <Footer />
      
      {/* 🚀 THE LOGIN MODAL UI (Overlays the frontpage) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blurred Background */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#15100c] p-8 shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-stone-400 hover:text-white transition"><X size={22} /></button>
            
            <div className="text-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto mb-4 shadow-lg shadow-orange-900/40">
                <img src="https://static.wixstatic.com/media/2596c5_38d2441599bc439fba1acd6213107147~mv2.png/v1/fill/w_91,h_73,al_c,q_95,usm_0.66_1.00_0.01,enc_avif,quality_auto/PoloCafe_png.png" alt="Polo cafe logo" className="h-full w-full object-contain" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-stone-400 text-sm mt-1">Sign in to your Polo Cafe account</p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-center text-sm font-medium">
                {loginError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="text" 
                placeholder="Username" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition" 
              />
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition" 
              />
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3.5 font-bold text-stone-950 shadow-xl hover:scale-[1.02] transition">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontPage;