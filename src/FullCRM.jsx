import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Phone, Mail, Home, Calendar, Filter, Star, Download, Users, TrendingUp, Eye, Edit, DollarSign } from 'lucide-react';

// Constants
const SAMPLE_PROPERTIES = [
  { id: 1, address: '123 Ocean Blvd, Newport Beach, CA', price: 3750000, type: 'Single Family', bedrooms: 4, bathrooms: 3, sqft: 2800, status: 'Active', daysOnMarket: 15, leadPotential: 'High' },
  { id: 2, address: '456 Coastal Highway, Huntington Beach, CA', price: 2890000, type: 'Single Family', bedrooms: 5, bathrooms: 4, sqft: 3200, status: 'Active', daysOnMarket: 28, leadPotential: 'Medium' },
  { id: 3, address: '789 Hill Street, San Clemente, CA', price: 1850000, type: 'Single Family', bedrooms: 3, bathrooms: 2, sqft: 2100, status: 'Pending', daysOnMarket: 8, leadPotential: 'High' },
  { id: 4, address: '321 Sunset Drive, Encinitas, CA', price: 4200000, type: 'Single Family', bedrooms: 6, bathrooms: 5, sqft: 4100, status: 'Active', daysOnMarket: 45, leadPotential: 'Medium' },
  { id: 5, address: '654 Beach Front, Carlsbad, CA', price: 5600000, type: 'Single Family', bedrooms: 4, bathrooms: 4, sqft: 3800, status: 'Active', daysOnMarket: 22, leadPotential: 'High' }
];

const SAMPLE_LEADS = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(949) 555-0123', interest: 'buying', priceRange: '$3M - $5M', location: 'Newport Beach', status: 'Hot', source: 'QR Code - Property Flyer', lastContact: '2025-01-15', notes: 'Looking for oceanfront property, flexible on timeline' },
  { id: 2, name: 'Michael Chen', email: 'm.chen@techcorp.com', phone: '(858) 555-0456', interest: 'selling', priceRange: '$2M - $3M', location: 'San Clemente', status: 'Warm', source: 'Website Contact', lastContact: '2025-01-14', notes: 'Current home valued at $2.8M, looking to upgrade' },
  { id: 3, name: 'Jennifer Martinez', email: 'jen.martinez@finance.com', phone: '(760) 555-0789', interest: 'buying', priceRange: '$1.5M - $2M', location: 'Carlsbad', status: 'Hot', source: 'QR Code - Open House', lastContact: '2025-01-16', notes: 'First-time luxury buyer, needs education on process' },
  { id: 4, name: 'David Wilson', email: 'dwilson@investment.com', phone: '(949) 555-0321', interest: 'buying', priceRange: '$4M+', location: 'Huntington Beach', status: 'Cold', source: 'Calendly Booking', lastContact: '2025-01-10', notes: 'Investment property buyer, cash ready' }
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'properties', label: 'Properties', icon: Home },
  { id: 'zillow-integration', label: 'Zillow Integration', icon: Download },
  { id: 'qr-codes', label: 'QR Codes', icon: Eye }
];

const STATUS_COLORS = {
  Hot: 'bg-red-100 text-red-800',
  Warm: 'bg-yellow-100 text-yellow-800',
  Cold: 'bg-blue-100 text-blue-800',
  New: 'bg-green-100 text-green-800'
};

// Utility functions
const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);
const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

