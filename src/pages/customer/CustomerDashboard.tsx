import React, { useState, useEffect } from 'react';
import { Search, FileText, Clock, CheckCircle, XCircle, ChevronRight, Newspaper, HelpCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

const NEWS_UPDATES = [
  { id: 1, title: 'New UIDAI linking guidelines for certificates', date: 'May 08, 2026' },
  { id: 2, title: 'Server maintenance scheduled for this weekend', date: 'May 05, 2026' },
  { id: 3, title: 'Income certificate validity extended to 1 year', date: 'May 01, 2026' },
];

const FAQS = [
  { q: 'How to track my application?', a: 'You can check the "My Applications" tab to see real-time status updates.' },
  { q: 'What documents are required?', a: 'Requirements vary by service. Click "Apply Now" to see a tailored checklist.' },
  { q: 'Can I cancel my application?', a: 'Yes, if the status is "Submitted", you can withdraw it without fee penalty.' },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'EN' | 'TA'>('EN');
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsub = onSnapshot(q, (snapshot) => {
      const svcs: any[] = [];
      snapshot.forEach(doc => svcs.push({ id: doc.id, ...doc.data() }));
      setServices(svcs);
      setLoadingServices(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      setLoadingServices(false);
    });

    const qCats = query(collection(db, 'categories'));
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach(doc => cats.push({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    });

    return () => {
      unsub();
      unsubCats();
    };
  }, []);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ? true : s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === 'EN' ? 'Welcome back! 👋' : 'வாருங்கள்! 👋'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === 'EN' ? 'Track your request and find new services.' : 'உங்கள் கோரிக்கைகளை கண்காணிக்கவும்.'}
          </p>
        </div>
        <div className="flex bg-background/50 border border-border/50 rounded-lg p-1">
          <button 
            onClick={() => setLang('EN')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${lang === 'EN' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang('TA')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${lang === 'TA' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Apps', count: 5, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Processing', count: 2, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Approved', count: 3, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Rejected', count: 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="glass p-2 rounded-xl flex-1 flex items-center gap-3 border border-border/50 focus-within:border-primary/50 transition-colors">
          <Search className="text-muted-foreground ml-3" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={lang === 'EN' ? "Search for services (e.g. Income Certificate)" : "சேவைகளை தேடுக..."}
            className="bg-transparent border-none outline-none flex-1 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {categories.length > 0 && (
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="glass rounded-xl px-4 py-2 text-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent min-w-[200px]"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Popular Services</h2>
            <button className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          {/* Service Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingServices ? (
              <div className="col-span-2 text-center text-muted-foreground p-8">Loading services...</div>
            ) : filteredServices.length === 0 ? (
              <div className="col-span-2 text-center text-muted-foreground p-8">No services available.</div>
            ) : (
              filteredServices.map(service => (
                <div key={service.id} className="glass p-5 rounded-2xl flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group border border-border/50">
                  {service.popular && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                      <Star size={10} className="fill-amber-950" /> POPULAR
                    </div>
                  )}
                  <div className="w-full absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <h3 className="font-semibold text-lg flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl shadow-sm">
                      {service.emoji}
                    </div>
                    {service.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4 mb-5 text-sm text-muted-foreground relative z-10">
                    <div className="flex items-center gap-2 bg-background/50 px-2.5 py-1 rounded-md">
                      <span className="font-bold text-foreground">₹{service.fee}</span> Fee
                    </div>
                    <div className="flex items-center gap-1.5 bg-background/50 px-2.5 py-1 rounded-md">
                      <Clock size={14} /> {service.days} Days
                    </div>
                  </div>
                  
                  <div className="mt-auto relative z-10">
                    <button 
                      onClick={() => navigate(`/customer/apply/${service.id}`)}
                      className="w-full py-2.5 bg-primary/10 text-primary-foreground font-medium rounded-xl hover:bg-primary hover:text-white transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-6">
          {/* News & Updates */}
          <div className="glass rounded-2xl p-5 border border-border/50">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Newspaper size={18} className="text-primary" /> 
              Latest Updates
            </h2>
            <div className="space-y-4">
              {NEWS_UPDATES.map(news => (
                <div key={news.id} className="border-b border-border/50 last:border-0 pb-3 last:pb-0">
                  <p className="text-sm font-medium hover:text-primary cursor-pointer transition-colors leading-snug">{news.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{news.date}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-semibold bg-background/50 hover:bg-background rounded-lg transition-colors border border-border/50">
              View All News
            </button>
          </div>

          {/* Quick FAQ */}
          <div className="glass rounded-2xl p-5 border border-border/50 bg-gradient-to-br from-background to-secondary/10">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-secondary-foreground" /> 
              Help & FAQ
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-background/80 p-3 rounded-xl shadow-sm">
                  <p className="text-sm font-semibold text-foreground mb-1">{faq.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-xs font-semibold text-primary hover:underline">
              Contact Support Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
