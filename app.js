import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Printer, Save, Upload, Download, FileText, Settings, Calculator } from 'lucide-react';

const EstimationSlipApp = () => {
  const [slips, setSlips] = useState([]);
  const [currentSlip, setCurrentSlip] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street, City, State, India',
    companyPhone: '+91 98765 43210',
    companyEmail: 'info@company.com',
    currency: '₹'
  });

  const printRef = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSlips = localStorage.getItem('estimationSlips');
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSlips) setSlips(JSON.parse(savedSlips));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  };

  const saveData = () => {
    localStorage.setItem('estimationSlips', JSON.stringify(slips));
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    saveData();
  }, [slips, settings]);

  const createNewSlip = () => {
    const newSlip = {
      id: Date.now(),
      slipNumber: `EST-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      clientName: '',
      clientAddress: '',
      clientPhone: '',
      clientEmail: '',
      items: [{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }],
      notes: '',
      subtotal: 0,
      total: 0
    };
    setCurrentSlip(newSlip);
  };

  const addItem = () => {
    if (!currentSlip) return;
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setCurrentSlip({
      ...currentSlip,
      items: [...currentSlip.items, newItem]
    });
  };

  const updateItem = (id, field, value) => {
    const updatedItems = currentSlip.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto-calculate amount only if quantity or rate changes
        // Allow manual amount entry
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    });
    
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal;
    
    setCurrentSlip({
      ...currentSlip,
      items: updatedItems,
      subtotal,
      total
    });
  };

  const deleteItem = (id) => {
    if (currentSlip.items.length <= 1) {
      alert('Cannot delete the last item. At least one item is required.');
      return;
    }
    const updatedItems = currentSlip.items.filter(item => item.id !== id);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal;
    
    setCurrentSlip({
      ...currentSlip,
      items: updatedItems,
      subtotal,
      total
    });
  };

  const saveSlip = () => {
    if (!currentSlip) return;
    if (!currentSlip.clientName.trim()) {
      alert('Please enter client name');
      return;
    }
    const existingIndex = slips.findIndex(s => s.id === currentSlip.id);
    if (existingIndex >= 0) {
      const updated = [...slips];
      updated[existingIndex] = currentSlip;
      setSlips(updated);
    } else {
      setSlips([...slips, currentSlip]);
    }
    alert('Estimation slip saved successfully!');
  };

  const loadSlip = (slip) => {
    setCurrentSlip({ ...slip });
  };

  const deleteSlip = (id) => {
    if (confirm('Are you sure you want to delete this estimation slip?')) {
      setSlips(slips.filter(s => s.id !== id));
      if (currentSlip?.id === id) setCurrentSlip(null);
    }
  };

  const handlePrint = () => {
    if (!currentSlip) {
      alert('No slip to print');
      return;
    }
    
    // Trigger browser print dialog
    try {
      window.print();
    } catch (error) {
      alert('Unable to open print dialog. Please try again.');
      console.error('Print error:', error);
    }
  };

  const exportToPDF = () => {
    if (!currentSlip) {
      alert('No slip to export');
      return;
    }
    
    // For PDF export, we'll use the print functionality
    // which allows "Save as PDF" option in the print dialog
    alert('In the print dialog, select "Save as PDF" or "Print to PDF" to save the estimation slip as PDF.');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const importFromJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          setCurrentSlip(imported);
          alert('Slip imported successfully!');
        } catch (error) {
          alert('Invalid file. Please select a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - Hidden on Print */}
      <div className="print:hidden bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">Estimation Slip Maker</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createNewSlip}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                New Slip
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="print:hidden max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Company Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company Name"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Company Address"
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Phone"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Saved Slips Sidebar */}
          <div className="print:hidden lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Saved Slips
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {slips.length === 0 ? (
                  <p className="text-gray-500 text-sm">No saved slips yet</p>
                ) : (
                  slips.map(slip => (
                    <div
                      key={slip.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => loadSlip(slip)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{slip.slipNumber}</p>
                          <p className="text-xs text-gray-600">{slip.clientName || 'No client'}</p>
                          <p className="text-xs text-gray-500">{slip.date}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlip(slip.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!currentSlip ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Slip Selected</h2>
                <p className="text-gray-500 mb-6">Create a new estimation slip or select an existing one</p>
                <button
                  onClick={createNewSlip}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Create New Slip
                </button>
              </div>
            ) : (
              <div ref={printRef} className="bg-white rounded-lg shadow-lg slip-content">
                {/* Action Buttons */}
                <div className="print:hidden p-4 border-b flex gap-2 flex-wrap no-print">
                  <button
                    onClick={saveSlip}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importFromJSON}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Slip Content */}
                <div className="p-8 print-content">
                  {/* Company Header */}
                  <div className="text-center mb-8 border-b-2 border-indigo-600 pb-4">
                    <h1 className="text-3xl font-bold text-indigo-600 mb-2">{settings.companyName}</h1>
                    <p className="text-sm text-gray-600">{settings.companyAddress}</p>
                    <p className="text-sm text-gray-600">
                      {settings.companyPhone} | {settings.companyEmail}
                    </p>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-6">ESTIMATION SLIP</h2>

                  {/* Estimation Details */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="font-bold text-lg mb-3">Estimation Details</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-600">Slip Number</label>
                          <input
                            type="text"
                            value={currentSlip.slipNumber}
                            onChange={(e) => setCurrentSlip({ ...currentSlip, slipNumber: e.target.value })}
                            className="w-full px-3 py-2 border rounded print:border-0"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Date</label>
                          <input
                            type="date"
                            value={currentSlip.date}
                            onChange={(e) => setCurrentSlip({ ...currentSlip, date: e.target.value })}
                            className="w-full px-3 py-2 border rounded print:border-0"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-3">Client Information</h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Client Name *"
                          value={currentSlip.clientName}
                          onChange={(e) => setCurrentSlip({ ...currentSlip, clientName: e.target.value })}
                          className="w-full px-3 py-2 border rounded print:border-0"
                        />
                        <input
                          type="text"
                          placeholder="Client Address"
                          value={currentSlip.clientAddress}
                          onChange={(e) => setCurrentSlip({ ...currentSlip, clientAddress: e.target.value })}
                          className="w-full px-3 py-2 border rounded print:border-0"
                        />
                        <input
                          type="text"
                          placeholder="Phone"
                          value={currentSlip.clientPhone}
                          onChange={(e) => setCurrentSlip({ ...currentSlip, clientPhone: e.target.value })}
                          className="w-full px-3 py-2 border rounded print:border-0"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={currentSlip.clientEmail}
                          onChange={(e) => setCurrentSlip({ ...currentSlip, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 border rounded print:border-0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg">Items</h3>
                      <button
                        onClick={addItem}
                        className="print:hidden flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Description</th>
                            <th className="border p-2 text-center w-24">Qty</th>
                            <th className="border p-2 text-right w-32">Rate (₹)</th>
                            <th className="border p-2 text-right w-32">Amount (₹)</th>
                            <th className="print:hidden border p-2 w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentSlip.items.map(item => (
                            <tr key={item.id}>
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                  className="w-full px-2 py-1 print:border-0"
                                  placeholder="Item description"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-center print:border-0"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.rate}
                                  onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-right print:border-0"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.amount}
                                  onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-right print:border-0 font-semibold"
                                />
                              </td>
                              <td className="print:hidden border p-2 text-center">
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="text-red-500 hover:text-red-700"
                                  disabled={currentSlip.items.length <= 1}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-8">
                    <div className="w-80">
                      <div className="space-y-2">
                        <div className="flex justify-between py-3 bg-indigo-50 px-4 rounded-lg border-2 border-indigo-200">
                          <span className="text-xl font-bold">Total Amount:</span>
                          <span className="text-2xl font-bold text-indigo-600">
                            {settings.currency}{currentSlip.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="font-bold mb-2">Terms & Conditions / Notes</h3>
                    <textarea
                      value={currentSlip.notes}
                      onChange={(e) => setCurrentSlip({ ...currentSlip, notes: e.target.value })}
                      className="w-full px-3 py-2 border rounded print:border-0 min-h-24"
                      placeholder="Additional notes, terms & conditions, payment terms, etc..."
                    />
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
                    <p className="font-semibold">Thank you for your business!</p>
                    <p className="text-xs mt-2">This is an estimation slip and not a final invoice</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100%;
            height: 100%;
          }
          
          /* Hide everything initially */
          body * {
            visibility: hidden;
          }
          
          /* Show only the slip content and its children */
          .slip-content,
          .slip-content * {
            visibility: visible;
          }
          
          /* Position slip content at top */
          .slip-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
          
          /* Hide non-print elements */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Remove input borders */
          input,
          textarea {
            border: none !important;
            background: transparent !important;
            padding: 2px !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Ensure table prints correctly */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: avoid;
          }
          
          table th,
          table td {
            border: 1px solid #333 !important;
            padding: 8px !important;
          }
          
          table th {
            background-color: #f3f4f6 !important;
          }
          
          /* Print exact colors */
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ensure proper text rendering */
          .print-content {
            font-size: 12pt;
            line-height: 1.5;
          }
        }
      `}</style>
    </div>
  );
};

export default EstimationSlipApp;
