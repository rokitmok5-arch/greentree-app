import React, { useState, useEffect } from 'react';
import { Search, Home, Phone, Mail, MapPin, DollarSign, Calendar, Plus, Filter, Download } from 'lucide-react';

const RealEstateLeadGenerator = () => {
  const [leads, setLeads] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    priceMin: 1500000,
    priceMax: 10000000,
    propertyType: '',
    leadStatus: 'all'
  });
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    askingPrice: '',
    monthsSearching: '',
    propertyType: '',
    status: 'new',
    source: '',
    notes: ''
  });

  // Only leads in these coastal markets, asking $2.5M or more, are denoted "Hot"
  const HOT_LOCATIONS = [
    'Newport Beach, CA',
    'Laguna Beach, CA',
    'Dana Point, CA',
    'San Clemente, CA',
    'Huntington Beach, CA',
    'Irvine, CA'
  ];
  const HOT_PRICE_THRESHOLD = 2500000;
  // Warm leads: asking $2M or more, anywhere in the target markets
  const WARM_PRICE_THRESHOLD = 2000000;
  // Both Warm and Hot leads must have been searching for a buyer for more than 6 months.
  // We no longer track Cold leads at all — anything that doesn't clear these bars is dropped.
  const MIN_MONTHS_SEARCHING = 6;

  // Sample luxury market areas
  const targetAreas = [
    'Newport Beach, CA',
    'Laguna Beach, CA',
    'Dana Point, CA',
    'San Clemente, CA',
    'Irvine, CA',
    'Corona del Mar, CA',
    'Huntington Beach, CA',
    'Rancho Santa Fe, CA',
    'Del Mar, CA',
    'Solana Beach, CA',
    'Encinitas, CA',
    'Carlsbad, CA',
    'La Jolla, CA'
  ];

  const propertyTypes = [
    'Single Family Home',
    'Luxury Condo',
    'Oceanfront Property',
    'Estate',
    'Penthouse',
    'Custom Home'
  ];

  const leadSources = [
    'Website Inquiry',
    'Referral',
    'Open House',
    'Social Media',
    'Real Estate Portal',
    'Direct Mail',
    'Cold Call',
    'Networking Event'
  ];

  // Initialize with sample leads
  useEffect(() => {
    const sampleLeads = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(949) 555-0123',
        location: 'Newport Beach, CA',
        askingPrice: 2800000,
        monthsSearching: 8,
        propertyType: 'Oceanfront Property',
        status: 'hot',
        source: 'Website Inquiry',
        notes: 'Looking for oceanfront with 4+ bedrooms',
        dateAdded: '2024-01-15'
      },
      {
        id: 2,
        name: 'Michael Chen',
        email: 'mchen@email.com',
        phone: '(858) 555-0456',
        location: 'Rancho Santa Fe, CA',
        askingPrice: 4500000,
        monthsSearching: 9,
        propertyType: 'Estate',
        status: 'warm',
        source: 'Referral',
        notes: 'Interested in properties with wine cellars',
        dateAdded: '2024-01-12'
      }
    ];
    setLeads(sampleLeads);
  }, []);

  const handleAddLead = () => {
    if (newLead.name && newLead.email) {
      const lead = {
        ...newLead,
        askingPrice: Number(newLead.askingPrice) || 0,
        monthsSearching: Number(newLead.monthsSearching) || 0,
        id: leads.length + 1,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setLeads([...leads, lead]);
      setNewLead({
        name: '',
        email: '',
        phone: '',
        location: '',
        askingPrice: '',
        monthsSearching: '',
        propertyType: '',
        status: 'new',
        source: '',
        notes: ''
      });
      setShowAddLead(false);
    }
  };

  // Hot: target coastal market + $2.5M+ asking price. Warm: $2M+ asking price anywhere.
  // Both require the seller to have been searching for a buyer for more than 6 months.
  // Cold leads are no longer tracked — anything that doesn't clear these bars is dropped
  // from the list entirely (unless it's still a fresh, uncategorized "new" lead).
  const getLeadStatus = (lead) => {
    const meetsTenure = lead.monthsSearching > MIN_MONTHS_SEARCHING;
    const isHot = meetsTenure && HOT_LOCATIONS.includes(lead.location) && lead.askingPrice >= HOT_PRICE_THRESHOLD;
    if (isHot) return 'hot';
    const isWarm = meetsTenure && lead.askingPrice >= WARM_PRICE_THRESHOLD;
    if (isWarm) return 'warm';
    return lead.status === 'new' ? 'new' : null;
  };

  const formatPrice = (amount) => {
    if (amount === '' || amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredLeads = leads.filter(lead => {
    const status = getLeadStatus(lead);
    if (!status) return false; // no longer tracking cold/unqualified leads

    const matchesLocation = !searchFilters.location ||
      lead.location.toLowerCase().includes(searchFilters.location.toLowerCase());
    const matchesStatus = searchFilters.leadStatus === 'all' ||
      status === searchFilters.leadStatus;
    const matchesPropertyType = !searchFilters.propertyType ||
      lead.propertyType === searchFilters.propertyType;

    return matchesLocation && matchesStatus && matchesPropertyType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'new': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">GreenTree Properties</h1>
          </div>
          <p className="text-gray-600">
            Luxury Real Estate Lead Generator • Target Market: Orange County & North County San Diego • $1.5M+ Properties
          </p>
        </div>

        {/* Quick Links / QR Codes */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 border border-gray-200 rounded-lg p-4">
              <img src="/qr_code.jpg" alt="QR code for Home Valuation page" className="w-20 h-20 rounded-md border border-gray-200" />
              <div>
                <div className="font-semibold text-gray-900">Home Valuation</div>
              </div>
            </div>
            <div className="flex items-center gap-4 border border-gray-200 rounded-lg p-4">
              <img src="/qr_code_2.jpg" alt="QR code for Calendly booking page" className="w-20 h-20 rounded-md border border-gray-200" />
              <div>
                <div className="font-semibold text-gray-900">Book a Call (Calendly)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {targetAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={searchFilters.propertyType}
                onChange={(e) => setSearchFilters({...searchFilters, propertyType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lead Status</label>
              <select
                value={searchFilters.leadStatus}
                onChange={(e) => setSearchFilters({...searchFilters, leadStatus: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="new">New</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowAddLead(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Leads ({filteredLeads.length})
            </h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="grid gap-4">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{lead.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {lead.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getLeadStatus(lead))}`}>
                    {getLeadStatus(lead).charAt(0).toUpperCase() + getLeadStatus(lead).slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{lead.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{formatPrice(lead.askingPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{lead.propertyType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <strong>Source:</strong> {lead.source}
                  </div>
                  <div>
                    <strong>Searching:</strong> {lead.monthsSearching} {lead.monthsSearching === 1 ? 'month' : 'months'}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Added: {lead.dateAdded}
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700"><strong>Notes:</strong> {lead.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Lead</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(xxx) xxx-xxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={newLead.location}
                  onChange={(e) => setNewLead({...newLead, location: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select location</option>
                  {targetAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={newLead.askingPrice}
                  onChange={(e) => setNewLead({...newLead, askingPrice: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Months Searching for a Buyer</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newLead.monthsSearching}
                  onChange={(e) => setNewLead({...newLead, monthsSearching: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select source</option>
                  {leadSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Additional notes about this lead..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddLead}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Lead
              </button>
              <button
                onClick={() => setShowAddLead(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
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

export default RealEstateLeadGenerator;