// Optimized components
const StatCard = React.memo(({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
  </div>
));

const LeadRow = React.memo(({ lead }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4">
      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
      <div className="text-sm text-gray-500">{lead.email}</div>
      <div className="text-sm text-gray-500">{lead.phone}</div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${lead.interest === 'buying' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
        {lead.interest}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-900">{lead.priceRange}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
        {lead.status}
      </span>
    </td>
    <td className="px-6 py-4 text-sm text-gray-500">{lead.source}</td>
    <td className="px-6 py-4">
      <div className="flex space-x-2">
        <button className="text-green-600 hover:text-green-900"><Phone className="w-4 h-4" /></button>
        <button className="text-blue-600 hover:text-blue-900"><Mail className="w-4 h-4" /></button>
        <button className="text-gray-600 hover:text-gray-900"><Edit className="w-4 h-4" /></button>
      </div>
    </td>
  </tr>
));

const PropertyCard = React.memo(({ property }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-lg text-gray-900">{formatPrice(property.price)}</h3>
        <p className="text-sm text-gray-600">{property.address}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${property.leadPotential === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
        {property.leadPotential} Potential
      </span>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[
        { label: 'Bedrooms', value: property.bedrooms },
        { label: 'Bathrooms', value: property.bathrooms },
        { label: 'Sq Ft', value: property.sqft.toLocaleString() }
      ].map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${property.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
        {property.status}
      </span>
      <span className="text-sm text-gray-500">{property.daysOnMarket} days on market</span>
    </div>
  </div>
));

const QRCodeCard = React.memo(({ title, icon: Icon, iconColor, url, filename, description }) => {
  const downloadQR = useCallback(() => {
    const link = document.createElement('a');
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
    link.download = filename;
    link.click();
  }, [url, filename]);

  const openURL = useCallback(() => window.open(url, '_blank'), [url]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
          alt={`${title} QR Code`}
          className="w-48 h-48 mx-auto cursor-pointer hover:scale-105 transition-transform"
          onClick={openURL}
        />
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex justify-center gap-2">
        <button onClick={downloadQR} className={`${iconColor.includes('green') ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-2 rounded text-sm`}>
          Download PNG
        </button>
        <button onClick={openURL} className={`border ${iconColor.includes('green') ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-blue-600 text-blue-600 hover:bg-blue-50'} px-3 py-2 rounded text-sm`}>
          Test Link
        </button>
      </div>
    </div>
  );
});

const EMPTY_LEAD = { name: '', email: '', phone: '', interest: 'buying', priceRange: '', location: '', source: '', notes: '' };

const GreenTreeCRM = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState(SAMPLE_LEADS);
  const [properties] = useState(SAMPLE_PROPERTIES);
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState(EMPTY_LEAD);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [addLeadError, setAddLeadError] = useState('');

  const handleAddLead = useCallback(async () => {
    if (!newLead.name || !newLead.email) {
      setAddLeadError('Name and email are required.');
      return;
    }
    setIsCategorizing(true);
    setAddLeadError('');
    try {
      const response = await fetch('/api/categorize-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Categorization failed');

      setLeads(prev => [...prev, {
        ...newLead,
        id: Date.now(),
        status: data.status,
        aiConfidence: data.confidence,
        aiReasoning: data.reasoning,
        lastContact: new Date().toISOString().split('T')[0],
      }]);
      setNewLead(EMPTY_LEAD);
      setShowAddLead(false);
    } catch (err) {
      setAddLeadError(err.message || 'Something went wrong categorizing this lead.');
    } finally {
      setIsCategorizing(false);
    }
  }, [newLead]);

  const filteredLeads = useMemo(() => 
    leadStatusFilter === 'all' ? leads : leads.filter(lead => lead.status.toLowerCase() === leadStatusFilter),
    [leads, leadStatusFilter]
  );

  const stats = useMemo(() => ({
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.status === 'Hot').length,
    activeProperties: properties.filter(p => p.status === 'Active').length,
    avgPropertyValue: properties.reduce((sum, p) => sum + p.price, 0) / properties.length
  }), [leads, properties]);

  const renderTab = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} color="text-blue-600" />
              <StatCard title="Hot Leads" value={stats.hotLeads} icon={Star} color="text-red-600" />
              <StatCard title="Active Properties" value={stats.activeProperties} icon={Home} color="text-green-600" />
              <StatCard title="Avg Property Value" value={formatPrice(stats.avgPropertyValue)} icon={DollarSign} color="text-purple-600" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { title: 'Recent Leads', data: leads.slice(0, 3).map(lead => ({ name: lead.name, subtitle: `${lead.location} • ${lead.priceRange}`, status: lead.status })) },
                { title: 'High-Value Properties', data: properties.slice(0, 3).map(property => ({ name: property.address, subtitle: `${property.bedrooms}bd • ${property.bathrooms}ba • ${property.sqft.toLocaleString()} sqft`, price: formatPrice(property.price), days: `${property.daysOnMarket} days` })) }
              ].map(({ title, data }) => (
                <div key={title} className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b"><h3 className="text-lg font-semibold">{title}</h3></div>
                  <div className="p-6 space-y-4">
                    {data.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                        </div>
                        <div className="text-right">
                          {item.status ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                          ) : (
                            <>
                              <p className="font-bold text-green-600">{item.price}</p>
                              <p className="text-xs text-gray-500">{item.days}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lead Management</h2>
              <button onClick={() => setShowAddLead(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />Add New Lead
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filters:</span>
                <select value={leadStatusFilter} onChange={(e) => setLeadStatusFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option value="all">All Status</option>
                  {Object.keys(STATUS_COLORS).map(status => (
                    <option key={status} value={status.toLowerCase()}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Contact', 'Interest', 'Price Range', 'Status', 'Source', 'Actions'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map(lead => <LeadRow key={lead.id} lead={lead} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Property Portfolio</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Generate New Leads</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map(property => <PropertyCard key={property.id} property={property} />)}
            </div>
          </div>
        );

      case 'zillow-integration':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Zillow Lead Integration</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Setup Integration</button>
            </div>
            
            {/* QR Codes for Lead Generation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Generation QR Codes</h3>
              <p className="text-sm text-gray-600 mb-6">Use these QR codes on your Zillow listings, marketing materials, and business cards to drive leads directly to your CRM</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QRCodeCard 
                  title="Schedule Consultation" 
                  icon={Calendar} 
                  iconColor="text-green-600" 
                  url="https://calendly.com/greentreeproperties/30min" 
                  filename="kevin_hood_calendly_qr.png"
                  description="Direct booking for Kevin Hood's consultation"
                />
                <QRCodeCard 
                  title="GreenTree Properties Website" 
                  icon={Home} 
                  iconColor="text-blue-600" 
                  url="https://greentreeproperties.net" 
                  filename="greentree_website_qr.png"
                  description="Home valuations and property search"
                />
              </div>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Integration Tip:</h4>
                <p className="text-sm text-blue-700">Add these QR codes to your Zillow property descriptions, photos, and Premier Agent profile to capture leads who may not immediately contact you through Zillow's system.</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-medium text-yellow-800 mb-3">Zillow Integration Setup Guide</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>To connect your Zillow Premier Agent account:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Log into your Zillow Premier Agent dashboard</li>
                  <li>Navigate to Settings → Lead Management → Integrations</li>
                  <li>Select "Custom CRM" or "Webhook Integration"</li>
                  <li>Enter your webhook URL and API credentials</li>
                  <li>Test the connection and activate lead forwarding</li>
                </ol>
                <p className="mt-3">Estimated setup time: 15-30 minutes. Leads will automatically appear in your CRM within minutes of generation on Zillow.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Zillow Leads', icon: Home, color: 'text-blue-600', desc: 'Automatically import leads from Zillow Premier Agent' },
                { title: 'Lead Management', icon: Users, color: 'text-green-600', desc: 'Track, organize and nurture all your real estate leads' },
                { title: 'Analytics', icon: TrendingUp, color: 'text-purple-600', desc: 'Monitor lead sources and conversion rates' }
              ].map(({ title, icon: Icon, color, desc }) => (
                <div key={title} className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <div className={`w-12 h-12 ${color.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'qr-codes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">QR Codes & Marketing</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" />Download Marketing Kit
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QRCodeCard 
                title="Schedule Consultation" 
                icon={Calendar} 
                iconColor="text-green-600" 
                url="https://calendly.com/greentreeproperties/30min" 
                filename="calendly_qr_code.png"
                description="Direct link to consultation booking"
              />
              <QRCodeCard 
                title="Home Valuation" 
                icon={Home} 
                iconColor="text-blue-600" 
                url="https://greentreeproperties.net" 
                filename="website_qr_code.png"
                description="Links to home valuation tools"
              />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Marketing Usage Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Calendly QR Code - Best For:', color: 'text-green-600', items: ['Business cards and networking materials', 'Open house sign-in sheets', 'Property flyers for consultations', 'Email signatures and digital marketing', 'Social media posts'] },
                  { title: 'Website QR Code - Best For:', color: 'text-blue-600', items: ['Yard signs and property marketing', 'Neighborhood farming postcards', 'Community event materials', '"Just Sold" postcards to neighbors', 'Print advertisements and magazines'] }
                ].map(({ title, color, items }) => (
                  <div key={title}>
                    <h4 className={`font-medium ${color} mb-2`}>{title}</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {items.map(item => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'QR Code Performance', data: [['Total Scans Today', '24'], ['Conversion Rate', '12.5%', 'text-green-600'], ['New Leads Generated', '3']] },
                { title: 'Top Lead Sources', data: [['Property Flyers', '45%'], ['Open House Signs', '32%'], ['Business Cards', '23%']] }
              ].map(({ title, data }) => (
                <div key={title} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">{title}</h3>
                  <div className="space-y-3">
                    {data.map(([label, value, color]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-600">{label}</span>
                        <span className={`font-bold ${color || ''}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GT</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Green Tree Properties CRM</h1>
                <p className="text-sm text-gray-500">Orange County & North County Lead Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Kevin Hood, Broker</span>
              <span className="text-sm text-green-600 font-medium">DRE# 01476642</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm ${
                  activeTab === id ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderTab()}
      </main>

      {showAddLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Lead</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(xxx) xxx-xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest</label>
                <select
                  value={newLead.interest}
                  onChange={(e) => setNewLead({ ...newLead, interest: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="buying">Buying</option>
                  <option value="selling">Selling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <input
                  type="text"
                  value={newLead.priceRange}
                  onChange={(e) => setNewLead({ ...newLead, priceRange: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., $2M - $3M"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newLead.location}
                  onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Newport Beach"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Website Contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Anything the lead said that hints at intent, timeline, budget..."
                />
              </div>
            </div>

            {addLeadError && <p className="mt-4 text-sm text-red-600">{addLeadError}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddLead}
                disabled={isCategorizing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isCategorizing ? 'Categorizing with AI...' : 'Add Lead'}
              </button>
              <button
                onClick={() => { setShowAddLead(false); setAddLeadError(''); }}
                disabled={isCategorizing}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenTreeCRM;